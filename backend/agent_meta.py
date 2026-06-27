AGENT_ID      = "urn:masumi:agent:agritrust-scoring-v1"
AGENT_VERSION = "1.0.0"
MASUMI_EXPLORER = "https://www.masumi.network/explorer"

AGENT_LIMITS = [
    "Does not make final loan approval or denial decisions.",
    "Scores 60–84 require human loan-officer review before any credit action.",
    "Cannot access live bank records — uses mobile-money proxy data.",
    "Climate data is regional, not field-level.",
    "All outputs are advisory. Lender bears final credit decision responsibility.",
]

SERVICE_TIERS = [
    {
        "id": "basic",
        "name": "Basic Score",
        "description": "Trust score and category only — fast risk triage.",
        "price_ada": 0.2,
        "inputs": ["farmer_id"],
        "outputs": ["trust_score", "trust_category", "human_review_required"],
    },
    {
        "id": "standard",
        "name": "Standard Profile",
        "description": "Score, recommendations, next steps, and score breakdown.",
        "price_ada": 0.5,
        "inputs": ["farmer_id"],
        "outputs": ["trust_score", "trust_category", "score_breakdown", "recommendations", "next_steps", "human_review_required"],
    },
    {
        "id": "premium",
        "name": "Full Graph Profile",
        "description": "Complete Neo4j graph profile — cooperative network, peer vouchers, repayment chain, climate exposure, explainability.",
        "price_ada": 1.5,
        "inputs": ["farmer_id"],
        "outputs": ["trust_score", "trust_category", "score_breakdown", "recommendations", "next_steps", "cooperative_network", "peer_vouchers", "repayment_chain", "climate_exposure", "graph_insights", "explainability", "mobile_money_trend", "human_review_required"],
    },
]