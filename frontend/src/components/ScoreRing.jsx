import React, { useMemo, useState } from "react";
import { usePHC } from "../context/PHCContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const pct = (score, max) => Math.round((max ? (score / max) : 0) * 100);

export default function ScoreRing() {
  const { aiScoreData, isScoreLoading } = usePHC();
  const [open, setOpen] = useState(false);

  const score = aiScoreData?.score ?? 70;
  const grade = aiScoreData?.grade ?? "Calculating...";

  const color =
    score >= 75 ? "var(--success)" :
      score >= 50 ? "var(--warning)" :
        "var(--error)";

  const breakdown = useMemo(() => {
    const parts = aiScoreData?.breakdown?.parts;
    if (!parts) return null;
    return [
      { label: "Queue pressure", ...parts.queue },
      { label: "Doctor availability", ...parts.doctors },
      { label: "Medicines", ...parts.medicines },
      { label: "Alerts / Emergency", ...parts.alerts },
    ];
  }, [aiScoreData]);

  // ring math
  const r = 60;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (c * score) / 100;

  return (
    <div className="glass-card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 800 }}>
        Readiness Score <span style={{ opacity: 0.7 }}>(decision support)</span>
      </div>

      <div style={{ position: "relative", width: 160, height: 160, margin: "14px auto 8px" }}>
        <svg width="160" height="160" style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 800ms ease" }}
          />
        </svg>

        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 900, color }}>
            {isScoreLoading ? "…" : score}
          </div>
        </div>
      </div>

      <div style={{ fontWeight: 900, color, fontSize: 18 }}>
        {isScoreLoading ? "Calculating…" : grade}
      </div>

      <button
        className="btn-secondary"
        onClick={() => setOpen(v => !v)}
        style={{ marginTop: 12, width: "100%", display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}
      >
        Score breakdown {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div style={{ marginTop: 10, textAlign: "left", opacity: 0.92 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            This score is computed from live PHC operational inputs (not diagnosis).
          </div>

          {breakdown ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {breakdown.map((b) => (
                <div key={b.label} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>{b.label}</div>
                  <div style={{ opacity: 0.8, fontWeight: 800 }}>
                    {b.score}/{b.max} <span style={{ opacity: 0.6, fontWeight: 700 }}>({pct(b.score, b.max)}%)</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>Total</div>
                <div style={{ fontWeight: 900 }}>{score}/100</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Breakdown not available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}