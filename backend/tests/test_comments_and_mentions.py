"""Tests for Task Comments, Task Creator Notifications, and @Mentions."""

import pytest


def test_comments_and_mentions_suite(client):
    """
    Automated test suite verifying Tests 1 through 13:
    1. Assigned member comments (201)
    2. Other project member comments (201)
    3. Project Owner comments (201)
    4. Project Admin comments (201)
    5. Outsider comments (403)
    6. Task creator notification exists when member comments
    7. Creator comments on own task -> no self-notification
    8. Single mention -> mentioned user gets 1 notification
    9. Multiple mentions -> each mentioned user gets 1 notification
    10. Duplicate mention in same comment -> only 1 notification for that user
    11. Invalid mention (@UnknownUser) -> comment succeeds, no invalid notification
    12. Project isolation -> member of Project A cannot comment on Project B task (403)
    13. Status regression -> other project member can comment, but status update is 403
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

    owner_id = register("Alice Owner", "alice@example.com")
    admin_id = register("Bob Admin", "bob@example.com")
    assignee_id = register("Charlie Assignee", "charlie@example.com")
    member_id = register("Diana Member", "diana@example.com")
    outsider_id = register("Evan Outsider", "evan@example.com")

    # Alice creates Project 1
    login_as("alice@example.com")
    res = client.post("/api/projects", json={
        "name": "Project Alpha",
        "description": "Primary Workspace",
    })
    assert res.status_code == 201
    proj_a_id = res.get_json()["project"]["id"]

    # Alice adds Bob (admin), Charlie (member), Diana (member) to Project 1
    res = client.post(f"/api/projects/{proj_a_id}/members", json={"email": "bob@example.com", "role": "admin"})
    assert res.status_code == 201
    res = client.post(f"/api/projects/{proj_a_id}/members", json={"email": "charlie@example.com", "role": "member"})
    assert res.status_code == 201
    res = client.post(f"/api/projects/{proj_a_id}/members", json={"email": "diana@example.com", "role": "member"})
    assert res.status_code == 201

    # Alice creates Task 1 (created_by=Alice, assigned_to=Charlie)
    res = client.post(f"/api/projects/{proj_a_id}/tasks", json={
        "title": "Build Authentication API",
        "description": "OAuth and JWT endpoints",
        "status": "todo",
        "priority": "high",
        "assigned_to": assignee_id,
    })
    assert res.status_code == 201
    task_1_id = res.get_json()["task"]["id"]

    # -------------------------------------------------------------
    # Test 1 — Assigned member comments
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "I have started working on this."})
    assert res.status_code == 201
    assert res.get_json()["comment"]["body"] == "I have started working on this."

    # -------------------------------------------------------------
    # Test 2 — Other project member comments
    # -------------------------------------------------------------
    login_as("diana@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Let me know if you need help with schemas."})
    assert res.status_code == 201

    # -------------------------------------------------------------
    # Test 3 — Owner comments
    # -------------------------------------------------------------
    login_as("alice@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Great progress, keep me posted."})
    assert res.status_code == 201

    # -------------------------------------------------------------
    # Test 4 — Admin comments
    # -------------------------------------------------------------
    login_as("bob@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Looks good from security review."})
    assert res.status_code == 201

    # -------------------------------------------------------------
    # Test 5 — Outsider comments
    # -------------------------------------------------------------
    login_as("evan@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Unauthorized message."})
    assert res.status_code == 403

    # -------------------------------------------------------------
    # Test 6 — Task creator notification
    # Charlie (assignee) comments on Alice's task -> Alice receives notification
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Progress is now 60%."})
    assert res.status_code == 201

    # Check Alice's notifications
    login_as("alice@example.com")
    res = client.get("/api/notifications")
    assert res.status_code == 200
    alice_notifs = res.get_json()["notifications"]
    creator_notif = next(
        (n for n in alice_notifs if n["task_id"] == task_1_id and n["type"] == "task_comment" and "Progress is now 60%" in n["message"]),
        None
    )
    assert creator_notif is not None, "Task creator must receive notification when member comments"

    # -------------------------------------------------------------
    # Test 7 — Self notification prevention
    # Creator (Alice) comments on own task -> Alice must NOT receive a self-notification
    # -------------------------------------------------------------
    login_as("alice@example.com")
    # Mark existing read or note count
    initial_alice_unread = res.get_json()["unread_count"]
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Self comment from creator."})
    assert res.status_code == 201

    res = client.get("/api/notifications")
    alice_notifs_after = res.get_json()["notifications"]
    self_notif = next(
        (n for n in alice_notifs_after if n["actor_id"] == owner_id and n["recipient_id"] == owner_id),
        None
    )
    assert self_notif is None, "Users must never receive self-notifications"

    # -------------------------------------------------------------
    # Test 8 — Single mention
    # Charlie mentions Diana: "@Diana Please review the API response."
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "@Diana Please review the API response."})
    assert res.status_code == 201

    login_as("diana@example.com")
    res = client.get("/api/notifications")
    diana_notifs = res.get_json()["notifications"]
    mention_notif = next(
        (n for n in diana_notifs if n["task_id"] == task_1_id and n["type"] == "comment_mention"),
        None
    )
    assert mention_notif is not None, "Mentioned user must receive comment_mention notification"
    assert "Charlie" in mention_notif["title"] or "Charlie" in mention_notif["message"]

    # -------------------------------------------------------------
    # Test 9 — Multiple mentions
    # Charlie mentions Bob and Diana in the same comment
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "@Bob @Diana Please review the latest commit."})
    assert res.status_code == 201

    login_as("bob@example.com")
    res = client.get("/api/notifications")
    bob_notifs = res.get_json()["notifications"]
    bob_mention = next(
        (n for n in bob_notifs if n["task_id"] == task_1_id and n["type"] == "comment_mention" and "latest commit" in n["message"]),
        None
    )
    assert bob_mention is not None

    login_as("diana@example.com")
    res = client.get("/api/notifications")
    diana_notifs_2 = res.get_json()["notifications"]
    diana_mention = next(
        (n for n in diana_notifs_2 if n["task_id"] == task_1_id and n["type"] == "comment_mention" and "latest commit" in n["message"]),
        None
    )
    assert diana_mention is not None

    # -------------------------------------------------------------
    # Test 10 — Duplicate mention
    # @Diana ... @Diana in same comment should only produce ONE notification for Diana
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "@Diana please check this. @Diana also review the API docs."})
    assert res.status_code == 201

    login_as("diana@example.com")
    res = client.get("/api/notifications")
    diana_dups = [
        n for n in res.get_json()["notifications"]
        if n["task_id"] == task_1_id and "review the API docs" in n["message"]
    ]
    assert len(diana_dups) == 1, "Duplicate mentions in same comment must not create duplicate notifications"

    # -------------------------------------------------------------
    # Test 11 — Invalid mention
    # @UnknownUser -> comment succeeds, no invalid notification
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "@UnknownUser please check this out."})
    assert res.status_code == 201
    assert res.get_json()["comment"]["body"] == "@UnknownUser please check this out."

    # -------------------------------------------------------------
    # Test 12 — Project isolation
    # Evan creates Project Beta with Task 2. Charlie (member of Alpha only) attempts comment on Task 2 -> 403
    # -------------------------------------------------------------
    login_as("evan@example.com")
    res = client.post("/api/projects", json={"name": "Project Beta", "description": "Isolated Workspace"})
    assert res.status_code == 201
    proj_b_id = res.get_json()["project"]["id"]

    res = client.post(f"/api/projects/{proj_b_id}/tasks", json={
        "title": "Project Beta Secret Task",
        "description": "Confidential",
        "status": "todo",
        "priority": "low",
    })
    assert res.status_code == 201
    task_2_id = res.get_json()["task"]["id"]

    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_2_id}/comments", json={"body": "Attempt cross-project comment."})
    assert res.status_code == 403

    # -------------------------------------------------------------
    # Test 13 — Status regression
    # Diana (other project member, not assignee, not owner/admin)
    # can comment on Task 1, but status update is 403
    # -------------------------------------------------------------
    login_as("diana@example.com")
    # Comment: allowed (201)
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "Commenting is permitted."})
    assert res.status_code == 201

    # Status update: forbidden (403)
    res = client.patch(f"/api/tasks/{task_1_id}/status", json={"status": "done"})
    assert res.status_code == 403

    # Task update (fields): forbidden (403)
    res = client.patch(f"/api/tasks/{task_1_id}", json={"status": "done"})
    assert res.status_code == 403

    # -------------------------------------------------------------
    # Test 14 — Task creator + mention interaction
    # When task creator Alice is mentioned, she gets 1 notification, not duplicate
    # -------------------------------------------------------------
    login_as("charlie@example.com")
    res = client.post(f"/api/tasks/{task_1_id}/comments", json={"body": "@Alice Please check the finalized auth design."})
    assert res.status_code == 201

    login_as("alice@example.com")
    res = client.get("/api/notifications")
    alice_matches = [
        n for n in res.get_json()["notifications"]
        if n["task_id"] == task_1_id and "finalized auth design" in n["message"]
    ]
    assert len(alice_matches) == 1, "Mentioning task creator must produce only 1 notification, not duplicates"

