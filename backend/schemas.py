from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class PredictRequest(BaseModel):
    total_packets: float
    total_bytes: float
    duration_us: float
    is_simulated: bool = False

class PredictResponse(BaseModel):
    features: Dict[str, Any]
    rf_prediction: str
    anomaly_score: float
    anomaly_threshold: float
    is_anomaly: bool
    status: str
    is_simulated: bool = False

class EventResponse(BaseModel):
    id: int
    timestamp: datetime
    total_packets: float
    total_bytes: float
    duration_us: float
    duration_s: float
    packets_per_sec: float
    bytes_per_sec: float
    avg_packet_size: float
    rf_prediction_class: str
    anomaly_score: float
    anomaly_threshold: float
    is_anomaly: bool
    overall_status: str
    is_simulated: bool = False

    class Config:
        from_attributes = True
