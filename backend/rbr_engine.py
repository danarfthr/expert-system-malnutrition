def forward_chain(
    input_symptoms: list[str], rule_base: dict[str, list[dict]]
) -> dict | None:
    input_set = set(input_symptoms)

    for rule in rule_base["rules"]:
        conditions = rule["conditions"]
        if set(conditions).issubset(input_set):
            return {
                "rule_code": rule["code"],
                "disease_code": rule["disease_code"],
                "disease_name": rule["disease_name"],
                "matched_symptoms": conditions,
            }

    return None
