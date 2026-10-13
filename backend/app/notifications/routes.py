"""Notifications route handlers."""

from __future__ import annotations

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Notification
from ..schemas import NotificationSchema
from . import notifications_bp

notification_schema = NotificationSchema()


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    """Retrieve user notifications with read status and unread count."""
    user_id = int(get_jwt_identity())
    limit = min(100, max(1, request.args.get("limit", 30, type=int)))
    unread_only = request.args.get("unread_only", "").lower() in ("true", "1")

    query = db.select(Notification).where(Notification.recipient_id == user_id)
    if unread_only:
        query = query.where(Notification.is_read.is_(False))

    query = query.order_by(Notification.created_at.desc()).limit(limit)
    notifications = db.session.execute(query).scalars().all()

    # Total unread count
    unread_count = db.session.execute(
        db.select(db.func.count(Notification.id)).where(
            Notification.recipient_id == user_id,
            Notification.is_read.is_(False),
        )
    ).scalar_one()

    return jsonify(
        notifications=notification_schema.dump(notifications, many=True),
        unread_count=unread_count,
    ), 200


@notifications_bp.patch("/<int:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id: int):
    """Mark an individual notification as read."""
    user_id = int(get_jwt_identity())
    notification = db.session.get(Notification, notification_id)
    if not notification:
        return jsonify(message="Notification not found"), 404

    if notification.recipient_id != user_id:
        return jsonify(message="Forbidden: You cannot modify this notification"), 403

    notification.is_read = True
    db.session.commit()

    return jsonify(
        message="Notification marked as read",
        notification=notification_schema.dump(notification),
    ), 200


@notifications_bp.post("/read-all")
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications of the current user as read."""
    user_id = int(get_jwt_identity())
    db.session.execute(
        db.update(Notification)
        .where(
            Notification.recipient_id == user_id,
            Notification.is_read.is_(False),
        )
        .values(is_read=True)
    )
    db.session.commit()

    return jsonify(message="All notifications marked as read", unread_count=0), 200
