from backend.cbr_engine import retrieve
from backend.rbr_engine import forward_chain


def diagnose_hybrid(
    input_symptoms: list[str],
    rule_base: dict[str, list[dict]],
    case_base: dict[str, list[dict]],
    weights: dict[str, int],
    threshold: float = 0.5,
) -> dict:
    rbr_result = forward_chain(input_symptoms, rule_base)
    if rbr_result:
        return {
            "method": "RBR",
            "diagnosis": {
                "disease_code": rbr_result["disease_code"],
                "disease_name": rbr_result["disease_name"],
            },
            "requires_review": False,
            "similarity": None,
            "message": "Diagnosis ditentukan oleh aturan RBR. CBR tidak dijalankan.",
            "input_symptoms": input_symptoms,
            "matched_rule": rbr_result,
            "per_disease": [],
        }

    cbr_result = retrieve(input_symptoms, case_base, weights, threshold)
    cbr_result["method"] = "CBR"
    cbr_result["matched_rule"] = None
    return cbr_result
