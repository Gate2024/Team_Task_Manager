"""Flask application factory."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from flask import Flask, jsonify

from .config import config_from_environment, validate_required_settings
from .extensions import db, jwt, migrate
from . import models  # noqa: F401 - registers model metadata for migrations


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

    @app.get("/api/health")
    def health():
        return jsonify(status="ok"), 200

    return app
