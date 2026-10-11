# RouteSense AI - Backend

This is the FastAPI backend for the Phase 1 demonstration prototype of RouteSense AI.
It provides a minimal API to perform inference using the pre-trained `ml/` models.

## Setup Instructions

1. **Create a virtual environment:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure models are present:**
   The backend automatically loads models from `../ml/models/`. Make sure `random_forest_v1.joblib` and `isolation_forest_v1.joblib` are present there.

4. **Start the API:**
   ```bash
   uvicorn main:app --reload
   ```

## Testing

Run tests with `pytest`:
```bash
pytest tests/
```

## Database

By default, an SQLite database `routesense.db` is created in the `backend/` directory. You can inspect it using any SQLite client (e.g., `sqlite3 routesense.db`). To configure the path, set the `ROUTESENSE_DB_PATH` environment variable.
