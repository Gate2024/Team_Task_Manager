"""Projects and memberships blueprint package."""

from flask import Blueprint

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

from . import routes  # noqa: E402, F401
