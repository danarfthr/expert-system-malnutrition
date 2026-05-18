import pytest

from backend.cbr_engine import calculate_similarity, retrieve, retain


WEIGHTS = {
    "G01": 5,
    "G02": 3,
    "G03": 5,
    "G04": 5,
    "G05": 5,
    "G06": 3,
    "G07": 5,
    "G08": 3,
    "G09": 1,
    "G10": 5,
    "G11": 3,
    "G12": 5,
    "G13": 5,
    "G14": 3,
    "G15": 5,
    "G16": 1,
    "G17": 3,
}

CASE_BASE = {
    "diseases": [
        {
            "code": "GZ01",
            "name": "Kwashiorkor",
            "symptoms": ["G01", "G02", "G03", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G17"],
        },
        {
            "code": "GZ02",
            "name": "Marasmus",
            "symptoms": ["G02", "G04", "G05", "G13", "G14", "G15", "G16"],
        },
        {
            "code": "GZ03",
            "name": "Kwashiorkor-Marasmus",
            "symptoms": ["G01", "G02", "G04", "G05", "G12"],
        },
    ]
}


class TestCalculateSimilarity:
    def test_exact_match_returns_one(self):
        symptoms = ["G01", "G02", "G03"]
        similarity, numerator = calculate_similarity(symptoms, symptoms, WEIGHTS)
        assert similarity == 1.0

    def test_no_match_returns_zero(self):
        input_symptoms = ["G01", "G02"]
        case_symptoms = ["G03", "G04"]
        similarity, numerator = calculate_similarity(input_symptoms, case_symptoms, WEIGHTS)
        assert similarity == 0.0

    def test_partial_match_returns_correct_value(self):
        input_symptoms = ["G01", "G02"]
        case_symptoms = ["G01", "G02", "G03"]
        total_weight = WEIGHTS["G01"] + WEIGHTS["G02"] + WEIGHTS["G03"]
        expected = (WEIGHTS["G01"] + WEIGHTS["G02"]) / total_weight
        similarity, numerator = calculate_similarity(input_symptoms, case_symptoms, WEIGHTS)
        assert similarity == expected
        assert numerator == WEIGHTS["G01"] + WEIGHTS["G02"]

    def test_empty_case_symptoms_returns_zero(self):
        similarity, numerator = calculate_similarity(["G01"], [], WEIGHTS)
        assert similarity == 0.0
        assert numerator == 0


class TestRetrieve:
    def test_returns_highest_similarity_disease(self):
        input_symptoms = ["G01", "G02", "G03", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G17"]
        result = retrieve(input_symptoms, CASE_BASE, WEIGHTS, threshold=0.7)
        assert result["diagnosis"]["disease_code"] == "GZ01"
        assert result["diagnosis"]["disease_name"] == "Kwashiorkor"
        assert result["similarity"] == 1.0
        assert result["requires_review"] is False

    def test_flags_low_confidence_when_below_threshold(self):
        input_symptoms = ["G01", "G02", "G05"]
        result = retrieve(input_symptoms, CASE_BASE, WEIGHTS, threshold=0.7)
        assert result["requires_review"] is True
        assert result["similarity"] < 0.7

    def test_tie_break_by_numerator(self):
        case_base_modified = {
            "diseases": [
                {"code": "GZ01", "name": "DiseaseA", "symptoms": ["G01", "G02"]},
                {"code": "GZ02", "name": "DiseaseB", "symptoms": ["G03", "G04"]},
            ]
        }
        input_symptoms = ["G01", "G02", "G03", "G04"]
        result = retrieve(input_symptoms, case_base_modified, WEIGHTS, threshold=0.7)
        assert result["diagnosis"]["disease_code"] == "GZ02"
        assert result["diagnosis"]["disease_name"] == "DiseaseB"

    def test_flags_ambiguous_when_tie_with_equal_numerator(self):
        case_base_ambiguous = {
            "diseases": [
                {"code": "GZ01", "name": "DiseaseA", "symptoms": ["G01", "G02"]},
                {"code": "GZ02", "name": "DiseaseB", "symptoms": ["G01", "G02"]},
            ]
        }
        input_symptoms = ["G01", "G02"]
        result = retrieve(input_symptoms, case_base_ambiguous, WEIGHTS, threshold=0.7)
        assert result["diagnosis"] is None
        assert result["requires_review"] is True
        assert "ambigu" in result["message"].lower()


class TestRetain:
    def test_adds_new_case_to_case_base(self):
        case_base = {"diseases": []}
        new_case = {"code": "GZ04", "name": "TestDisease", "symptoms": ["G01", "G02"]}
        updated = retain(new_case, case_base)
        assert len(updated["diseases"]) == 1
        assert updated["diseases"][0]["code"] == "GZ04"
        assert updated["diseases"][0]["name"] == "TestDisease"

    def test_retain_returns_modified_case_base(self):
        case_base = {"diseases": [{"code": "GZ01", "name": "Existing", "symptoms": ["G01"]}]}
        new_case = {"code": "GZ04", "name": "NewCase", "symptoms": ["G02"]}
        result = retain(new_case, case_base)
        assert len(result["diseases"]) == 2