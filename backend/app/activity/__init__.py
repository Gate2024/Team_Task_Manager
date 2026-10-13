"""Activity blueprint initialization."""

from flask import Blueprint

activity_bp = Blueprint("activity", __name__, url_prefix="/api")

from . import routes  # noqa: E402, F401
