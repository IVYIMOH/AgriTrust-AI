# AgriTrust — Masumi Data Agent
**Kenya AI Challenge 2026 · AFRACA / AgriFin submission**

## Problem
Lending companies cannot assess smallholder farmers because they lack
collateral history. AFRACA and AgriFin hold rich alternative data —
cooperative membership, mobile money behaviour, repayment chains,
climate exposure — in a Neo4j graph. This data is valuable but
currently not monetised or accessible to lenders in a structured,
auditable way.

## Solution
A Masumi-registered AI agent that lending companies (or their autonomous
agents) pay via ADA escrow to query the Neo4j graph and receive a
scored, explainable farmer credit profile. Every paid query is logged
to an immutable audit trail. Human review is enforced for borderline
scores. The agent never makes a final credit decision.

---

## Project structure

```
agritrust/
├── backend/
│   ├── app.py                     # Flask app — all endpoints
│   ├── requirements.txt
│   ├── data/
│   │   └── mock_data.py           # Farmer profiles (replace with Neo4j)
│   ├── scoring/
│   │   └── trust_score.py         # Score computation + category logic
│   └── masumi/
│       └── agent_meta.py          # AGENT_ID, tiers, limits constants
│
└── frontend/
    └── src/
        ├── App.jsx                # Full React UI
        ├── api.ts                 # API client (service-request → recommendations)
        └── types.ts               # TypeScript types
```

---

## Running locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Set `VITE_API_BASE=http://localhost:5000/api` in `frontend/.env`.

---

## Masumi integration

### Agent identity
```
AGENT_ID: urn:masumi:agent:agritrust-scoring-v1
```
Register at: https://docs.masumi.network/documentation/technical-documentation/agent-identity-nft

### Payment flow (two steps)

**Step 1 — Service request (escrow intent)**
```bash
POST /api/service-request
Body: { "farmer_id": 1, "tier": "standard" }

Response:
{
  "job_id": "uuid",
  "tier": "standard",
  "price_ada": 0.5,
  "status": "awaiting_payment",
  "escrow": { "amount": "0.5 ADA", "network": "preprod" }
}
```

**Step 2 — Paid recommendation**
```bash
POST /api/recommendations
Header: X-Masumi-Escrow-Tx: <job_id>
Body: { "farmer_id": 1, "tier": "standard" }

Response:
{
  "trust_score": 88,
  "trust_category": "Strong",
  "human_review_required": false,
  "recommendations": [...],
  "masumi_audit": {
    "status": "verified",
    "audit_id": "uuid",
    "escrow_tx": "...",
    "explorer": "https://www.masumi.network/explorer"
  }
}
```

Without the header, the endpoint returns 402 Payment Required.

### Service tiers

| Tier     | Price   | Output                                      |
|----------|---------|---------------------------------------------|
| basic    | 0.2 ADA | Trust score + category only                 |
| standard | 0.5 ADA | Score + recommendations + next steps        |
| premium  | 1.5 ADA | Full Neo4j graph: cooperative network,      |
|          |         | peer vouchers, repayment chain, climate,    |
|          |         | explainability narrative                    |

### Agent-to-agent coordination
```bash
POST /api/agent/outbound-climate
Body: { "region": "East Africa" }

# AgriTrust agent pays a downstream climate agent mid-workflow.
# Returns masumi_payment_tx showing the outbound payment.
# MOCKED — replace with live Masumi SDK call for testnet.
```

### Audit trail
```bash
GET /api/audit
# Returns every paid recommendation call with audit_id, escrow_tx,
# tier, price, score, and timestamp.
```

---

## All endpoints

| Method | Path                          | Auth                  | Description                    |
|--------|-------------------------------|-----------------------|--------------------------------|
| GET    | /api/agent                    | None                  | Masumi discovery metadata      |
| GET    | /api/agent/tiers              | None                  | Service tier catalogue         |
| POST   | /api/service-request          | None                  | Step 1 — escrow intent         |
| POST   | /api/recommendations          | X-Masumi-Escrow-Tx    | Step 2 — paid profile          |
| POST   | /api/agent/outbound-climate   | None                  | Agent-to-agent demo call       |
| GET    | /api/audit                    | None (restrict later) | Full audit trail               |
| GET    | /api/farmers                  | None                  | Farmer summary list            |
| GET    | /api/farmers/<id>             | None                  | Farmer full detail             |
| GET    | /api/scorecard                | None                  | Portfolio stats                |
| GET    | /api/climate                  | None                  | Climate events and alerts      |

---

## Scoring model

```
trust_score = (
    mobile_money_score × 0.25 +
    coop_trust_score   × 0.25 +
    repayment_score    × 0.35 +
    farm_data_score    × 0.15
) + climate_penalty     # Low: 0, Moderate: -3, High: -6

Clamped to [40, 98].

Strong:           score ≥ 85  → recommend for lending
Developing:       score 70–84 → conditional, human review required
Needs Improvement: score < 70 → capacity building, do not lend
```

Human review is enforced for scores 60–84. The agent never outputs
"approved" or "declined" as final decisions.

---

## Neo4j integration (next step)

Replace `data/mock_data.py` with queries using the `neo4j` Python driver:

```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    os.environ["NEO4J_URI"],
    auth=(os.environ["NEO4J_USER"], os.environ["NEO4J_PASSWORD"])
)

def get_farmer_by_id(farmer_id):
    with driver.session() as s:
        result = s.run("""
            MATCH (f:Farmer {id: $id})
            OPTIONAL MATCH (f)-[:MEMBER_OF]->(c:Cooperative)
            OPTIONAL MATCH (f)-[:HAS_LOAN]->(l:LoanRecord)
            OPTIONAL MATCH (f)-[:OWNS]->(m:MobileMoneyAccount)
            OPTIONAL MATCH (f)-[:LOCATED_IN]->(z:ClimateZone)
            OPTIONAL MATCH (f)-[:VOUCHES_FOR]->(peer:Farmer)
            RETURN f, c, collect(l) AS loans, m, z, collect(peer.name) AS peers
        """, id=farmer_id)
        return result.single()
```

---

## Demo script (5–7 min)

| Time   | What to show                                                      |
|--------|-------------------------------------------------------------------|
| 0–1    | Problem: AFRACA holds farmer graph, lenders can't access it safely |
| 1–2    | Neo4j graph — cooperative edges, peer vouching, repayment chains  |
| 2–4    | Live demo: service request → escrow → recommendation + audit badge |
| 4–5    | Show 402 rejection without escrow header, then success with it    |
| 5–6    | Outbound climate agent call — agent-to-agent payment pattern      |
| 6–7    | Audit trail GET, business value, next steps                       |

---

## Masumi evidence checklist

- [x] Agent identity constant (AGENT_ID) — register on Masumi network
- [x] Service request endpoint — escrow intent with job_id
- [x] Payment gate — 402 without X-Masumi-Escrow-Tx header
- [x] Masumi audit block in every recommendation response
- [x] Audit trail endpoint — GET /api/audit
- [x] Agent-to-agent outbound call — /api/agent/outbound-climate
- [x] Explorer link in every audit block
- [ ] Live testnet escrow — replace MOCKED calls with Masumi SDK
- [ ] Agent registration on Masumi network explorer
