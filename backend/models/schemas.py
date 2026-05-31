from typing import Annotated, Literal

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


class MatchedRuleDetail(BaseModel):
    rule_code: str
    disease_code: str
    disease_name: str
    matched_symptoms: list[str]


class DiagnosisResponse(BaseModel):
    method: Literal["RBR", "CBR"]
    disease_code: str | None
    disease_name: str | None
    similarity: float | None
    requires_review: bool
    message: str | None = None
    input_symptoms: list[str]
    matched_rule: MatchedRuleDetail | None = None
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
