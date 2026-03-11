import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePHC } from '../context/PHCContext';
import { ArrowLeft, CalendarClock, CheckCircle2, HeartPulse, Phone, Stethoscope } from 'lucide-react';
import SectionImage from '../components/SectionImage';
import teleImg from '../assets/telemedicine.png';

const TeleOPD = () => {
  const navigate = useNavigate();
  const { phcData, createTeleopdBooking } = usePHC();

  const slots = useMemo(() => ([
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
  ]), []);

  const [category, setCategory] = useState("General OPD");
  const [slot, setSlot] = useState(slots[0]);
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const booking = createTeleopdBooking({ category, slot, phone });
    setConfirmed(booking);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/public')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <HeartPulse size={24} color="var(--primary)" />
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Tele-OPD Booking</h1>
        </div>
      </header>

      <SectionImage src={teleImg} alt="Tele-OPD Consultation" height={180} objectPosition="center 20%" style={{ marginBottom: '0.5rem' }} />

      {!confirmed ? (
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: "var(--trust-blue)" }}>
            <CalendarClock size={18} color="var(--primary)" /> Book a slot
          </h3>

          <p style={{ fontSize: '0.9rem', color: "var(--text-secondary)", marginBottom: '1rem' }}>
            Register a tele-consultation request and receive a booking reference. (No diagnosis or prescription is issued in this app.)
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: "var(--text-primary)" }}><Stethoscope size={16} /> Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <option>General OPD</option>
                <option>Child / Pediatrics</option>
                <option>Women / ANC</option>
                <option>Mental Wellbeing</option>
                <option>Other</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: "var(--text-primary)" }}><CalendarClock size={16} /> Time Slot</span>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: "var(--text-primary)" }}><Phone size={16} /> Phone (optional)</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 98xxxxxx10" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </label>

            <button className="btn-primary" type="submit">Confirm Booking</button>
          </form>
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
            <CheckCircle2 size={18} color="var(--primary)" /> Booking Confirmed
          </h3>

          <div style={{ background: 'var(--surface-blue)', border: '1px solid var(--sky-blue)', padding: '1rem', borderRadius: '10px' }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>PHC:</strong> {phcData.phcName}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Booking ID:</strong> {confirmed.id}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Category:</strong> {confirmed.category}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Slot:</strong> {confirmed.slot}</p>
            <p style={{ fontSize: '0.85rem', color: "var(--text-secondary)" }}>Please be available during your selected slot.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => { setConfirmed(null); }}>Book Another</button>
            <button className="btn-primary" onClick={() => navigate('/public')}>Go to Citizen View</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeleOPD;
