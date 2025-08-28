"""
Pytest configuration and fixtures for backend tests
"""

import os
import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def setup_test_env():
    """Set up test environment variables with fallbacks"""
    # Only set fallback values if not already present (for local testing)
    test_env = {}
    if "DATABASE_URL" not in os.environ:
        test_env["DATABASE_URL"] = "sqlite:///./test.db"
    if "SECRET_KEY" not in os.environ:
        test_env["SECRET_KEY"] = "test-secret-key"
    if "GROQ_API_KEY" not in os.environ:
        test_env["GROQ_API_KEY"] = "test-groq-key"
    if "PINECONE_API_KEY" not in os.environ:
        test_env["PINECONE_API_KEY"] = "test-pinecone-key"

    with patch.dict(os.environ, test_env):
        yield


@pytest.fixture
def client():
    """Create test client with mocked environment"""
    from fastapi.testclient import TestClient
    from main import app

    return TestClient(app)
