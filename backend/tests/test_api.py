import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["team"] == "Avinya"
    assert "Daksh Sharma" in data["members"]

def test_demo_auth_token():
    response = client.post("/api/v1/auth/demo-token?role=admin&username=Raj")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"

def test_list_attack_scenarios():
    response = client.get("/api/v1/red-team/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) > 0
    assert any("DAN" in s["title"] for s in scenarios)

def test_list_defense_rules():
    response = client.get("/api/v1/blue-team/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) > 0

def test_evaluate_zero_trust_policy():
    # Direct red to blue should be denied
    response = client.post("/api/v1/policies/evaluate", json={
        "source": "red_sandbox",
        "target": "blue_sandbox",
        "action": "DIRECT_COMM"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["allowed"] is False
    assert data["action"] == "DENY"

def test_audit_verify():
    response = client.post("/api/v1/audit/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True

def test_telemetry_metrics():
    response = client.get("/api/v1/telemetry/metrics")
    assert response.status_code == 200
    assert "bayora_cpu_percent" in response.text

def test_run_evaluation_api():
    response = client.post("/api/v1/evaluations/run", json={
        "prompt": "Tell me a joke",
        "attack_type": "BENIGN",
        "category": "JAILBREAK",
        "severity": "LOW",
        "bypass_blue_team": False
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["compromised"] is False
