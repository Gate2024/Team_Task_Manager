"""Cases blueprint route handlers."""

from __future__ import annotations

from datetime import date
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from ..common.events import create_notification, log_activity, notify_project_admins
from ..extensions import db
from ..models import Case, Project, ProjectMember, User
from ..schemas import CaseSchema, CaseStatusUpdateSchema, CaseUpdateSchema
from . import cases_bp

case_schema = CaseSchema()
case_status_schema = CaseStatusUpdateSchema()
case_update_schema = CaseUpdateSchema()


def _get_user_accessible_project_ids(user_id: int) -> tuple[set[int], set[int]]:
    """Return (admin_project_ids, member_only_project_ids) accessible to user."""
    memberships = db.session.execute(
        db.select(ProjectMember.project_id, ProjectMember.role).where(
            ProjectMember.user_id == user_id
        )
    ).all()
    owned_ids = set(
        db.session.execute(
            db.select(Project.id).where(Project.owner_id == user_id)
        ).scalars().all()
    )

    admin_ids = set(owned_ids)
    member_only_ids = set()

    for pid, role in memberships:
        if role in ("owner", "admin"):
            admin_ids.add(pid)
        else:
            member_only_ids.add(pid)

    return admin_ids, member_only_ids


@cases_bp.get("")
@jwt_required()
def list_cases():
    """List accessible cases across projects with filtering and pagination."""
    user_id = int(get_jwt_identity())
    admin_ids, member_ids = _get_user_accessible_project_ids(user_id)
    all_accessible_ids = admin_ids | member_ids

    if not all_accessible_ids:
        return jsonify(
            cases=[],
            total=0,
            page=1,
            limit=50,
            pages=0,
        ), 200

    query = db.select(Case).where(Case.project_id.in_(all_accessible_ids))

    # Project filter
    project_id = request.args.get("project_id", type=int)
    if project_id:
        if project_id not in all_accessible_ids:
            return jsonify(message="Forbidden: You do not have access to this project"), 403
        query = query.where(Case.project_id == project_id)

    # Status filter
    status = request.args.get("status")
    if status and status in ("open", "in_progress", "resolved", "closed"):
        query = query.where(Case.status == status)

    # Priority filter
    priority = request.args.get("priority")
    if priority and priority in ("low", "medium", "high", "urgent"):
        query = query.where(Case.priority == priority)

    # Assigned to filter
    assigned_to = request.args.get("assigned_to")
    if assigned_to:
        if assigned_to == "me":
            query = query.where(Case.assigned_to == user_id)
        elif assigned_to == "unassigned":
            query = query.where(Case.assigned_to.is_(None))
        else:
            try:
                query = query.where(Case.assigned_to == int(assigned_to))
            except ValueError:
                pass

    # Search filter (ticket_number, title, description)
    search = request.args.get("search", "").strip()
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            db.or_(
                Case.ticket_number.ilike(search_pattern),
                Case.title.ilike(search_pattern),
                Case.description.ilike(search_pattern),
            )
        )

    # Sorting
    sort_by = request.args.get("sort_by", "created_at")
    sort_dir = request.args.get("sort_dir", "desc")
    order_col = Case.created_at
    if sort_by == "due_date":
        order_col = Case.due_date
    elif sort_by == "priority":
        order_col = Case.priority
    elif sort_by == "status":
        order_col = Case.status
    elif sort_by == "ticket_number":
        order_col = Case.ticket_number

    if sort_dir == "asc":
        query = query.order_by(order_col.asc().nulls_last())
    else:
        query = query.order_by(order_col.desc().nulls_last())

    # Count total
    total = db.session.execute(
        db.select(db.func.count()).select_from(query.subquery())
    ).scalar_one()

    # Pagination
    page = max(1, request.args.get("page", 1, type=int))
    limit = min(100, max(1, request.args.get("limit", 50, type=int)))
    offset = (page - 1) * limit

    cases = db.session.execute(query.offset(offset).limit(limit)).scalars().all()
    pages = (total + limit - 1) // limit if limit > 0 else 0

    return jsonify(
        cases=case_schema.dump(cases, many=True),
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    ), 200


@cases_bp.post("")
@jwt_required()
def create_case():
    """Create a new case in a project where the caller is a member."""
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify(message="Request body must be valid JSON"), 400

    try:
        data = case_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid input"
        return jsonify(message=first_error, errors=err.messages), 400

    project_id = data["project_id"]
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify(message="Project not found"), 404

    # Verify caller is owner or member
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
        return jsonify(message="Forbidden: You are not a member of this project"), 403

    # Generate sequential ticket number
    last_case_id = (
        db.session.execute(db.select(Case.id).order_by(Case.id.desc())).scalar_one_or_none()
        or 0
    )
    ticket_number = f"CASE-{1000 + last_case_id + 1}"

    # Assignee verification if provided
    assigned_to = data.get("assigned_to")
    if assigned_to:
        is_assignee_member = (
            project.owner_id == assigned_to
            or db.session.execute(
                db.select(ProjectMember.id).where(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id == assigned_to,
                )
            ).scalar_one_or_none()
            is not None
        )
        if not is_assignee_member:
            return jsonify(message="Assignee must be an active member of this project"), 400

    new_case = Case(
        ticket_number=ticket_number,
        title=data["title"],
        description=data.get("description", ""),
        status=data.get("status", "open"),
        priority=data.get("priority", "medium"),
        project_id=project_id,
        created_by=user_id,
        assigned_to=assigned_to,
        due_date=data.get("due_date"),
    )

    db.session.add(new_case)
    db.session.flush()

    actor = db.session.get(User, user_id)
    actor_name = actor.name if actor else "Someone"

    # Log activity
    log_activity(
        action="case_created",
        actor_id=user_id,
        project_id=project_id,
        case_id=new_case.id,
        metadata={"ticket_number": ticket_number, "title": new_case.title},
    )

    # Notify assignee if assigned to someone else
    if assigned_to and assigned_to != user_id:
        create_notification(
            recipient_id=assigned_to,
            actor_id=user_id,
            type="case_assigned",
            title=f"New Case Assigned: {ticket_number}",
            message=f"{actor_name} assigned case '{new_case.title}' ({ticket_number}) to you",
            project_id=project_id,
            case_id=new_case.id,
        )

    db.session.commit()

    return jsonify(message="Case created successfully", case=case_schema.dump(new_case)), 201


@cases_bp.get("/<int:case_id>")
@jwt_required()
def get_case(case_id: int):
    """Retrieve full details of a specific case."""
    user_id = int(get_jwt_identity())
    c = db.session.get(Case, case_id)
    if not c:
        return jsonify(message="Case not found"), 404

    # Verify access
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

    return jsonify(case=case_schema.dump(c)), 200


@cases_bp.patch("/<int:case_id>")
@jwt_required()
def update_case(case_id: int):
    """Update case status, priority, assignee, description, or due date."""
    user_id = int(get_jwt_identity())
    c = db.session.get(Case, case_id)
    if not c:
        return jsonify(message="Case not found"), 404

    project = db.session.get(Project, c.project_id)
    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == c.project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner_or_admin = (
        project.owner_id == user_id or (membership and membership.role in ("owner", "admin"))
    )
    is_assignee = c.assigned_to == user_id

    if not (is_owner_or_admin or is_assignee or (membership is not None)):
        return jsonify(message="Forbidden: You do not have permission to modify this case"), 403

    json_data = request.get_json(silent=True) or {}
    try:
        data = case_update_schema.load(json_data)
    except ValidationError as err:
        first_error = next(iter(err.messages.values()))[0] if err.messages else "Invalid input"
        return jsonify(message=first_error, errors=err.messages), 400

    actor = db.session.get(User, user_id)
    actor_name = actor.name if actor else "Someone"

    # Title & Priority: Owner / Admin only
    if "title" in data:
        if not is_owner_or_admin:
            return jsonify(message="Only project owners and admins can rename cases"), 403
        c.title = data["title"].strip()

    if "priority" in data:
        if not is_owner_or_admin:
            return jsonify(message="Only project owners and admins can adjust case priority"), 403
        c.priority = data["priority"]

    if "description" in data:
        c.description = data["description"] or ""

    if "due_date" in data:
        if not is_owner_or_admin:
            return jsonify(message="Only project owners and admins can set case due date"), 403
        c.due_date = data["due_date"]

    # Assignee change
    if "assigned_to" in data:
        new_assignee_id = data["assigned_to"]
        if not is_owner_or_admin:
            # Member can only assign to self if currently unassigned
            if not (c.assigned_to is None and new_assignee_id == user_id):
                return jsonify(message="Forbidden: Only owners and admins can reassign cases"), 403

        if new_assignee_id:
            is_valid_assignee = (
                project.owner_id == new_assignee_id
                or db.session.execute(
                    db.select(ProjectMember.id).where(
                        ProjectMember.project_id == c.project_id,
                        ProjectMember.user_id == new_assignee_id,
                    )
                ).scalar_one_or_none()
                is not None
            )
            if not is_valid_assignee:
                return jsonify(message="Assignee must be an active project member"), 400

        old_assignee = c.assigned_to
        c.assigned_to = new_assignee_id

        if new_assignee_id != old_assignee:
            action_type = "case_self_assigned" if new_assignee_id == user_id else "case_assigned"
            log_activity(
                action=action_type,
                actor_id=user_id,
                project_id=c.project_id,
                case_id=c.id,
                metadata={"ticket_number": c.ticket_number, "assigned_to": new_assignee_id},
            )
            if new_assignee_id and new_assignee_id != user_id:
                create_notification(
                    recipient_id=new_assignee_id,
                    actor_id=user_id,
                    type="case_assigned",
                    title=f"Case Assigned: {c.ticket_number}",
                    message=f"{actor_name} assigned case '{c.title}' to you",
                    project_id=c.project_id,
                    case_id=c.id,
                )

    # Status change
    if "status" in data:
        old_status = c.status
        new_status = data["status"]
        if old_status != new_status:
            c.status = new_status
            action_name = "case_resolved" if new_status == "resolved" else "case_status_changed"
            log_activity(
                action=action_name,
                actor_id=user_id,
                project_id=c.project_id,
                case_id=c.id,
                metadata={
                    "ticket_number": c.ticket_number,
                    "old_status": old_status,
                    "new_status": new_status,
                },
            )
            # Notify creator if creator is different
            if c.created_by != user_id:
                create_notification(
                    recipient_id=c.created_by,
                    actor_id=user_id,
                    type="case_status_changed",
                    title=f"Case {c.ticket_number} Updated",
                    message=f"{actor_name} changed status of '{c.title}' to {new_status.replace('_', ' ').title()}",
                    project_id=c.project_id,
                    case_id=c.id,
                )

    db.session.commit()
    return jsonify(message="Case updated successfully", case=case_schema.dump(c)), 200


@cases_bp.post("/<int:case_id>/self-assign")
@jwt_required()
def self_assign_case(case_id: int):
    """Allow an active project member to assign an unassigned case to themselves."""
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
        return jsonify(message="Forbidden: You are not a member of this project"), 403

    if c.assigned_to is not None:
        if c.assigned_to == user_id:
            return jsonify(message="Case is already assigned to you", case=case_schema.dump(c)), 200
        return jsonify(
            message="Conflict: This case has already been assigned to another team member"
        ), 409

    c.assigned_to = user_id
    actor = db.session.get(User, user_id)
    actor_name = actor.name if actor else "Team member"

    log_activity(
        action="case_self_assigned",
        actor_id=user_id,
        project_id=c.project_id,
        case_id=c.id,
        metadata={"ticket_number": c.ticket_number, "assigned_to": user_id},
    )

    notify_project_admins(
        project_id=c.project_id,
        type="case_self_assigned",
        title=f"Case Claimed: {c.ticket_number}",
        message=f"{actor_name} self-assigned case '{c.title}' ({c.ticket_number})",
        actor_id=user_id,
        case_id=c.id,
    )

    db.session.commit()
    return jsonify(message="Case assigned to you successfully", case=case_schema.dump(c)), 200


@cases_bp.delete("/<int:case_id>")
@jwt_required()
def delete_case(case_id: int):
    """Delete case. Allowed only for project owner or admin."""
    user_id = int(get_jwt_identity())
    c = db.session.get(Case, case_id)
    if not c:
        return jsonify(message="Case not found"), 404

    project = db.session.get(Project, c.project_id)
    membership = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == c.project_id,
            ProjectMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    is_owner_or_admin = (
        project.owner_id == user_id or (membership and membership.role in ("owner", "admin"))
    )
    if not is_owner_or_admin:
        return jsonify(message="Forbidden: Only project owners and admins can delete cases"), 403

    log_activity(
        action="case_deleted",
        actor_id=user_id,
        project_id=c.project_id,
        metadata={"ticket_number": c.ticket_number, "title": c.title},
    )

    db.session.delete(c)
    db.session.commit()

    return jsonify(message="Case deleted successfully"), 200
