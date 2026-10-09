"""Health check endpoint tests."""


def test_health_check(client):
    """Verify that the health check endpoint returns 200 OK and status 'ok'."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}
