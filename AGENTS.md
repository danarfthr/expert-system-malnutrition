# Expert System: Child Nutritional Status Diagnosis (RBR + CBR Hybrid)

## Project Overview

An expert system for early diagnosis of malnutrition (Gizi Buruk) in toddlers using a
hybrid approach: Rule-Based Reasoning (RBR) with Forward Chaining as the primary filter,
falling back to Case-Based Reasoning (CBR) with Nearest Neighbor Retrieval when rules
do not match perfectly.

## Tech Stack

- **Backend:** Python 3.10+, FastAPI
- **Frontend:** Streamlit
- **Package Manager:** UV (always use UV — never pip or conda directly)
- **Deployment:** Docker & Docker Compose
- **Data:** JSON/CSV for rule base, case base, and symptom weights

## Core Algorithm: Hybrid RBR → CBR

### Decision Flow

```
User Input (Symptoms)
        │
        ▼
┌─────────────────────┐
│  Step 1: RBR        │  Forward Chaining over predefined rules
│  (Forward Chaining) │
└────────┬────────────┘
         │
    100% match?
    ┌────┴────┐
   YES        NO
    │          │
    ▼          ▼
RBR Output   Step 2: CBR (NNR)
(Instant)    → Compute similarity for all cases
             → Return highest-similarity diagnosis
             → If similarity < threshold → trigger Revise (expert review)
```

### Step 1: RBR — Forward Chaining

- Rules are defined as IF-THEN structures covering three diagnosis categories (Rule 1, 2, 3)
- If **all** symptoms in a rule fire → diagnosis is returned immediately; CBR is skipped
- Rule evaluation is O(n_rules) and must complete before any CBR computation

### Step 2: CBR — Nearest Neighbor Retrieval (NNR)

Triggered only when no rule matches 100%.

`Similarity = sum(S_i * W_i) / sum(W_i)`

- `S_i`: 1 if symptom matches, 0 otherwise
- `W_i`: symptom weight — High=5, Medium=3, Low=1

### Uncertainty Handling: Similarity Threshold

CBR inherently expresses confidence through its similarity percentage — no Certainty Factor needed.

- `similarity == 1.0` — Identical case found; diagnosis returned automatically
- `similarity >= threshold` — Sufficient confidence; diagnosis recommended
- `similarity < threshold` — Low confidence; Revise step triggered for expert review

## Project Structure

```
.
├── backend/
│   ├── main.py            # FastAPI entry point
│   ├── rbr_engine.py      # Forward Chaining rule evaluation (decoupled)
│   ├── cbr_engine.py      # NNR similarity logic (decoupled)
│   ├── hybrid_engine.py   # Orchestrates RBR → CBR decision flow
│   ├── models/            # Pydantic schemas
│   └── data/
│       ├── rules.json           # IF-THEN rule definitions
│       ├── case_base.json       # Historical case records
│       └── symptom_weights.json # Weight definitions (5, 3, 1)
├── frontend/
│   └── app.py             # Streamlit UI
├── tests/
│   ├── test_rbr.py
│   └── test_cbr.py
├── pyproject.toml         # UV-managed dependencies
├── docker-compose.yml
└── CLAUDE.md
```

## Engine Responsibilities

- `rbr_engine.py` — Evaluates rules via forward chaining; returns diagnosis or `None`
- `cbr_engine.py` — Computes NNR similarity; returns ranked cases
- `hybrid_engine.py` — Calls RBR first; calls CBR only if RBR returns `None`
- None of these files may import from FastAPI — keep logic fully decoupled from routing

## Package Management (UV)

Always use UV. Never use `pip install` or `conda`.

```bash
uv init                          # Initialize project
uv add fastapi uvicorn           # Runtime dependencies
uv add --dev pytest ruff         # Dev dependencies
uv sync                          # Sync environment from lockfile
```

## Development Commands

```bash
uv run uvicorn backend.main:app --reload --port 8000   # Backend dev
uv run streamlit run frontend/app.py                    # Frontend dev
docker-compose up --build                               # Full stack
uv run pytest tests/ -v                                 # Run tests
uv run ruff check . && uv run ruff format .             # Lint and format
```

## Coding Conventions

- **Type hints:** Strict typing everywhere (`-> str | None`, `list[str]`, Pydantic models)
- **Linting/Formatting:** Ruff only (replaces Flake8 + Black)
- **Language:** Code, comments, docstrings in English; UI labels and API messages in Indonesian
- **Error handling:** 400 for bad input, 404 for no matching case, 200 for success
- **No globals:** Use FastAPI `Depends()` for dependency injection
- **Secrets:** Never hardcode config — use `.env` via `python-dotenv`

## Testing

- Test RBR and CBR engines independently
- Test `hybrid_engine.py` for correct fallback behavior (RBR miss → CBR triggers)
- Name tests descriptively: `test_rbr_returns_none_when_no_rule_fully_matches`

## Git Conventions

- Branch: `feat/`, `fix/`, `chore/`
- Commit messages in English, imperative: `Add forward chaining rule evaluation`
- Never commit `.env`, `__pycache__`, or `.venv`
