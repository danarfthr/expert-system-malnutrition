from typing import Annotated

from pydantic import BaseModel, Field


class DiagnosisRequest(BaseModel):
    symptoms: Annotated[
        list[str], Field(min_length=1, description="List of symptom codes")
    ]


class PerDiseaseDetail(BaseModel):
    code: str
    name: str
    symptoms: list[str]
    matched: list[str]
    unmatched: list[str]
    matched_weight: int
    total_weight: int
    similarity: float
    formula: str
    is_winner: bool


class DiagnosisResponse(BaseModel):
    disease_code: str | None
    disease_name: str | None
    similarity: float
    requires_review: bool
    message: str | None = None
    input_symptoms: list[str]
    per_disease: list[PerDiseaseDetail]


class DiseaseInfo(BaseModel):
    code: str
    name: str


class SymptomInfo(BaseModel):
    code: str
    name: str
    name_en: str
    weight: int


class SymptomsListResponse(BaseModel):
    symptoms: list[SymptomInfo]


class NewCaseRequest(BaseModel):
    code: Annotated[
        str, Field(pattern=r"^GZ\d{2}$", description="Disease code GZ01-GZ99")
    ]
    name: str
    symptoms: Annotated[
        list[str], Field(min_length=1, description="List of symptom codes")
    ]


class CaseEntry(BaseModel):
    code: str
    name: str
    symptoms: list[str]
