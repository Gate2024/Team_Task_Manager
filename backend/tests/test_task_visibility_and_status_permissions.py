"""Tests for Task Visibility and Task Progress/Status Update Permissions."""

def test_task_visibility_and_status_permissions_matrix(client):
    """
    Test matrix according to business rules:
    - All members belonging to a project can VIEW all tasks in that project.
    - Only assigned members (or owner/admin) can UPDATE status of that task.
    - Other members get 403 on status update.
    - Outsiders get 403 on view and update.
    """
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

    user_a_id = register("User A Owner", "usera@example.com")
    user_b_id = register("User B Member", "userb@example.com")
    user_c_id = register("User C Member", "userc@example.com")
    outsider_id = register("User D Outsider", "userd_outsider@example.com")

    # 1. User A creates Project P
    login_as("usera@example.com")
    res = client.post("/api/projects", json={
        "name": "Project P",
        "description": "Website Development Workspace",
    })
    assert res.status_code == 201
    project_p_id = res.get_json()["project"]["id"]

    # User A adds User B and User C as members
    res = client.post(f"/api/projects/{project_p_id}/members", json={
        "email": "userb@example.com",
        "role": "member",
    })
    assert res.status_code == 201

    res = client.post(f"/api/projects/{project_p_id}/members", json={
        "email": "userc@example.com",
        "role": "member",
    })
    assert res.status_code == 201

    # User A creates 3 tasks in Project P:
    # Task 1 -> Assigned to User B
    res = client.post(f"/api/projects/{project_p_id}/tasks", json={
        "title": "Task 1: Build Login Page",
        "description": "Implement authentication form",
        "status": "todo",
        "priority": "medium",
        "assigned_to": user_b_id,
    })
    assert res.status_code == 201
    task1_id = res.get_json()["task"]["id"]

    # Task 2 -> Assigned to User C
    res = client.post(f"/api/projects/{project_p_id}/tasks", json={
        "title": "Task 2: Implement API",
        "description": "Build RESTful endpoints",
        "status": "in_progress",
        "priority": "high",
        "assigned_to": user_c_id,
    })
    assert res.status_code == 201
    task2_id = res.get_json()["task"]["id"]

    # Task 3 -> Unassigned
    res = client.post(f"/api/projects/{project_p_id}/tasks", json={
        "title": "Task 3: Create Testing Plan",
        "description": "QA checklist",
        "status": "todo",
        "priority": "low",
        "assigned_to": None,
    })
    assert res.status_code == 201
    task3_id = res.get_json()["task"]["id"]

    # -------------------------------------------------------------
    # STEP 22 & 34: VISIBILITY VERIFICATION
    # -------------------------------------------------------------
    # User B (regular member) can VIEW all 3 tasks in Project P
    login_as("userb@example.com")
    res = client.get(f"/api/projects/{project_p_id}/tasks")
    assert res.status_code == 200
    p_tasks = res.get_json()["tasks"]
    task_ids = [t["id"] for t in p_tasks]
    assert task1_id in task_ids
    assert task2_id in task_ids
    assert task3_id in task_ids

    # User B can view single tasks directly
    assert client.get(f"/api/tasks/{task1_id}").status_code == 200
    assert client.get(f"/api/tasks/{task2_id}").status_code == 200
    assert client.get(f"/api/tasks/{task3_id}").status_code == 200

    # User C (regular member) can VIEW all 3 tasks in Project P
    login_as("userc@example.com")
    res = client.get(f"/api/projects/{project_p_id}/tasks")
    assert res.status_code == 200
    p_tasks = res.get_json()["tasks"]
    task_ids = [t["id"] for t in p_tasks]
    assert task1_id in task_ids
    assert task2_id in task_ids
    assert task3_id in task_ids

    assert client.get(f"/api/tasks/{task1_id}").status_code == 200
    assert client.get(f"/api/tasks/{task2_id}").status_code == 200
    assert client.get(f"/api/tasks/{task3_id}").status_code == 200

    # User D (outsider) CANNOT view project tasks or single tasks
    login_as("userd_outsider@example.com")
    assert client.get(f"/api/projects/{project_p_id}/tasks").status_code == 403
    assert client.get(f"/api/tasks/{task1_id}").status_code == 403
    assert client.get(f"/api/tasks/{task2_id}").status_code == 403
    assert client.get(f"/api/tasks/{task3_id}").status_code == 403

    # -------------------------------------------------------------
    # STEP 22, 24, 34: STATUS UPDATE PERMISSION VERIFICATION
    # -------------------------------------------------------------
    # User B (assigned to Task 1):
    login_as("userb@example.com")
    # Updating Task 1 -> ALLOWED (200)
    res = client.patch(f"/api/tasks/{task1_id}/status", json={"status": "in_progress"})
    assert res.status_code == 200
    assert res.get_json()["task"]["status"] == "in_progress"

    # User B updating Task 2 (assigned to User C) -> FORBIDDEN (403)
    res = client.patch(f"/api/tasks/{task2_id}/status", json={"status": "done"})
    assert res.status_code == 403

    # User B updating Task 3 (unassigned) -> FORBIDDEN (403)
    res = client.patch(f"/api/tasks/{task3_id}/status", json={"status": "in_progress"})
    assert res.status_code == 403

    # User C (assigned to Task 2):
    login_as("userc@example.com")
    # Updating Task 2 -> ALLOWED (200)
    res = client.patch(f"/api/tasks/{task2_id}/status", json={"status": "done"})
    assert res.status_code == 200
    assert res.get_json()["task"]["status"] == "done"

    # User C updating Task 1 (assigned to User B) -> FORBIDDEN (403)
    res = client.patch(f"/api/tasks/{task1_id}/status", json={"status": "done"})
    assert res.status_code == 403

    # User C updating Task 3 (unassigned) -> FORBIDDEN (403)
    res = client.patch(f"/api/tasks/{task3_id}/status", json={"status": "in_progress"})
    assert res.status_code == 403

    # User A (Owner):
    login_as("usera@example.com")
    # Owner can update any task in their project
    res = client.patch(f"/api/tasks/{task1_id}/status", json={"status": "done"})
    assert res.status_code == 200
    assert res.get_json()["task"]["status"] == "done"

    res = client.patch(f"/api/tasks/{task3_id}/status", json={"status": "in_progress"})
    assert res.status_code == 200
    assert res.get_json()["task"]["status"] == "in_progress"

    # Outsider:
    login_as("userd_outsider@example.com")
    assert client.patch(f"/api/tasks/{task1_id}/status", json={"status": "todo"}).status_code == 403
    assert client.patch(f"/api/tasks/{task2_id}/status", json={"status": "todo"}).status_code == 403
    assert client.patch(f"/api/tasks/{task3_id}/status", json={"status": "todo"}).status_code == 403


def test_project_isolation(client):
    """
    Test Step 25: Project Isolation
    Project 1: User A, User B
    Project 2: User C, User D
    User B must see Project 1 tasks, but not Project 2 tasks.
    """
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

    u_a = register("Iso A", "iso_a@example.com")
    u_b = register("Iso B", "iso_b@example.com")
    u_c = register("Iso C", "iso_c@example.com")
    u_d = register("Iso D", "iso_d@example.com")

    # Project 1 created by A, members: A, B
    login_as("iso_a@example.com")
    p1_res = client.post("/api/projects", json={"name": "Project 1"}).get_json()["project"]
    client.post(f"/api/projects/{p1_res['id']}/members", json={"email": "iso_b@example.com", "role": "member"})
    t1_res = client.post(f"/api/projects/{p1_res['id']}/tasks", json={
        "title": "P1 Task",
        "assigned_to": u_b,
    }).get_json()["task"]

    # Project 2 created by C, members: C, D
    login_as("iso_c@example.com")
    p2_res = client.post("/api/projects", json={"name": "Project 2"}).get_json()["project"]
    client.post(f"/api/projects/{p2_res['id']}/members", json={"email": "iso_d@example.com", "role": "member"})
    t2_res = client.post(f"/api/projects/{p2_res['id']}/tasks", json={
        "title": "P2 Task",
        "assigned_to": u_d,
    }).get_json()["task"]

    # User B checks
    login_as("iso_b@example.com")
    # Can access Project 1 tasks
    assert client.get(f"/api/projects/{p1_res['id']}/tasks").status_code == 200
    assert client.get(f"/api/tasks/{t1_res['id']}").status_code == 200

    # CANNOT access Project 2 tasks (isolated)
    assert client.get(f"/api/projects/{p2_res['id']}/tasks").status_code == 403
    assert client.get(f"/api/tasks/{t2_res['id']}").status_code == 403
    assert client.patch(f"/api/tasks/{t2_res['id']}/status", json={"status": "done"}).status_code == 403
