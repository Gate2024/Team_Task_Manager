"""Authentication API endpoint tests."""


def test_register_and_login_flow(client):
    """Test user registration, login, profile fetch, and logout."""
    # 1. Register new user
    reg_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepassword123",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    assert reg_data["user"]["email"] == "jane@example.com"
    assert reg_data["user"]["name"] == "Jane Doe"
    assert "password_hash" not in reg_data["user"]

    # 2. Duplicate registration should return 409
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 409

    # 3. Invalid password login should fail
    bad_login = client.post(
        "/api/auth/login",
        json={"email": "jane@example.com", "password": "wrongpassword"},
    )
    assert bad_login.status_code == 401

    # 4. Correct login should succeed and set cookies
    login_res = client.post(
        "/api/auth/login",
        json={"email": "JANE@EXAMPLE.COM", "password": "securepassword123"},
    )
    assert login_res.status_code == 200
    assert "access_token_cookie" in login_res.headers.get("Set-Cookie", "")

    # 5. Fetch profile with session cookies
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["email"] == "jane@example.com"

    # 6. Logout
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200
