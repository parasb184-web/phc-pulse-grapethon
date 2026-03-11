// frontend/src/pages/Welcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import heroImg from "../assets/hero-healthcare.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--bg-color)",
      }}
    >
      <div
        style={{
          width: "min(820px, 100%)",
          borderRadius: 18,
          padding: 32,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <Logo height={56} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--trust-blue)" }}>PHC Pulse Live</div>
            </div>

            <div style={{ color: "var(--text-secondary)" }}>Real-time PHC status for staff and citizens</div>
          </div>
        </div>

        <motion.div
          style={{ marginBottom: 24 }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "3 / 1",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={heroImg}
              alt="PHC Pulse Dashboard"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                objectPosition: "center 42%",
              }}
            />
          </div>
        </motion.div>

        <div style={{ fontSize: "1.05rem", lineHeight: 1.5, opacity: 0.9 }}>
          PHCs often face <b>uncertainty</b> — citizens don’t know doctor availability, queue/wait time,
          medicine stock, or service closures. This leads to overcrowding and wasted trips.
          <br /><br />
          <b>PHC Pulse Live</b> makes PHC operations visible in real time via a staff dashboard → TV board →
          citizen link, with Tele-OPD routing and rotating awareness tips.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 24 }}>
          <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-color)" }}>
            <Monitor size={22} color="var(--primary)" />
            <div style={{ marginTop: 10, fontWeight: 800, color: "var(--text-primary)" }}>Public Transparency</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
              TV board + citizen link with readiness score and wait times.
            </div>
          </div>

          <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-color)" }}>
            <ShieldCheck size={22} color="var(--primary)" />
            <div style={{ marginTop: 10, fontWeight: 800, color: "var(--text-primary)" }}>Internal Accountability</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
              Dedicated Medicine Officer console to track stock anomalies.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/login")}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            Continue <ArrowRight size={18} />
          </button>

          <button className="btn-secondary" onClick={() => navigate("/how-to")}>
            How to use
          </button>

          <button className="btn-secondary" onClick={() => navigate("/public")}>
            Open Citizen View
          </button>

          <button className="btn-secondary" onClick={() => navigate("/tv")}>
            Open TV Display
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
          Note: Operational visibility only (doctor/queue/medicines/alerts). No personal health records.
        </div>
      </div>
    </div>
  );
}
