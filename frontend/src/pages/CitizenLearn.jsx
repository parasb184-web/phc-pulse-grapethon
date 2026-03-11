import React, { useEffect, useMemo, useState } from "react";
import { citizenFlashcards } from "../data/citizenFlashcards";
import { useNavigate } from "react-router-dom";

const LS_KEY = "phc_citizen_flashcards_progress";

const safeParse = (v, fallback) => {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export default function CitizenLearn() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en"); // "en" | "hi"
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(() => safeParse(localStorage.getItem(LS_KEY), {}));

  const cards = useMemo(() => citizenFlashcards, []);
  const card = cards[index];

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  }, [progress]);

  const markRead = () => setProgress(p => ({ ...p, [card.id]: new Date().toISOString() }));
  const isRead = Boolean(progress?.[card?.id]);

  const next = () => setIndex(i => Math.min(cards.length - 1, i + 1));
  const prev = () => setIndex(i => Math.max(0, i - 1));

  const t = (obj) => obj?.[lang] ?? "";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <button onClick={() => navigate("/public")} style={{ padding: "10px 12px", borderRadius: 10 }}>
          ← Back to Citizen View
        </button>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Language:</span>
          <button
            onClick={() => setLang("en")}
            style={{ padding: "8px 10px", borderRadius: 10, fontWeight: lang === "en" ? 700 : 500 }}
          >
            English
          </button>
          <button
            onClick={() => setLang("hi")}
            style={{ padding: "8px 10px", borderRadius: 10, fontWeight: lang === "hi" ? 700 : 500 }}
          >
            हिन्दी
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: 18 }}>Health Cards (1 minute)</h2>
      <p style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
        General information for awareness. <b>Guidance, not diagnosis.</b> For symptoms, consult PHC staff/doctor.
      </p>

      <div style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div>
            <div style={{ fontSize: 28 }}>{card.icon}</div>
            <h3 style={{ marginTop: 8 }}>{t(card.title)}</h3>
            {isRead && (
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                ✅ Read on {new Date(progress[card.id]).toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={prev} disabled={index === 0} style={{ padding: "10px 12px", borderRadius: 10 }}>
              ◀ Prev
            </button>
            <button onClick={next} disabled={index === cards.length - 1} style={{ padding: "10px 12px", borderRadius: 10 }}>
              Next ▶
            </button>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <ul>
            {card.bullets[lang].map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
          </ul>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }}>
            <b>✅ Do</b>
            <ul style={{ marginTop: 8 }}>
              {card.do[lang].map((x, i) => <li key={i} style={{ marginBottom: 6 }}>{x}</li>)}
            </ul>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }}>
            <b>❌ Don’t</b>
            <ul style={{ marginTop: 8 }}>
              {card.dont[lang].map((x, i) => <li key={i} style={{ marginBottom: 6 }}>{x}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }}>
            <b>🏥 Visit PHC if</b>
            <ul style={{ marginTop: 8 }}>
              {card.visitPHC[lang].map((x, i) => <li key={i} style={{ marginBottom: 6 }}>{x}</li>)}
            </ul>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }}>
            <b>🚨 Emergency / urgent help if</b>
            <ul style={{ marginTop: 8 }}>
              {card.emergency[lang].map((x, i) => <li key={i} style={{ marginBottom: 6 }}>{x}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={markRead} style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 700 }}>
            Mark as Read
          </button>

          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Card {index + 1} / {cards.length}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.8 }}>
        Progress is stored locally on this device.
      </div>
    </div>
  );
}
