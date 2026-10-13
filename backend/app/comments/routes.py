"""Comments route handlers for tasks and cases."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from ..common.events import create_notification, log_activity, parse_and_notify_mentions
from ..extensions import db
from ..models import Case, Comment, Project, ProjectMember, Task, User
from ..schemas import CommentSchema
from . import comments_bp

comment_schema = CommentSchema()


@comments_bp.get("/tasks/<int:task_id>/comments")
@jwt_required()
def list_task_comments(task_id: int):
    """Retrieve all comments on a specific task."""
    user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify(message="Task not found"), 404

    project = db.session.get(Project, task.project_id)
    is_member = (
        project.owner_id == user_id
        or db.session.execute(
            db.select(ProjectMember.id).where(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        is not None
    )
    if not is_member:
        return jsonify(message="Forbidden: You do not have access to this task"), 403

    comments = db.session.execute(
        db.select(Comment)
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
    ).scalars().all()

    return jsonify(comments=comment_schema.dump(comments, many=True)), 200


@comments_bp.post("/tasks/<int:task_id>/comments")
@jwt_required()
def create_task_comment(task_id: int):
    """Add a new comment message to a task."""
    user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify(message="Task not found"), 404

    project = db.session.get(Project, task.project_id)
    is_member = (
        project.owner_id == user_id
        or db.session.execute(
            db.select(ProjectMember.id).where(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        is not None
    )
    if not is_member:
        return jsonify(message="Forbidden: You do not have access to this task"), 403

    json_data = request.get_json(silent=True) or {}
    try:
        data = comment_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid input"
        return jsonify(message=first_error, errors=err.messages), 400

    body = data["body"].strip()
    if not body:
        return jsonify(message="Comment body cannot be empty"), 400

    comment = Comment(
        author_id=user_id,
        task_id=task_id,
        body=body,
    )
    db.session.add(comment)
    db.session.flush()

    actor = db.session.get(User, user_id)
    actor_name = actor.name if actor else "Someone"

    # Log activity
    log_activity(
        action="comment_added",
        actor_id=user_id,
        project_id=task.project_id,
        task_id=task.id,
        metadata={"task_title": task.title},
    )

    # Notify assignee if different from author
    if task.assigned_to and task.assigned_to != user_id:
        create_notification(
            recipient_id=task.assigned_to,
            actor_id=user_id,
            type="task_comment",
            title=f"New comment on {task.title}",
            message=f"{actor_name} commented: {body[:100]}",
            project_id=task.project_id,
            task_id=task.id,
        )

    # Parse @mentions
    if actor:
        parse_and_notify_mentions(
            text=body,
            actor=actor,
            project_id=task.project_id,
            task_id=task.id,
            context_title=f"task '{task.title}'",
        )

    db.session.commit()
    return jsonify(message="Comment added successfully", comment=comment_schema.dump(comment)), 201


@comments_bp.get("/cases/<int:case_id>/comments")
@jwt_required()
def list_case_comments(case_id: int):
    """Retrieve all comments on a specific case."""
    user_id = int(get_jwt_identity())
    c = db.session.get(Case, case_id)
    if not c:
        return jsonify(message="Case not found"), 404

    project = db.session.get(Project, c.project_id)
    is_member = (
        project.owner_id == user_id
        or db.session.execute(
            db.select(ProjectMember.id).where(
                ProjectMember.project_id == c.project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        is not None
    )
    if not is_member:
        return jsonify(message="Forbidden: You do not have access to this case"), 403

    comments = db.session.execute(
        db.select(Comment)
        .where(Comment.case_id == case_id)
        .order_by(Comment.created_at.asc())
    ).scalars().all()

    return jsonify(comments=comment_schema.dump(comments, many=True)), 200


@comments_bp.post("/cases/<int:case_id>/comments")
@jwt_required()
def create_case_comment(case_id: int):
    """Add a new comment message to a case."""
    user_id = int(get_jwt_identity())
    c = db.session.get(Case, case_id)
    if not c:
        return jsonify(message="Case not found"), 404

    project = db.session.get(Project, c.project_id)
    is_member = (
        project.owner_id == user_id
        or db.session.execute(
            db.select(ProjectMember.id).where(
                ProjectMember.project_id == c.project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        is not None
    )
    if not is_member:
        return jsonify(message="Forbidden: You do not have access to this case"), 403

    json_data = request.get_json(silent=True) or {}
    try:
        data = comment_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid input"
        return jsonify(message=first_error, errors=err.messages), 400

    body = data["body"].strip()
    if not body:
        return jsonify(message="Comment body cannot be empty"), 400

    comment = Comment(
        author_id=user_id,
        case_id=case_id,
        body=body,
    )
    db.session.add(comment)
    db.session.flush()

    actor = db.session.get(User, user_id)
    actor_name = actor.name if actor else "Someone"

    # Log activity
    log_activity(
        action="comment_added",
        actor_id=user_id,
        project_id=c.project_id,
        case_id=c.id,
        metadata={"ticket_number": c.ticket_number, "case_title": c.title},
    )

    # Notify assignee if different from author
    if c.assigned_to and c.assigned_to != user_id:
        create_notification(
            recipient_id=c.assigned_to,
            actor_id=user_id,
            type="case_comment",
            title=f"New comment on {c.ticket_number}",
            message=f"{actor_name} commented: {body[:100]}",
            project_id=c.project_id,
            case_id=c.id,
        )

    # Parse @mentions
    if actor:
        parse_and_notify_mentions(
            text=body,
            actor=actor,
            project_id=c.project_id,
            case_id=c.id,
            context_title=f"case '{c.ticket_number}'",
        )

    db.session.commit()
    return jsonify(message="Comment added successfully", comment=comment_schema.dump(comment)), 201


@comments_bp.delete("/comments/<int:comment_id>")
@jwt_required()
def delete_comment(comment_id: int):
    """Delete a comment. Allowed for comment author or project owner/admin."""
    user_id = int(get_jwt_identity())
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify(message="Comment not found"), 404

    # Determine project
    project_id = None
    if comment.task_id:
        task = db.session.get(Task, comment.task_id)
        if task:
            project_id = task.project_id
    elif comment.case_id:
        c = db.session.get(Case, comment.case_id)
        if c:
            project_id = c.project_id

    project = db.session.get(Project, project_id) if project_id else None
    membership = (
        db.session.execute(
            db.select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        if project_id
        else None
    )

    is_author = comment.author_id == user_id
    is_owner_or_admin = (
        project and (project.owner_id == user_id or (membership and membership.role in ("owner", "admin")))
    )

    if not (is_author or is_owner_or_admin):
        return jsonify(message="Forbidden: You cannot delete this comment"), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify(message="Comment deleted successfully"), 200
