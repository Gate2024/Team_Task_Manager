"""Reports and analytics route handlers."""

from __future__ import annotations

from datetime import date, datetime
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Case, Project, ProjectMember, Task, User
from . import reports_bp


def _get_user_role_context(user_id: int, project_id: int | None = None) -> tuple[bool, set[int]]:
    """Determine if caller has admin/owner privileges and get accessible project IDs."""
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

    admin_proj_ids = set(owned_ids)
    all_proj_ids = set(owned_ids)

    for pid, role in memberships:
        all_proj_ids.add(pid)
        if role in ("owner", "admin"):
            admin_proj_ids.add(pid)

    if project_id:
        if project_id not in all_proj_ids:
            return False, set()
        is_admin = project_id in admin_proj_ids
        return is_admin, {project_id}

    is_overall_admin = len(admin_proj_ids) > 0
    return is_overall_admin, (admin_proj_ids if is_overall_admin else all_proj_ids)


@reports_bp.get("/summary")
@jwt_required()
def get_summary_report():
    """Aggregated productivity metrics for projects, tasks, and cases."""
    user_id = int(get_jwt_identity())
    project_id = request.args.get("project_id", type=int)

    is_admin, accessible_projects = _get_user_role_context(user_id, project_id)
    if not accessible_projects:
        empty_res = dict(
            is_admin=False,
            total_projects=0,
            total_tasks=0,
            completed_tasks=0,
            in_progress_tasks=0,
            todo_tasks=0,
            overdue_tasks=0,
            completion_rate=0.0,
            total_cases=0,
            resolved_cases=0,
            open_cases=0,
            case_resolution_rate=0.0,
            priority_distribution={"low": 0, "medium": 0, "high": 0, "urgent": 0},
            status_distribution={"todo": 0, "in_progress": 0, "done": 0},
        )
        return jsonify(summary=empty_res, **empty_res), 200

    # Tasks query
    task_query = db.select(Task).where(Task.project_id.in_(accessible_projects))
    # If not admin of this scope, limit to user's assigned tasks
    if not is_admin:
        task_query = task_query.where(Task.assigned_to == user_id)

    tasks = db.session.execute(task_query).scalars().all()

    today = date.today()
    total_tasks = len(tasks)
    todo = 0
    in_progress = 0
    completed = 0
    overdue = 0
    priority_dist = {"low": 0, "medium": 0, "high": 0, "urgent": 0}
    status_dist = {"todo": 0, "in_progress": 0, "done": 0}

    for t in tasks:
        if t.status in status_dist:
            status_dist[t.status] += 1
        if t.priority in priority_dist:
            priority_dist[t.priority] += 1

        if t.status == "todo":
            todo += 1
        elif t.status == "in_progress":
            in_progress += 1
        elif t.status == "done":
            completed += 1

        if t.due_date and t.status != "done" and t.due_date < today:
            overdue += 1

    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # Cases query
    case_query = db.select(Case).where(Case.project_id.in_(accessible_projects))
    if not is_admin:
        case_query = case_query.where(Case.assigned_to == user_id)

    cases = db.session.execute(case_query).scalars().all()
    total_cases = len(cases)
    resolved_cases = sum(1 for c in cases if c.status in ("resolved", "closed"))
    open_cases = sum(1 for c in cases if c.status in ("open", "in_progress"))
    case_resolution_rate = round((resolved_cases / total_cases * 100), 1) if total_cases > 0 else 0.0

    res_payload = dict(
        is_admin=is_admin,
        total_projects=len(accessible_projects),
        total_tasks=total_tasks,
        completed_tasks=completed,
        in_progress_tasks=in_progress,
        todo_tasks=todo,
        overdue_tasks=overdue,
        completion_rate=completion_rate,
        total_cases=total_cases,
        resolved_cases=resolved_cases,
        open_cases=open_cases,
        case_resolution_rate=case_resolution_rate,
        priority_distribution=priority_dist,
        status_distribution=status_dist,
    )
    return jsonify(summary=res_payload, **res_payload), 200


@reports_bp.get("/workload")
@jwt_required()
def get_workload_report():
    """Team member workload matrix. Full team for Admins, personal for Members."""
    user_id = int(get_jwt_identity())
    project_id = request.args.get("project_id", type=int)

    is_admin, accessible_projects = _get_user_role_context(user_id, project_id)
    if not accessible_projects:
        return jsonify(workload=[]), 200

    today = date.today()

    if is_admin:
        # Collect all unique members in accessible projects
        member_users = (
            db.session.execute(
                db.select(User)
                .join(ProjectMember, ProjectMember.user_id == User.id)
                .where(ProjectMember.project_id.in_(accessible_projects))
                .distinct()
            )
            .scalars()
            .all()
        )
        # Also include project owners
        owners = (
            db.session.execute(
                db.select(User)
                .join(Project, Project.owner_id == User.id)
                .where(Project.id.in_(accessible_projects))
                .distinct()
            )
            .scalars()
            .all()
        )
        all_users = {u.id: u for u in (member_users + owners)}.values()
    else:
        # Member only sees their own workload
        user = db.session.get(User, user_id)
        all_users = [user] if user else []

    workload_data = []
    for u in all_users:
        tasks = (
            db.session.execute(
                db.select(Task).where(
                    Task.project_id.in_(accessible_projects),
                    Task.assigned_to == u.id,
                )
            )
            .scalars()
            .all()
        )
        cases = (
            db.session.execute(
                db.select(Case).where(
                    Case.project_id.in_(accessible_projects),
                    Case.assigned_to == u.id,
                )
            )
            .scalars()
            .all()
        )

        total_tasks = len(tasks)
        completed = sum(1 for t in tasks if t.status == "done")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        overdue = sum(1 for t in tasks if t.due_date and t.status != "done" and t.due_date < today)
        active_cases = sum(1 for c in cases if c.status in ("open", "in_progress"))

        rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        workload_data.append(
            {
                "user_id": u.id,
                "name": u.name,
                "email": u.email,
                "profile_image_url": u.profile_image_url,
                "total_tasks": total_tasks,
                "completed_tasks": completed,
                "in_progress_tasks": in_progress,
                "overdue_tasks": overdue,
                "active_cases": active_cases,
                "completion_rate": rate,
            }
        )

    # Sort workload by total_tasks descending
    workload_data.sort(key=lambda x: x["total_tasks"], reverse=True)

    return jsonify(workload=workload_data), 200
