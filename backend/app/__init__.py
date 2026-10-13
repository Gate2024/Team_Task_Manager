"""Flask application factory."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    verify_jwt_in_request,
)

from .config import config_from_environment, validate_required_settings
from .extensions import db, jwt, migrate
from . import models  # noqa: F401 - registers model metadata for migrations
from .auth import auth_bp
from .projects import projects_bp
from .tasks import tasks_bp
from .cases import cases_bp
from .comments import comments_bp
from .notifications import notifications_bp
from .activity import activity_bp
from .reports import reports_bp


def create_app(
    config_object: object | None = None,
    config_overrides: Mapping[str, Any] | None = None,
) -> Flask:
    """Build and configure an application instance."""

    app = Flask(__name__)
    app.config.from_object(config_object or config_from_environment())
    if config_overrides:
        app.config.update(config_overrides)

    validate_required_settings(app.config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Configure JWT error responses with structured, safe error codes
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        token_type = jwt_payload.get("type", "access")
        return jsonify(
            code="token_expired",
            message=f"The {token_type} token has expired",
            token_type=token_type,
        ), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify(
            code="invalid_token",
            message="Invalid or malformed authentication token",
        ), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        return jsonify(
            code="authorization_required",
            message="Authentication credentials are required to access this resource",
        ), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify(
            code="token_revoked",
            message="Authentication session has been revoked",
        ), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_callback(jwt_header, jwt_payload):
        return jsonify(
            code="fresh_token_required",
            message="A fresh login is required for this action",
        ), 401

    # Implicit sliding session renewal during active usage
    @app.after_request
    def refresh_expiring_jwts(response):
        """Silently slide the access token forward when nearing expiration during active usage."""
        if request.path in ("/api/auth/logout", "/api/auth/refresh"):
            return response

        # Only refresh on successful responses (do not set cookies on errors or redirects)
        if response.status_code >= 400 or response.status_code == 302:
            return response

        try:
            verify_jwt_in_request(optional=True)
            jwt_data = get_jwt()
            if jwt_data and jwt_data.get("type") == "access":
                exp_timestamp = jwt_data.get("exp")
                if exp_timestamp:
                    now = datetime.now(timezone.utc)
                    target_timestamp = datetime.fromtimestamp(exp_timestamp, timezone.utc)
                    # Refresh if remaining time is under 5 minutes (300 seconds)
                    if (target_timestamp - now).total_seconds() < 300:
                        user_id = jwt_data.get("sub")
                        if user_id:
                            new_access_token = create_access_token(identity=str(user_id))
                            set_access_cookies(response, new_access_token)
        except Exception:
            pass

        return response

    # Register modular blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(cases_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(reports_bp)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok"), 200

    @app.get("/api/uploads/<path:filename>")
    @app.get("/uploads/<path:filename>")
    def uploaded_files(filename: str):
        from .storage import get_storage
        return get_storage().serve(filename)

    @app.get("/api/search")
    @jwt_required()
    def global_search():
        """Search across accessible projects, tasks, cases, and team members."""
        user_id = int(get_jwt_identity())
        query_text = request.args.get("q", "").strip()
        if not query_text or len(query_text) < 2:
            return jsonify(projects=[], tasks=[], cases=[], members=[]), 200

        from .models import Case, Project, ProjectMember, Task, User

        memberships = db.session.execute(
            db.select(ProjectMember.project_id).where(ProjectMember.user_id == user_id)
        ).scalars().all()
        owned_ids = db.session.execute(
            db.select(Project.id).where(Project.owner_id == user_id)
        ).scalars().all()
        accessible_ids = set(memberships) | set(owned_ids)

        if not accessible_ids:
            return jsonify(projects=[], tasks=[], cases=[], members=[]), 200

        pat = f"%{query_text}%"

        # Projects
        projs = db.session.execute(
            db.select(Project)
            .where(
                Project.id.in_(accessible_ids),
                db.or_(Project.name.ilike(pat), Project.description.ilike(pat)),
            )
            .limit(10)
        ).scalars().all()

        # Tasks
        tsks = db.session.execute(
            db.select(Task)
            .where(
                Task.project_id.in_(accessible_ids),
                db.or_(Task.title.ilike(pat), Task.description.ilike(pat)),
            )
            .limit(10)
        ).scalars().all()

        # Cases
        cses = db.session.execute(
            db.select(Case)
            .where(
                Case.project_id.in_(accessible_ids),
                db.or_(Case.ticket_number.ilike(pat), Case.title.ilike(pat), Case.description.ilike(pat)),
            )
            .limit(10)
        ).scalars().all()

        # Members in accessible projects
        mem_users = db.session.execute(
            db.select(User)
            .join(ProjectMember, ProjectMember.user_id == User.id)
            .where(
                ProjectMember.project_id.in_(accessible_ids),
                db.or_(User.name.ilike(pat), User.email.ilike(pat)),
            )
            .distinct()
            .limit(10)
        ).scalars().all()

        return jsonify(
            projects=[{"id": p.id, "name": p.name, "description": p.description} for p in projs],
            tasks=[{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "project_id": t.project_id} for t in tsks],
            cases=[{"id": c.id, "ticket_number": c.ticket_number, "title": c.title, "status": c.status, "priority": c.priority, "project_id": c.project_id} for c in cses],
            members=[{"id": m.id, "name": m.name, "email": m.email, "profile_image_url": m.profile_image_url} for m in mem_users],
        ), 200

    @app.get("/api/dashboard/stats")
    @jwt_required()
    def dashboard_stats():
        """Aggregated workspace statistics for active dashboard."""
        user_id = int(get_jwt_identity())
        from datetime import date
        from .models import Case, Project, ProjectMember, Task

        memberships = db.session.execute(
            db.select(ProjectMember.project_id, ProjectMember.role).where(
                ProjectMember.user_id == user_id
            )
        ).all()
        owned_proj_ids = set(
            db.session.execute(
                db.select(Project.id).where(Project.owner_id == user_id)
            ).scalars().all()
        )

        admin_proj_ids = set(owned_proj_ids)
        member_only_proj_ids = set()
        for pid, role in memberships:
            if role in ("owner", "admin"):
                admin_proj_ids.add(pid)
            else:
                member_only_proj_ids.add(pid)

        all_proj_ids = admin_proj_ids | member_only_proj_ids
        active_projects = len(all_proj_ids)

        tasks = []
        if all_proj_ids:
            tasks.extend(
                db.session.execute(
                    db.select(Task).where(Task.project_id.in_(all_proj_ids))
                ).scalars().all()
            )

        seen = set()
        deduped = []
        for t in tasks:
            if t.id not in seen:
                seen.add(t.id)
                deduped.append(t)

        total_tasks = len(deduped)
        today = date.today()
        todo = 0
        in_progress = 0
        completed = 0
        overdue = 0
        unassigned = 0

        my_tasks = 0
        my_due_today = 0
        my_in_progress = 0
        my_completed = 0
        my_overdue = 0

        for t in deduped:
            if t.status == "todo":
                todo += 1
            elif t.status == "in_progress":
                in_progress += 1
            elif t.status == "done":
                completed += 1

            if t.due_date and t.status != "done" and t.due_date < today:
                overdue += 1

            if t.assigned_to is None:
                unassigned += 1

            if t.assigned_to == user_id:
                my_tasks += 1
                if t.due_date and t.due_date == today:
                    my_due_today += 1
                if t.status == "in_progress":
                    my_in_progress += 1
                elif t.status == "done":
                    my_completed += 1
                if t.due_date and t.status != "done" and t.due_date < today:
                    my_overdue += 1

        # Cases metrics
        all_cases = []
        if all_proj_ids:
            all_cases = db.session.execute(
                db.select(Case).where(Case.project_id.in_(all_proj_ids))
            ).scalars().all()

        total_cases = len(all_cases)
        open_cases = sum(1 for c in all_cases if c.status in ("open", "in_progress"))
        resolved_cases = sum(1 for c in all_cases if c.status in ("resolved", "closed"))
        my_cases = sum(1 for c in all_cases if c.assigned_to == user_id)
        my_active_cases = sum(1 for c in all_cases if c.assigned_to == user_id and c.status in ("open", "in_progress"))

        return jsonify(
            active_projects=active_projects,
            total_tasks=total_tasks,
            todo=todo,
            in_progress=in_progress,
            completed=completed,
            overdue=overdue,
            unassigned=unassigned,
            my_tasks=my_tasks,
            my_due_today=my_due_today,
            my_in_progress=my_in_progress,
            my_completed=my_completed,
            my_overdue=my_overdue,
            total_cases=total_cases,
            open_cases=open_cases,
            resolved_cases=resolved_cases,
            my_cases=my_cases,
            my_active_cases=my_active_cases,
        ), 200

    return app
