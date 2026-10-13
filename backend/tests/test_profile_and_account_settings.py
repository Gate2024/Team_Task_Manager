"""Tests for profile image upload, deletion, validation, and account deletion."""

import io


def test_profile_image_workflow_and_account_deletion(client):
    """Test full cycle of image upload, validation, deletion, and account deletion."""
    # 1. Register & Login
    client.post(
        "/api/auth/register",
        json={"name": "Avatar User", "email": "avatar@example.com", "password": "SecurePassword123!"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "avatar@example.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200

    # 2. Reject non-image upload
    text_data = io.BytesIO(b"Hello world text file")
    res_bad_type = client.post(
        "/api/auth/profile/image",
        data={"image": (text_data, "document.txt")},
        content_type="multipart/form-data",
    )
    assert res_bad_type.status_code == 400

    # 3. Reject oversized image (> 5 MB)
    large_data = io.BytesIO(b"\xff\xd8\xff" + b"0" * (6 * 1024 * 1024))
    res_oversized = client.post(
        "/api/auth/profile/image",
        data={"image": (large_data, "huge.jpg")},
        content_type="multipart/form-data",
    )
    assert res_oversized.status_code == 413

    # 4. Upload valid PNG image
    # Valid PNG header is \x89PNG\r\n\x1a\n
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    valid_png = io.BytesIO(png_bytes)
    res_upload = client.post(
        "/api/auth/profile/image",
        data={"image": (valid_png, "avatar.png")},
        content_type="multipart/form-data",
    )
    assert res_upload.status_code == 200
    user_data = res_upload.get_json()["user"]
    assert user_data["profile_image_url"] is not None
    assert user_data["profile_image_url"].startswith("/uploads/avatars/")

    # 5. Check GET /api/auth/me reflects the new avatar
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["profile_image_url"] == user_data["profile_image_url"]

    # 6. Delete profile image
    del_img_res = client.delete("/api/auth/profile/image")
    assert del_img_res.status_code == 200
    assert del_img_res.get_json()["user"]["profile_image_url"] is None

    # Verify GET /api/auth/me now has None
    me_res2 = client.get("/api/auth/me")
    assert me_res2.get_json()["user"]["profile_image_url"] is None

    # 7. Account deletion with wrong password
    bad_del_res = client.delete("/api/auth/account", json={"password": "WrongPassword!"})
    assert bad_del_res.status_code == 401

    # 8. Account deletion with correct password
    good_del_res = client.delete("/api/auth/account", json={"password": "SecurePassword123!"})
    assert good_del_res.status_code == 200
    assert good_del_res.get_json()["message"] == "Account successfully deleted"

    # 9. Verify session is invalidated
    me_after_del = client.get("/api/auth/me")
    assert me_after_del.status_code == 401
