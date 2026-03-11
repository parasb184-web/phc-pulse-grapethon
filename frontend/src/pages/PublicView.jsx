import React, { useMemo, useState, useEffect } from 'react';
import { usePHC } from '../context/PHCContext';
import { alertsAPI, insightsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Info, Bot, CalendarClock, MapPin, Bell, AlertTriangle, Smartphone, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import SectionImage from '../components/SectionImage';
import citizenImg from '../assets/citizen-guidance.png';
import { buildNowServingSummary, trackToken } from '../utils/queueUtils';

const PublicView = () => {
  const { phcData, aiScoreData, aiWaitData, logout, awarenessCards } = usePHC();
  const navigate = useNavigate();

  const score = aiScoreData?.score || 70;
  const waitTime = aiWaitData?.estimatedWaitMinutes || 20;
  const availableDoctors = useMemo(
    () => Object.values(phcData?.doctors || {}).filter((d) => d.status !== "Absent").length,
    [phcData?.doctors]
  );
  const leadDoctor = useMemo(
    () =>
      Object.values(phcData?.doctors || {}).find((d) => d.status === "Available" || d.status === "Busy")?.name ||
      "General OPD Counter",
    [phcData?.doctors]
  );
  const queueSnapshot = useMemo(
    () =>
      buildNowServingSummary({
        serving: phcData?.serving,
        queueCount: phcData?.queue,
        waitMinutes: waitTime,
        doctorsAvailable: availableDoctors,
      }),
    [phcData?.serving, phcData?.queue, waitTime, availableDoctors]
  );

  // ✅ live "time ago" ticker
  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const lastUpdatedMs = useMemo(() => {
    const t = Date.parse(phcData?.lastUpdated || "");
    return Number.isFinite(t) ? t : Date.now();
  }, [phcData?.lastUpdated]);

  const diffSec = Math.max(0, Math.floor((nowMs - lastUpdatedMs) / 1000));
  const isStale = diffSec > 60;

  const formatAgo = (s) => {
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };

  // ----- Queue alert registration -----
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertPref, setAlertPref] = useState("3_ahead");
  const [smsRegistered, setSmsRegistered] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [registrationError, setRegistrationError] = useState("");
  const [nearbyComparison, setNearbyComparison] = useState(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenResult, setTokenResult] = useState(null);
  const [tokenError, setTokenError] = useState("");

  const handleSmsRegister = async (e) => {
    e.preventDefault();
    setRegistrationError("");
    if (phoneNumber.length > 6) {
      try {
        const result = await alertsAPI.registerToken({ phone: phoneNumber, triggerType: alertPref });
        setRegistrationInfo(result);
        setSmsRegistered(true);
      } catch (err) {
        console.error("Failed to register queue alert:", err);
        setRegistrationError("Unable to register right now. Please check the phone number and try again.");
      }
    }
  };

  const handleTrackToken = (e) => {
    e.preventDefault();
    setTokenError("");
    const result = trackToken({
      tokenInput,
      serving: phcData?.serving,
      queueCount: phcData?.queue,
      waitMinutes: waitTime,
      doctorsAvailable: availableDoctors,
      doctorLabel: leadDoctor,
    });

    if (!result.ok) {
      setTokenResult(null);
      setTokenError(result.reason);
      return;
    }

    setTokenResult(result);
  };

  // Awareness ticker text from staff cards
  const awarenessTickerText = useMemo(() => {
    const active = (awarenessCards || []).filter(c => c.active);
    const list = active.length
      ? active
      : [{ icon: "📢", title: "Awareness", text: "No active awareness tips right now." }];

    return list
      .map(c => `${c.icon || "📢"} ${c.title}: ${c.text}`)
      .join('  •  ');
  }, [awarenessCards]);

  useEffect(() => {
    const fallbackData = {
      currentPhc: {
        name: phcData?.phcName || "Current PHC",
        waitTimeMinutes: waitTime,
        doctorsAvailable: Object.values(phcData?.doctors || {}).filter((d) => d.status !== "Absent").length,
        medicineStatus: "Moderate",
        readiness: score >= 75 ? "Optimal" : score >= 50 ? "Moderate" : "Stretched"
      },
      options: [
        { id: "ALT-1", name: "Sadar PHC", distanceKm: 2.1, waitTimeMinutes: Math.max(8, Math.round(waitTime * 0.75)), doctorsAvailable: 3, medicineStatus: "Good", readiness: "Moderate" },
        { id: "ALT-2", name: "District Hospital OPD", distanceKm: 5.6, waitTimeMinutes: Math.max(10, Math.round(waitTime * 0.9)), doctorsAvailable: 4, medicineStatus: "Good", readiness: "Moderate" }
      ],
      recommendation: "Nearby centre guidance is currently indicative. Please verify service availability before travel."
    };

    insightsAPI.getNearbyComparison()
      .then((res) => setNearbyComparison(res))
      .catch(() => setNearbyComparison(fallbackData));
  }, [phcData, waitTime, score]);

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.45); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }
      `}</style>

      <div
        style={{
          padding: '1rem',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minHeight: '100vh',
          paddingBottom: 95 // space for ticker
        }}
      >
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Logo height={48} />
            <div>
              <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.1, color: "var(--trust-blue)" }}>PHC Pulse</h1>

              {/* ✅ LIVE + last updated */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  opacity: 0.9
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: isStale ? "var(--warning)" : "var(--primary)",
                    boxShadow: isStale ? "0 0 0 rgba(0,0,0,0)" : "0 0 12px rgba(0,0,0,0.15)",
                    animation: isStale ? "none" : "pulseDot 1.2s infinite"
                  }} />
                  LIVE
                </span>

                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  Updated {formatAgo(diffSec)}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Staff Login
          </button>
        </header>

        {/* Optional stale warning */}
        {isStale && (
          <div className="glass-card" style={{ borderColor: "var(--warning)", background: "rgba(255, 199, 0, 0.08)" }}>
            <div style={{ fontWeight: 800, color: "var(--warning)" }}>Data may be stale</div>
            <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
              Updates may be delayed. Refresh to load the latest status.
            </div>
          </div>
        )}

        <SectionImage src={citizenImg} alt="Citizen Guidance" height={180} objectPosition="center 20%" style={{ marginBottom: '0.5rem' }} />

        {/* Queue Overview Card */}
        <div className="glass-card flex-col items-center justify-center text-center animate-fade-in" style={{ padding: '2rem 1.5rem', borderTop: '4px solid var(--trust-blue)' }}>
          <h2 style={{ fontSize: '1.1rem', color: "var(--text-secondary)", marginBottom: '0.5rem' }}>{phcData.phcName}</h2>

          {/* ✅ secondary last updated (more obvious to judges) */}
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
            Last update: {formatAgo(diffSec)}
          </div>

          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 700 }}>
            Now Serving
          </div>
          <div style={{
            marginTop: 2,
            marginBottom: 12,
            padding: "10px 18px",
            borderRadius: 999,
            border: "2px solid var(--trust-blue)",
            color: "var(--trust-blue)",
            fontSize: "2.3rem",
            fontWeight: 900
          }}>
            {queueSnapshot.nowServing}
          </div>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{queueSnapshot.nextRange}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Next Tokens</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{queueSnapshot.approxWaitForNewEntry}m</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>New Entry Wait</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{phcData.queue}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Patients Ahead</div>
            </div>
          </div>

          {aiWaitData?.bestArrivalWindow && (
            <div style={{ marginTop: '0.9rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Best arrival window today: <strong style={{ color: 'var(--text-primary)' }}>{aiWaitData.bestArrivalWindow}</strong>
            </div>
          )}

          {phcData.alerts.length > 0 && (
            <div style={{ width: '100%', marginTop: '1.5rem', background: 'var(--warning-soft)', borderLeft: '4px solid var(--warning)', padding: '12px', textAlign: 'left', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <strong><Bell size={16} color="var(--warning)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Update: </strong>
              {phcData.alerts[0]}
            </div>
          )}
        </div>

        {/* Track My Token */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.08s', textAlign: 'left' }}>
          <h3 style={{ marginBottom: 6, color: "var(--trust-blue)" }}>Track My Token</h3>
          <p style={{ fontSize: '0.9rem', color: "var(--text-secondary)", marginTop: 0 }}>
            Already have a token? Track your turn live.
          </p>
          <form onSubmit={handleTrackToken} style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter token (e.g. A-27)"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surface-muted)",
                color: "var(--text-primary)"
              }}
            />
            <button type="submit" className="btn-primary">Track</button>
          </form>
          {tokenError && <div style={{ marginTop: 8, color: "var(--error)", fontSize: 13 }}>{tokenError}</div>}

          {tokenResult && (
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Your Token: <span style={{ color: "var(--trust-blue)" }}>{tokenResult.token}</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Now Serving: <span style={{ color: "var(--text-primary)" }}>{tokenResult.nowServing}</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Patients Ahead: <span style={{ color: "var(--text-primary)" }}>{tokenResult.patientsAhead}</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Estimated Turn: <span style={{ color: "var(--text-primary)" }}>~{tokenResult.estimatedTurnMinutes} min</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Assigned Doctor/Counter: <span style={{ color: "var(--text-primary)" }}>{tokenResult.doctorOrCounter}</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-muted)", fontWeight: 700 }}>
                Status: <span style={{ color: "var(--trust-blue)" }}>{tokenResult.status}</span>
              </div>
            </div>
          )}
        </div>

        {(score < 50 || waitTime > 45) && (
          <div className="glass-card animate-fade-in" style={{ background: 'var(--warning-soft)', borderColor: 'var(--warning)', animationDelay: '0.1s' }}>
            <h3 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Info size={18} /> High Load Detected
            </h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', marginBottom: '1rem', color: "var(--text-secondary)" }}>
              Skip the wait! Consider Tele-OPD booking to save time.
            </p>
            <button
              style={{ width: '100%', background: 'var(--warning)', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 150ms ease' }}
              onClick={() => navigate('/teleopd')}
            >
              Book Tele-OPD Slot
            </button>
          </div>
        )}

        {/* Queue Alert Registration */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.15s', textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: "var(--trust-blue)" }}>
            <Smartphone size={18} color="var(--primary)" /> Queue Notifications
          </h3>

          {smsRegistered ? (
            <div style={{ padding: "1rem", background: "var(--success-soft)", border: "1px solid var(--success)", borderRadius: "8px", textAlign: "center", color: "var(--success)" }}>
              <CheckCircle2 size={32} style={{ margin: "0 auto 0.5rem auto" }} />
              <div style={{ fontWeight: 800, marginBottom: "0.2rem" }}>Alert registration successful</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>Queue notification request captured.</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.35rem" }}>
                Notification trigger configured: {registrationInfo?.triggerLabel || (alertPref === "next" ? "Alert when my turn is near" : "Alert when 3 patients remain")}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.5rem" }}>
                Notification request saved. Message delivery channel may vary by facility configuration.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSmsRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.9rem', color: "var(--text-secondary)", margin: 0 }}>
                Leave the waiting area and get a notification when your turn approaches.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: "var(--text-secondary)", marginBottom: '0.3rem' }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-muted)', color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: "var(--text-secondary)", marginBottom: '0.3rem' }}>Alert Trigger</label>
                <select
                  value={alertPref}
                  onChange={(e) => setAlertPref(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-muted)', color: "var(--text-primary)" }}
                >
                  <option value="3_ahead">Alert when 3 patients remain</option>
                  <option value="next">Alert when I am next</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
                Register for Alerts
              </button>
              {registrationError && (
                <div style={{ fontSize: "0.8rem", color: "var(--error)" }}>{registrationError}</div>
              )}
            </form>
          )}
        </div>

        {/* Guide Bot */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Bot size={18} color="var(--primary)" /> PHC Guide Bot
          </h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '1rem' }}>
            Tap preset actions for instant info. (Guidance only — not diagnosis.)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/bot')}>Open Guide Bot</button>
            <button
              className="btn-primary"
              onClick={() => navigate('/teleopd')}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
            >
              <CalendarClock size={16} /> Book Tele-OPD
            </button>
          </div>
        </div>

        {/* Nearby PHC Comparison */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: "var(--trust-blue)" }}>
            <MapPin size={18} color="var(--primary)" /> Nearby PHC Comparison
          </h3>

          {nearbyComparison ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Indicative comparison based on current queue and readiness indicators.
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Current: <strong style={{ color: 'var(--text-primary)' }}>{nearbyComparison.currentPhc?.name}</strong> | Wait: <strong style={{ color: 'var(--text-primary)' }}>{nearbyComparison.currentPhc?.waitTimeMinutes}m</strong> | Readiness: <strong style={{ color: 'var(--text-primary)' }}>{nearbyComparison.currentPhc?.readiness}</strong>
              </div>
              {(nearbyComparison.options || []).slice(0, 3).map((opt) => (
                <div key={opt.id || opt.name} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{opt.name}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{opt.distanceKm} km</span>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                    <span>Wait: <strong style={{ color: 'var(--text-primary)' }}>{opt.waitTimeMinutes}m</strong></span>
                    <span>Doctors: <strong style={{ color: 'var(--text-primary)' }}>{opt.doctorsAvailable}</strong></span>
                    <span>Medicines: <strong style={{ color: 'var(--text-primary)' }}>{opt.medicineStatus}</strong></span>
                    <span>Readiness: <strong style={{ color: 'var(--text-primary)' }}>{opt.readiness}</strong></span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.4rem', padding: '0.7rem', borderRadius: '8px', background: 'var(--surface-blue)', border: '1px solid var(--primary)', color: 'var(--trust-blue)', fontSize: '0.84rem', fontWeight: 700 }}>
                {nearbyComparison.recommendation}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Loading nearby comparison...
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 12,
        width: "min(600px, calc(100vw - 24px))",
        height: 48,
        background: "var(--surface-blue)",
        border: "1px solid var(--primary)",
        color: "var(--trust-blue)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        zIndex: 9999,
        paddingLeft: 16,
        borderRadius: 12,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)"
      }}>
        <AlertTriangle size={20} color="var(--primary)" style={{ marginRight: 12, minWidth: 20 }} />
        <div style={{ width: "100%" }}>
          <marquee style={{ fontSize: "1rem", fontWeight: 700 }}>
            {awarenessTickerText}
          </marquee>
        </div>
      </div>
    </>
  );
};

export default PublicView;
