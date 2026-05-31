from backend.hybrid_engine import diagnose_hybrid


WEIGHTS = {
    "G01": 5,
    "G02": 3,
    "G03": 5,
    "G04": 5,
    "G05": 5,
}

RULE_BASE = {
    "rules": [
        {
            "code": "R01",
            "disease_code": "GZ01",
            "disease_name": "Kwashiorkor",
            "conditions": ["G01", "G02", "G03"],
        }
    ]
}

CASE_BASE = {
    "diseases": [
        {
            "code": "GZ01",
            "name": "Kwashiorkor",
            "symptoms": ["G01", "G02", "G03"],
        },
        {
            "code": "GZ02",
            "name": "Marasmus",
            "symptoms": ["G02", "G04", "G05"],
        },
    ]
}


def test_hybrid_returns_rbr_result_before_cbr_when_rule_matches():
    result = diagnose_hybrid(["G01", "G02", "G03"], RULE_BASE, CASE_BASE, WEIGHTS)

    assert result["method"] == "RBR"
    assert result["diagnosis"]["disease_code"] == "GZ01"
    assert result["similarity"] is None
    assert result["requires_review"] is False
    assert result["matched_rule"]["rule_code"] == "R01"
    assert result["per_disease"] == []


def test_hybrid_falls_back_to_cbr_when_no_rule_matches():
    result = diagnose_hybrid(["G02", "G04", "G05"], RULE_BASE, CASE_BASE, WEIGHTS)

    assert result["method"] == "CBR"
    assert result["diagnosis"]["disease_code"] == "GZ02"
    assert result["similarity"] == 1.0
    assert result["requires_review"] is False
    assert result["matched_rule"] is None
    assert result["per_disease"]
