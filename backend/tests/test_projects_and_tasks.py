"""Tests for Project and Task CRUD, permissions, priority, and pagination."""

def test_project_and_task_lifecycle_and_permissions(client):
    # Helper to register and switch session
    def register(name, email):
        res = client.post("/api/auth/register", json={
            "name": name,
            "email": email,
            "password": "Password123!",
            "mobile_number": "1234567890",
        })
        assert res.status_code == 201
        return res.get_json()["user"]["id"]

    def login_as(email):
        res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
        assert res.status_code == 200

    owner_id = register("Project Owner", "owner@example.com")
    admin_id = register("Project Admin", "admin@example.com")
    member_id = register("Regular Member", "member@example.com")
    outsider_id = register("Outsider User", "outsider@example.com")

    # 1. Login as owner & Create Project
    login_as("owner@example.com")
    res = client.post("/api/projects", json={
        "name": "Alpha Initiative",
        "description": "Initial description of Alpha",
    })
    assert res.status_code == 201
    project_id = res.get_json()["project"]["id"]
    assert res.get_json()["project"]["description"] == "Initial description of Alpha"

    # Owner adds admin_user and member_user
    res = client.post(f"/api/projects/{project_id}/members", json={
        "email": "admin@example.com",
        "role": "admin",
    })
    assert res.status_code == 201

    res = client.post(f"/api/projects/{project_id}/members", json={
        "email": "member@example.com",
        "role": "member",
    })
    assert res.status_code == 201

    # 2. Login as admin_user
    login_as("admin@example.com")

    # Admin updates project name & description -> SUCCESS
    res = client.patch(f"/api/projects/{project_id}", json={
        "name": "Alpha Initiative Updated",
        "description": "Updated by admin",
    })
    assert res.status_code == 200
    assert res.get_json()["project"]["name"] == "Alpha Initiative Updated"
    assert res.get_json()["project"]["description"] == "Updated by admin"

    # Admin tries to delete project -> FORBIDDEN (Owner only)
    res = client.delete(f"/api/projects/{project_id}")
    assert res.status_code == 403

    # Admin creates a task with priority and due date
    res = client.post(f"/api/projects/{project_id}/tasks", json={
        "title": "Backend Optimization",
        "description": "Optimize database queries",
        "priority": "high",
        "status": "todo",
        "assigned_to": member_id,
        "due_date": "2026-11-01",
    })
    assert res.status_code == 201
    task_id = res.get_json()["task"]["id"]
    assert res.get_json()["task"]["priority"] == "high"

    # Admin creates second task
    res = client.post(f"/api/projects/{project_id}/tasks", json={
        "title": "Documentation",
        "description": "Write API docs",
        "priority": "low",
        "status": "todo",
        "assigned_to": member_id,
    })
    assert res.status_code == 201
    task2_id = res.get_json()["task"]["id"]

    # Test pagination on project tasks
    res = client.get(f"/api/projects/{project_id}/tasks?page=1&limit=1")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["tasks"]) == 1
    assert data["pagination"]["total"] == 2
    assert data["pagination"]["pages"] == 2

    # 3. Login as regular member
    login_as("member@example.com")

    # Member tries to update project -> FORBIDDEN
    res = client.patch(f"/api/projects/{project_id}", json={"name": "Hacked"})
    assert res.status_code == 403

    # Member can update description and status of assigned task
    res = client.patch(f"/api/tasks/{task_id}", json={
        "description": "Working on it actively",
        "status": "in_progress",
    })
    assert res.status_code == 200
    assert res.get_json()["task"]["status"] == "in_progress"
    assert res.get_json()["task"]["description"] == "Working on it actively"

    # Member tries to change priority -> FORBIDDEN
    res = client.patch(f"/api/tasks/{task_id}", json={
        "priority": "urgent",
    })
    assert res.status_code == 403

    # Member tries to delete task -> FORBIDDEN
    res = client.delete(f"/api/tasks/{task_id}")
    assert res.status_code == 403

    # 4. Login as outsider
    login_as("outsider@example.com")

    # Outsider tries to access project tasks -> 403
    res = client.get(f"/api/projects/{project_id}/tasks")
    assert res.status_code == 403

    # Outsider tries to update task -> 403
    res = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
    assert res.status_code == 403

    # 5. Login back as owner and delete project
    login_as("owner@example.com")

    res = client.delete(f"/api/projects/{project_id}")
    assert res.status_code == 200

    # Project and tasks should be deleted
    res = client.get(f"/api/projects/{project_id}")
    assert res.status_code == 404
