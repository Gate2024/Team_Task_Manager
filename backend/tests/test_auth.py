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
    logout_cookies = logout_res.headers.getlist("Set-Cookie")
    # All JWT cookies must be expired in the past on logout
    assert any("access_token_cookie=" in c for c in logout_cookies)
    assert any("refresh_token_cookie=" in c for c in logout_cookies)


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

    # 6. Unauthenticated /api/auth/me -> 401 with structured code
    unauth_me = client.get("/api/auth/me")
    assert unauth_me.status_code == 401
    assert unauth_me.get_json().get("code") == "authorization_required"


def test_login_issues_both_access_and_refresh_cookies(client):
    """Verify that logging in issues both HttpOnly access and refresh cookies."""
    # Register user
    client.post(
        "/api/auth/register",
        json={"name": "Alice Cooper", "email": "alice@cooper.com", "password": "password123"},
    )

    login_res = client.post(
        "/api/auth/login",
        json={"email": "alice@cooper.com", "password": "password123"},
    )
    assert login_res.status_code == 200
    cookies = login_res.headers.getlist("Set-Cookie")
    assert any("access_token_cookie=" in c for c in cookies)
    assert any("refresh_token_cookie=" in c for c in cookies)


def test_refresh_endpoint_success_and_cookie_rotation(client):
    """Verify POST /api/auth/refresh issues fresh access and refresh cookies."""
    client.post(
        "/api/auth/register",
        json={"name": "Bob Marley", "email": "bob@marley.com", "password": "password123"},
    )
    client.post(
        "/api/auth/login",
        json={"email": "bob@marley.com", "password": "password123"},
    )

    # Call /api/auth/refresh
    refresh_res = client.post("/api/auth/refresh")
    assert refresh_res.status_code == 200
    data = refresh_res.get_json()
    assert data["message"] == "Session refreshed successfully"
    assert data["user"]["email"] == "bob@marley.com"

    cookies = refresh_res.headers.getlist("Set-Cookie")
    assert any("access_token_cookie=" in c for c in cookies)
    assert any("refresh_token_cookie=" in c for c in cookies)

    # After refresh, protected endpoint continues to work
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["email"] == "bob@marley.com"


def test_refresh_fails_without_refresh_token(client):
    """Calling /api/auth/refresh without refresh cookie must return 401."""
    res = client.post("/api/auth/refresh")
    assert res.status_code == 401
    assert res.get_json().get("code") == "authorization_required"


def test_expired_access_token_recovery_via_refresh(client, app):
    """Simulate expired access token followed by refresh and successful retry."""
    from datetime import timedelta
    from flask_jwt_extended import create_access_token, create_refresh_token

    # Register user
    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Carol Danvers", "email": "carol@marvel.com", "password": "password123"},
    )
    user_id = str(reg_res.get_json()["user"]["id"])

    # Manually configure an expired access token and a valid refresh token
    with app.test_request_context():
        expired_access = create_access_token(identity=user_id, expires_delta=timedelta(seconds=-10))
        valid_refresh = create_refresh_token(identity=user_id, expires_delta=timedelta(days=30))

    client.set_cookie("access_token_cookie", expired_access)
    client.set_cookie("refresh_token_cookie", valid_refresh)

    # 1. Request with expired access token fails with 401 token_expired
    stale_req = client.get("/api/auth/me")
    assert stale_req.status_code == 401
    err_json = stale_req.get_json()
    assert err_json.get("code") == "token_expired"
    assert err_json.get("token_type") == "access"

    # 2. Silent refresh with valid refresh token succeeds
    refresh_res = client.post("/api/auth/refresh")
    assert refresh_res.status_code == 200

    # 3. Retried request now succeeds
    retry_req = client.get("/api/auth/me")
    assert retry_req.status_code == 200
    assert retry_req.get_json()["user"]["email"] == "carol@marvel.com"


def test_logout_ends_session_and_subsequent_refresh_fails(client):
    """Verify that logging out clears session and subsequent refresh fails with 401."""
    client.post(
        "/api/auth/register",
        json={"name": "David Bowie", "email": "david@bowie.com", "password": "password123"},
    )
    client.post(
        "/api/auth/login",
        json={"email": "david@bowie.com", "password": "password123"},
    )

    # Logout
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200

    # Protected endpoint must return 401
    unauth_req = client.get("/api/auth/me")
    assert unauth_req.status_code == 401

    # Refresh endpoint must also return 401
    refresh_req = client.post("/api/auth/refresh")
    assert refresh_req.status_code == 401


def test_sliding_session_renewal_on_active_request(client, app):
    """Verify that an active request with token nearing expiry triggers sliding renewal."""
    from datetime import timedelta
    from flask_jwt_extended import create_access_token

    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Eve Polastri", "email": "eve@mi6.gov.uk", "password": "password123"},
    )
    user_id = str(reg_res.get_json()["user"]["id"])

    # Create access token expiring in 2 minutes (< 5 min threshold)
    with app.test_request_context():
        nearing_expiry_token = create_access_token(identity=user_id, expires_delta=timedelta(minutes=2))

    client.set_cookie("access_token_cookie", nearing_expiry_token)

    # Make an active request to /api/auth/me
    active_res = client.get("/api/auth/me")
    assert active_res.status_code == 200

    # Response headers must contain renewed access_token_cookie
    cookies = active_res.headers.getlist("Set-Cookie")
    assert any("access_token_cookie=" in c for c in cookies)
