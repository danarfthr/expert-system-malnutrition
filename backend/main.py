from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.cbr_engine import retrieve, retain
from backend.models import (
    CaseEntry,
    DiagnosisRequest,
    DiagnosisResponse,
    NewCaseRequest,
    SymptomInfo,
    SymptomsListResponse,
)

load_dotenv()

app = FastAPI(
    title="Sistem Pakar Diagnosa Gizi Buruk",
    description="Expert system for early diagnosis of malnutrition in toddlers using CBR",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
SYMPTOMS_FILE = DATA_DIR / "symptom_weights.json"
CASES_FILE = DATA_DIR / "case_base.json"

DEFAULT_THRESHOLD = 0.7


def load_symptoms() -> dict[str, dict]:
    import json

    with open(SYMPTOMS_FILE) as f:
        return json.load(f)


def load_case_base() -> dict:
    import json

    with open(CASES_FILE) as f:
        return json.load(f)


def save_case_base(case_base: dict) -> None:
    import json

    with open(CASES_FILE, "w") as f:
        json.dump(case_base, f, indent=2)


@app.get("/")
def root() -> dict:
    return {"message": "Sistem Pakar Diagnosa Gizi Buruk - CBR Backend"}


@app.get("/symptoms", response_model=SymptomsListResponse)
def get_symptoms() -> SymptomsListResponse:
    symptoms_data = load_symptoms()
    symptoms = [
        SymptomInfo(
            code=code,
            name=data["name"],
            name_en=data["name_en"],
            weight=data["weight"],
        )
        for code, data in symptoms_data.items()
    ]
    return SymptomsListResponse(symptoms=symptoms)


@app.post("/diagnose", response_model=DiagnosisResponse)
def diagnose(request: DiagnosisRequest, threshold: float = DEFAULT_THRESHOLD) -> DiagnosisResponse:
    symptoms_data = load_symptoms()
    case_base = load_case_base()

    weights = {code: data["weight"] for code, data in symptoms_data.items()}

    result = retrieve(
        input_symptoms=request.symptoms,
        case_base=case_base,
        weights=weights,
        threshold=threshold,
    )

    if result["diagnosis"] is None:
        return DiagnosisResponse(
            disease_code=None,
            disease_name=None,
            similarity=result["similarity"],
            requires_review=True,
            message=result.get("message"),
        )

    return DiagnosisResponse(
        disease_code=result["diagnosis"]["disease_code"],
        disease_name=result["diagnosis"]["disease_name"],
        similarity=result["similarity"],
        requires_review=result["requires_review"],
    )


@app.get("/cases", response_model=list[CaseEntry])
def get_cases() -> list[CaseEntry]:
    case_base = load_case_base()
    return [CaseEntry(code=d["code"], name=d["name"], symptoms=d["symptoms"]) for d in case_base["diseases"]]


@app.post("/cases", response_model=CaseEntry, status_code=status.HTTP_201_CREATED)
def add_case(request: NewCaseRequest) -> CaseEntry:
    case_base = load_case_base()

    for disease in case_base["diseases"]:
        if disease["code"] == request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Penyakit dengan kode {request.code} sudah ada.",
            )

    new_case = {"code": request.code, "name": request.name, "symptoms": request.symptoms}
    case_base = retain(new_case, case_base)
    save_case_base(case_base)

    return CaseEntry(code=request.code, name=request.name, symptoms=request.symptoms)