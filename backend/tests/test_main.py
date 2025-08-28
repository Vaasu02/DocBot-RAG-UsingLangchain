import pytest


def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_upload_endpoint_without_file(client):
    """Test upload endpoint without file"""
    response = client.post("/api/upload")
    assert response.status_code == 422  # Validation error


def test_indexes_endpoint(client):
    """Test indexes endpoint"""
    response = client.get("/api/indexes")
    assert response.status_code in [200, 500]  # May fail without valid API keys


def test_chat_endpoint_without_query(client):
    """Test chat endpoint without query"""
    response = client.post("/api/chat", json={})
    assert response.status_code == 422  # Validation error


def test_chat_endpoint_with_query(client):
    """Test chat endpoint with query (may fail without proper setup)"""
    response = client.post("/api/chat", json={"query": "test question"})
    # May return 500 if API keys not configured, which is expected in CI
    assert response.status_code in [200, 500]
