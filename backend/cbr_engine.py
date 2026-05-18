def calculate_similarity(
    input_symptoms: list[str],
    case_symptoms: list[str],
    weights: dict[str, int],
) -> tuple[float, int]:
    if not case_symptoms:
        return 0.0, 0

    matched_weight_sum = sum(
        weights[symptom] for symptom in case_symptoms if symptom in input_symptoms
    )
    total_weight_sum = sum(weights[symptom] for symptom in case_symptoms)

    if total_weight_sum == 0:
        return 0.0, 0

    similarity = matched_weight_sum / total_weight_sum
    return similarity, matched_weight_sum


def _build_disease_detail(
    input_symptoms: list[str],
    disease: dict,
    weights: dict[str, int],
) -> dict:
    symptoms = disease["symptoms"]
    matched = [s for s in symptoms if s in input_symptoms]
    unmatched = [s for s in symptoms if s not in input_symptoms]

    matched_weight = sum(weights[s] for s in matched)
    total_weight = sum(weights[s] for s in symptoms)
    similarity = matched_weight / total_weight if total_weight > 0 else 0.0

    matched_str = " + ".join(f"{s}:{weights[s]}" for s in matched) if matched else "0"
    formula = f"({matched_str}) / ({total_weight}) = {matched_weight}/{total_weight} ≈ {similarity:.3f}"

    return {
        "code": disease["code"],
        "name": disease["name"],
        "symptoms": symptoms,
        "matched": matched,
        "unmatched": unmatched,
        "matched_weight": matched_weight,
        "total_weight": total_weight,
        "similarity": similarity,
        "formula": formula,
    }


def retrieve(
    input_symptoms: list[str],
    case_base: dict[str, list[dict]],
    weights: dict[str, int],
    threshold: float = 0.7,
) -> dict:
    disease_details: list[dict] = []

    for disease in case_base["diseases"]:
        detail = _build_disease_detail(input_symptoms, disease, weights)
        disease_details.append(detail)

    disease_details.sort(
        key=lambda x: (x["similarity"], x["matched_weight"]), reverse=True
    )

    for detail in disease_details:
        detail["is_winner"] = detail == disease_details[0]

    if not disease_details:
        return {
            "diagnosis": None,
            "requires_review": True,
            "similarity": 0.0,
            "message": "Tidak ada data penyakit dalam basis pengetahuan.",
            "input_symptoms": input_symptoms,
            "per_disease": [],
        }

    best = disease_details[0]
    requires_review = best["similarity"] < threshold

    if len(disease_details) > 1:
        second = disease_details[1]
        if (
            best["similarity"] == second["similarity"]
            and best["matched_weight"] == second["matched_weight"]
        ):
            return {
                "diagnosis": None,
                "requires_review": True,
                "similarity": best["similarity"],
                "message": "Hasil diagnosa ambigu. Silakan masukkan gejala tambahan.",
                "input_symptoms": input_symptoms,
                "per_disease": disease_details,
            }

    return {
        "diagnosis": {
            "disease_code": best["code"],
            "disease_name": best["name"],
        },
        "requires_review": requires_review,
        "similarity": best["similarity"],
        "numerator": best["matched_weight"],
        "input_symptoms": input_symptoms,
        "per_disease": disease_details,
    }


def retain(
    new_case: dict,
    case_base: dict[str, list[dict]],
) -> dict[str, list[dict]]:
    case_base["diseases"].append(new_case)
    return case_base
