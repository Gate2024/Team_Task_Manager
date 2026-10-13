"""ActivityLog serialization schemas."""

from marshmallow import Schema, fields

from .user import UserSummarySchema


class ActivityLogSchema(Schema):
    """Schema for serializing workspace activity entries."""

    id = fields.Int(dump_only=True)
    actor_id = fields.Int(allow_none=True)
    project_id = fields.Int(allow_none=True)
    task_id = fields.Int(allow_none=True)
    case_id = fields.Int(allow_none=True)
    action = fields.Str(dump_only=True)
    metadata_json = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    actor = fields.Nested(UserSummarySchema, dump_only=True)
