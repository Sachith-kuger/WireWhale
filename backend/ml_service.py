import sys
import os
from pathlib import Path
import joblib

# Ensure ml is in path so we can import feature_schema
ROOT_DIR = Path(__file__).resolve().parent.parent
ML_DIR = ROOT_DIR / "ml"
sys.path.append(str(ML_DIR))

from feature_schema import validate_record, compute_features, FEATURE_NAMES

class MLService:
    def __init__(self):
        self.rf_model = None
        self.rf_classes = None
        self.if_model = None
        self.if_threshold = None
        self.is_loaded = False
        self.load_models()

    def load_models(self):
        rf_path = ML_DIR / "models" / "random_forest_v1.joblib"
        if_path = ML_DIR / "models" / "isolation_forest_v1.joblib"
        
        try:
            rf_bundle = joblib.load(rf_path)
            self.rf_model = rf_bundle["model"]
            self.rf_classes = rf_bundle.get("label_classes", [])
            
            if_bundle = joblib.load(if_path)
            self.if_model = if_bundle["model"]
            self.if_threshold = float(if_bundle["threshold"])
            
            self.is_loaded = True
        except Exception as e:
            print(f"Error loading models: {e}")
            self.is_loaded = False

    def predict(self, record: dict):
        if not self.is_loaded:
            raise RuntimeError("Models are not loaded.")

        # 1. Validate inputs
        validate_record(record)
        
        # 2. Compute features
        features_df = compute_features(**record)
        X = features_df[FEATURE_NAMES].to_numpy(dtype=float)
        
        # 3. Random Forest Prediction
        pred_idx = self.rf_model.predict(X)[0]
        try:
            pred_class = self.rf_classes[pred_idx] if self.rf_classes else "Unknown"
        except Exception:
            pred_class = "Unknown"
            
        # 4. Isolation Forest Score
        # Must negate the score to get 'unusualness' per verified convention
        unusual_score = float(-self.if_model.score_samples(X)[0])
        is_anomaly = bool(unusual_score > self.if_threshold)
        
        # Determine overall status
        if is_anomaly:
            status = "ANOMALY_DETECTED"
        elif pred_class != "BENIGN":
            status = "ATTACK_DETECTED"
        else:
            status = "NORMAL"

        return {
            "features": features_df.iloc[0].to_dict(),
            "rf_prediction": pred_class,
            "anomaly_score": unusual_score,
            "anomaly_threshold": self.if_threshold,
            "is_anomaly": is_anomaly,
            "status": status
        }
