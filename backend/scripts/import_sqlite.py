"""Import the legacy SQLite database into an already-migrated PostgreSQL DB.

The source is opened read-only. The script refuses the repository's original
``instance/site.db`` path so validation must always use an explicit copy.
"""

from __future__ import annotations

import argparse
from collections import Counter
from datetime import date
import os
from pathlib import Path
import sqlite3
import sys
from typing import Any, Iterable

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app import create_app
from app.extensions import db
from app.models import Project, ProjectMember, Task, User


ROOT = BACKEND_ROOT.parent
ORIGINAL_SQLITE = (ROOT / "instance" / "site.db").resolve()
STATUS_MAP = {
    "To Do": "todo",
    "In Progress": "in_progress",
    "Done": "done",
    "todo": "todo",
    "in_progress": "in_progress",
    "done": "done",
}
MODELS = (User, Project, ProjectMember, Task)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    return parser.parse_args()


def validate_source(source: Path) -> Path:
    resolved = source.expanduser().resolve(strict=True)
    if resolved == ORIGINAL_SQLITE or (
        ORIGINAL_SQLITE.exists() and os.path.samefile(resolved, ORIGINAL_SQLITE)
    ):
        raise SystemExit(
            "Refusing to read the original instance/site.db. Make a copy and "
            "pass that copy with --source."
        )
    if resolved.suffix.lower() not in {".db", ".sqlite", ".sqlite3"}:
        raise SystemExit("The source must be a SQLite database copy.")
    return resolved


def read_source(source: Path) -> dict[str, list[dict[str, Any]]]:
    uri = f"{source.as_uri()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True)
    connection.row_factory = sqlite3.Row
    try:
        required = {"user", "project", "project_member", "task"}
        actual = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
        missing = required - actual
        if missing:
            raise SystemExit(f"SQLite copy is missing tables: {sorted(missing)}")
        return {
            table: [dict(row) for row in connection.execute(f'SELECT * FROM "{table}"')]
            for table in sorted(required)
        }
    finally:
        connection.close()


def normalized_rows(
    source: dict[str, list[dict[str, Any]]],
) -> tuple[dict[type, list[dict[str, Any]]], int, Counter[str]]:
    users = [
        {
            "id": row["id"],
            "name": row["name"].strip(),
            "email": row["email"].strip().lower(),
            "password_hash": row["password"],
        }
        for row in source["user"]
    ]
    emails = [row["email"] for row in users]
    if len(emails) != len(set(emails)):
        raise SystemExit("Lowercasing legacy emails would create duplicates.")

    projects = [
        {"id": row["id"], "name": row["name"].strip(), "owner_id": row["created_by"]}
        for row in source["project"]
    ]

    memberships: dict[tuple[int, int], dict[str, Any]] = {}
    next_membership_id = max(
        (row["id"] for row in source["project_member"]), default=0
    ) + 1
    for row in source["project_member"]:
        memberships[(row["project_id"], row["user_id"])] = {
            "id": row["id"],
            "project_id": row["project_id"],
            "user_id": row["user_id"],
            "role": row["role"],
        }

    repaired_owners = 0
    for project in projects:
        key = (project["id"], project["owner_id"])
        if key not in memberships:
            memberships[key] = {
                "id": next_membership_id,
                "project_id": project["id"],
                "user_id": project["owner_id"],
                "role": "owner",
            }
            next_membership_id += 1
            repaired_owners += 1
        else:
            memberships[key]["role"] = "owner"

    status_counts: Counter[str] = Counter()
    tasks: list[dict[str, Any]] = []
    for row in source["task"]:
        try:
            status = STATUS_MAP[row["status"]]
        except KeyError as exc:
            raise SystemExit(f"Unknown legacy task status: {row['status']!r}") from exc
        status_counts[f"{row['status']} -> {status}"] += 1
        raw_due_date = row["due_date"]
        tasks.append(
            {
                "id": row["id"],
                "title": row["title"].strip(),
                "description": row["description"] or "",
                "status": status,
                "project_id": row["project_id"],
                "created_by": row["user_id"],
                "assigned_to": row["assigned_to"],
                "due_date": date.fromisoformat(raw_due_date) if raw_due_date else None,
            }
        )

    return (
        {
            User: users,
            Project: projects,
            ProjectMember: list(memberships.values()),
            Task: tasks,
        },
        repaired_owners,
        status_counts,
    )


def target_counts(connection) -> dict[str, int]:
    return {
        model.__tablename__: connection.execute(
            select(func.count()).select_from(model)
        ).scalar_one()
        for model in MODELS
    }


def upsert_rows(
    connection,
    model,
    rows: Iterable[dict[str, Any]],
    conflict_columns: list[str],
) -> None:
    rows = list(rows)
    if not rows:
        return
    statement = insert(model).values(rows)
    immutable = {"id", "created_at", "updated_at"}
    updates = {
        column.name: statement.excluded[column.name]
        for column in model.__table__.columns
        if column.name not in immutable
    }
    connection.execute(
        statement.on_conflict_do_update(
            index_elements=conflict_columns,
            set_=updates,
        )
    )


def reset_sequences(connection) -> None:
    for table_name in ("users", "projects", "project_members", "tasks"):
        connection.execute(
            text(
                "SELECT setval("
                f"pg_get_serial_sequence('{table_name}', 'id'), "
                f"COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM {table_name}"
            )
        )


def print_counts(label: str, counts: dict[str, int]) -> None:
    rendered = ", ".join(f"{name}={count}" for name, count in counts.items())
    print(f"{label}: {rendered}")


def main() -> None:
    source_path = validate_source(parse_args().source)
    source = read_source(source_path)
    rows, repaired_owners, status_counts = normalized_rows(source)
    source_counts = {
        "users": len(source["user"]),
        "projects": len(source["project"]),
        "project_members": len(source["project_member"]),
        "tasks": len(source["task"]),
    }

    app = create_app()
    with app.app_context(), db.engine.begin() as connection:
        if connection.dialect.name != "postgresql":
            raise SystemExit("The import target must be PostgreSQL.")
        before = target_counts(connection)
        upsert_rows(connection, User, rows[User], ["id"])
        upsert_rows(connection, Project, rows[Project], ["id"])
        upsert_rows(
            connection,
            ProjectMember,
            rows[ProjectMember],
            ["project_id", "user_id"],
        )
        upsert_rows(connection, Task, rows[Task], ["id"])
        reset_sequences(connection)
        after = target_counts(connection)

    print(f"SQLite copy: {source_path}")
    print_counts("Source before normalization", source_counts)
    print_counts("PostgreSQL before import", before)
    print_counts("PostgreSQL after import", after)
    print(f"Missing owner memberships repaired: {repaired_owners}")
    print("Status conversions:")
    if status_counts:
        for conversion, count in sorted(status_counts.items()):
            print(f"  {conversion}: {count}")
    else:
        print("  none")


if __name__ == "__main__":
    main()
