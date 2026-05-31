from backend.rbr_engine import forward_chain


RULE_BASE = {
    "rules": [
        {
            "code": "R01",
            "disease_code": "GZ01",
            "disease_name": "Kwashiorkor",
            "conditions": ["G01", "G02", "G03"],
        },
        {
            "code": "R02",
            "disease_code": "GZ02",
            "disease_name": "Marasmus",
            "conditions": ["G02", "G04"],
        },
    ]
}


def test_rbr_returns_diagnosis_when_rule_fully_matches():
    result = forward_chain(["G01", "G02", "G03", "G99"], RULE_BASE)

    assert result is not None
    assert result["rule_code"] == "R01"
    assert result["disease_code"] == "GZ01"
    assert result["disease_name"] == "Kwashiorkor"
    assert result["matched_symptoms"] == ["G01", "G02", "G03"]


def test_rbr_returns_none_when_no_rule_fully_matches():
    result = forward_chain(["G01", "G02"], RULE_BASE)

    assert result is None
