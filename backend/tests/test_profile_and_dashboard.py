"""Test suite for profile updates, projects, tasks, and dashboard stats."""

def test_profile_update_and_workspace_apis(client):
    """Verify profile updating, project and task creation, and dashboard stats."""
    # 1. Register and login
    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Dev User", "email": "dev@example.com", "password": "OriginalPassword123!"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/auth/login",
        json={"email": "dev@example.com", "password": "OriginalPassword123!"},
    )
    assert login_res.status_code == 200

    # 2. GET /api/auth/me should contain mobile_number
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    user_data = me_res.get_json()["user"]
    assert "mobile_number" in user_data
    assert user_data["mobile_number"] is None

    # 3. PATCH /api/auth/profile - Reject email alteration
    bad_email_patch = client.patch(
        "/api/auth/profile",
        json={"email": "hacked@example.com"},
    )
    assert bad_email_patch.status_code == 400

    # 4. PATCH /api/auth/profile - Valid profile update with mobile_number
    patch_res = client.patch(
        "/api/auth/profile",
        json={"name": "Dev User Updated", "mobile_number": "+1 555-019-2834"},
    )
    assert patch_res.status_code == 200
    updated_user = patch_res.get_json()["user"]
    assert updated_user["name"] == "Dev User Updated"
    assert updated_user["mobile_number"] == "+1 555-019-2834"

    # 5. PATCH /api/auth/profile - Password update with incorrect current password
    bad_pass_patch = client.patch(
        "/api/auth/profile",
        json={"current_password": "WrongPassword", "new_password": "BrandNewPassword123!"},
    )
    assert bad_pass_patch.status_code == 401

    # 6. PATCH /api/auth/profile - Valid password update
    good_pass_patch = client.patch(
        "/api/auth/profile",
        json={"current_password": "OriginalPassword123!", "new_password": "BrandNewPassword123!"},
    )
    assert good_pass_patch.status_code == 200

    # 7. Create Project
    proj_res = client.post(
        "/api/projects",
        json={"name": "Engineering Alpha", "description": "Core infrastructure revamp"},
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.get_json()["project"]["id"]

    # 8. List Projects
    list_proj_res = client.get("/api/projects")
    assert list_proj_res.status_code == 200
    projects_list = list_proj_res.get_json()["projects"]
    assert len(projects_list) == 1
    assert projects_list[0]["user_role"] == "owner"

    # 9. Create Task
    task_res = client.post(
        f"/api/projects/{proj_id}/tasks",
        json={"title": "Setup PostgreSQL Database", "status": "in_progress"},
    )
    assert task_res.status_code == 201
    task_id = task_res.get_json()["task"]["id"]

    # 10. List Tasks
    tasks_res = client.get("/api/tasks")
    assert tasks_res.status_code == 200
    tasks_list = tasks_res.get_json()["tasks"]
    assert len(tasks_list) == 1
    assert tasks_list[0]["title"] == "Setup PostgreSQL Database"

    # 11. Update Task Status
    update_task_res = client.patch(
        f"/api/tasks/{task_id}/status",
        json={"status": "done"},
    )
    assert update_task_res.status_code == 200
    assert update_task_res.get_json()["task"]["status"] == "done"

    # 12. Dashboard Stats
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.get_json()
    assert stats["active_projects"] == 1
    assert stats["total_tasks"] == 1
    assert stats["completed"] == 1
    assert stats["in_progress"] == 0
