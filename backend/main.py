import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db
from ml_service import MLService

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RouteSense AI Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for Phase 1 testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Service globally
ml_service = MLService()

@app.get("/api/health")
def health_check():
    return {
        "status": "up",
        "models_loaded": ml_service.is_loaded
    }

@app.post("/api/predict", response_model=schemas.PredictResponse)
def predict_flow(request: schemas.PredictRequest, db: Session = Depends(get_db)):
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Machine learning models are not loaded.")

    try:
        raw_record = {
            "total_packets": request.total_packets,
            "total_bytes": request.total_bytes,
            "duration_us": request.duration_us
        }
        
        # Run inference
        result = ml_service.predict(raw_record)
        
        # Save to database
        db_event = models.Event(
            total_packets=request.total_packets,
            total_bytes=request.total_bytes,
            duration_us=request.duration_us,
            duration_s=result["features"]["duration_s"],
            packets_per_sec=result["features"]["packets_per_sec"],
            bytes_per_sec=result["features"]["bytes_per_sec"],
            avg_packet_size=result["features"]["avg_packet_size"],
            rf_prediction_class=result["rf_prediction"],
            anomaly_score=result["anomaly_score"],
            anomaly_threshold=result["anomaly_threshold"],
            is_anomaly=result["is_anomaly"],
            overall_status=result["status"],
            is_simulated=request.is_simulated
        )
        db.add(db_event)
        db.commit()
        
        result["is_simulated"] = request.is_simulated
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/events", response_model=List[schemas.EventResponse])
def get_events(limit: int = 100, db: Session = Depends(get_db)):
    events = db.query(models.Event).order_by(models.Event.timestamp.desc()).limit(limit).all()
    return events
