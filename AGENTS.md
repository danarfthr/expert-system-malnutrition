# Expert System: Child Nutritional Status Diagnosis (CBR)

## Project Overview

An expert system for early diagnosis of malnutrition (Gizi Buruk) in toddlers using
Case-Based Reasoning (CBR) with Nearest Neighbor Retrieval and Similarity Threshold for uncertainty handling.

## Tech Stack

- **Backend:** Python 3.10+, FastAPI
- **Frontend:** Streamlit
- **Package Manager:** UV (always use UV — never pip or conda directly)
- **Deployment:** Docker & Docker Compose
- **Data:** JSON/CSV for case base and symptom weights

## Core Algorithm: CBR (4R Cycle)

1. **Retrieve** — Nearest Neighbor Retrieval (NNR):
   `Similarity = sum(S_i * W_i) / sum(W_i)`
   - `S_i`: 1 if symptom matches, 0 otherwise
   - `W_i`: symptom weight (1=Low, 3=Medium, 5=High)
2. **Reuse** — Return diagnosis of the highest-similarity case
3. **Revise** — Expert adjusts diagnosis if similarity is below threshold (via UI)
4. **Retain** — Persist validated case back to knowledge base

## Uncertainty Handling: Similarity Threshold

CBR handles uncertainty inherently through the NNR similarity percentage — no Certainty Factor needed.

- `similarity == 1.0` — Absolute certainty: new case is identical to an existing case
- `similarity >= threshold` — System concludes the situation is "similar enough" and recommends the diagnosis with the highest similarity score
- `similarity < threshold` — System flags low confidence; the Revise step is triggered for expert review

Do not implement a separate CF module. The similarity score is the confidence metric.

## Project Structure

```
.
├── backend/
│   ├── main.py            # FastAPI entry point
│   ├── cbr_engine.py      # Core CBR/NNR logic (decoupled from routing)
│   ├── models/            # Pydantic schemas
│   └── data/              # case_base.json, symptom_weights.json
├── frontend/
│   └── app.py             # Streamlit UI
├── tests/
│   └── test_cbr.py
├── pyproject.toml         # Project metadata and dependencies (UV-managed)
├── docker-compose.yml
├── AGENTS.md              # Main project instructions
└── README.md              # Project overview and how to run the code

```

## Package Management (UV)

Always use UV. Never use `pip install` or `conda`.

```bash
uv init                        # Initialize project (creates pyproject.toml)
uv add fastapi uvicorn          # Add runtime dependencies
uv add --dev pytest ruff        # Add dev dependencies
uv run uvicorn backend.main:app --reload --port 8000
uv run streamlit run frontend/app.py
uv run pytest tests/
uv sync                        # Sync environment from lockfile
```

## Development Commands

```bash
uv run uvicorn backend.main:app --reload --port 8000   # Backend dev
uv run streamlit run frontend/app.py                    # Frontend dev
docker-compose up --build                               # Full stack via Docker
uv run pytest tests/ -v                                 # Run tests
uv run ruff check . && uv run ruff format .             # Lint and format
```

## Coding Conventions

- **Type hints:** Enforce strict typing everywhere (`-> int`, `list[str]`, Pydantic models)
- **Linting/Formatting:** Use Ruff for both linting and formatting (replaces Flake8 + Black)
- **Modularity:** `cbr_engine.py` must have zero FastAPI imports
- **Language:** Code, comments, and docstrings in English; UI labels and API messages in Indonesian
- **Performance:** Use list comprehensions or NumPy for NNR over large case bases
- **Error handling:** Return proper HTTP status codes — 400 for bad input, 404 for no matching case, 200 for success
- **No globals:** Pass dependencies explicitly (use FastAPI `Depends()`)
- **Secrets:** Never hardcode config — use `.env` loaded via `python-dotenv`

## Testing

- Minimum: one test per CBR function (similarity calc, retrieve, retain)
- Use `pytest` with `uv run pytest`
- Name tests descriptively: `test_similarity_returns_zero_for_no_match`

## Git Commits

Format: `<type>(<scope>): <imperative verb> <what>` — max 72 chars, no period.
Types: `feat` `fix` `refactor` `test` `chore` `docs`
Scopes: `cbr` `api` `ui` `data` `config` `deps`

One logical change per commit. Split end-to-end features by layer:

```
feat(cbr): Add NNR similarity calculation
feat(api): Add POST /diagnose endpoint
test(cbr): Add test for zero-match returning 0.0
```

Use `git add -p` to stage hunks — never `git add .` blindly.
Never commit `.env`, `.venv/`, or `__pycache__/`.
