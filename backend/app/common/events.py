"""Activity logging and notification dispatch utilities."""

from __future__ import annotations

import json
import re
from typing import Any

from ..extensions import db
from ..models import ActivityLog, Notification, ProjectMember, User


def log_activity(
    action: str,
    actor_id: int | None = None,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> ActivityLog:
    """Create a persistent activity log record."""
    meta_str = json.dumps(metadata) if metadata else None
    activity = ActivityLog(
        actor_id=actor_id,
        project_id=project_id,
        task_id=task_id,
        case_id=case_id,
        action=action,
        metadata_json=meta_str,
    )
    db.session.add(activity)
    return activity


def create_notification(
    recipient_id: int,
    type_: str | None = None,
    title: str = "",
    message: str = "",
    actor_id: int | None = None,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    type: str | None = None,
) -> Notification | None:
    """Create a persistent notification for a user (skips if actor is recipient)."""
    if actor_id and actor_id == recipient_id:
        return None

    notif_type = type or type_ or "general"

    notification = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=notif_type,
        title=title,
        message=message,
        project_id=project_id,
        task_id=task_id,
        case_id=case_id,
    )
    db.session.add(notification)
    return notification


def notify_project_admins(
    project_id: int,
    type_: str | None = None,
    title: str = "",
    message: str = "",
    actor_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    type: str | None = None,
) -> list[Notification]:
    """Send notification to project owner and admins."""
    notif_type = type or type_ or "general"
    members = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.role.in_(("owner", "admin")),
        )
    ).scalars().all()

    notifications = []
    for m in members:
        if actor_id and m.user_id == actor_id:
            continue
        n = create_notification(
            recipient_id=m.user_id,
            type_=notif_type,
            title=title,
            message=message,
            actor_id=actor_id,
            project_id=project_id,
            task_id=task_id,
            case_id=case_id,
        )
        if n:
            notifications.append(n)
    return notifications


def parse_and_notify_mentions(
    text: str,
    actor: User,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    context_title: str = "item",
) -> list[Notification]:
    """Parse @mentions in text and notify valid project members."""
    if not text or "@" not in text:
        return []

    # Find words following @
    matches = re.findall(r"@([a-zA-Z0-9_\-\.]+)", text)
    if not matches:
        return []

    notifications = []
    notified_user_ids = set()

    for mention in set(matches):
        # Match user by name (starts with or exact) or email prefix
        user = db.session.execute(
            db.select(User).where(
                db.or_(
                    User.name.ilike(f"{mention}%"),
                    User.email.ilike(f"{mention}%"),
                )
            )
        ).scalars().first()

        if user and user.id != actor.id and user.id not in notified_user_ids:
            # If project_id is given, verify user is a project member or owner
            if project_id:
                is_member = db.session.execute(
                    db.select(ProjectMember.id).where(
                        ProjectMember.project_id == project_id,
                        ProjectMember.user_id == user.id,
                    )
                ).scalar_one_or_none()
                if not is_member:
                    continue

            notified_user_ids.add(user.id)
            n = create_notification(
                recipient_id=user.id,
                actor_id=actor.id,
                type="comment_mention",
                title=f"{actor.name} mentioned you",
                message=f"{actor.name} mentioned you in a comment on {context_title}",
                project_id=project_id,
                task_id=task_id,
                case_id=case_id,
            )
            if n:
                notifications.append(n)

    return notifications
