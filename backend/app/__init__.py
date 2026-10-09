"""Flask application factory."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from flask import Flask, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from .config import config_from_environment, validate_required_settings
from .extensions import db, jwt, migrate
from . import models  # noqa: F401 - registers model metadata for migrations
from .auth import auth_bp
from .projects import projects_bp
from .tasks import tasks_bp


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

    # Register modular blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok"), 200

    @app.get("/api/dashboard/stats")
    @jwt_required()
    def dashboard_stats():
        """Aggregated workspace statistics for active dashboard."""
        user_id = int(get_jwt_identity())
        from .models import Project, ProjectMember, Task

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
        if admin_proj_ids:
            tasks.extend(
                db.session.execute(
                    db.select(Task).where(Task.project_id.in_(admin_proj_ids))
                ).scalars().all()
            )
        if member_only_proj_ids:
            tasks.extend(
                db.session.execute(
                    db.select(Task).where(
                        Task.project_id.in_(member_only_proj_ids),
                        Task.assigned_to == user_id,
                    )
                ).scalars().all()
            )

        seen = set()
        total_tasks = 0
        in_progress = 0
        completed = 0

        for t in tasks:
            if t.id not in seen:
                seen.add(t.id)
                total_tasks += 1
                if t.status == "in_progress":
                    in_progress += 1
                elif t.status == "done":
                    completed += 1

        return jsonify(
            active_projects=active_projects,
            total_tasks=total_tasks,
            in_progress=in_progress,
            completed=completed,
        ), 200

    return app
