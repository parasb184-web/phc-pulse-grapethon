import React, { useState } from "react";
import { usePHC } from "../../context/PHCContext";
import { BookOpenCheck, CheckCircle2, Megaphone, Trash2 } from "lucide-react";
import SectionImage from "../../components/SectionImage";
import learnImg from "../../assets/staff-learning.png";

export default function LearnAwareness() {
  const [mode, setMode] = useState("learning");

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ padding: "2rem 0", display: "flex" }}>
      <div className="glass-card" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn-secondary" onClick={() => setMode("learning")} style={{ borderColor: mode === "learning" ? "var(--primary)" : "var(--border)", color: mode === "learning" ? "var(--primary)" : "var(--text-secondary)" }}>
          Staff Learning
        </button>
        <button className="btn-secondary" onClick={() => setMode("awareness")} style={{ borderColor: mode === "awareness" ? "var(--primary)" : "var(--border)", color: mode === "awareness" ? "var(--primary)" : "var(--text-secondary)" }}>
          Awareness Cards
        </button>
      </div>

      {mode === "learning" ? <LearningSection /> : <AwarenessSection />}
    </div>
  );
}

function LearningSection() {
  const { toggleSopCompletion, isSopCompleted } = usePHC();
  const [role, setRole] = useState("Nurse");

  const sops = [
    { id: "bp", title: "BP Measurement", desc: "Correct cuff, proper posture, accurate reading." },
    { id: "fever", title: "Fever Triage", desc: "Red flags, vitals, referral rules." },
    { id: "coldchain", title: "Cold-chain Checklist", desc: "Vaccine storage temperature & log checks." },
    { id: "counsel", title: "Counselling Script", desc: "Clear, empathetic patient guidance basics." },
    { id: "ors", title: "ORS Guidance", desc: "Dehydration signs and safe ORS advice." },
  ];

  const completedCount = sops.filter((s) => isSopCompleted(role, s.id)).length;

  return (
    <>
      <SectionImage src={learnImg} alt="Staff Learning" height={160} objectPosition="center 20%" style={{ marginBottom: "0.5rem" }} />

      <div className="glass-card" style={{ textAlign: "left" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <BookOpenCheck /> Staff Learning (SOP Cards)
        </h2>
        <p style={{ marginTop: "0.5rem", opacity: 0.75 }}>Quick micro-learning for staff roles with completion tracking.</p>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {["ANM", "Nurse", "Pharmacist"].map((r) => (
            <button
              key={r}
              className="btn-secondary"
              onClick={() => setRole(r)}
              style={{ borderColor: role === r ? "var(--primary)" : "var(--border)", color: role === r ? "var(--primary)" : "var(--text-secondary)" }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "1rem", fontWeight: 800 }}>
          Progress: {completedCount}/{sops.length} completed
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {sops.map((sop) => {
          const done = isSopCompleted(role, sop.id);
          return (
            <div key={sop.id} className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <h3 style={{ marginBottom: "0.35rem" }}>{sop.title}</h3>
                  <p style={{ opacity: 0.75, fontSize: "0.9rem" }}>{sop.desc}</p>
                </div>
                {done ? <CheckCircle2 color="var(--primary)" /> : null}
              </div>

              <button className={done ? "btn-secondary" : "btn-primary"} onClick={() => toggleSopCompletion(role, sop.id)} style={{ marginTop: "1rem", width: "100%" }}>
                {done ? "Mark as Not Done" : "Mark as Completed"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AwarenessSection() {
  const { awarenessCards, addAwarenessCard, toggleAwarenessCard, deleteAwarenessCard } = usePHC();
  const [icon, setIcon] = useState("📢");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    addAwarenessCard({ icon, title, text });
    setTitle("");
    setText("");
  };

  return (
    <>
      <div className="glass-card" style={{ textAlign: "left" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Megaphone /> Awareness Cards (Citizen Tips)
        </h2>
        <p style={{ marginTop: "0.5rem", opacity: 0.75 }}>
          These tips show up as scrolling flashcards on Citizen + TV screens.
        </p>

        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.75rem", marginTop: "1rem" }}>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Icon (emoji)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📢" />
          </div>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Dengue alert" />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Message</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Keep it short (1-2 lines)..." rows={3} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn-primary" type="submit" style={{ width: "100%" }}>
              Add Awareness Card
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ textAlign: "left" }}>
        <h3 style={{ marginBottom: "1rem" }}>Current Cards</h3>

        {(!awarenessCards || awarenessCards.length === 0) ? (
          <p style={{ opacity: 0.7 }}>No cards yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {awarenessCards.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "10px 14px", background: "var(--surface-muted)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ fontSize: 20 }}>{c.icon || "📢"}</div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{c.title}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>{c.text}</div>
                    <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
                      Status: {c.active ? "Active" : "Hidden"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button className="btn-secondary" onClick={() => toggleAwarenessCard(c.id)}>
                    {c.active ? "Hide" : "Show"}
                  </button>
                  <button className="btn-secondary" onClick={() => deleteAwarenessCard(c.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
