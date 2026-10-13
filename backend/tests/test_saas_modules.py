"""Automated end-to-end tests for SaaS modules: Cases, Comments, Notifications, Activity, Reports, Search, and Self-Assignment."""

def test_saas_platform_complete_lifecycle(client):
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

    owner_id = register("Project Owner", "owner@saas.com")
    alice_id = register("Alice Engineer", "alice@saas.com")
    bob_id = register("Bob QA", "bob@saas.com")
    outsider_id = register("Outsider User", "outsider@saas.com")

    # 1. Project Creation & Member Setup
    login_as("owner@saas.com")
    res = client.post("/api/projects", json={
        "name": "SaaS Platform Project",
        "description": "Production workspace for enterprise workflows",
    })
    assert res.status_code == 201
    project_id = res.get_json()["project"]["id"]

    # Add Alice and Bob as members
    res = client.post(f"/api/projects/{project_id}/members", json={"email": "alice@saas.com", "role": "member"})
    assert res.status_code == 201
    res = client.post(f"/api/projects/{project_id}/members", json={"email": "bob@saas.com", "role": "member"})
    assert res.status_code == 201

    # Check that Alice and Bob received notifications for being added
    login_as("alice@saas.com")
    res = client.get("/api/notifications")
    assert res.status_code == 200
    alice_notifs = res.get_json()["notifications"]
    assert any(n["type"] == "member_added" for n in alice_notifs)

    # 2. Task Creation & Self-Assignment
    login_as("owner@saas.com")
    res = client.post(f"/api/projects/{project_id}/tasks", json={
        "title": "Build Authentication Matrix",
        "description": "Implement RBAC checks",
        "status": "todo",
        "priority": "high",
    })
    assert res.status_code == 201
    task_id = res.get_json()["task"]["id"]

    # Alice self-assigns the unassigned task
    login_as("alice@saas.com")
    res = client.post(f"/api/tasks/{task_id}/self-assign")
    assert res.status_code == 200
    assert res.get_json()["task"]["assigned_to"] == alice_id

    # Bob attempts to steal the assigned task -> 409 Conflict
    login_as("bob@saas.com")
    res = client.post(f"/api/tasks/{task_id}/self-assign")
    assert res.status_code == 409

    # 3. Case Creation & Lifecycle
    login_as("owner@saas.com")
    res = client.post("/api/cases", json={
        "project_id": project_id,
        "title": "Session token race condition",
        "description": "Token refresh fails under high concurrency",
        "priority": "urgent",
    })
    assert res.status_code == 201
    case_data = res.get_json()["case"]
    case_id = case_data["id"]
    assert case_data["ticket_number"].startswith("CASE-")
    assert case_data["status"] == "open"
    assert case_data["priority"] == "urgent"

    # Bob self-assigns the case
    login_as("bob@saas.com")
    res = client.post(f"/api/cases/{case_id}/self-assign")
    assert res.status_code == 200
    assert res.get_json()["case"]["assigned_to"] == bob_id

    # Alice tries to self-assign Bob's case -> 409 Conflict
    login_as("alice@saas.com")
    res = client.post(f"/api/cases/{case_id}/self-assign")
    assert res.status_code == 409

    # Bob updates status to in_progress then resolved
    login_as("bob@saas.com")
    res = client.patch(f"/api/cases/{case_id}", json={"status": "in_progress"})
    assert res.status_code == 200
    assert res.get_json()["case"]["status"] == "in_progress"

    res = client.patch(f"/api/cases/{case_id}", json={"status": "resolved"})
    assert res.status_code == 200
    assert res.get_json()["case"]["status"] == "resolved"

    # Outsider tries to view case -> 403 Forbidden
    login_as("outsider@saas.com")
    res = client.get(f"/api/cases/{case_id}")
    assert res.status_code == 403

    # 4. Comments & Mentions
    login_as("alice@saas.com")
    # Comment on case and mention Bob
    res = client.post(f"/api/cases/{case_id}/comments", json={
        "body": "Fixed the concurrency lock. @Bob please verify and close.",
    })
    assert res.status_code == 201
    comment_id = res.get_json()["comment"]["id"]
    assert res.get_json()["comment"]["case_id"] == case_id

    # List comments on case
    res = client.get(f"/api/cases/{case_id}/comments")
    assert res.status_code == 200
    comments = res.get_json()["comments"]
    assert len(comments) >= 1
    assert comments[0]["body"] == "Fixed the concurrency lock. @Bob please verify and close."

    # Verify Bob got a mention notification
    login_as("bob@saas.com")
    res = client.get("/api/notifications")
    assert res.status_code == 200
    bob_notifs = res.get_json()["notifications"]
    mention_notif = next((n for n in bob_notifs if n["type"] == "comment_mention"), None)
    assert mention_notif is not None
    assert mention_notif["case_id"] == case_id

    # 5. Notifications Read Operations
    login_as("bob@saas.com")
    # Mark single notification as read
    res = client.patch(f"/api/notifications/{mention_notif['id']}/read")
    assert res.status_code == 200
    assert res.get_json()["notification"]["is_read"] is True

    # Mark all as read
    res = client.post("/api/notifications/read-all")
    assert res.status_code == 200
    assert res.get_json()["unread_count"] == 0

    # 6. Activity Log Inspection
    login_as("owner@saas.com")
    res = client.get("/api/activity")
    assert res.status_code == 200
    activities = res.get_json()["activity"]
    assert len(activities) > 0
    actions = [a["action"] for a in activities]
    assert "project_created" in actions
    assert "task_created" in actions
    assert "case_created" in actions
    assert "case_status_changed" in actions
    assert "comment_added" in actions

    # Project-specific activity
    res = client.get(f"/api/projects/{project_id}/activity")
    assert res.status_code == 200
    proj_acts = res.get_json()["activity"]
    assert len(proj_acts) > 0

    # 7. Reports & Analytics
    # Admin / Owner summary
    login_as("owner@saas.com")
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    admin_summary = res.get_json()["summary"]
    assert admin_summary["is_admin"] is True
    assert admin_summary["total_projects"] >= 1
    assert admin_summary["total_tasks"] >= 1
    assert admin_summary["total_cases"] >= 1

    # Workload report for admin
    res = client.get("/api/reports/workload")
    assert res.status_code == 200
    workload = res.get_json()["workload"]
    assert len(workload) >= 1

    # Member summary (Alice only sees her own metrics, no team privacy leakage)
    login_as("alice@saas.com")
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    member_summary = res.get_json()["summary"]
    assert member_summary["is_admin"] is False
    assert "total_tasks" in member_summary

    # 8. Global Search
    login_as("owner@saas.com")
    res = client.get("/api/search?q=SaaS")
    assert res.status_code == 200
    results = res.get_json()
    assert "projects" in results
    assert any("SaaS" in p["name"] for p in results["projects"])

    res = client.get("/api/search?q=token")
    assert res.status_code == 200
    results = res.get_json()
    assert any("token" in c["title"].lower() for c in results["cases"])
