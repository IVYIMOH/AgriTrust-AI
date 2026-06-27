"""
AgriTrust Scoring Agent — app.py
Masumi-registered AI agent selling smallholder farmer credit intelligence
from AFRACA/AgriFin Neo4j graph data to lending companies.
"""

import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

from data.mock_data import farmers, applications, climate_data
from scoring.trust_score import compute_trust_score, trust_category, human_review_required, score_breakdown
from masumi.agent_meta import AGENT_ID, AGENT_VERSION, MASUMI_EXPLORER, AGENT_LIMITS, SERVICE_TIERS

app = Flask(__name__)
CORS(app)

audit_log = []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_farmer(farmer_id):
    return next((f for f in farmers if f["id"] == farmer_id), None)


def _serialize_summary(f):
    return {
        "id": f["id"], "name": f["name"], "location": f["location"],
        "primary_crop": f["primary_crop"], "cooperative": f["cooperative"],
        "loan_status": f["loan_status"], "credit_readiness": f["credit_readiness"],
        "trust_score": compute_trust_score(f), "climate_risk": f["climate_risk"],
        "profile": f["profile"],
    }


def _serialize_detail(f):
    score = compute_trust_score(f)
    return {
        **_serialize_summary(f),
        "trust_category": trust_category(score),
        "human_review_required": human_review_required(score),
        "mobile_money_trend": f["mobile_money_trend"],
        "repayment_history": f["repayment_history"],
        "climate_exposure": f["climate_exposure"],
        "graph_insights": f["graph_insights"],
        "recommendations": f["recommendations"],
        "next_steps": f["next_steps"],
        "explainability": f["explainability"],
        "score_breakdown": score_breakdown(f),
    }


def _build_recommendation(farmer, tier):
    score = compute_trust_score(farmer)
    cat   = trust_category(score)
    review = human_review_required(score)
    base = {
        "farmer_id":             farmer["id"],
        "tier":                  tier,
        "trust_score":           score,
        "trust_category":        cat,
        "human_review_required": review,
        "score_breakdown":       score_breakdown(farmer),
    }
    if tier in ("standard", "premium"):
        base["recommendations"] = farmer["recommendations"]
        base["next_steps"]      = farmer["next_steps"]
    if tier == "premium":
        base["mobile_money_trend"]  = farmer["mobile_money_trend"]
        base["repayment_history"]   = farmer["repayment_history"]
        base["climate_exposure"]    = farmer["climate_exposure"]
        base["graph_insights"]      = farmer["graph_insights"]
        base["explainability"]      = farmer["explainability"]
    base["agent_limits"] = AGENT_LIMITS
    return base


# ---------------------------------------------------------------------------
# Masumi — agent discovery
# ---------------------------------------------------------------------------

@app.route("/api/agent", methods=["GET"])
def agent_info():
    return jsonify({
        "agent_id": AGENT_ID, "version": AGENT_VERSION,
        "name": "AgriTrust Scoring Agent",
        "description": "Sells smallholder farmer credit intelligence from AFRACA Neo4j graph data to lending companies via Masumi-gated API.",
        "capabilities": ["trust_scoring", "climate_risk_overlay", "repayment_analysis", "cooperative_network_analysis", "explainable_ai_memo"],
        "inputs": ["farmer_id", "tier"],
        "outputs": ["trust_score", "trust_category", "score_breakdown", "recommendations", "masumi_audit"],
        "limits": AGENT_LIMITS,
        "service_tiers": SERVICE_TIERS,
        "payment": {"network": "Masumi", "token": "ADA"},
        "masumi_docs": "https://docs.masumi.network/",
        "masumi_explorer": MASUMI_EXPLORER,
    })


@app.route("/api/agent/tiers", methods=["GET"])
def agent_tiers():
    return jsonify(SERVICE_TIERS)


# ---------------------------------------------------------------------------
# Masumi — Step 1: service request
# ---------------------------------------------------------------------------

@app.route("/api/service-request", methods=["POST"])
def service_request():
    payload   = request.get_json(silent=True) or {}
    farmer_id = payload.get("farmer_id")
    tier      = payload.get("tier", "standard")

    if not farmer_id:
        return jsonify({"error": "farmer_id is required"}), 400
    if not _find_farmer(farmer_id):
        return jsonify({"error": f"Farmer {farmer_id} not found"}), 404

    tier_meta = next((t for t in SERVICE_TIERS if t["id"] == tier), SERVICE_TIERS[1])
    job_id    = str(uuid.uuid4())

    return jsonify({
        "job_id":   job_id,
        "agent_id": AGENT_ID,
        "farmer_id": farmer_id,
        "tier":     tier,
        "price_ada": tier_meta["price_ada"],
        "status":   "awaiting_payment",
        "escrow": {
            "note":   "MOCKED — replace with live Masumi SDK call for testnet",
            "amount": f"{tier_meta['price_ada']} ADA",
            "network": "preprod",
            "instructions": "Fund escrow on-chain, then POST to /api/recommendations with job_id as X-Masumi-Escrow-Tx header.",
        },
        "masumi_explorer": MASUMI_EXPLORER,
    }), 202


# ---------------------------------------------------------------------------
# Masumi — Step 2: paid recommendation
# ---------------------------------------------------------------------------

@app.route("/api/recommendations", methods=["POST"])
def recommendations():
    escrow_tx = request.headers.get("X-Masumi-Escrow-Tx")
    if not escrow_tx:
        return jsonify({
            "error": "Payment required",
            "message": "Include a valid Masumi escrow tx ID in X-Masumi-Escrow-Tx header. Call POST /api/service-request first.",
        }), 402

    payload   = request.get_json(silent=True) or {}
    farmer_id = payload.get("farmer_id")
    tier      = payload.get("tier", "standard")

    if not farmer_id:
        return jsonify({"error": "farmer_id is required"}), 400
    farmer = _find_farmer(farmer_id)
    if not farmer:
        return jsonify({"error": f"Farmer {farmer_id} not found"}), 404

    tier_meta = next((t for t in SERVICE_TIERS if t["id"] == tier), SERVICE_TIERS[1])
    result    = _build_recommendation(farmer, tier)

    audit_entry = {
        "audit_id":              str(uuid.uuid4()),
        "timestamp":             datetime.now(timezone.utc).isoformat(),
        "agent_id":              AGENT_ID,
        "farmer_id":             farmer_id,
        "escrow_tx":             escrow_tx,
        "tier":                  tier,
        "price_ada":             tier_meta["price_ada"],
        "trust_score":           result["trust_score"],
        "trust_category":        result["trust_category"],
        "human_review_required": result["human_review_required"],
    }
    audit_log.append(audit_entry)

    result["masumi_audit"] = {
        "status":      "verified",
        "audit_id":    audit_entry["audit_id"],
        "escrow_tx":   escrow_tx,
        "agent_id":    AGENT_ID,
        "tier":        tier,
        "price_ada":   tier_meta["price_ada"],
        "timestamp":   audit_entry["timestamp"],
        "explorer":    MASUMI_EXPLORER,
    }
    return jsonify(result)


# ---------------------------------------------------------------------------
# Masumi — outbound agent-to-agent call (climate agent)
# ---------------------------------------------------------------------------

@app.route("/api/agent/outbound-climate", methods=["POST"])
def outbound_climate():
    """
    Demonstrates agent-to-agent payment pattern.
    AgriTrust agent pays a downstream climate agent for regional risk data.
    MOCKED — replace with live Masumi SDK call to climate agent on testnet.
    """
    payload = request.get_json(silent=True) or {}
    region  = payload.get("region", "East Africa")

    mock_climate_tx = str(uuid.uuid4()).replace("-", "")[:24]

    return jsonify({
        "region":             region,
        "risk_level":         "Moderate",
        "active_alerts":      3,
        "primary_hazard":     "Drought — below-average long rains forecast",
        "seasonal_forecast":  "La Niña pattern — reduced rainfall probability 60% for Q3 2024",
        "recommended_action": "Mandate weather insurance for lake basin and semi-arid zone applications",
        "masumi_payment_tx":  mock_climate_tx,
        "paying_agent":       AGENT_ID,
        "receiving_agent":    "urn:masumi:agent:climate-risk-africa-v1",
        "amount_paid_ada":    0.1,
        "mocked":             True,
        "note":               "MOCKED — replace with live Masumi agent-to-agent payment call",
    })


# ---------------------------------------------------------------------------
# Audit trail
# ---------------------------------------------------------------------------

@app.route("/api/audit", methods=["GET"])
def get_audit():
    return jsonify({
        "agent_id":    AGENT_ID,
        "total_calls": len(audit_log),
        "entries":     audit_log,
    })


# ---------------------------------------------------------------------------
# Farmers
# ---------------------------------------------------------------------------

@app.route("/api/farmers", methods=["GET"])
def get_farmers():
    return jsonify([_serialize_summary(f) for f in farmers])


@app.route("/api/farmers/<int:farmer_id>", methods=["GET"])
def get_farmer(farmer_id):
    farmer = _find_farmer(farmer_id)
    if not farmer:
        return jsonify({"error": f"Farmer {farmer_id} not found"}), 404
    return jsonify(_serialize_detail(farmer))


# ---------------------------------------------------------------------------
# Scorecard
# ---------------------------------------------------------------------------

@app.route("/api/scorecard", methods=["GET"])
def get_scorecard():
    total  = len(farmers)
    scores = [compute_trust_score(f) for f in farmers]
    return jsonify({
        "farmer_count":        total,
        "average_trust_score": round(sum(scores) / total),
        "trust_distribution":  {
            "strong":            sum(1 for s in scores if s >= 85),
            "developing":        sum(1 for s in scores if 70 <= s < 85),
            "needs_improvement": sum(1 for s in scores if s < 70),
        },
        "approved_loans":      applications["approved"],
        "pending_loans":       applications["pending"],
        "declined_loans":      applications["declined"],
        "loan_flow_change":    applications["last_month_change"],
        "climate_events":      climate_data["climate_events"],
        "weather_alerts":      climate_data["weather_alerts"],
        "regional_risk":       climate_data["regional_risk"],
        "recommended_actions": climate_data["recommended_actions"],
    })


@app.route("/api/climate", methods=["GET"])
def get_climate():
    return jsonify(climate_data)


if __name__ == "__main__":
    app.run(debug=True, port=5000)