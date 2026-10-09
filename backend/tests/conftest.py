"""Pytest test scaffolding and fixtures for Flask API."""

try:
    from app import create_app
    from app.config import TestingConfig
    from app.extensions import db
except ModuleNotFoundError:
    from backend.app import create_app
    from backend.app.config import TestingConfig
    from backend.app.extensions import db


class SQLiteTestingConfig(TestingConfig):
    """Testing configuration utilizing in-memory SQLite database."""

    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key-at-least-32-bytes-long"
    JWT_SECRET_KEY = "test-jwt-secret-key-at-least-32-bytes"
    JWT_COOKIE_CSRF_PROTECT = False


try:
    import pytest

    @pytest.fixture
    def app():
        """Application fixture configured for isolated automated testing."""
        test_app = create_app(config_object=SQLiteTestingConfig)
        with test_app.app_context():
            db.create_all()
            yield test_app
            db.session.remove()
            db.drop_all()

    @pytest.fixture
    def client(app):
        """Test HTTP client fixture."""
        return app.test_client()

    @pytest.fixture
    def runner(app):
        """Test CLI runner fixture."""
        return app.test_cli_runner()
except ImportError:
    # Pytest is installed during test phase (Phase 4)
    pass
