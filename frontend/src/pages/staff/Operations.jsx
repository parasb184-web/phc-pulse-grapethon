import React, { useState } from "react";
import { usePHC } from "../../context/PHCContext";
import { Users, Stethoscope, AlertTriangle, Activity } from "lucide-react";
import ScoreRing from "../../components/ScoreRing";
import QueuePanel from "../../components/QueuePanel";

export default function Operations() {
  const { phcData, updatePhcData, aiDemandData } = usePHC();
  const [newAlert, setNewAlert] = useState("");

  // ===== 1-click demo scenarios =====
  const setAllDoctors = (statusMap) => {
    const next = {};
    Object.entries(phcData.doctors).forEach(([id, doc]) => {
      next[id] = { ...doc, status: statusMap[id] ?? doc.status };
    });
    return next;
  };

  const setAllMeds = (statusMap) => {
    const next = {};
    Object.entries(phcData.medicines).forEach(([id, med]) => {
      next[id] = { ...med, status: statusMap[id] ?? med.status };
    });
    return next;
  };

  const setSymptomCounts = (countMap) => {
    const next = {};
    Object.entries(phcData.symptoms).forEach(([id, s]) => {
      next[id] = { ...s, count: Number.isFinite(countMap[id]) ? countMap[id] : s.count };
    });
    return next;
  };

  const applyScenario = (name) => {
    if (name === "normal") {
      updatePhcData({
        queue: 8,
        serving: 120,
        emergency: false,
        alerts: [],
        doctors: setAllDoctors({ doc1: "Available", doc2: "Available", doc3: "Available" }),
        medicines: setAllMeds({ med1: "In Stock", med2: "In Stock", med3: "In Stock", med4: "In Stock", med5: "In Stock" }),
        symptoms: setSymptomCounts({ fever: 7, cough: 5, diarrhoea: 2, vomiting: 1, rash: 0, eyeinf: 0 }),
      });
      return;
    }

    if (name === "rush") {
      updatePhcData({
        queue: 34,
        serving: 210,
        emergency: false,
        alerts: ["High patient volume today — expect delays."],
        doctors: setAllDoctors({ doc1: "Busy", doc2: "Available", doc3: "Absent" }),
        medicines: setAllMeds({ med2: "Low", med4: "Low" }),
        symptoms: setSymptomCounts({ fever: 16, cough: 12, diarrhoea: 6, vomiting: 3, rash: 1, eyeinf: 1 }),
      });
      return;
    }

    updatePhcData({
      queue: 52,
      serving: 330,
      emergency: true,
      alerts: ["Emergency cases are being prioritized.", "Lab closed till 2:00 PM"],
      doctors: setAllDoctors({ doc1: "Busy", doc2: "Busy", doc3: "Absent" }),
      medicines: setAllMeds({ med1: "Low", med4: "Out of Stock" }),
      symptoms: setSymptomCounts({ fever: 30, cough: 18, diarrhoea: 10, vomiting: 6, rash: 2, eyeinf: 2 }),
    });
  };

  const cycleDocStatus = (id, current) => {
    const statuses = ["Available", "Busy", "Break", "Absent"];
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
    updatePhcData({ doctors: { ...phcData.doctors, [id]: { ...phcData.doctors[id], status: next } } });
  };

  const getDocColor = (status) => {
    switch (status) {
      case "Available": return "var(--success)";
      case "Busy": return "var(--warning)";
      case "Break": return "var(--warning)";
      case "Absent": return "var(--error)";
      default: return "var(--text-muted)";
    }
  };

  const demand = aiDemandData || {
    trend: "Stable", color: "var(--success)", msg: "Current patient traffic is manageable.",
    bars: [4, 5, 8, 10, 9, 6, 4, 3, 5, 7, 9, 6], hour: new Date().getHours(),
    outlook: [
      { hour: "10:00", expectedLoad: "Moderate", insight: "Moderate increase expected in the next hour." },
      { hour: "11:00", expectedLoad: "High", insight: "Peak traffic likely this morning." },
      { hour: "12:00", expectedLoad: "Moderate", insight: "Expected to remain stable in this window." },
      { hour: "13:00", expectedLoad: "Low", insight: "Load expected to ease gradually." }
    ]
  };

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ padding: "2rem 0", display: "flex" }}>
      <ScoreRing />

      <div className="glass-card" style={{ textAlign: "left" }}>
        <h3 style={{ marginBottom: "0.4rem", fontWeight: 900, color: "var(--trust-blue)" }}>Operational Quick Presets</h3>
        <p style={{ marginTop: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Apply common workload conditions quickly to reflect real-time operations.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <button className="btn-secondary" onClick={() => applyScenario("normal")}>Normal Day</button>
          <button className="btn-secondary" onClick={() => applyScenario("rush")}>Rush Hour</button>
          <button className="btn-danger" onClick={() => applyScenario("emergency")}>Emergency + Stockout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <QueuePanel />

        <div className="glass-card flex-col items-center justify-center text-center w-full">
          <Users size={32} color="var(--primary)" style={{ margin: "0 auto", display: "block" }} />
          <h1 style={{ fontSize: "3rem", margin: "0.5rem 0", color: "var(--trust-blue)" }}>{phcData.queue}</h1>
          <p style={{ color: "var(--text-secondary)", fontWeight: 800 }}>Patients in Queue</p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-secondary" onClick={() => updatePhcData({ queue: Math.max(0, phcData.queue - 5) })}>-5</button>
            <button className="btn-secondary" onClick={() => updatePhcData({ queue: Math.max(0, phcData.queue - 1) })}>-1</button>
            <button className="btn-secondary" onClick={() => updatePhcData({ queue: phcData.queue + 1 })}>+1</button>
            <button className="btn-secondary" onClick={() => updatePhcData({ queue: phcData.queue + 5 })}>+5</button>
          </div>
        </div>
      </div>

      {/* Demand Prediction Engine */}
      <div className="glass-card" style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Activity color={demand.color} /> Predicted Patient Load
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
          <div style={{ flex: "1 1 min-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: demand.color }}>{demand.trend}</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem", lineHeight: 1.4, maxWidth: "400px" }}>
              {demand.msg}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              *Pattern-based demand forecast
            </p>
          </div>

          <div style={{ flex: "1 1 300px", display: "flex", alignItems: "flex-end", height: "80px", gap: "4px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            {demand.bars.map((val, idx) => {
              // The 'hour' index starts at 8 AM. 
              const isCurrent = idx === Math.max(0, Math.min(11, demand.hour - 8));
              const heightPct = val * 10;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    background: isCurrent ? demand.color : "var(--border)",
                    borderRadius: "4px 4px 0 0",
                    opacity: isCurrent ? 1 : 0.6,
                    transition: "height 0.3s ease",
                    minHeight: "4px"
                  }}
                  title={`Hour block: ${idx + 8}:00`}
                />
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h4 style={{ margin: "0 0 0.6rem 0", color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Next Few Hours Outlook
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.6rem" }}>
            {(demand.outlook || []).slice(0, 4).map((item, idx) => (
              <div
                key={`${item.hour}-${idx}`}
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-muted)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.hour}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>{item.expectedLoad}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {item.insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Stethoscope color="var(--primary)" /> Doctors Status
          </h3>

          <div className="flex-col gap-4">
            {Object.entries(phcData.doctors).map(([id, doc]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--surface-muted)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{doc.name}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{doc.dept}</p>
                </div>

                <button
                  onClick={() => cycleDocStatus(id, doc.status)}
                  style={{ background: getDocColor(doc.status), border: "none", padding: "6px 14px", borderRadius: "15px", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem", minWidth: "90px", transition: "transform 150ms ease" }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {doc.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--warning)" }}>
          <AlertTriangle /> Service Alerts
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {phcData.alerts.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No active alerts.</p> : null}

          {phcData.alerts.map((alert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--warning-soft)", borderLeft: "4px solid var(--warning)", borderRadius: "6px", color: "var(--text-primary)" }}>
              <span>{alert}</span>
              <button
                onClick={() => updatePhcData({ alerts: phcData.alerts.filter((_, idx) => idx !== i) })}
                style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newAlert.trim()) {
              updatePhcData({ alerts: [...phcData.alerts, newAlert.trim()] });
              setNewAlert("");
            }
          }}
          style={{ display: "flex", gap: "1rem" }}
        >
          <input type="text" placeholder="Add new alert..." value={newAlert} onChange={(e) => setNewAlert(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn-secondary">Add</button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            className={`btn-danger ${phcData.emergency ? "emergency-glow" : ""}`}
            onClick={() => updatePhcData({ emergency: !phcData.emergency })}
            style={{ width: "100%", padding: "1rem", fontSize: "1.2rem", textTransform: "uppercase" }}
          >
            {phcData.emergency ? "DEACTIVATE EMERGENCY MODE" : "ACTIVATE EMERGENCY PRIORITY MODE"}
          </button>
        </div>
      </div>
    </div>
  );
}
