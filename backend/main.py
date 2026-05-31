import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.cbr_engine import retain
from backend.hybrid_engine import diagnose_hybrid
from backend.models import (
    CaseEntry,
    DiagnosisRequest,
    DiagnosisResponse,
    MatchedRuleDetail,
    NewCaseRequest,
    PerDiseaseDetail,
    SymptomInfo,
    SymptomsListResponse,
)

load_dotenv()

app = FastAPI(
    title="Sistem Pakar Diagnosa Gizi Buruk",
    description="Expert system for early diagnosis of malnutrition in toddlers using Hybrid RBR + CBR",
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
RULES_FILE = DATA_DIR / "rules.json"

DEFAULT_THRESHOLD = float(os.getenv("THRESHOLD", "0.5"))


def load_symptoms() -> dict[str, dict]:
    import json

    with open(SYMPTOMS_FILE) as f:
        return json.load(f)


def load_case_base() -> dict:
    import json

    with open(CASES_FILE) as f:
        return json.load(f)


def load_rule_base() -> dict:
    import json

    with open(RULES_FILE) as f:
        return json.load(f)


def save_case_base(case_base: dict) -> None:
    import json

    with open(CASES_FILE, "w") as f:
        json.dump(case_base, f, indent=2)


@app.get("/")
def root() -> dict:
    return {"message": "Sistem Pakar Diagnosa Gizi Buruk - Hybrid RBR + CBR Backend"}


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
def diagnose(
    request: DiagnosisRequest, threshold: float = DEFAULT_THRESHOLD
) -> DiagnosisResponse:
    symptoms_data = load_symptoms()
    case_base = load_case_base()
    rule_base = load_rule_base()

    weights = {code: data["weight"] for code, data in symptoms_data.items()}

    result = diagnose_hybrid(
        input_symptoms=request.symptoms,
        rule_base=rule_base,
        case_base=case_base,
        weights=weights,
        threshold=threshold,
    )

    per_disease = [
        PerDiseaseDetail(
            code=d["code"],
            name=d["name"],
            symptoms=d["symptoms"],
            matched=d["matched"],
            unmatched=d["unmatched"],
            matched_weight=d["matched_weight"],
            total_weight=d["total_weight"],
            similarity=d["similarity"],
            formula=d["formula"],
            is_winner=d["is_winner"],
        )
        for d in result.get("per_disease", [])
    ]

    matched_rule = None
    if result.get("matched_rule"):
        matched_rule = MatchedRuleDetail(**result["matched_rule"])

    return DiagnosisResponse(
        method=result["method"],
        disease_code=result["diagnosis"]["disease_code"]
        if result["diagnosis"]
        else None,
        disease_name=result["diagnosis"]["disease_name"]
        if result["diagnosis"]
        else None,
        similarity=result["similarity"],
        requires_review=result["requires_review"],
        message=result.get("message"),
        input_symptoms=result["input_symptoms"],
        matched_rule=matched_rule,
        per_disease=per_disease,
    )


@app.get("/cases", response_model=list[CaseEntry])
def get_cases() -> list[CaseEntry]:
    case_base = load_case_base()
    return [
        CaseEntry(code=d["code"], name=d["name"], symptoms=d["symptoms"])
        for d in case_base["diseases"]
    ]


@app.post("/cases", response_model=CaseEntry, status_code=status.HTTP_201_CREATED)
def add_case(request: NewCaseRequest) -> CaseEntry:
    case_base = load_case_base()

    for disease in case_base["diseases"]:
        if disease["code"] == request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Penyakit dengan kode {request.code} sudah ada.",
            )

    new_case = {
        "code": request.code,
        "name": request.name,
        "symptoms": request.symptoms,
    }
    case_base = retain(new_case, case_base)
    save_case_base(case_base)

    return CaseEntry(code=request.code, name=request.name, symptoms=request.symptoms)
