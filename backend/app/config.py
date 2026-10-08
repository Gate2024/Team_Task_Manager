"""Application configuration loaded exclusively from the environment."""

from __future__ import annotations

from datetime import timedelta
import os
from typing import Any, Mapping


def _as_bool(value: str | None, *, default: bool) -> bool:
    if value is None:
        return default

    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise RuntimeError(f"Invalid boolean environment value: {value!r}")


def _database_url() -> str | None:
    url = os.getenv("DATABASE_URL")
    if not url:
        return None

    # SQLAlchemy must use the psycopg 3 driver in every environment.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Config:
    """Shared configuration. Secrets intentionally have no fallback values."""

    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_TOKEN_LOCATION = ("cookies",)
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_METHODS = ("POST", "PUT", "PATCH", "DELETE")
    JWT_ACCESS_CSRF_HEADER_NAME = "X-CSRF-TOKEN"
    JWT_COOKIE_SECURE = _as_bool(os.getenv("JWT_COOKIE_SECURE"), default=True)
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_SESSION_COOKIE = True
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"
    JWT_ACCESS_CSRF_COOKIE_NAME = "csrf_access_token"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", "15"))
    )


class DevelopmentConfig(Config):
    """Local development configuration with the debugger kept disabled."""

    DEBUG = False


class TestingConfig(Config):
    """Automated-test configuration; individual tests inject isolated URLs."""

    TESTING = True
    JWT_COOKIE_SECURE = False


class ProductionConfig(Config):
    """Production configuration that always requires HTTPS-only cookies."""

    DEBUG = False
    JWT_COOKIE_SECURE = True


CONFIG_BY_ENVIRONMENT = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def config_from_environment() -> type[Config]:
    """Select a known configuration class without silently guessing names."""

    environment = os.getenv("APP_ENV", "production").strip().lower()
    try:
        return CONFIG_BY_ENVIRONMENT[environment]
    except KeyError as exc:
        choices = ", ".join(sorted(CONFIG_BY_ENVIRONMENT))
        raise RuntimeError(
            f"Unknown APP_ENV {environment!r}; expected one of: {choices}"
        ) from exc


REQUIRED_SETTINGS = ("SECRET_KEY", "JWT_SECRET_KEY", "SQLALCHEMY_DATABASE_URI")


def validate_required_settings(config: Mapping[str, Any]) -> None:
    """Fail at startup when required secrets or services are not configured."""

    missing = [name for name in REQUIRED_SETTINGS if not config.get(name)]
    if missing:
        names = ", ".join(missing)
        raise RuntimeError(f"Missing required application configuration: {names}")
