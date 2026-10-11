from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Raw flow counters
    total_packets = Column(Float)
    total_bytes = Column(Float)
    duration_us = Column(Float)
    
    # Computed features
    duration_s = Column(Float)
    packets_per_sec = Column(Float)
    bytes_per_sec = Column(Float)
    avg_packet_size = Column(Float)
    
    # Predictions
    rf_prediction_class = Column(String)
    anomaly_score = Column(Float)
    anomaly_threshold = Column(Float)
    is_anomaly = Column(Boolean)
    overall_status = Column(String)
    
    # Metadata
    is_simulated = Column(Boolean, default=False)
