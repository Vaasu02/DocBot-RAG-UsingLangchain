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


def test_upload_endpoint_without_auth(client):
    """Test upload endpoint without authentication"""
    response = client.post("/api/upload")
    assert response.status_code == 403  # Forbidden (no auth header)


def test_indexes_endpoint_without_auth(client):
    """Test indexes endpoint without authentication"""
    response = client.get("/api/indexes")
    assert response.status_code == 403  # Forbidden (no auth header)


def test_chat_endpoint_without_auth(client):
    """Test chat endpoint without authentication"""
    response = client.post("/api/chat", json={"query": "test question"})
    assert response.status_code == 403  # Forbidden (no auth header)


def test_auth_signup_endpoint(client):
    """Test user signup endpoint"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
    }
    response = client.post("/api/auth/signup", json=user_data)
    # May succeed or fail depending on if user exists, both are acceptable in tests
    assert response.status_code in [200, 400]


def test_auth_login_endpoint_invalid(client):
    """Test login with invalid credentials"""
    login_data = {"email": "nonexistent@example.com", "password": "wrongpassword"}
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401  # Unauthorized
