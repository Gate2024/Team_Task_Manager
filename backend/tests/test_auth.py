"""Authentication API endpoint tests."""


def test_register_and_login_flow(client):
    """Test user registration, login, profile fetch, and logout."""
    # 1. Register new user without mobile_number
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
    assert reg_data["user"]["mobile_number"] is None
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


def test_registration_with_mobile_number_and_validation(client):
    """Verify registration with valid/invalid mobile number and field validations."""
    # 1. Valid registration with mobile number
    payload = {
        "name": "Alex Morgan",
        "email": "alex@example.com",
        "password": "StrongPassword123!",
        "mobile_number": "+1 555-019-2834",
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["user"]["name"] == "Alex Morgan"
    assert data["user"]["mobile_number"] == "+1 555-019-2834"

    # 2. Invalid mobile number format (< 10 digits) -> 400
    bad_mobile_res = client.post(
        "/api/auth/register",
        json={
            "name": "Bob Smith",
            "email": "bob@example.com",
            "password": "StrongPassword123!",
            "mobile_number": "12345",
        },
    )
    assert bad_mobile_res.status_code == 400
    assert "mobile_number" in bad_mobile_res.get_json()["errors"]

    # 3. Empty name -> 400
    bad_name_res = client.post(
        "/api/auth/register",
        json={
            "name": "",
            "email": "emptyname@example.com",
            "password": "StrongPassword123!",
        },
    )
    assert bad_name_res.status_code == 400

    # 4. Invalid email format -> 400
    bad_email_res = client.post(
        "/api/auth/register",
        json={
            "name": "Invalid Email",
            "email": "not-an-email",
            "password": "StrongPassword123!",
        },
    )
    assert bad_email_res.status_code == 400

    # 5. Short password (< 8 chars) -> 400
    short_pass_res = client.post(
        "/api/auth/register",
        json={
            "name": "Short Pass",
            "email": "shortpass@example.com",
            "password": "short",
        },
    )
    assert short_pass_res.status_code == 400

    # 6. Unauthenticated /api/auth/me -> 401
    unauth_me = client.get("/api/auth/me")
    assert unauth_me.status_code == 401
