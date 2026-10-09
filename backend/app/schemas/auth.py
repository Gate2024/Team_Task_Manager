"""Authentication payload validation schemas."""

from marshmallow import Schema, fields, validate


class LoginSchema(Schema):
    """Credentials validation schema for login requests."""

    email = fields.Email(required=True, validate=validate.Length(max=254))
    password = fields.Str(required=True, validate=validate.Length(min=1))


class RegisterSchema(Schema):
    """Validation schema for user registration requests."""

    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=254))
    password = fields.Str(required=True, validate=validate.Length(min=8))
