# Expert System for Child Nutritional Status Diagnosis (Hybrid RBR + CBR)

Sistem pakar diagnosa dini malnutrition (Gizi Buruk) pada balita menggunakan Hybrid Rule-Based Reasoning (RBR) dan Case-Based Reasoning (CBR). RBR Forward Chaining berjalan lebih dulu; CBR Nearest Neighbor Retrieval hanya berjalan jika tidak ada aturan RBR yang cocok 100%.

## Tech Stack

- **Backend:** Python 3.13+, FastAPI
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lenis
- **Package Manager:** UV for Python backend, npm for Next.js frontend
- **Deployment:** Docker & Docker Compose

## Project Structure

```
.
├── backend/
│   ├── Dockerfile        # Backend container image
│   ├── main.py            # FastAPI entry point
│   ├── rbr_engine.py      # Forward Chaining rule evaluation
│   ├── cbr_engine.py      # Core CBR/NNR logic
│   ├── hybrid_engine.py   # RBR first, then CBR fallback
│   ├── models/            # Pydantic schemas
│   └── data/              # rules.json, case_base.json, symptom_weights.json
├── frontend/
│   ├── Dockerfile        # Frontend container image
│   ├── app/              # Next.js App Router UI, layout composition, and API proxy routes
│   ├── components/ui/    # shadcn/ui components
│   ├── lib/              # Shared frontend utilities
│   ├── package.json      # Frontend scripts and dependencies
│   └── tsconfig.json     # TypeScript configuration
├── tests/
│   ├── test_rbr.py
│   ├── test_cbr.py
│   └── test_hybrid.py
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Local Development

```bash
# Backend
uv run uvicorn backend.main:app --reload --port 8000

# Frontend setup
cd frontend
npm install

# Frontend development server (in another terminal)
npm run dev

# Frontend build and lint
npm run build
npm run lint

# Return to project root before backend commands
cd ..

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
- Frontend: http://localhost:3000

The Next.js frontend calls relative `/api/*` routes. Those route handlers proxy requests to FastAPI through `BACKEND_URL`.

For Docker Compose, `BACKEND_URL` is set to `http://backend:8000`. For local frontend development outside Docker, the default backend URL is `http://localhost:8000`.

## Frontend Features

- Professional Indonesian clinical UI with small English helper text.
- Two-page flow: landing page at `/` and diagnosis workflow at `/diagnose`.
- Reusable composition components for page shell, intro sections, content sections, and process steps.
- shadcn/ui components for cards, buttons, badges, alerts, checkboxes, progress, skeletons, switches, and accordions.
- Lenis smooth scrolling with reduced-motion handling.
- Symptom checklist grouped by clinical category, not by weight.
- RBR result panel for exact rule matches.
- CBR similarity details with per-disease matched symptoms, unmatched symptoms, formula, and weighted score.
- Expert mode retain workflow for saving validated cases to the case base.
- Next.js API proxy routes to avoid browser-side Docker hostname issues.

## Frontend Routes

| Route       | Description                                      |
|-------------|--------------------------------------------------|
| `/`         | Landing page with short RBR + CBR explanation    |
| `/diagnose` | Clinical symptom checklist and diagnosis results |

## Frontend Proxy Routes

| Method | Route           | Proxies To              | Description                 |
|--------|-----------------|-------------------------|-----------------------------|
| GET    | `/api/symptoms` | `GET /symptoms`         | Fetch symptom definitions   |
| POST   | `/api/diagnose` | `POST /diagnose`        | Run diagnosis               |
| POST   | `/api/cases`    | `POST /cases`           | Retain expert-approved case |

## API Endpoints

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| GET    | `/`          | Health check                       |
| GET    | `/symptoms`  | List all symptoms                  |
| POST   | `/diagnose`  | Run diagnosis on symptoms          |
| GET    | `/cases`     | List all disease cases             |
| POST   | `/cases`     | Add a new validated case (expert) |

## Hybrid Algorithm

1. **RBR Forward Chaining** - If all symptoms in one rule are present, return that diagnosis and skip CBR.
2. **CBR Retrieve** - If no RBR rule fires, run Nearest Neighbor Retrieval (NNR):
   `Similarity = sum(S_i * W_i) / sum(W_i)`
3. **Reuse** - Return diagnosis of highest-similarity case.
4. **Revise** - Expert reviews if similarity < 0.5 (threshold).
5. **Retain** - Persist validated case back to knowledge base.

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
