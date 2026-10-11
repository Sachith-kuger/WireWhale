import sys
import os
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

# Setup test db before importing main
os.environ["ROUTESENSE_DB_PATH"] = "sqlite:///./test_routesense.db"

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
sys.path.append(str(BACKEND_DIR))

from backend.main import app
from backend.database import Base, get_db

engine = create_engine(
    os.environ["ROUTESENSE_DB_PATH"], connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Recreate db tables for tests
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "up"
    assert isinstance(data["models_loaded"], bool)

def test_predict_valid():
    health = client.get("/api/health").json()
    if not health["models_loaded"]:
        pytest.skip("Models not loaded")

    payload = {
        "total_packets": 1500,
        "total_bytes": 1000000,
        "duration_us": 5000000
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert data["features"]["duration_s"] == 5.0
    assert data["rf_prediction"] == "BENIGN"
    assert "anomaly_score" in data
    
def test_predict_invalid():
    health = client.get("/api/health").json()
    if not health["models_loaded"]:
        pytest.skip("Models not loaded")
        
    payload = {
        "total_packets": -5, 
        "total_bytes": 1000000,
        "duration_us": 5000000
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 400
    assert "non-negative" in response.json()["detail"]

def test_events_retrieval():
    health = client.get("/api/health").json()
    if not health["models_loaded"]:
        pytest.skip("Models not loaded")
        
    payload = {
        "total_packets": 10,
        "total_bytes": 500,
        "duration_us": 100000
    }
    client.post("/api/predict", json=payload)
    
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "total_packets" in data[0]
