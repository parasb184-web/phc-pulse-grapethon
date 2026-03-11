import React, { useState, useEffect, useMemo } from 'react';
import { usePHC } from '../context/PHCContext';
import { HeartPulse, Clock as ClockIcon, Users, Stethoscope, Pill, AlertTriangle } from 'lucide-react';
import { buildNowServingSummary } from '../utils/queueUtils';

const TVScreen = () => {
  const { phcData, aiWaitData, isWaitLoading, awarenessCards } = usePHC();
  const [time, setTime] = useState(new Date());

  const waitTime = aiWaitData?.estimatedWaitMinutes || 20;
  const alerts = useMemo(() => phcData.alerts || [], [phcData.alerts]);

  // ===== TIME TICK =====
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===== LIVE / LAST UPDATED =====
  const lastUpdatedMs = useMemo(() => {
    const t = Date.parse(phcData?.lastUpdated || "");
    return Number.isFinite(t) ? t : Date.now();
  }, [phcData?.lastUpdated]);

  const diffSec = Math.max(0, Math.floor((time.getTime() - lastUpdatedMs) / 1000));
  const isStale = diffSec > 60;

  const formatAgo = (s) => {
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };

  // ===== COLORS =====
  const getDocColor = (status) => {
    switch (status) {
      case "Available": return "var(--success)";
      case "Busy": return "var(--warning)";
      case "Break": return "var(--warning)";
      case "Absent": return "var(--error)";
      default: return "var(--text-muted)";
    }
  };

  const waitColor = waitTime < 20 ? "var(--success)" : waitTime < 45 ? "var(--warning)" : "var(--error)";
  const availableDoctors = useMemo(
    () => Object.values(phcData.doctors || {}).filter((d) => d.status !== "Absent").length,
    [phcData.doctors]
  );
  const inStockMedicines = useMemo(
    () => Object.values(phcData.medicines || {}).filter((m) => m.status === "In Stock").length,
    [phcData.medicines]
  );

  const queueSnapshot = useMemo(
    () =>
      buildNowServingSummary({
        serving: phcData.serving,
        queueCount: phcData.queue,
        waitMinutes: waitTime,
        doctorsAvailable: availableDoctors,
      }),
    [phcData.serving, phcData.queue, waitTime, availableDoctors]
  );

  // ===== AWARENESS MARQUEE TEXT (from staff cards) =====
  const awarenessTickerText = useMemo(() => {
    const active = (awarenessCards || []).filter(c => c.active);
    const list = active.length ? active : [
      { icon: "📢", title: "Awareness", text: "No awareness cards added yet." }
    ];

    return list
      .map(c => `${c.icon || "📢"} ${c.title}: ${c.text}`)
      .join("   •   ");
  }, [awarenessCards]);

  // ===== IMPORTANT NOTICE POPUP (4 sec show, 10 sec hide, rotate alerts) =====
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeIdx, setNoticeIdx] = useState(0);

  useEffect(() => {
    if (alerts.length === 0) {
      setNoticeVisible(false);
      return;
    }

    let hideTimer;

    const showNow = () => {
      setNoticeVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setNoticeVisible(false), 4000);
    };

    showNow();

    const interval = setInterval(() => {
      setNoticeIdx((i) => (i + 1) % alerts.length);
      showNow();
    }, 14000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [alerts]);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>

      {/* ✅ Pulse animation for LIVE dot */}
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.55); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }
      `}</style>

      {/* Header */}
      <header className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', margin: '1rem', borderRadius: '16px', borderTop: '4px solid var(--trust-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <HeartPulse size={48} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, color: "var(--trust-blue)" }}>PHC Pulse Live</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: '1.2rem', margin: 0 }}>{phcData.phcName}</p>

            {/* ✅ LIVE + Updated */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                fontWeight: 900,
                letterSpacing: 0.5
              }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: isStale ? "var(--warning)" : "var(--primary)",
                  animation: isStale ? "none" : "pulseDot 1.2s infinite"
                }} />
                LIVE
              </div>

              <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 700 }}>
                Updated {formatAgo(diffSec)}{isStale ? " • may be stale" : ""}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', color: "var(--text-primary)" }}>
          <h2 style={{ fontSize: '3rem', margin: 0, fontWeight: 800 }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: '1.2rem', margin: 0 }}>
            {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem', padding: '0 2rem', paddingBottom: 90 }}>

        {/* Now Serving Column */}
        <div className="glass-card flex-col items-center justify-center text-center">
          <h2 style={{ fontSize: '1.5rem', color: "var(--text-secondary)" }}>Now Serving</h2>

          <div style={{
            marginTop: "1.3rem",
            marginBottom: "1rem",
            padding: "14px 22px",
            borderRadius: 999,
            border: "2px solid var(--trust-blue)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--trust-blue)",
            fontSize: "2.8rem",
            fontWeight: 900,
            letterSpacing: 0.2
          }}>
            {queueSnapshot.nowServing}
          </div>

          <div style={{
            marginTop: "1.4rem",
            width: "100%",
            display: "grid",
            gap: "0.7rem",
            textAlign: "left"
          }}>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", fontSize: "1.1rem", fontWeight: 700 }}>
              Next: <span style={{ color: "var(--text-primary)" }}>{queueSnapshot.nextRange}</span>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", fontSize: "1.1rem", fontWeight: 700 }}>
              Approx. Wait for New Entry: <span style={{ color: waitColor }}>{isWaitLoading ? "Updating..." : `${queueSnapshot.approxWaitForNewEntry} min`}</span>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", fontSize: "1.1rem", fontWeight: 700 }}>
              Patients Ahead in Queue: <span style={{ color: "var(--text-primary)" }}>{phcData.queue}</span>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", fontSize: "1.1rem", fontWeight: 700 }}>
              Doctors Available: <span style={{ color: availableDoctors > 0 ? "var(--success)" : "var(--error)" }}>{availableDoctors}</span>
            </div>
          </div>
        </div>

        {/* Stats & Doctors Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* 4 Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card flex-col items-center justify-center text-center">
              <ClockIcon size={40} color={waitColor} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: waitColor }}>
                {isWaitLoading ? "..." : waitTime}
              </div>
              <div style={{ fontSize: '1.2rem', color: "var(--text-secondary)", marginTop: 8 }}>Min Wait</div>
            </div>
            <div className="glass-card flex-col items-center justify-center text-center">
              <Users size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{phcData.queue}</div>
              <div style={{ fontSize: '1.2rem', color: "var(--text-secondary)", marginTop: 8 }}>In Queue</div>
            </div>
            <div className="glass-card flex-col items-center justify-center text-center">
              <Stethoscope size={40} color={Object.values(phcData.doctors).filter(d => d.status !== "Absent").length > 0 ? "var(--success)" : "var(--warning)"} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>
                {availableDoctors}
              </div>
              <div style={{ fontSize: '1.2rem', color: "var(--text-secondary)", marginTop: 8 }}>Docs Avail</div>
            </div>
            <div className="glass-card flex-col items-center justify-center text-center">
              <Pill size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>
                {inStockMedicines}
              </div>
              <div style={{ fontSize: '1.2rem', color: "var(--text-secondary)", marginTop: 8 }}>Meds In Stock</div>
            </div>
          </div>

          {/* Doctor Cards */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {Object.entries(phcData.doctors).map(([id, doc]) => (
              <div key={id} className={`glass-card flex-col items-center justify-center text-center animate-fade-in`} style={{ padding: '2rem', border: `2px solid ${doc.status === 'Available' ? 'var(--success)' : 'var(--border)'}` }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>
                  👨‍⚕️
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: 0, color: "var(--text-primary)" }}>{doc.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: '1rem', marginBottom: '1rem' }}>{doc.dept}</p>
                <div style={{
                  background: getDocColor(doc.status),
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {doc.status}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* IMPORTANT NOTICE popup above marquee */}
      {alerts.length > 0 && noticeVisible && (
        <div style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 52,
          width: "min(1100px, calc(100vw - 60px))",
          background: "rgba(255, 244, 229, 0.95)",
          border: "2px solid rgba(255, 193, 7, 0.85)",
          color: "#1f2937",
          padding: "12px 16px",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 10000,
          display: "flex",
          gap: 12,
          alignItems: "center"
        }}>
          <span style={{ fontWeight: 900, color: "#b45309", fontSize: 18 }}>IMPORTANT:</span>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{alerts[noticeIdx]}</span>
        </div>
      )}

      {/* Bottom moving ticker = Awareness flashcards */}
      <footer style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 44,
        background: 'var(--error)',
        color: '#fff',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <AlertTriangle size={22} style={{ marginLeft: '16px', marginRight: '12px', minWidth: '22px' }} />

        <div style={{ position: 'relative', width: '100%' }}>
          {phcData.emergency ? (
            <div className="emergency-glow" style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
              EMERGENCY PRIORITY MODE ACTIVATED - PLEASE COOPERATE WITH STAFF
            </div>
          ) : (
            <marquee style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {awarenessTickerText}
            </marquee>
          )}
        </div>
      </footer>

    </div>
  );
};

export default TVScreen;
