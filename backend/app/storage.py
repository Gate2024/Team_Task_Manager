"""Storage abstraction for user uploads and media assets.

Supports local filesystem storage for development and container environments,
and is structured to support S3-compatible cloud storage (AWS S3, Cloudflare R2,
Railway Object Storage) via environment variables.
"""

from __future__ import annotations

import os
import uuid
from typing import BinaryIO
from flask import current_app, send_from_directory
from werkzeug.utils import secure_filename

# Allowed upload extensions and MIME types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 Megabytes


def validate_image_file(file_storage) -> tuple[bool, str]:
    """Validate uploaded image MIME type, file extension, size, and magic bytes.

    Returns (is_valid, error_message).
    """
    if not file_storage or not file_storage.filename:
        return False, "No file uploaded or filename is empty"

    filename = file_storage.filename.lower()
    _, ext = os.path.splitext(filename)
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Allowed: .jpg, .jpeg, .png, .webp"

    # Validate MIME type declared by client
    content_type = (file_storage.mimetype or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        return False, f"Unsupported content type '{content_type}'. Allowed: image/jpeg, image/png, image/webp"

    # Read the initial bytes to check file size and magic headers
    stream: BinaryIO = file_storage.stream
    stream.seek(0, os.SEEK_END)
    file_size = stream.tell()
    stream.seek(0)

    if file_size <= 0:
        return False, "Uploaded file is empty"

    if file_size > MAX_IMAGE_SIZE_BYTES:
        return False, f"File exceeds maximum allowed size of 5 MB (size: {file_size / (1024 * 1024):.1f} MB)"

    header = stream.read(16)
    stream.seek(0)

    # Magic byte verification:
    # JPEG: starts with \xff\xd8\xff
    # PNG: starts with \x89PNG\r\n\x1a\n
    # WEBP: starts with RIFF, then 4 bytes, then WEBP
    is_jpeg = header.startswith(b"\xff\xd8\xff")
    is_png = header.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = header.startswith(b"RIFF") and len(header) >= 12 and header[8:12] == b"WEBP"

    if not (is_jpeg or is_png or is_webp):
        return False, "File contents do not match a valid JPEG, PNG, or WEBP image"

    return True, ""


class LocalStorageProvider:
    """Saves files to the local uploads directory and serves them via static route."""

    def __init__(self, base_dir: str | None = None, public_url_prefix: str = "/uploads"):
        if not base_dir:
            base_dir = os.path.join(os.getcwd(), "uploads")
        self.base_dir = os.path.abspath(base_dir)
        self.avatars_dir = os.path.join(self.base_dir, "avatars")
        os.makedirs(self.avatars_dir, exist_ok=True)
        self.public_url_prefix = public_url_prefix.rstrip("/")

    def save(self, file_storage, subfolder: str = "avatars") -> str:
        """Save uploaded file with a secure UUID filename and return the public URL path."""
        target_dir = os.path.join(self.base_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        _, ext = os.path.splitext(file_storage.filename.lower())
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(target_dir, unique_filename)

        file_storage.save(dest_path)
        return f"{self.public_url_prefix}/{subfolder}/{unique_filename}"

    def delete(self, file_url_or_path: str) -> bool:
        """Delete file associated with the public URL path."""
        if not file_url_or_path or not file_url_or_path.startswith(self.public_url_prefix):
            return False

        rel_path = file_url_or_path[len(self.public_url_prefix):].lstrip("/\\")
        full_path = os.path.abspath(os.path.join(self.base_dir, rel_path))

        # Security check: Ensure target path remains within base_dir
        if not full_path.startswith(self.base_dir):
            return False

        if os.path.isfile(full_path):
            try:
                os.remove(full_path)
                return True
            except OSError:
                return False
        return False

    def serve(self, relative_path: str):
        """Serve uploaded file from local filesystem."""
        safe_rel_path = relative_path.lstrip("/\\")
        sub_dir = os.path.dirname(safe_rel_path)
        filename = os.path.basename(safe_rel_path)
        full_folder = os.path.abspath(os.path.join(self.base_dir, sub_dir))

        if not full_folder.startswith(self.base_dir):
            return {"message": "Invalid file path"}, 400

        return send_from_directory(full_folder, filename)


class S3StorageProvider:
    """S3-compatible persistent object storage provider (e.g. AWS S3, Cloudflare R2, MinIO)."""

    def __init__(self):
        self.bucket = os.getenv("STORAGE_BUCKET")
        self.region = os.getenv("STORAGE_REGION", "us-east-1")
        self.access_key = os.getenv("STORAGE_ACCESS_KEY")
        self.secret_key = os.getenv("STORAGE_SECRET_KEY")
        self.endpoint_url = os.getenv("STORAGE_ENDPOINT_URL")
        self.public_url = os.getenv("STORAGE_PUBLIC_URL", "").rstrip("/")

    def save(self, file_storage, subfolder: str = "avatars") -> str:
        """Upload to S3-compatible bucket."""
        import boto3  # Optional dependency for S3

        _, ext = os.path.splitext(file_storage.filename.lower())
        unique_key = f"{subfolder}/{uuid.uuid4().hex}{ext}"

        client = boto3.client(
            "s3",
            region_name=self.region,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
        )

        client.upload_fileobj(
            file_storage.stream,
            self.bucket,
            unique_key,
            ExtraArgs={"ContentType": file_storage.mimetype},
        )

        if self.public_url:
            return f"{self.public_url}/{unique_key}"
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{unique_key}"

    def delete(self, file_url_or_key: str) -> bool:
        """Delete object from S3-compatible bucket."""
        import boto3

        key = file_url_or_key
        if self.public_url and key.startswith(self.public_url):
            key = key[len(self.public_url):].lstrip("/")
        elif "/" in key:
            # Extract key from full URL if applicable
            parts = key.split("/")
            if "avatars" in parts:
                key = "/".join(parts[parts.index("avatars"):])

        client = boto3.client(
            "s3",
            region_name=self.region,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
        )
        try:
            client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    def serve(self, relative_path: str):
        """For S3, files are served directly via public CDN/S3 URL."""
        return {"message": "Files stored in object storage are served directly via public URL"}, 400


def get_storage():
    """Factory to retrieve configured storage provider."""
    provider = os.getenv("STORAGE_PROVIDER", "local").strip().lower()
    if provider == "s3" and os.getenv("STORAGE_BUCKET"):
        return S3StorageProvider()
    return LocalStorageProvider()
