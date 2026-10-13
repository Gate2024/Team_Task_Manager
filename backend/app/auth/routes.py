"""Authentication route handlers."""

from __future__ import annotations

import re
from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from marshmallow import ValidationError

from ..extensions import db
from ..models import Project, ProjectMember, Task, User
from ..schemas import LoginSchema, RegisterSchema, UserSchema
from ..storage import get_storage, validate_image_file
from . import auth_bp

login_schema = LoginSchema()
register_schema = RegisterSchema()
user_schema = UserSchema()


def validate_mobile_format(number: str | None) -> bool:
    """Validate standard phone/mobile format (10-15 digits, optional leading +)."""
    if not number:
        return True
    cleaned = re.sub(r"[\s\-\(\)]", "", number)
    return bool(re.match(r"^\+?[0-9]{10,15}$", cleaned))


@auth_bp.post("/register")
def register():
    """Register a new user account with secure password hashing."""
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify(message="Request body must be valid JSON"), 400

    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid input"
        return jsonify(message=first_error, errors=err.messages), 400

    email = data["email"].strip().lower()
    name = data["name"].strip()
    password = data["password"]
    raw_mobile = data.get("mobile_number")
    mobile_number = None

    if raw_mobile and str(raw_mobile).strip():
        cleaned_mobile = str(raw_mobile).strip()
        if not validate_mobile_format(cleaned_mobile):
            return jsonify(
                message="Mobile number must contain between 10 and 15 digits",
                errors={"mobile_number": ["Mobile number must contain between 10 and 15 digits"]},
            ), 400
        mobile_number = cleaned_mobile

    existing_user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify(message="An account with this email address already exists"), 409

    new_user = User(name=name, email=email, mobile_number=mobile_number)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify(
        message="Account created successfully",
        user=user_schema.dump(new_user),
    ), 201


@auth_bp.post("/login")
def login():
    """Authenticate user credentials and issue secure JWT cookies."""
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify(message="Request body must be valid JSON"), 400

    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid credentials"
        return jsonify(message=first_error, errors=err.messages), 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    if not user or not user.check_password(password):
        return jsonify(message="Invalid email or password"), 401

    access_token = create_access_token(identity=str(user.id))
    response = jsonify(
        message="Login successful",
        user=user_schema.dump(user),
    )
    set_access_cookies(response, access_token)
    return response, 200


@auth_bp.post("/logout")
def logout():
    """Clear JWT authentication cookies to invalidate the session."""
    response = jsonify(message="Logged out successfully")
    unset_jwt_cookies(response)
    return response, 200


@auth_bp.get("/me")
@jwt_required()
def get_current_user():
    """Retrieve profile of the currently authenticated user."""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        response = jsonify(message="User not found")
        unset_jwt_cookies(response)
        return response, 401

    return jsonify(user=user_schema.dump(user)), 200


@auth_bp.patch("/profile")
@jwt_required()
def update_profile():
    """Update user personal profile details and password securely."""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        response = jsonify(message="User not found")
        unset_jwt_cookies(response)
        return response, 401

    data = request.get_json(silent=True) or {}

    # Security constraint: Email cannot be modified
    if "email" in data and data["email"].strip().lower() != user.email:
        return jsonify(message="Email address is a permanent identifier and cannot be modified"), 400

    # Name update
    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return jsonify(message="Name cannot be empty"), 400
        if len(name) > 100:
            return jsonify(message="Name must not exceed 100 characters"), 400
        user.name = name

    # Mobile number update
    if "mobile_number" in data:
        mobile = data["mobile_number"]
        if mobile is not None and str(mobile).strip():
            cleaned_mobile = str(mobile).strip()
            if not validate_mobile_format(cleaned_mobile):
                return jsonify(message="Mobile number must contain between 10 and 15 digits"), 400
            user.mobile_number = cleaned_mobile
        else:
            user.mobile_number = None

    # Password update
    new_password = data.get("new_password")
    if new_password:
        current_password = data.get("current_password")
        if not current_password:
            return jsonify(message="Current password is required to set a new password"), 400
        if not user.check_password(current_password):
            return jsonify(message="Current password is incorrect"), 401
        if len(new_password) < 8:
            return jsonify(message="New password must be at least 8 characters long"), 400
        user.set_password(new_password)

    db.session.commit()

    return jsonify(
        message="Profile updated successfully",
        user=user_schema.dump(user),
    ), 200


@auth_bp.post("/profile/image")
@jwt_required()
def upload_profile_image():
    """Upload and set a new profile avatar image."""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        response = jsonify(message="User not found")
        unset_jwt_cookies(response)
        return response, 401

    file = request.files.get("image") or request.files.get("file")
    if not file:
        return jsonify(message="No image file provided in request"), 400

    is_valid, error_msg = validate_image_file(file)
    if not is_valid:
        status_code = 413 if "5 MB" in error_msg else 400
        return jsonify(message=error_msg), status_code

    storage = get_storage()

    # Delete previous profile image if one exists
    if user.profile_image_url:
        storage.delete(user.profile_image_url)

    # Save new image and update database record
    new_image_url = storage.save(file, subfolder="avatars")
    user.profile_image_url = new_image_url
    db.session.commit()

    return jsonify(
        message="Profile photo updated successfully",
        user=user_schema.dump(user),
    ), 200


@auth_bp.delete("/profile/image")
@jwt_required()
def remove_profile_image():
    """Remove user avatar image and revert to initials."""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        response = jsonify(message="User not found")
        unset_jwt_cookies(response)
        return response, 401

    if user.profile_image_url:
        storage = get_storage()
        storage.delete(user.profile_image_url)
        user.profile_image_url = None
        db.session.commit()

    return jsonify(
        message="Profile photo removed successfully",
        user=user_schema.dump(user),
    ), 200


@auth_bp.delete("/account")
@jwt_required()
def delete_account():
    """Permanently delete user account and associated personal resources."""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        response = jsonify(message="User not found")
        unset_jwt_cookies(response)
        return response, 401

    data = request.get_json(silent=True) or {}
    password = data.get("password") or data.get("current_password")
    if not password:
        return jsonify(message="Password is required to confirm account deletion"), 400
    if not user.check_password(password):
        return jsonify(message="Incorrect password"), 401

    # Clean up assigned tasks: set assigned_to = None
    db.session.execute(
        db.update(Task).where(Task.assigned_to == user.id).values(assigned_to=None)
    )
    # Remove project memberships
    db.session.execute(
        db.delete(ProjectMember).where(ProjectMember.user_id == user.id)
    )
    # Delete owned projects
    owned_projects = db.session.execute(
        db.select(Project).where(Project.owner_id == user.id)
    ).scalars().all()
    for proj in owned_projects:
        db.session.delete(proj)

    # Clean up avatar file if stored
    if user.profile_image_url:
        storage = get_storage()
        storage.delete(user.profile_image_url)

    db.session.delete(user)
    db.session.commit()

    response = jsonify(message="Account successfully deleted")
    unset_jwt_cookies(response)
    return response, 200
