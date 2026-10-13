"""Comprehensive tests for project member management endpoints."""

def test_project_member_management_lifecycle(client):
    """Verify listing, adding, role enforcement, duplicate prevention, and deletion of project members."""
    # 1. Register 4 test users: Owner, Admin, Member, Outsider
    client.post("/api/auth/register", json={"name": "Owner User", "email": "owner@example.com", "password": "Password123!"})
    client.post("/api/auth/register", json={"name": "Admin User", "email": "admin@example.com", "password": "Password123!"})
    client.post("/api/auth/register", json={"name": "Member User", "email": "member@example.com", "password": "Password123!"})
    client.post("/api/auth/register", json={"name": "Outsider User", "email": "outsider@example.com", "password": "Password123!"})

    # Helper function to switch active login session
    def login_as(email):
        res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
        assert res.status_code == 200

    # 2. Login as Owner & Create Project
    login_as("owner@example.com")
    proj_res = client.post("/api/projects", json={"name": "Project Apollo", "description": "Flagship mission"})
    assert proj_res.status_code == 201
    project_id = proj_res.get_json()["project"]["id"]

    # 3. GET /api/projects/:id/members as Owner -> should see Owner membership
    members_res = client.get(f"/api/projects/{project_id}/members")
    assert members_res.status_code == 200
    members = members_res.get_json()["members"]
    assert len(members) == 1
    assert members[0]["role"] == "owner"
    assert members[0]["user"]["email"] == "owner@example.com"

    # 4. GET /api/projects/:id/members as Outsider -> 403 Forbidden
    login_as("outsider@example.com")
    outsider_view = client.get(f"/api/projects/{project_id}/members")
    assert outsider_view.status_code == 403

    # 5. POST /api/projects/:id/members as Outsider -> 403 Forbidden
    outsider_add = client.post(f"/api/projects/{project_id}/members", json={"email": "member@example.com"})
    assert outsider_add.status_code == 403

    # 6. Login as Owner to Add Members
    login_as("owner@example.com")

    # Add unknown user -> 404
    unknown_add = client.post(f"/api/projects/{project_id}/members", json={"email": "ghost@example.com"})
    assert unknown_add.status_code == 404

    # Add invalid role -> 400
    bad_role_add = client.post(f"/api/projects/{project_id}/members", json={"email": "member@example.com", "role": "superman"})
    assert bad_role_add.status_code == 400

    # Missing email/user_id -> 400
    empty_add = client.post(f"/api/projects/{project_id}/members", json={})
    assert empty_add.status_code == 400

    # Successfully add Admin User as 'admin' -> 201
    add_admin_res = client.post(f"/api/projects/{project_id}/members", json={"email": "admin@example.com", "role": "admin"})
    assert add_admin_res.status_code == 201
    admin_member_data = add_admin_res.get_json()["member"]
    assert admin_member_data["role"] == "admin"
    assert admin_member_data["user"]["email"] == "admin@example.com"
    admin_user_id = admin_member_data["user_id"]

    # Duplicate addition of Admin User -> 409 Conflict
    dup_add_res = client.post(f"/api/projects/{project_id}/members", json={"email": "admin@example.com"})
    assert dup_add_res.status_code == 409

    # Successfully add Member User as 'member' -> 201
    add_member_res = client.post(f"/api/projects/{project_id}/members", json={"email": "member@example.com", "role": "member"})
    assert add_member_res.status_code == 201
    member_user_id = add_member_res.get_json()["member"]["user_id"]

    # 7. Login as Member User:
    login_as("member@example.com")
    # Member can view members list -> 200
    member_view = client.get(f"/api/projects/{project_id}/members")
    assert member_view.status_code == 200
    assert len(member_view.get_json()["members"]) == 3

    # Member cannot add members -> 403
    member_cannot_add = client.post(f"/api/projects/{project_id}/members", json={"email": "outsider@example.com"})
    assert member_cannot_add.status_code == 403

    # Member cannot remove members -> 403
    member_cannot_remove = client.delete(f"/api/projects/{project_id}/members/{admin_user_id}")
    assert member_cannot_remove.status_code == 403

    # 8. Login as Admin User:
    login_as("admin@example.com")

    # Admin cannot remove owner -> 400
    owner_membership = [m for m in member_view.get_json()["members"] if m["role"] == "owner"][0]
    admin_remove_owner = client.delete(f"/api/projects/{project_id}/members/{owner_membership['user_id']}")
    assert admin_remove_owner.status_code == 400

    # Add a second admin to test admin-cannot-remove-admin
    login_as("owner@example.com")
    client.post("/api/auth/register", json={"name": "Second Admin", "email": "admin2@example.com", "password": "Password123!"})
    add_admin2 = client.post(f"/api/projects/{project_id}/members", json={"email": "admin2@example.com", "role": "admin"})
    assert add_admin2.status_code == 201
    admin2_user_id = add_admin2.get_json()["member"]["user_id"]

    login_as("admin@example.com")
    # Admin cannot remove another admin -> 403
    admin_remove_admin2 = client.delete(f"/api/projects/{project_id}/members/{admin2_user_id}")
    assert admin_remove_admin2.status_code == 403

    # Admin CAN remove regular member -> 200
    admin_remove_member = client.delete(f"/api/projects/{project_id}/members/{member_user_id}")
    assert admin_remove_member.status_code == 200

    # Removing already removed / non-existent member -> 404
    remove_again = client.delete(f"/api/projects/{project_id}/members/{member_user_id}")
    assert remove_again.status_code == 404

    # 9. Owner CAN remove admin -> 200
    login_as("owner@example.com")
    owner_remove_admin = client.delete(f"/api/projects/{project_id}/members/{admin_user_id}")
    assert owner_remove_admin.status_code == 200
