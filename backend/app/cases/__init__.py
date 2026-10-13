"""Cases blueprint initialization."""

from flask import Blueprint

cases_bp = Blueprint("cases", __name__, url_prefix="/api/cases")

from . import routes  # noqa: E402, F401
