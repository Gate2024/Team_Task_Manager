"""User serialization and validation schemas."""

from marshmallow import Schema, fields, validate


class UserSchema(Schema):
    """Full user schema with audit fields."""

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=254))
    mobile_number = fields.Str(allow_none=True)
    profile_image_url = fields.Str(allow_none=True, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserSummarySchema(Schema):
    """Compact user projection for embedded associations."""

    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)
    profile_image_url = fields.Str(allow_none=True, dump_only=True)
