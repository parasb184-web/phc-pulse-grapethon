import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePHC } from '../context/PHCContext';
import { HeartPulse, ArrowLeft, Info, Clock, Stethoscope, Pill, PhoneCall, Smile } from 'lucide-react';

const QuickButton = ({ icon, label, onClick }) => (
  <button
    className="btn-secondary"
    onClick={onClick}
    style={{
      display: 'flex',
      gap: '0.6rem',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '12px',
      fontWeight: 700
    }}
  >
    {icon}
    {label}
  </button>
);

const GuideBot = () => {
  const navigate = useNavigate();
  const { phcData, aiWaitData, aiScoreData } = usePHC();
  const score = aiScoreData?.score ?? 70;
  const wait = aiWaitData?.estimatedWaitMinutes ?? 20;

  const [messages, setMessages] = useState(() => ([
    { from: 'sys', text: "Welcome to the PHC Guidance Assistant. Select an option below for current facility information. (Guidance only — not medical diagnosis.)" }
  ]));

  const availableDocs = useMemo(() => {
    const docs = Object.values(phcData?.doctors || {});
    return docs.filter(d => d.status !== 'Absent');
  }, [phcData]);

  const medsSummary = useMemo(() => {
    const meds = Object.values(phcData?.medicines || {});
    const inStock = meds.filter(m => m.status === 'In Stock').length;
    const low = meds.filter(m => m.status === 'Low').length;
    const out = meds.filter(m => m.status === 'Out of Stock').length;
    const outList = meds.filter(m => m.status === 'Out of Stock').map(m => m.name);
    return { inStock, low, out, outList, total: meds.length };
  }, [phcData]);

  const pushSys = (text) => setMessages(prev => [...prev, { from: 'sys', text }]);

  const handleDoctor = () => {
    const names = availableDocs.map(d => `${d.name} (${d.dept}) — ${d.status}`);
    pushSys(
      names.length
        ? `Doctors currently on duty:\n• ${names.join('\n• ')}`
        : "No doctors are currently marked as available. Please check with the help desk or use Tele-OPD."
    );
  };

  const handleWait = () => {
    let advice = "Current load is manageable.";
    if (score < 50 || wait > 45) advice = "High patient volume detected. Tele-OPD may reduce waiting time.";
    pushSys(`Estimated wait time: ~${wait} minutes.\nReadiness score: ${score}/100.\nRecommendation: ${advice}`);
  };

  const handleMeds = () => {
    const line1 = `Medicine availability summary: ${medsSummary.inStock}/${medsSummary.total} listed items are in stock.`;
    const line2 = medsSummary.outList.length ? `Currently unavailable: ${medsSummary.outList.join(', ')}` : "No critical stock-out is currently reported.";
    pushSys(`${line1}\n${line2}`);
  };

  const handleTele = () => {
    pushSys("Opening Tele-OPD booking. Please select a suitable consultation slot.");
    navigate('/teleopd');
  };

  const handleStress = () => {
    pushSys(
      "Wellbeing check-in:\n1) Practice slow breathing for 60 seconds.\n2) Rest in a calm waiting area.\n3) If needed, request counselling support through Tele-OPD.\n\nFor urgent distress, contact emergency services immediately."
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/public')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <HeartPulse size={24} color="var(--primary)" />
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>PHC Guidance Assistant</h1>
        </div>
      </header>

      <div className="glass-card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <Info size={18} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Guidance Options</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <QuickButton icon={<Stethoscope size={18} color="var(--primary)" />} label="Check doctor availability" onClick={handleDoctor} />
          <QuickButton icon={<Clock size={18} color="var(--accent)" />} label="Show wait time" onClick={handleWait} />
          <QuickButton icon={<Pill size={18} color="var(--warning)" />} label="Medicines available?" onClick={handleMeds} />
          <QuickButton icon={<PhoneCall size={18} color="var(--primary)" />} label="Book Tele-OPD" onClick={handleTele} />
          <QuickButton icon={<Smile size={18} color="var(--accent)" />} label="Wellbeing check-in" onClick={handleStress} />
        </div>

        <p style={{ marginTop: '0.9rem', fontSize: '0.8rem', opacity: 0.75 }}>
          Disclaimer: This assistant provides general guidance and operational info. It does not provide medical diagnosis or prescriptions.
        </p>
      </div>

      <div className="glass-card" style={{ textAlign: 'left', flex: 1 }}>
        <h3 style={{ marginBottom: '0.8rem' }}>Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              background: m.from === 'sys' ? '#EFF6FF' : '#F1F5F9',
              border: m.from === 'sys' ? '1px solid #BFDBFE' : '1px solid var(--glass-border)',
              padding: '0.8rem',
              borderRadius: '10px',
              whiteSpace: 'pre-line'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', color: '#1E293B' }}>
                {m.from === 'sys' ? 'System' : 'You'}
              </div>
              <div style={{ fontSize: '0.95rem' }}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideBot;
