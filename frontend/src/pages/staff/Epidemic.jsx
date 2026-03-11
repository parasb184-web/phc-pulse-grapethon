import React, { useState, useEffect } from "react";
import { usePHC } from "../../context/PHCContext";
import { alertsAPI } from "../../services/api";
import { AlertTriangle, Activity } from "lucide-react";

export default function Epidemic() {
  const { phcData, updatePhcData } = usePHC();
  const symptoms = phcData.symptoms;
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState("");
  const [overallStatus, setOverallStatus] = useState("Stable");

  useEffect(() => {
    alertsAPI
      .getEpidemicSignals()
      .then((res) => {
        setSignals(res.activeSignals || res.signals || []);
        setSummary(res.summary || "");
        setOverallStatus(res.overallStatus || "Stable");
      })
      .catch(console.error);
  }, [symptoms]);

  const hasSpike = signals.length > 0;
  const highRiskSignals = signals.filter((s) => s.level === "High Risk");

  const editCount = async (id, current) => {
    const res = prompt(`Enter new count for ${symptoms[id].name}:`, current);
    if (res !== null && !isNaN(res)) {
      updatePhcData({
        symptoms: { ...symptoms, [id]: { ...symptoms[id], count: parseInt(res) } },
      });
    }
  };

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ padding: "2rem 0", display: "flex" }}>
      {hasSpike && (
        <div className="glass-card emergency-glow" style={{ background: "rgba(255,69,96,0.1)", border: "1px solid var(--error)" }}>
          <h2 style={{ color: "var(--error)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle /> Early Warning Signal
          </h2>
          <p style={{ margin: "0.8rem 0", color: "var(--text-secondary)" }}>
            {summary || "Possible outbreak signal under review."}
          </p>
          {highRiskSignals.length > 0 && (
            <p style={{ margin: "0 0 0.8rem 0", fontSize: "0.9rem", color: "var(--text-primary)" }}>
              High-risk indicators: {highRiskSignals.map((s) => `${s.name} (${s.currentCount} vs avg ${s.baseline})`).join(", ")}
            </p>
          )}
          <div
            style={{
              width: "100%",
              background: "var(--error)",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 14px",
              fontWeight: 800,
              textAlign: "center"
            }}
          >
            Escalation Review Required
          </div>
          <p style={{ margin: "0.7rem 0 0 0", fontSize: "0.78rem", opacity: 0.75 }}>
            Signal generated from symptom trends against baseline averages.
          </p>
        </div>
      )}

      <div className="glass-card" style={{ background: "var(--surface-muted)", border: "1px solid var(--border)" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={18} color={overallStatus === "Stable" ? "var(--success)" : "var(--warning)"} />
          District Signal Summary
        </h3>
        <div style={{ fontSize: "0.92rem", color: "var(--text-secondary)" }}>
          Status: <strong style={{ color: "var(--text-primary)" }}>{overallStatus}</strong>
        </div>
        {signals.length > 0 ? (
          <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {signals.map((s) => (
              <div key={s.id || `${s.type}-${s.timestamp}`} style={{ padding: "0.7rem", borderRadius: "8px", background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <strong>{s.name}</strong>
                  <span style={{ fontSize: "0.78rem", color: s.level === "High Risk" ? "var(--error)" : "var(--warning)", fontWeight: 700 }}>{s.level}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {s.message} ({s.currentCount} cases vs avg {s.baseline})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "0.8rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            No unusual symptom cluster detected in current entries.
          </div>
        )}
      </div>

      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Activity /> Daily Symptom Tracker
      </h2>
      <p style={{ margin: "-0.5rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        Select a symptom card to update the daily count.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
        {Object.entries(symptoms).map(([id, symp]) => {
          const isSpike = symp.count >= symp.avg * 3;
          return (
            <div
              key={id}
              className="glass-card flex-col items-center justify-center text-center cursor-pointer hover-lift"
              onClick={() => editCount(id, symp.count)}
              style={{ padding: "1.5rem 1rem", borderColor: isSpike ? "var(--error)" : "var(--border)", cursor: "pointer", transition: "all 150ms ease" }}
            >
              <div style={{ fontSize: "2.5rem" }}>{symp.emoji}</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: isSpike ? "var(--error)" : "var(--text-primary)", lineHeight: 1 }}>
                {symp.count}
              </div>
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{symp.name}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Avg: {symp.avg}/day</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
