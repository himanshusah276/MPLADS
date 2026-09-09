import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_kpis():
    response = client.get("/api/stats/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_sanctioned_cr" in data
    assert "total_utilized_cr" in data
    assert "open_alerts_count" in data
    assert data["total_works"] > 0

def test_list_mps():
    response = client.get("/api/mps")
    assert response.status_code == 200
    mps = response.json()
    assert len(mps) > 0
    assert "mp_id" in mps[0]
    assert "composite_risk_score" in mps[0]

def test_list_works():
    response = client.get("/api/works?limit=10")
    assert response.status_code == 200
    works = response.json()
    assert len(works) == 10
    assert "work_id" in works[0]

def test_get_work_detail():
    response = client.get("/api/works/WK-40521")
    assert response.status_code == 200
    data = response.json()
    assert data["work"]["work_id"] == "WK-40521"
    assert "timeline" in data
    assert "cost_analytics" in data
    assert data["cost_analytics"]["is_overrun"] is True

def test_pre_check_simulation():
    # Test work that violates outside constituency limit
    payload = {
        "mp_id": "MP-LS-0101",
        "state": "Maharashtra",
        "district": "Nashik",
        "category": "Roads & Pathways",
        "description": "Widening of outside bypass road",
        "estimated_cost": 3500000.0,
        "is_outside_constituency": True
    }
    response = client.post("/api/mps/pre-check-recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_compliant"] is False
    assert any(v["rule_code"] == "R3" for v in data["violations"])

def test_trigger_ml_analysis():
    response = client.post("/api/ml/run-analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_alerts_generated"] > 0
