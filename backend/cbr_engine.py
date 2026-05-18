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


def retrieve(
    input_symptoms: list[str],
    case_base: dict[str, list[dict]],
    weights: dict[str, int],
    threshold: float = 0.7,
) -> dict:
    results: list[dict] = []

    for disease in case_base["diseases"]:
        code = disease["code"]
        name = disease["name"]
        symptoms = disease["symptoms"]

        similarity, numerator = calculate_similarity(input_symptoms, symptoms, weights)
        results.append(
            {
                "disease_code": code,
                "disease_name": name,
                "symptoms": symptoms,
                "similarity": similarity,
                "numerator": numerator,
            }
        )

    results.sort(key=lambda x: (x["similarity"], x["numerator"]), reverse=True)

    if not results:
        return {
            "diagnosis": None,
            "requires_review": True,
            "similarity": 0.0,
            "message": "Tidak ada data penyakit dalam basis pengetahuan.",
        }

    best = results[0]
    requires_review = best["similarity"] < threshold

    if len(results) > 1:
        second = results[1]
        if (
            best["similarity"] == second["similarity"]
            and best["numerator"] == second["numerator"]
        ):
            return {
                "diagnosis": None,
                "requires_review": True,
                "similarity": best["similarity"],
                "message": "Hasil diagnosa ambigu. Silakan masukkan gejala tambahan.",
                "candidates": results[:2],
            }

    return {
        "diagnosis": {
            "disease_code": best["disease_code"],
            "disease_name": best["disease_name"],
        },
        "requires_review": requires_review,
        "similarity": best["similarity"],
        "numerator": best["numerator"],
    }


def retain(
    new_case: dict,
    case_base: dict[str, list[dict]],
) -> dict[str, list[dict]]:
    case_base["diseases"].append(new_case)
    return case_base
