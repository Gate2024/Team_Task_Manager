"""ActivityLog route handlers."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import ActivityLog, Project, ProjectMember
from ..schemas import ActivityLogSchema
from . import activity_bp

activity_schema = ActivityLogSchema()


@activity_bp.get("/activity")
@jwt_required()
def list_global_activity():
    """Retrieve recent workspace activity across all user projects."""
    user_id = int(get_jwt_identity())
    limit = min(100, max(1, request.args.get("limit", 40, type=int)))

    # Get accessible project IDs
    memberships = db.session.execute(
        db.select(ProjectMember.project_id).where(ProjectMember.user_id == user_id)
    ).scalars().all()
    owned_projects = db.session.execute(
        db.select(Project.id).where(Project.owner_id == user_id)
    ).scalars().all()
    all_project_ids = set(memberships) | set(owned_projects)

    if not all_project_ids:
        return jsonify(activities=[], activity=[]), 200

    query = (
        db.select(ActivityLog)
        .where(
            db.or_(
                ActivityLog.project_id.in_(all_project_ids),
                ActivityLog.actor_id == user_id,
            )
        )
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )

    activities = db.session.execute(query).scalars().all()
    dumped = activity_schema.dump(activities, many=True)
    return jsonify(activities=dumped, activity=dumped), 200


@activity_bp.get("/projects/<int:project_id>/activity")
@jwt_required()
def list_project_activity(project_id: int):
    """Retrieve activity history for a specific project."""
    user_id = int(get_jwt_identity())
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    is_member = (
        project.owner_id == user_id
        or db.session.execute(
            db.select(ProjectMember.id).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id,
            )
        ).scalar_one_or_none()
        is not None
    )
    if not is_member:
        return jsonify(message="Forbidden: You do not have access to this project"), 403

    limit = min(100, max(1, request.args.get("limit", 50, type=int)))
    activities = db.session.execute(
        db.select(ActivityLog)
        .where(ActivityLog.project_id == project_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    ).scalars().all()

    dumped = activity_schema.dump(activities, many=True)
    return jsonify(activities=dumped, activity=dumped), 200
