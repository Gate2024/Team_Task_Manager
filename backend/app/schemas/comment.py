"""Comment serialization and validation schemas."""

from marshmallow import Schema, fields, validate

from .user import UserSummarySchema


class CommentSchema(Schema):
    """Schema for serializing comments with author details."""

    id = fields.Int(dump_only=True)
    body = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    author_id = fields.Int(dump_only=True)
    task_id = fields.Int(allow_none=True)
    case_id = fields.Int(allow_none=True)
    author = fields.Nested(UserSummarySchema, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
