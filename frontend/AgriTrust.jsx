import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Palette: deep forest green (#1a3a2a), warm ivory (#f7f4ee), gold (#c9a84c),
// earth red (#8b3a2a), cool slate (#e8ebe6). Signature: a living trust-score
// ring that breathes — pulses on load, reflects category in colour.

const COLORS = {
  forest:  "#1a3a2a",
  leaf:    "#2d6a4f",
  mint:    "#52b788",
  ivory:   "#f7f4ee",
  parchment: "#ede9df",
  gold:    "#c9a84c",
  earth:   "#8b3a2a",
  slate:   "#e8ebe6",
  ink:     "#1c1c1a",
  muted:   "#6b7c6e",
};

// ─── Mock API (simulates Flask backend) ──────────────────────────────────────

const MOCK_FARMERS = [
  { id:1, name:"Wanjiru Kamau", location:"Nyeri, Central Kenya", primary_crop:"Coffee", cooperative:"Othaya Farmers Cooperative", loan_status:"Active", credit_readiness:"High", climate_risk:"Low", trust_score:88, profile:"12-year cooperative member with consistent M-Pesa inflows and three fully repaid seasonal loans." },
  { id:2, name:"Otieno Odhiambo", location:"Kisumu, Nyanza", primary_crop:"Rice", cooperative:"Lake Basin Rice Growers", loan_status:"Pending", credit_readiness:"Medium", climate_risk:"Moderate", trust_score:65, profile:"Emerging farmer with 3 years cooperative membership. One prior loan partially repaid due to 2023 flooding." },
  { id:3, name:"Achieng Adhiambo", location:"Nakuru, Rift Valley", primary_crop:"Maize", cooperative:"Rift Valley Grain Cooperative", loan_status:"Approved", credit_readiness:"High", climate_risk:"Low", trust_score:93, profile:"Established maize farmer, 8 years in cooperative. Supplier to two regional millers." },
  { id:4, name:"Mwangi Kariuki", location:"Embu, Mount Kenya Region", primary_crop:"Tea", cooperative:"Meru Tea Farmers SACCO", loan_status:"Under Review", credit_readiness:"Low", climate_risk:"High", trust_score:44, profile:"New cooperative member (14 months). Limited mobile money history. Recent drought affected last harvest." },
];

const MOCK_DETAILS = {
  1: { trust_category:"Strong", human_review_required:false, mobile_money_trend:"Improving — avg KSh 18,400/month", repayment_history:["2022 — KSh 45,000 repaid in full","2023 — KSh 60,000 repaid in full","2024 — KSh 80,000 active, on schedule"], climate_exposure:["Low drought risk — altitude >1,600m","Coffee berry disease risk moderate — managed via cooperative extension"], graph_insights:["Vouched for by 4 cooperative peers with Strong credit scores","Cooperative default rate 2.1% — lowest in Nyeri county","Peer network avg trust score: 84"], recommendations:["Approve up to KSh 120,000 for input financing","Offer insurance-linked loan product given low climate risk","Fast-track — no additional documentation required"], next_steps:["Disburse within 3 business days","Schedule mid-season check-in at cooperative branch","Flag for loyalty product upgrade at next cycle"], explainability:{ narrative:"Wanjiru's score reflects a long cooperative membership, improving mobile money inflows, and a clean repayment record across three loan cycles.", drivers:["Repayment score 94/100 — all loans cleared on time","Cooperative trust 91/100 — Othaya 2.1% default rate","Mobile money 88/100 — consistent and growing"], evidence:["3 consecutive repaid loans on file","M-Pesa 6-month statement shows upward trend","4 cooperative peers with score ≥80 have vouched"] }, score_breakdown:[{label:"Mobile Money",value:88,weight:25},{label:"Cooperative Trust",value:91,weight:25},{label:"Repayment",value:94,weight:35},{label:"Farm Data",value:85,weight:15}] },
  2: { trust_category:"Developing", human_review_required:true, mobile_money_trend:"Stable — avg KSh 9,200/month, slight uptick", repayment_history:["2023 — KSh 30,000, 80% repaid (flood impact)","2024 — no active loan"], climate_exposure:["Flooding risk — Lake Victoria basin","2023 loss event on record — partial crop failure"], graph_insights:["2 cooperative peers vouching — both Developing","Cooperative default rate 8.4% — above regional average","Lake basin climate overlay shows moderate flood probability"], recommendations:["Consider reduced loan up to KSh 35,000 with weather insurance mandatory","Require additional mobile money statements for 60 days","Loan officer review required before disbursement"], next_steps:["Request 60-day M-Pesa statement from borrower","Verify cooperative standing with branch manager","Attach flood insurance quote to application"], explainability:{ narrative:"Otieno's score sits in the Developing band. A partial repayment in 2023 due to flooding is the primary drag. Mobile money trend is recovering.", drivers:["Repayment score 62/100 — one partial repayment on record","Climate risk Moderate — flood exposure in Lake Victoria basin","Cooperative trust 58/100 — above-average default rate"], evidence:["2023 loan 80% repaid — flood event documented","M-Pesa trend positive last 60 days","2 vouching peers — both Developing category"] }, score_breakdown:[{label:"Mobile Money",value:71,weight:25},{label:"Cooperative Trust",value:58,weight:25},{label:"Repayment",value:62,weight:35},{label:"Farm Data",value:60,weight:15}] },
  3: { trust_category:"Strong", human_review_required:false, mobile_money_trend:"Strong — avg KSh 24,100/month, consistent 12 months", repayment_history:["2021 — KSh 50,000 repaid","2022 — KSh 70,000 repaid","2023 — KSh 95,000 repaid","2024 — KSh 130,000 approved"], climate_exposure:["Low drought risk — Nakuru highland zone","Armyworm risk moderate — cooperative spraying programme in place"], graph_insights:["Vouched for by 6 peers — 5 with Strong scores","Cooperative is anchor borrower group — default rate 1.8%","Linked to 2 off-takers via warehouse receipts"], recommendations:["Approve full KSh 130,000 — no conditions","Offer value-chain financing linked to miller offtake contract","Priority customer — eligible for reduced interest rate tier"], next_steps:["Issue loan agreement within 48 hours","Link disbursement to warehouse receipt system","Introduce to agri-insurance partner for crop cover"], explainability:{ narrative:"Achieng is AgriTrust's highest-confidence profile. Four consecutive clean repayments, strong peer network, low climate exposure, documented off-taker relationships.", drivers:["Repayment score 97/100 — four consecutive clean cycles","Mobile money 92/100 — KSh 24k/month consistent","Off-taker links — two miller contracts provide income certainty"], evidence:["4 loan cycles fully repaid — increasing amounts","Warehouse receipts on file 2022 and 2023","6 peer vouchers — 5 Strong category"] }, score_breakdown:[{label:"Mobile Money",value:92,weight:25},{label:"Cooperative Trust",value:95,weight:25},{label:"Repayment",value:97,weight:35},{label:"Farm Data",value:90,weight:15}] },
  4: { trust_category:"Needs Improvement", human_review_required:false, mobile_money_trend:"Thin — avg KSh 4,800/month, irregular", repayment_history:["No prior loan history on record"], climate_exposure:["High drought risk — below-average rainfall 2023/2024","Tea quality risk — drought stress documented by cooperative"], graph_insights:["No peer vouchers yet — new member","SACCO default rate 12% — highest in dataset","Climate zone flagged for consecutive dry seasons"], recommendations:["Do not approve standard loan product at this time","Refer to capacity building programme","Revisit in 6 months after mobile money history thickens"], next_steps:["Enrol in AFRACA financial literacy module","Encourage 6-month M-Pesa saving discipline","Assign cooperative mentor from Strong peer pool"], explainability:{ narrative:"Mwangi's profile reflects early-stage credit readiness. Short tenure, thin mobile money history, high climate exposure, and no repayment record.", drivers:["Repayment score 40/100 — no prior loan history","Climate risk High — consecutive drought seasons","Mobile money 44/100 — thin and irregular"], evidence:["14-month cooperative tenure — below 24-month threshold","No M-Pesa statement showing consistent inflows","SACCO default rate 12% — above all peers"] }, score_breakdown:[{label:"Mobile Money",value:44,weight:25},{label:"Cooperative Trust",value:48,weight:25},{label:"Repayment",value:40,weight:35},{label:"Farm Data",value:35,weight:15}] },
};

const MOCK_SCORECARD = { farmer_count:4, average_trust_score:73, trust_distribution:{strong:2,developing:1,needs_improvement:1}, approved_loans:28, pending_loans:11, declined_loans:6, loan_flow_change:"+14%", weather_alerts:3, regional_risk:"Moderate", recommended_actions:["Attach weather insurance to all lake basin applications","Flag Rift Valley drought watch for Q3 2024","Prioritise highland (>1,500m) profiles for fast-track approval"] };

const TIERS = [
  { id:"basic",    name:"Basic",    price:"0.2 ADA", desc:"Trust score & category only" },
  { id:"standard", name:"Standard", price:"0.5 ADA", desc:"Score + recommendations" },
  { id:"premium",  name:"Premium",  price:"1.5 ADA", desc:"Full Neo4j graph profile" },
];

function simulateAPI(delay = 900) {
  return new Promise(r => setTimeout(r, delay));
}

// ─── Score ring component (the signature element) ─────────────────────────────

function ScoreRing({ score, category, size = 120 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = category === "Strong" ? COLORS.mint : category === "Developing" ? COLORS.gold : COLORS.earth;

  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLORS.parchment} strokeWidth={7} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ - fill}`}
          style={{ transition:"stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size > 100 ? 26 : 18, fontWeight:700, color:COLORS.ink, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:10, color:COLORS.muted, marginTop:2, textAlign:"center", maxWidth:60, lineHeight:1.2 }}>{category}</span>
      </div>
    </div>
  );
}

// ─── Masumi audit badge ───────────────────────────────────────────────────────

function MasumiAuditBadge({ audit }) {
  if (!audit) return null;
  return (
    <div style={{ border:`1.5px solid ${COLORS.mint}`, borderRadius:12, padding:"12px 16px", background:`${COLORS.mint}10`, marginTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.mint }} />
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:COLORS.leaf, textTransform:"uppercase" }}>Masumi Verified</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
        {[
          ["Audit ID",   audit.audit_id?.slice(0,12) + "…"],
          ["Escrow TX",  audit.escrow_tx?.slice(0,12) + "…"],
          ["Tier",       audit.tier],
          ["Paid",       `${audit.price_ada} ADA`],
        ].map(([k,v]) => (
          <div key={k}>
            <div style={{ fontSize:10, color:COLORS.muted, marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:12, color:COLORS.ink, fontFamily:"monospace" }}>{v}</div>
          </div>
        ))}
      </div>
      <a href="https://www.masumi.network/explorer" target="_blank" rel="noopener noreferrer"
        style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:10, fontSize:11, color:COLORS.leaf, textDecoration:"none", fontWeight:600 }}>
        View on Masumi Explorer ↗
      </a>
    </div>
  );
}

// ─── Tier selector ────────────────────────────────────────────────────────────

function TierSelector({ selected, onChange }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
      {TIERS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            border: selected === t.id ? `2px solid ${COLORS.leaf}` : `1.5px solid ${COLORS.parchment}`,
            borderRadius:10, padding:"10px 8px", background: selected === t.id ? `${COLORS.leaf}12` : COLORS.ivory,
            cursor:"pointer", textAlign:"center", transition:"all 0.15s",
          }}>
          <div style={{ fontSize:12, fontWeight:700, color:COLORS.ink }}>{t.name}</div>
          <div style={{ fontSize:11, color:COLORS.leaf, fontWeight:600, margin:"3px 0" }}>{t.price}</div>
          <div style={{ fontSize:10, color:COLORS.muted, lineHeight:1.3 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, weight }) {
  const color = value >= 80 ? COLORS.mint : value >= 60 ? COLORS.gold : COLORS.earth;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:COLORS.ink }}>{label}</span>
        <span style={{ fontSize:12, color:COLORS.muted }}>{value}/100 · {weight}%</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:COLORS.parchment, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`, background:color, borderRadius:3, transition:"width 0.7s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ─── Farmer card ──────────────────────────────────────────────────────────────

function FarmerCard({ farmer, selected, onSelect }) {
  const riskColor = farmer.climate_risk === "Low" ? COLORS.mint : farmer.climate_risk === "Moderate" ? COLORS.gold : COLORS.earth;
  const cat = farmer.trust_score >= 85 ? "Strong" : farmer.trust_score >= 70 ? "Developing" : "Needs Improvement";

  return (
    <div onClick={() => onSelect(farmer.id)}
      style={{
        border: selected ? `2px solid ${COLORS.leaf}` : `1.5px solid ${COLORS.parchment}`,
        borderRadius:16, padding:20, background: selected ? `${COLORS.leaf}08` : COLORS.ivory,
        cursor:"pointer", transition:"all 0.18s", transform: selected ? "none" : undefined,
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = COLORS.mint; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = COLORS.parchment; }}>
      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
        <ScoreRing score={farmer.trust_score} category={cat} size={80} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:15, fontWeight:700, color:COLORS.ink }}>{farmer.name}</span>
            <span style={{ fontSize:10, fontWeight:700, color:riskColor, background:`${riskColor}18`, padding:"2px 8px", borderRadius:20, letterSpacing:"0.08em", textTransform:"uppercase" }}>{farmer.climate_risk} risk</span>
          </div>
          <div style={{ fontSize:12, color:COLORS.muted, margin:"3px 0 6px" }}>{farmer.location} · {farmer.primary_crop}</div>
          <div style={{ fontSize:12, color:COLORS.leaf, fontWeight:600 }}>{farmer.cooperative}</div>
          <p style={{ fontSize:12, color:COLORS.muted, margin:"8px 0 0", lineHeight:1.5 }}>{farmer.profile}</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:14 }}>
        {[
          ["Loan status", farmer.loan_status],
          ["Readiness",   farmer.credit_readiness],
          ["Category",    cat],
        ].map(([k,v]) => (
          <div key={k} style={{ background:COLORS.slate, borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:10, color:COLORS.muted, marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:12, fontWeight:600, color:COLORS.ink }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ farmerId, tier, onClose }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [detail, setDetail] = useState(null);
  const [rec, setRec]       = useState(null);
  const [step, setStep]     = useState(0);
  const [steps, setSteps]   = useState([]);

  const runFlow = useCallback(async () => {
    setState("loading");
    setStep(0);
    const log = [];

    const addStep = (msg) => { log.push(msg); setSteps([...log]); };

    try {
      addStep("Querying Neo4j farmer graph…");
      await simulateAPI(600);
      const d = MOCK_DETAILS[farmerId];
      const f = MOCK_FARMERS.find(x => x.id === farmerId);
      setDetail({ ...f, ...d });

      addStep("Sending Masumi service request…");
      await simulateAPI(500);
      const jobId = `job_${Math.random().toString(36).slice(2,10)}`;
      addStep(`Escrow intent created — job_id: ${jobId.slice(0,16)}…`);
      await simulateAPI(400);

      addStep("Calling /api/recommendations with escrow header…");
      await simulateAPI(700);

      const tierMeta = TIERS.find(t => t.id === tier);
      const auditId = `aud_${Math.random().toString(36).slice(2,10)}`;
      const escrowTx = Math.random().toString(36).slice(2,26);

      setRec({
        ...d,
        tier, price_ada: parseFloat(tierMeta.price),
        masumi_audit: {
          audit_id:  auditId,
          escrow_tx: escrowTx,
          tier,
          price_ada: parseFloat(tierMeta.price),
          timestamp: new Date().toISOString(),
          status:    "verified",
        }
      });
      addStep("✓ Masumi payment verified — profile unlocked");
      setState("done");
    } catch {
      setState("error");
    }
  }, [farmerId, tier]);

  useEffect(() => {
    if (farmerId) runFlow();
  }, [farmerId, tier]);

  if (!farmerId) {
    return (
      <div style={{ background:COLORS.ivory, borderRadius:16, padding:32, border:`1.5px solid ${COLORS.parchment}`, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🌿</div>
        <div style={{ fontSize:15, fontWeight:600, color:COLORS.ink, marginBottom:8 }}>Select a farmer to run assessment</div>
        <div style={{ fontSize:13, color:COLORS.muted, maxWidth:260, lineHeight:1.6 }}>AgriTrust will query the Neo4j graph, initiate a Masumi payment, and return a scored profile for loan-officer review.</div>
      </div>
    );
  }

  return (
    <div style={{ background:COLORS.ivory, borderRadius:16, border:`1.5px solid ${COLORS.parchment}`, overflow:"hidden" }}>
      <div style={{ background:COLORS.forest, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11, color:`${COLORS.mint}cc`, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>Loan Officer Briefing</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{detail?.name || "Loading…"}</div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13 }}>Close</button>
      </div>

      <div style={{ padding:24, overflowY:"auto", maxHeight:"calc(100vh - 280px)" }}>
        {/* Flow log */}
        {state === "loading" && (
          <div style={{ marginBottom:20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:`1px solid ${COLORS.slate}` }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: i === steps.length-1 ? COLORS.gold : COLORS.mint, flexShrink:0 }} />
                <span style={{ fontSize:12, color:COLORS.muted }}>{s}</span>
              </div>
            ))}
            <div style={{ fontSize:12, color:COLORS.muted, marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"inline-block", width:12, height:12, border:`2px solid ${COLORS.mint}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              Processing…
            </div>
          </div>
        )}

        {state === "done" && detail && rec && (
          <>
            {/* Human review banner */}
            {rec.human_review_required && (
              <div style={{ background:`${COLORS.gold}18`, border:`1.5px solid ${COLORS.gold}`, borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#7a5c00" }}>Human review required</div>
                  <div style={{ fontSize:12, color:"#7a5c00", marginTop:2 }}>Score 60–84 requires loan officer sign-off before any credit action.</div>
                </div>
              </div>
            )}

            {/* Score ring + breakdown */}
            <div style={{ display:"flex", gap:20, alignItems:"flex-start", marginBottom:20 }}>
              <ScoreRing score={detail.trust_score} category={detail.trust_category} size={110} />
              <div style={{ flex:1 }}>
                {rec.score_breakdown?.map(b => <ScoreBar key={b.label} {...b} />)}
              </div>
            </div>

            {/* Explainability */}
            {rec.explainability && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Explainable AI</div>
                <p style={{ fontSize:13, color:COLORS.ink, lineHeight:1.7, marginBottom:10 }}>{rec.explainability.narrative}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[["Score drivers", rec.explainability.drivers], ["Evidence", rec.explainability.evidence]].map(([t, items]) => (
                    <div key={t}>
                      <div style={{ fontSize:10, color:COLORS.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>{t}</div>
                      {items.map((item, i) => (
                        <div key={i} style={{ background:COLORS.slate, borderRadius:6, padding:"6px 10px", marginBottom:4, fontSize:12, color:COLORS.ink, lineHeight:1.4 }}>{item}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {rec.recommendations && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Recommendations</div>
                {rec.recommendations.map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${COLORS.slate}` }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:COLORS.leaf, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                    <span style={{ fontSize:13, color:COLORS.ink, lineHeight:1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Next steps */}
            {rec.next_steps && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Next steps</div>
                {rec.next_steps.map((s, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"6px 0" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:COLORS.mint, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:COLORS.ink }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Masumi audit */}
            <MasumiAuditBadge audit={rec.masumi_audit} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Scorecard ────────────────────────────────────────────────────────────────

function Scorecard({ data }) {
  if (!data) return null;
  const dist = data.trust_distribution;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:32 }}>
      {[
        { label:"Avg Trust Score",   value:data.average_trust_score, sub:`${data.farmer_count} farmers assessed`, accent:COLORS.mint },
        { label:"Strong profiles",   value:dist.strong,              sub:"Score ≥ 85",                           accent:COLORS.mint },
        { label:"Developing",        value:dist.developing,          sub:"Score 70–84 · human review",           accent:COLORS.gold },
        { label:"Needs Improvement", value:dist.needs_improvement,   sub:"Score < 70 · capacity building",       accent:COLORS.earth },
        { label:"Loans approved",    value:data.approved_loans,      sub:`${data.loan_flow_change} this month`,  accent:COLORS.leaf },
        { label:"Weather alerts",    value:data.weather_alerts,      sub:`Regional risk: ${data.regional_risk}`, accent:COLORS.gold },
      ].map(({ label, value, sub, accent }) => (
        <div key={label} style={{ background:COLORS.ivory, border:`1.5px solid ${COLORS.parchment}`, borderRadius:14, padding:"16px 18px", borderTop:`3px solid ${accent}` }}>
          <div style={{ fontSize:11, color:COLORS.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:28, fontWeight:800, color:COLORS.ink, lineHeight:1 }}>{value}</div>
          <div style={{ fontSize:11, color:COLORS.muted, marginTop:6 }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Agent info panel ─────────────────────────────────────────────────────────

function AgentInfoPanel({ open, onToggle }) {
  return (
    <div style={{ background:COLORS.forest, borderRadius:14, marginBottom:24, overflow:"hidden" }}>
      <button onClick={onToggle} style={{ width:"100%", background:"none", border:"none", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.mint }} />
          <span style={{ fontSize:13, fontWeight:700, color:"#fff", letterSpacing:"0.05em" }}>AgriTrust · Masumi Agent</span>
          <span style={{ fontSize:11, color:`${COLORS.mint}bb`, fontFamily:"monospace" }}>urn:masumi:agent:agritrust-scoring-v1</span>
        </div>
        <span style={{ color:`${COLORS.mint}`, fontSize:18, transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding:"0 24px 20px", borderTop:`1px solid rgba(255,255,255,0.08)` }}>
          <p style={{ fontSize:13, color:`rgba(255,255,255,0.7)`, lineHeight:1.7, marginBottom:16 }}>
            Masumi-registered AI agent selling smallholder farmer credit intelligence from AFRACA/AgriFin Neo4j graph data to lending companies. Buyers pay in ADA via on-chain escrow. Every paid query is permanently logged to the audit trail.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {TIERS.map(t => (
              <div key={t.id} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{t.name}</div>
                <div style={{ fontSize:13, fontWeight:800, color:COLORS.gold, margin:"4px 0" }}>{t.price}</div>
                <div style={{ fontSize:11, color:`rgba(255,255,255,0.5)` }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
            {["trust_scoring","climate_risk_overlay","repayment_analysis","cooperative_network","explainable_ai"].map(c => (
              <span key={c} style={{ fontSize:10, background:`${COLORS.mint}22`, color:COLORS.mint, padding:"3px 10px", borderRadius:20, fontFamily:"monospace" }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [farmers]        = useState(MOCK_FARMERS);
  const [scorecard]      = useState(MOCK_SCORECARD);
  const [selectedId, setSelectedId] = useState(null);
  const [tier, setTier]  = useState("standard");
  const [agentOpen, setAgentOpen] = useState(true);

  return (
    <div style={{ minHeight:"100vh", background:COLORS.slate, fontFamily:"system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${COLORS.parchment}; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background:COLORS.forest, borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:COLORS.mint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🌾</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>AgriTrust</div>
              <div style={{ fontSize:11, color:`${COLORS.mint}aa`, letterSpacing:"0.12em", textTransform:"uppercase" }}>AFRACA · AgriFin · Masumi</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:COLORS.mint, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:12, color:`rgba(255,255,255,0.6)` }}>Agent online · preprod</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:24 }}>

        {/* Hero */}
        <div style={{ background:COLORS.forest, borderRadius:18, padding:"36px 40px", marginBottom:24, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:`${COLORS.mint}10` }} />
          <div style={{ position:"absolute", bottom:-60, right:60, width:140, height:140, borderRadius:"50%", background:`${COLORS.gold}08` }} />
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:11, color:COLORS.mint, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Smallholder Credit Intelligence</div>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.2, maxWidth:540, marginBottom:12 }}>
              Explainable farmer trust scores — paid via Masumi, backed by Neo4j graph data.
            </h1>
            <p style={{ fontSize:14, color:`rgba(255,255,255,0.65)`, maxWidth:520, lineHeight:1.7 }}>
              AFRACA and AgriFin's cooperative, mobile money, and repayment graph powers a Masumi-registered agent that lending companies pay to assess smallholder creditworthiness — without collateral bias.
            </p>
          </div>
        </div>

        {/* Agent info panel */}
        <AgentInfoPanel open={agentOpen} onToggle={() => setAgentOpen(o => !o)} />

        {/* Scorecard */}
        <Scorecard data={scorecard} />

        {/* Tier selector */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Select assessment tier</div>
          <TierSelector selected={tier} onChange={id => { setTier(id); setSelectedId(null); }} />
        </div>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>

          {/* Farmer list */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Farmer profiles · {farmers.length} loaded</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {farmers.map(f => (
                <FarmerCard key={f.id} farmer={f} selected={selectedId === f.id} onSelect={setSelectedId} />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ position:"sticky", top:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:COLORS.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>
              {selectedId ? "Trust profile · Masumi flow" : "Assessment panel"}
            </div>
            <DetailPanel farmerId={selectedId} tier={tier} onClose={() => setSelectedId(null)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`1px solid ${COLORS.parchment}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:12, color:COLORS.muted }}>AgriTrust · AFRACA / AgriFin · Kenya AI Challenge 2026</div>
          <div style={{ display:"flex", gap:16 }}>
            {[["Masumi docs","https://docs.masumi.network"],["Explorer","https://www.masumi.network/explorer"],["AFRACA","https://www.afraca.org"]].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:COLORS.leaf, textDecoration:"none", fontWeight:600 }}>{l} ↗</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}