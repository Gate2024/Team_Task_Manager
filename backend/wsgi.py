"""WSGI entry point used by Flask CLI and the production server."""

from app import create_app


app = create_app()
