# Admin API

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API uses deterministic in-memory data for the frontend demo. `database/schema.sql` provides the MySQL schema for persistence integration.
