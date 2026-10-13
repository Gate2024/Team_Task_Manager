"""Projects and membership route handlers."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Project, ProjectMember, Task, User
from ..schemas import ProjectMemberSchema, ProjectSchema, TaskSchema
from . import projects_bp

project_schema = ProjectSchema()
task_schema = TaskSchema()
project_member_schema = ProjectMemberSchema()


@projects_bp.get("")
@jwt_required()
def list_projects():
    """List all projects where current user is an owner, admin, or member."""
    user_id = int(get_jwt_identity())

    # Find project IDs where user has a membership
    member_subq = (
        db.select(ProjectMember.project_id, ProjectMember.role)
        .where(ProjectMember.user_id == user_id)
        .subquery()
    )

    projects_query = (
        db.select(Project, member_subq.c.role)
        .outerjoin(member_subq, Project.id == member_subq.c.project_id)
        .where(
            db.or_(
                Project.owner_id == user_id,
                member_subq.c.project_id.is_not(None),
            )
        )
        .order_by(Project.created_at.desc())
    )

    results = db.session.execute(projects_query).all()

    output = []
    for project, member_role in results:
        role = "owner" if project.owner_id == user_id else (member_role or "member")
        item = project_schema.dump(project)
        item["user_role"] = role
        output.append(item)

    return jsonify(projects=output), 200


@projects_bp.post("")
@jwt_required()
def create_project():
    """Create a new project and assign creator as owner membership."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    if not name:
        return jsonify(message="Project name is required"), 400
    if len(name) > 100:
        return jsonify(message="Project name must not exceed 100 characters"), 400

    description = data.get("description", "").strip()

    # Invariant 1: Creator is stored as owner_id and owner membership in one transaction
    project = Project(name=name, description=description, owner_id=user_id)
    db.session.add(project)
    db.session.flush()

    membership = ProjectMember(project_id=project.id, user_id=user_id, role="owner")
    db.session.add(membership)
    db.session.commit()

    res = project_schema.dump(project)
    res["user_role"] = "owner"
    return jsonify(message="Project created successfully", project=res), 201


@projects_bp.get("/<int:project_id>")
@jwt_required()
def get_project(project_id: int):
    """Retrieve details for a single project."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not membership and project.owner_id != user_id:
        return jsonify(message="Access denied to this project"), 403

    role = "owner" if project.owner_id == user_id else (membership.role if membership else "member")
    res = project_schema.dump(project)
    res["user_role"] = role
    return jsonify(project=res), 200


@projects_bp.patch("/<int:project_id>")
@jwt_required()
def update_project(project_id: int):
    """Update project name and/or description (restricted to owner and admin)."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner = project.owner_id == user_id or (membership and membership.role == "owner")
    is_admin = membership and membership.role == "admin"

    if not (is_owner or is_admin):
        return jsonify(message="Only project owners and admins can update project details"), 403

    data = request.get_json(silent=True) or {}
    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return jsonify(message="Project name cannot be empty"), 400
        if len(name) > 100:
            return jsonify(message="Project name must not exceed 100 characters"), 400
        project.name = name

    if "description" in data:
        project.description = str(data["description"]).strip()

    db.session.commit()
    res = project_schema.dump(project)
    res["user_role"] = "owner" if is_owner else "admin"
    return jsonify(message="Project updated successfully", project=res), 200


@projects_bp.delete("/<int:project_id>")
@jwt_required()
def delete_project(project_id: int):
    """Delete a project and cascade tasks and memberships (restricted to owner)."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner = project.owner_id == user_id or (membership and membership.role == "owner")
    if not is_owner:
        return jsonify(message="Only the project owner can delete this project"), 403

    db.session.delete(project)
    db.session.commit()
    return jsonify(message="Project deleted successfully"), 200


@projects_bp.get("/<int:project_id>/tasks")
@jwt_required()
def list_project_tasks(project_id: int):
    """List tasks in a project filtered by role visibility, with optional pagination."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not membership and project.owner_id != user_id:
        return jsonify(message="Access denied to this project"), 403

    role = "owner" if project.owner_id == user_id else (membership.role if membership else "member")

    if role in ("owner", "admin"):
        query = db.select(Task).where(Task.project_id == project_id).order_by(Task.created_at.desc())
    else:
        # Regular member sees only assigned tasks
        query = (
            db.select(Task)
            .where(
                Task.project_id == project_id,
                Task.assigned_to == user_id,
            )
            .order_by(Task.created_at.desc())
        )

    all_tasks = db.session.execute(query).scalars().all()
    total = len(all_tasks)

    page = request.args.get("page", type=int)
    limit = request.args.get("limit", default=20, type=int)

    if page is not None and page > 0:
        import math
        pages = max(1, math.ceil(total / limit)) if limit > 0 else 1
        start = (page - 1) * limit
        end = start + limit
        paged_tasks = all_tasks[start:end]
        return jsonify(
            tasks=task_schema.dump(paged_tasks, many=True),
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "pages": pages,
            },
        ), 200

    return jsonify(
        tasks=task_schema.dump(all_tasks, many=True),
        pagination={
            "page": 1,
            "limit": total,
            "total": total,
            "pages": 1,
        },
    ), 200


@projects_bp.post("/<int:project_id>/tasks")
@jwt_required()
def create_project_task(project_id: int):
    """Create a task within a project (restricted to owner or admin)."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    role = "owner" if project.owner_id == user_id else (membership.role if membership else None)
    if role not in ("owner", "admin"):
        return jsonify(message="Only project owners and admins can create tasks"), 403

    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    if not title:
        return jsonify(message="Task title is required"), 400
    if len(title) > 100:
        return jsonify(message="Task title must not exceed 100 characters"), 400

    description = str(data.get("description", "")).strip()
    assigned_to = data.get("assigned_to")
    status = data.get("status", "todo")
    if status not in ("todo", "in_progress", "done"):
        status = "todo"

    priority = data.get("priority", "medium")
    if priority not in ("low", "medium", "high", "urgent"):
        priority = "medium"

    parsed_due_date = None
    due_date = data.get("due_date")
    if due_date:
        try:
            from datetime import date
            if isinstance(due_date, str):
                parsed_due_date = date.fromisoformat(due_date)
            else:
                parsed_due_date = due_date
        except (ValueError, TypeError):
            return jsonify(message="Invalid due_date format (must be YYYY-MM-DD)"), 400

    # If assignee is provided, ensure they belong to the project (Invariant 5)
    if assigned_to:
        assignee_member = db.session.execute(
            db.select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == int(assigned_to),
            )
        ).scalar_one_or_none()
        if not assignee_member and project.owner_id != int(assigned_to):
            return jsonify(message="Assigned user must be an active member of this project"), 400
        assigned_to = int(assigned_to)

    new_task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        project_id=project_id,
        created_by=user_id,
        assigned_to=assigned_to,
        due_date=parsed_due_date,
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify(message="Task created successfully", task=task_schema.dump(new_task)), 201


@projects_bp.get("/<int:project_id>/members")
@jwt_required()
def list_project_members(project_id: int):
    """List members of a project. Authenticated user must belong to the project."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not membership and project.owner_id != user_id:
        return jsonify(message="Access denied to this project"), 403

    members = db.session.execute(
        db.select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .order_by(ProjectMember.created_at.asc())
    ).scalars().all()

    return jsonify(members=project_member_schema.dump(members, many=True)), 200


@projects_bp.post("/<int:project_id>/members")
@jwt_required()
def add_project_member(project_id: int):
    """Add a member to a project. Restricted to project owner or admin."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    caller_membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner = project.owner_id == user_id or (
        caller_membership and caller_membership.role == "owner"
    )
    is_admin = caller_membership and caller_membership.role == "admin"

    if not (is_owner or is_admin):
        return jsonify(message="Only project owners and admins can add members"), 403

    data = request.get_json(silent=True) or {}
    email = data.get("email")
    target_user_id = data.get("user_id")

    if not email and not target_user_id:
        return jsonify(message="User email or user_id is required"), 400

    target_user = None
    if email:
        clean_email = str(email).strip().lower()
        target_user = db.session.execute(
            db.select(User).where(User.email == clean_email)
        ).scalar_one_or_none()
    elif target_user_id:
        try:
            target_user = db.session.get(User, int(target_user_id))
        except (ValueError, TypeError):
            return jsonify(message="Invalid user_id provided"), 400

    if not target_user:
        return jsonify(message="User not found"), 404

    # Check if target user is already a member
    existing_membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == target_user.id,
        )
    ).scalar_one_or_none()

    if existing_membership or project.owner_id == target_user.id:
        return jsonify(message="User is already a member of this project"), 409

    role = data.get("role", "member")
    if role not in ("admin", "member"):
        return jsonify(message="Role must be 'admin' or 'member'"), 400

    new_member = ProjectMember(
        project_id=project_id,
        user_id=target_user.id,
        role=role,
    )
    db.session.add(new_member)
    db.session.commit()

    return jsonify(
        message="Member added successfully",
        member=project_member_schema.dump(new_member),
    ), 201


@projects_bp.delete("/<int:project_id>/members/<int:user_id>")
@jwt_required()
def remove_project_member(project_id: int, user_id: int):
    """Remove a member from a project. Restricted to project owner or admin."""
    caller_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    caller_membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == caller_id,
        )
    ).scalar_one_or_none()

    is_owner = project.owner_id == caller_id or (
        caller_membership and caller_membership.role == "owner"
    )
    is_admin = caller_membership and caller_membership.role == "admin"

    if not (is_owner or is_admin):
        return jsonify(message="Only project owners and admins can remove members"), 403

    # Locate target membership by user_id or by membership id
    target_membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not target_membership:
        target_membership = db.session.execute(
            db.select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.id == user_id,
            )
        ).scalar_one_or_none()

    if not target_membership:
        return jsonify(message="Member not found in this project"), 404

    # Invariant: Project owner cannot be removed
    if target_membership.role == "owner" or target_membership.user_id == project.owner_id:
        return jsonify(message="The project owner cannot be removed from the project"), 400

    # Invariant: Admin cannot remove another admin or owner; only owner can remove admins
    if not is_owner and target_membership.role in ("owner", "admin"):
        return jsonify(
            message="Project admins cannot remove other admins. Only the owner can remove admins"
        ), 403

    # Unassign any tasks in this project assigned to this user
    db.session.execute(
        db.update(Task)
        .where(
            Task.project_id == project_id,
            Task.assigned_to == target_membership.user_id,
        )
        .values(assigned_to=None)
    )

    db.session.delete(target_membership)
    db.session.commit()

    return jsonify(message="Member removed successfully"), 200
