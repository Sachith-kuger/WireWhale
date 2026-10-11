# RouteSense AI

RouteSense AI is a network intrusion detection and traffic anomaly analysis system designed for Software-Defined Networking (SDN) environments. This repository represents the **Phase 1 Demonstration Prototype**, featuring a dual-stage machine learning inference engine, an asynchronous FastAPI backend, and an interactive React + TypeScript security operations console.

---

## Phase 1 Scope & Architecture

RouteSense AI employs a hybrid dual-model architecture to evaluate flow-level network telemetry:

1. **Stage 1 — Multi-Class Signature Classifier**: A trained Random Forest (`random_forest_v1.joblib`) that classifies network flows across 7 traffic categories (`BENIGN`, `DDoS`, `PortScan`, `Bot`, `Infiltration`, `Web Attack`, `Brute Force`).
2. **Stage 2 — Unsupervised Anomaly Detector**: An Isolation Forest (`isolation_forest_v1.joblib`) that scores flow unusualness against a calibrated decision threshold to identify zero-day behavior and structural outliers without relying on pre-existing labels.
3. **Operational API**: A FastAPI service providing health diagnostics (`GET /api/health`), flow inference and persistence (`POST /api/predict`), and historical event retrieval (`GET /api/events`).
4. **Operations Console**: A dark-mode cybersecurity dashboard built with React, Vite, and Tailwind CSS, featuring live telemetry, interactive charts, and a synthetic traffic generator.

> [!NOTE]
> **Prototype Demonstration Notice**:
> - **Synthetic Traffic**: The built-in simulation generator produces controlled mathematical flow parameters (`packets`, `bytes`, `duration_us`) to exercise the inference pipeline. These flows are not captured from physical network interfaces or live network wiretaps.
> - **Topology Visualization**: The network topology view is an illustrative representation of a multi-switch SDN environment and does not reflect a live physical OpenFlow controller.
> - **Detection Accuracy**: Stated classification performance is derived from offline benchmark validation splits. Real-world accuracy on enterprise networks requires live calibration and ongoing domain adaptation.

---

## Project Structure

```
Routesense/
├── backend/                  # FastAPI Application
│   ├── main.py               # API endpoints, middleware, and app entry point
│   ├── ml_service.py         # Model loading, validation, and inference pipeline
│   ├── database.py           # SQLite database engine and session management
│   ├── models.py             # SQLAlchemy ORM models (Event persistence)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── requirements.txt      # Backend runtime dependencies
│   └── tests/
│       └── test_api.py       # Pytest suite for API endpoints
├── frontend/                 # React + TypeScript + Vite Dashboard
│   ├── src/
│   │   ├── api/client.ts     # API client for backend communication
│   │   ├── pages/            # Dashboard pages (Overview, Live Detection, Traffic Analysis, etc.)
│   │   ├── App.tsx           # Layout, navigation, and simulation controller
│   │   └── index.css         # SOC dark-mode theme and typography
│   ├── package.json          # Node dependencies and build scripts
│   └── tailwind.config.js    # Design tokens and color system
├── ml/                       # Machine Learning Artifacts & Training
│   ├── feature_schema.py     # Canonical 4-feature contract and validation logic
│   ├── data_preprocessing.py # Preprocessing pipeline for training datasets
│   ├── models/               # Serialized model bundles (.joblib, .npz, .json)
│   │   ├── random_forest_v1.joblib
│   │   ├── isolation_forest_v1.joblib
│   │   └── ...
│   └── tests/                # Core ML validation tests
├── .gitignore                # Exclusion rules for secrets, builds, and local DBs
└── README.md                 # Project documentation
```

---

## Prerequisites

- **Python**: Version 3.10 to 3.14
- **Node.js**: Version 18+ and `npm`
- **Git**

---

## Backend Setup & Execution

### 1. Create and Activate Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Verify Model Artifacts

Ensure the pre-trained model files exist in `ml/models/`:
- `random_forest_v1.joblib`
- `isolation_forest_v1.joblib`

### 4. Start Backend Server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`. Interactive documentation (Swagger UI) is accessible at `http://127.0.0.1:8000/docs`.

---

## Frontend Setup & Execution

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### 3. Build for Production

```bash
npm run build
```

Production assets are emitted to `frontend/dist/`.

### 4. Run Linter

```bash
npm run lint
```

---

## API Endpoints

### `GET /api/health`
Checks backend availability and confirms whether machine learning model bundles are loaded in memory.
```json
{
  "status": "up",
  "models_loaded": true
}
```

### `POST /api/predict`
Ingests a flow record, calculates derived rates, executes dual-stage model inference, and persists the event to SQLite.

**Request Payload:**
```json
{
  "total_packets": 250,
  "total_bytes": 146500,
  "duration_us": 1000000,
  "is_simulated": true
}
```

**Response Payload:**
```json
{
  "features": {
    "total_packets": 250.0,
    "total_bytes": 146500.0,
    "duration_s": 1.0,
    "packets_per_sec": 250.0,
    "bytes_per_sec": 146500.0,
    "avg_packet_size": 586.0
  },
  "rf_prediction": "BENIGN",
  "anomaly_score": 0.6966,
  "anomaly_threshold": 0.6868,
  "is_anomaly": true,
  "status": "ANOMALY_DETECTED",
  "is_simulated": true
}
```

### `GET /api/events?limit=100`
Retrieves chronological history of evaluated flow events from SQLite storage.

---

## Running Tests

### Backend API Tests
Run the API integration and endpoint test suite:
```bash
./backend/.venv/bin/pytest backend/tests/ -v
# Or from the backend directory:
cd backend && pytest tests/ -v
```

### Core Machine Learning Tests
Run the feature schema validation and Isolation Forest score invariant tests:
```bash
./backend/.venv/bin/pytest ml/tests/test_feature_schema.py ml/tests/test_isolation_forest.py -v
```

---

## Synthetic Traffic Simulation

The dashboard header includes a simulation controller with cadences of `1.0s`, `2.0s`, and `5.0s`. 
- Clicking **Start** initiates an asynchronous generation loop that submits randomized synthetic flow parameter sets to `POST /api/predict`.
- Events are tagged with `is_simulated: true` and rendered in the Live Detection and Traffic Analysis tables with an explicit `SYNTHETIC` badge.
- Clicking **Stop** safely terminates the timer loop without leaving dangling requests.

---

## Current Limitations & Roadmap

- **Offline Dataset Grounding**: Models are currently trained on benchmark flow captures and require retraining or fine-tuning for specific operational networks.
- **In-Memory Inference**: Real-time packet parsing via DPDK or eBPF/XDP is planned for Phase 2; Phase 1 operates via flow summary ingestion over HTTP.
- **Single-Node SQLite**: Persistence uses local SQLite (`routesense.db`); distributed deployments will transition to PostgreSQL/TimescaleDB.
