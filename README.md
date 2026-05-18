# Expert System for Child Nutritional Status Diagnosis (CBR)

Sistem pakar diagnosa dini malnutrition (Gizi Buruk) pada balita menggunakan Case-Based Reasoning (CBR) dengan Nearest Neighbor Retrieval dan Similarity Threshold.

## Tech Stack

- **Backend:** Python 3.13+, FastAPI
- **Frontend:** Streamlit
- **Package Manager:** UV
- **Deployment:** Docker & Docker Compose

## Project Structure

```
.
├── backend/
│   ├── Dockerfile        # Backend container image
│   ├── main.py            # FastAPI entry point
│   ├── cbr_engine.py      # Core CBR/NNR logic
│   ├── models/            # Pydantic schemas
│   └── data/              # case_base.json, symptom_weights.json
├── frontend/
│   ├── Dockerfile        # Frontend container image
│   └── app.py             # Streamlit UI
├── tests/
│   └── test_cbr.py
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Local Development

```bash
# Backend
uv run uvicorn backend.main:app --reload --port 8000

# Frontend (in another terminal)
uv run streamlit run frontend/app.py

# Run tests
uv run pytest tests/ -v

# Lint
uv run ruff check .
```

## Docker Development

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:8501

## API Endpoints

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| GET    | `/`          | Health check                       |
| GET    | `/symptoms`  | List all symptoms                  |
| POST   | `/diagnose`  | Run diagnosis on symptoms          |
| GET    | `/cases`     | List all disease cases             |
| POST   | `/cases`     | Add a new validated case (expert) |

## CBR Algorithm

1. **Retrieve** - Nearest Neighbor Retrieval (NNR):
   `Similarity = sum(S_i * W_i) / sum(W_i)`
2. **Reuse** - Return diagnosis of highest-similarity case
3. **Revise** - Expert adjusts if similarity < 0.7 (threshold)
4. **Retain** - Persist validated case back to knowledge base

## Disease Codes

| Code | Disease Name         |
|------|----------------------|
| GZ01 | Kwashiorkor          |
| GZ02 | Marasmus             |
| GZ03 | Kwashiorkor-Marasmus |

## Symptom Codes

| Code | Symptom (Indonesian)                          | Weight |
|------|-----------------------------------------------|--------|
| G01  | Edema                                         | 5      |
| G02  | Diare                                         | 3      |
| G03  | Perut buncit                                  | 5      |
| G04  | Tubuh kurus                                   | 5      |
| G05  | Perubahan mental                              | 5      |
| G06  | Massa otot mengecil                           | 3      |
| G07  | Berat dan tinggi badan susah bertambah        | 5      |
| G08  | Kelainan kulit (bercak merah muda)            | 3      |
| G09  | Rambut kering atau kusam                      | 1      |
| G10  | Rambut tipis kemerahan                        | 5      |
| G11  | Pandangan mata sayu                           | 3      |
| G12  | Tubuh mengandung banyak cairan               | 5      |
| G13  | Tulang yang menonjol (tulang iga dan bahu)   | 5      |
| G14  | Kulit lengan, paha, dan bokong tampak kendur | 3      |
| G15  | Wajah sayu                                    | 5      |
| G16  | Wajah seperti orang tua                       | 1      |
| G17  | Kelelahan                                     | 3      |