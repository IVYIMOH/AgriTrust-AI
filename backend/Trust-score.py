SCORE_WEIGHTS = {
    "mobile_money": 0.25,
    "coop_trust":   0.25,
    "repayment":    0.35,
    "farm_data":    0.15,
}

CLIMATE_PENALTY = {"Low": 0, "Moderate": -3, "High": -6}


def compute_trust_score(farmer: dict) -> int:
    raw = sum(farmer["scores"][k] * w for k, w in SCORE_WEIGHTS.items())
    penalty = CLIMATE_PENALTY.get(farmer["climate_risk"], 0)
    return max(40, min(98, round(raw + penalty)))


def trust_category(score: int) -> str:
    if score >= 85:
        return "Strong"
    if score >= 70:
        return "Developing"
    return "Needs Improvement"


def human_review_required(score: int) -> bool:
    return 60 <= score < 85


def score_breakdown(farmer: dict) -> list:
    return [
        {"label": "Mobile Money",      "value": farmer["scores"]["mobile_money"], "weight": 25},
        {"label": "Cooperative Trust", "value": farmer["scores"]["coop_trust"],   "weight": 25},
        {"label": "Repayment",         "value": farmer["scores"]["repayment"],    "weight": 35},
        {"label": "Farm Data",         "value": farmer["scores"]["farm_data"],    "weight": 15},
    ]