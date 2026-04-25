"""Tests for the FastAPI endpoints."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client."""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """Test health check returns healthy status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_includes_version(self, client: TestClient) -> None:
        """Test health check includes version."""
        response = client.get("/api/health")
        data = response.json()
        assert "version" in data


class TestModelsEndpoint:
    """Tests for the models endpoint."""

    def test_list_models_returns_providers(self, client: TestClient) -> None:
        """Test list models returns provider list."""
        response = client.get("/api/models/")
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert "current" in data
        assert len(data["providers"]) > 0

    def test_list_models_no_api_keys_exposed(self, client: TestClient) -> None:
        """Test that no API keys are exposed in the response."""
        response = client.get("/api/models/")
        data = response.json()
        response_text = str(data)
        assert "sk-" not in response_text
        assert "api_key" not in response_text.lower()


class TestPipelineGraphEndpoint:
    """Tests for the pipeline graph endpoint."""

    def test_pipeline_graph_returns_structure(self, client: TestClient) -> None:
        """Test pipeline graph returns nodes and edges."""
        response = client.get("/api/pipeline/graph")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) >= 4
