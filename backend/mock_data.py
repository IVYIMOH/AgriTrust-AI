farmers = [
    {
        "id": 1,
        "name": "Wanjiru Kamau",
        "location": "Nyeri, Central Kenya",
        "primary_crop": "Coffee",
        "cooperative": "Othaya Farmers Cooperative",
        "loan_status": "Active",
        "credit_readiness": "High",
        "climate_risk": "Low",
        "profile": "12-year cooperative member with consistent M-Pesa inflows and three fully repaid seasonal loans.",
        "mobile_money_trend": "Improving — avg KSh 18,400/month over last 6 months",
        "repayment_history": ["2022 — KSh 45,000 repaid in full", "2023 — KSh 60,000 repaid in full", "2024 — KSh 80,000 active, on schedule"],
        "climate_exposure": ["Low drought risk — altitude >1,600m", "Coffee berry disease risk moderate — managed via cooperative extension"],
        "graph_insights": ["Vouched for by 4 cooperative peers with Strong credit scores", "Cooperative default rate 2.1% — lowest in Nyeri county", "Peer network avg trust score: 84"],
        "recommendations": ["Approve up to KSh 120,000 for input financing", "Offer insurance-linked loan product given low climate risk", "Fast-track — no additional documentation required"],
        "next_steps": ["Disburse within 3 business days", "Schedule mid-season check-in at cooperative branch", "Flag for loyalty product upgrade at next cycle"],
        "explainability": {
            "narrative": "Wanjiru's score reflects a long cooperative membership, improving mobile money inflows, and a clean repayment record across three loan cycles. Her peer network is strong and her climate zone carries minimal risk.",
            "drivers": ["Repayment score 94/100 — all loans cleared on time", "Cooperative trust 91/100 — Othaya has 2.1% default rate", "Mobile money 88/100 — consistent and growing inflows"],
            "evidence": ["3 consecutive repaid loans on file", "M-Pesa 6-month statement shows upward trend", "4 cooperative peers with score ≥80 have vouched"]
        },
        "scores": {"mobile_money": 88, "coop_trust": 91, "repayment": 94, "farm_data": 85}
    },
    {
        "id": 2,
        "name": "Otieno Odhiambo",
        "location": "Kisumu, Nyanza",
        "primary_crop": "Rice",
        "cooperative": "Lake Basin Rice Growers",
        "loan_status": "Pending",
        "credit_readiness": "Medium",
        "climate_risk": "Moderate",
        "profile": "Emerging farmer with 3 years cooperative membership. One prior loan partially repaid due to 2023 flooding. Inflows stabilising.",
        "mobile_money_trend": "Stable — avg KSh 9,200/month, slight uptick last 2 months",
        "repayment_history": ["2023 — KSh 30,000, 80% repaid (flood impact)", "2024 — no active loan"],
        "climate_exposure": ["Flooding risk — Lake Victoria basin", "2023 loss event on record — partial crop failure"],
        "graph_insights": ["2 cooperative peers vouching — both in Developing category", "Cooperative default rate 8.4% — above regional average", "Lake basin climate overlay shows moderate flood probability"],
        "recommendations": ["Consider for reduced loan up to KSh 35,000 with weather insurance mandatory", "Require additional mobile money statements for 60 days", "Loan officer review required before disbursement"],
        "next_steps": ["Request 60-day M-Pesa statement from borrower", "Verify cooperative standing with branch manager", "Attach flood insurance quote to application"],
        "explainability": {
            "narrative": "Otieno's score sits in the Developing band. A partial repayment in 2023 due to flooding is the primary drag. His mobile money trend is recovering and his cooperative membership is active, but the lake basin climate risk and higher cooperative default rate require human review.",
            "drivers": ["Repayment score 62/100 — one partial repayment on record", "Climate risk Moderate — flood exposure in Lake Victoria basin", "Cooperative trust 58/100 — cooperative default rate above average"],
            "evidence": ["2023 loan 80% repaid — flood event documented", "M-Pesa trend positive last 60 days", "2 vouching peers — both Developing category"]
        },
        "scores": {"mobile_money": 71, "coop_trust": 58, "repayment": 62, "farm_data": 60}
    },
    {
        "id": 3,
        "name": "Achieng Adhiambo",
        "location": "Nakuru, Rift Valley",
        "primary_crop": "Maize",
        "cooperative": "Rift Valley Grain Cooperative",
        "loan_status": "Approved",
        "credit_readiness": "High",
        "climate_risk": "Low",
        "profile": "Established maize farmer, 8 years in cooperative. Supplier to two regional millers. Strong mobile money and warehouse receipt history.",
        "mobile_money_trend": "Strong — avg KSh 24,100/month, consistent for 12 months",
        "repayment_history": ["2021 — KSh 50,000 repaid", "2022 — KSh 70,000 repaid", "2023 — KSh 95,000 repaid", "2024 — KSh 130,000 approved"],
        "climate_exposure": ["Low drought risk — Nakuru highland zone", "Armyworm risk moderate — managed via cooperative spraying programme"],
        "graph_insights": ["Vouched for by 6 peers — 5 with Strong scores", "Cooperative is anchor borrower group — default rate 1.8%", "Linked to 2 off-takers via warehouse receipts"],
        "recommendations": ["Approve full KSh 130,000 — no conditions", "Offer value-chain financing linked to miller offtake contract", "Priority customer — eligible for reduced interest rate tier"],
        "next_steps": ["Issue loan agreement within 48 hours", "Link disbursement to warehouse receipt system", "Introduce to agri-insurance partner for crop cover"],
        "explainability": {
            "narrative": "Achieng is AgriTrust's highest-confidence profile in this cohort. Four consecutive clean repayments, a strong peer network, low climate exposure, and documented off-taker relationships put her firmly in the Strong band.",
            "drivers": ["Repayment score 97/100 — four consecutive clean cycles", "Mobile money 92/100 — KSh 24k/month consistent", "Off-taker links — two miller contracts provide income certainty"],
            "evidence": ["4 loan cycles fully repaid — amounts increasing", "Warehouse receipts on file for 2022 and 2023 harvests", "6 peer vouchers — 5 Strong category"]
        },
        "scores": {"mobile_money": 92, "coop_trust": 95, "repayment": 97, "farm_data": 90}
    },
    {
        "id": 4,
        "name": "Mwangi Kariuki",
        "location": "Embu, Mount Kenya Region",
        "primary_crop": "Tea",
        "cooperative": "Meru Tea Farmers SACCO",
        "loan_status": "Under Review",
        "credit_readiness": "Low",
        "climate_risk": "High",
        "profile": "New cooperative member (14 months). Limited mobile money history. Recent drought affected last harvest. No prior formal loans.",
        "mobile_money_trend": "Thin — avg KSh 4,800/month, irregular",
        "repayment_history": ["No prior loan history on record"],
        "climate_exposure": ["High drought risk — below-average rainfall 2023/2024", "Tea quality risk — drought stress documented by cooperative"],
        "graph_insights": ["No peer vouchers yet — new member", "SACCO default rate 12% — highest in dataset", "Climate zone flagged for consecutive dry seasons"],
        "recommendations": ["Do not approve standard loan product at this time", "Refer to capacity building programme — financial literacy and record keeping", "Revisit in 6 months after mobile money history thickens"],
        "next_steps": ["Enrol in AFRACA financial literacy module", "Encourage 6-month M-Pesa saving discipline", "Assign cooperative mentor from Strong peer pool"],
        "explainability": {
            "narrative": "Mwangi's profile reflects early-stage credit readiness. Short cooperative tenure, thin mobile money history, high climate exposure, and no prior repayment record place him in Needs Improvement. This is a capacity-building case, not a credit risk rejection.",
            "drivers": ["Repayment score 40/100 — no prior loan history", "Climate risk High — consecutive drought seasons on record", "Mobile money 44/100 — thin and irregular"],
            "evidence": ["14-month cooperative tenure — below 24-month threshold", "No M-Pesa statement showing consistent inflows", "SACCO default rate 12% — above all peers"]
        },
        "scores": {"mobile_money": 44, "coop_trust": 48, "repayment": 40, "farm_data": 35}
    }
]

applications = {
    "approved": 28,
    "pending": 11,
    "declined": 6,
    "last_month_change": "+14%"
}

climate_data = {
    "climate_events": [
        {"type": "Drought", "season": "Long Rains 2024"},
        {"type": "Flooding", "season": "Short Rains 2023"},
        {"type": "Armyworm", "season": "Harvest 2023"}
    ],
    "weather_alerts": 3,
    "regional_risk": "Moderate",
    "recommended_actions": [
        "Attach weather insurance to all lake basin applications",
        "Flag Rift Valley drought watch for Q3 2024",
        "Prioritise highland (>1,500m) profiles for fast-track approval"
    ]
}