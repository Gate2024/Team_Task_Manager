"""Tasks blueprint route handlers."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Project, ProjectMember, Task
from ..schemas import TaskSchema
from . import tasks_bp

task_schema = TaskSchema()


@tasks_bp.get("")
@jwt_required()
def list_tasks():
    """List accessible tasks across all projects where user participates."""
    user_id = int(get_jwt_identity())

    # Find projects where user is owner or member with role
    memberships = db.session.execute(
        db.select(ProjectMember.project_id, ProjectMember.role).where(
            ProjectMember.user_id == user_id
        )
    ).all()

    owned_projects = db.session.execute(
        db.select(Project.id).where(Project.owner_id == user_id)
    ).scalars().all()

    admin_project_ids = set(owned_projects)
    member_project_ids = set()

    for pid, role in memberships:
        if role in ("owner", "admin"):
            admin_project_ids.add(pid)
        else:
            member_project_ids.add(pid)

    all_tasks = []

    # 1. For admin/owner projects: get all tasks
    if admin_project_ids:
        admin_tasks = db.session.execute(
            db.select(Task).where(Task.project_id.in_(admin_project_ids)).order_by(Task.created_at.desc())
        ).scalars().all()
        all_tasks.extend(admin_tasks)

    # 2. For member projects: get only assigned tasks
    if member_project_ids:
        member_tasks = db.session.execute(
            db.select(Task).where(
                Task.project_id.in_(member_project_ids),
                Task.assigned_to == user_id,
            ).order_by(Task.created_at.desc())
        ).scalars().all()
        all_tasks.extend(member_tasks)

    # Deduplicate by task ID if overlapping
    seen = set()
    deduped = []
    for t in all_tasks:
        if t.id not in seen:
            seen.add(t.id)
            deduped.append(t)

    return jsonify(tasks=task_schema.dump(deduped, many=True)), 200


@tasks_bp.patch("/<int:task_id>/status")
@jwt_required()
def update_task_status(task_id: int):
    """Update task status. Allowed only for assigned user or project owner/admin."""
    user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify(message="Task not found"), 404

    project = db.session.get(Project, task.project_id)
    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner_or_admin = (
        project.owner_id == user_id or (membership and membership.role in ("owner", "admin"))
    )
    is_assignee = task.assigned_to == user_id

    # Invariant 8: Only assigned member or project owner/admin can update status
    if not (is_owner_or_admin or is_assignee):
        return jsonify(
            message="Forbidden: Only assigned member or project owner/admin can update task status"
        ), 403

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("todo", "in_progress", "done"):
        return jsonify(message="Status must be one of: todo, in_progress, done"), 400

    task.status = status
    db.session.commit()

    return jsonify(message="Task status updated", task=task_schema.dump(task)), 200


@tasks_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    """Delete task. Allowed only for project owner or admin."""
    user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify(message="Task not found"), 404

    project = db.session.get(Project, task.project_id)
    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner_or_admin = (
        project.owner_id == user_id or (membership and membership.role in ("owner", "admin"))
    )

    if not is_owner_or_admin:
        return jsonify(message="Forbidden: Only project owners and admins can delete tasks"), 403

    db.session.delete(task)
    db.session.commit()

    return jsonify(message="Task deleted successfully"), 200
