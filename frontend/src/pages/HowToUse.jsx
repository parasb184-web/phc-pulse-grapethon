// frontend/src/pages/HowToUse.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Monitor, UserRound, Stethoscope, Megaphone, Tv, CalendarClock, Bot } from "lucide-react";

const Step = ({ icon: Icon, title, children }) => (
  <div
    style={{
      padding: 14,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.03)",
    }}
  >
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        display: "grid", placeItems: "center",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)"
      }}>
        <Icon size={18} color="var(--primary)" />
      </div>
      <div style={{ fontWeight: 900, fontSize: "1rem" }}>{title}</div>
    </div>
    <div style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.6 }}>{children}</div>
  </div>
);

export default function HowToUse() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", padding: 24 }}>
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          borderRadius: 18,
          padding: 18,
          border: "1px solid var(--glass-border)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <button className="btn-secondary" onClick={() => navigate(-1)} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ArrowLeft size={18} /> Back
          </button>

          <button className="btn-secondary" onClick={() => navigate("/login")} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Go to Role Selection <ExternalLink size={16} />
          </button>
        </div>

        <h1 style={{ marginTop: 14, fontSize: "1.6rem", fontWeight: 900 }}>How to Use PHC Pulse Live</h1>
        <p style={{ marginTop: 6, opacity: 0.75, lineHeight: 1.5 }}>
          For the best experience, keep <b>two tabs</b> open:
          <b> Staff</b> in one tab and <b>TV/Citizen</b> in another tab — so you can see live updates.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}>
          <Step icon={Monitor} title="Step 1 — Pick a mode">
            Open <b>Role Selection</b> and choose:
            <ul style={{ margin: "8px 0 0 18px" }}>
              <li><b>TV Display</b> (big screen board)</li>
              <li><b>PHC Staff</b> (control panel)</li>
              <li><b>Citizen View</b> (public dashboard)</li>
            </ul>
          </Step>

          <Step icon={Stethoscope} title="Step 2 — Update status from Staff">
            Go to <b>PHC Staff</b> → update:
            <ul style={{ margin: "8px 0 0 18px" }}>
              <li>Doctor availability</li>
              <li>Queue size & now serving</li>
              <li>Medicine stock</li>
              <li>Service alerts</li>
            </ul>
            These updates power both TV and Citizen screens.
          </Step>

          <Step icon={Megaphone} title="Step 3 — Add Awareness Cards (Flashcards)">
            In Staff → <b>Awareness</b> tab, add short awareness tips (1–2 lines).
            <br />
            These appear as a <b>scrolling ticker</b> (flashcards) on <b>TV</b> and <b>Citizen</b> views.
          </Step>

          <Step icon={Tv} title="Step 4 — TV Display (waiting area)">
            Open <b>TV Display</b> to show:
            <ul style={{ margin: "8px 0 0 18px" }}>
              <li>Readiness score + wait time</li>
              <li>Queue and available doctors</li>
              <li>Scrolling awareness ticker</li>
              <li><b>Important notices</b> pop above ticker for a few seconds</li>
            </ul>
          </Step>

          <Step icon={UserRound} title="Step 5 — Citizen View (public)">
            Open <b>Citizen View</b> to see readiness score, wait time, medicines, and alerts.
            When load is high, the system suggests <b>Tele-OPD</b>.
          </Step>

          <Step icon={CalendarClock} title="Step 6 — Tele-OPD booking">
            Use the <b>Book Tele-OPD</b> button → submit slot/category → get a confirmation ID.
            No sensitive personal health data is stored in this flow.
          </Step>

          <Step icon={Bot} title="Step 7 — Guide Bot (preset buttons)">
            Open the Guide Bot and use preset buttons (no typing needed):
            doctor availability / wait time / medicines / tele-OPD / stress check-in.
          </Step>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
          Note: The platform stores operational signals (doctor/queue/medicines/alerts/awareness). No patient records. Guidance only — not diagnosis.
        </div>
      </div>
    </div>
  );
}
