"""Projects and membership route handlers."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Project, ProjectMember, Task, User
from ..schemas import ProjectSchema, TaskSchema
from . import projects_bp

project_schema = ProjectSchema()
task_schema = TaskSchema()


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
    project = Project(name=name, owner_id=user_id)
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


@projects_bp.get("/<int:project_id>/tasks")
@jwt_required()
def list_project_tasks(project_id: int):
    """List tasks in a project filtered by role visibility."""
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
        tasks = db.session.execute(
            db.select(Task).where(Task.project_id == project_id).order_by(Task.created_at.desc())
        ).scalars().all()
    else:
        # Regular member sees only assigned tasks
        tasks = db.session.execute(
            db.select(Task).where(
                Task.project_id == project_id,
                Task.assigned_to == user_id,
            ).order_by(Task.created_at.desc())
        ).scalars().all()

    return jsonify(tasks=task_schema.dump(tasks, many=True)), 200


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

    description = str(data.get("description", "")).strip()
    assigned_to = data.get("assigned_to")
    status = data.get("status", "todo")
    if status not in ("todo", "in_progress", "done"):
        status = "todo"

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
        project_id=project_id,
        created_by=user_id,
        assigned_to=assigned_to,
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify(message="Task created successfully", task=task_schema.dump(new_task)), 201
