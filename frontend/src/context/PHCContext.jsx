import React, { createContext, useState, useEffect, useContext } from 'react';
import { phcAPI, insightsAPI, inventoryAPI, medicinesAPI } from '../services/api';

const PHCContext = createContext(null);

export const usePHC = () => useContext(PHCContext);

export const PHCProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem('phc_role') || null);

  const defaultStatus = {
    phcName: "Rampur PHC, Sitapur, Uttar Pradesh",
    doctors: {
      doc1: { name: "Dr. Priya Sharma", dept: "General Medicine", status: "Available" },
      doc2: { name: "Dr. Rakesh Verma", dept: "Pediatrics", status: "Available" },
      doc3: { name: "Dr. Meena Patel", dept: "Gynaecology", status: "Absent" }
    },
    queue: 14,
    serving: 42,
    medicines: {
      med1: { name: "Paracetamol 500mg", status: "In Stock" },
      med2: { name: "Amoxicillin 250mg", status: "Low" },
      med3: { name: "Metformin 500mg", status: "In Stock" },
      med4: { name: "ORS Sachets", status: "Out of Stock" },
      med5: { name: "Iron+Folic Acid", status: "In Stock" }
    },
    alerts: ["Lab closed till 2:00 PM"],
    emergency: false,
    symptoms: {
      fever: { count: 18, avg: 8, emoji: "🌡️", name: "Fever" },
      vomiting: { count: 4, avg: 3, emoji: "🤢", name: "Vomiting" },
      rash: { count: 2, avg: 2, emoji: "🔴", name: "Rash" },
      diarrhoea: { count: 7, avg: 5, emoji: "🚿", name: "Diarrhoea" },
      cough: { count: 9, avg: 10, emoji: "😷", name: "Cough" },
      eyeinf: { count: 1, avg: 1, emoji: "👁️", name: "Eye Infection" }
    },
    lastUpdated: new Date().toISOString()
  };

  const defaultSop = { ANM: {}, Nurse: {}, Pharmacist: {} };

  const safeParse = (v, fallback) => {
    try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };

  const [phcData, setPhcData] = useState(() => safeParse(localStorage.getItem('phc_data'), defaultStatus));
  const [teleopdBookings, setTeleopdBookings] = useState(() => safeParse(localStorage.getItem('phc_teleopd_bookings'), []));
  const [sopCompletions, setSopCompletions] = useState(() => safeParse(localStorage.getItem('phc_sop_completions'), defaultSop));
  const [awarenessCards, setAwarenessCards] = useState(() => {
    const fallback = [
      { id: "aw-001", icon: "🌡️", title: "Fever Tip", text: "Hydrate (water/ORS), rest. Visit PHC if fever lasts >2 days.", active: true },
      { id: "aw-002", icon: "🧼", title: "Hygiene", text: "Wash hands often. Cover cough/sneeze. Use a mask if needed.", active: true },
      { id: "aw-003", icon: "💊", title: "Medicine Safety", text: "Avoid antibiotics without prescription. Ask PHC pharmacist if unsure.", active: true },
    ];
    return safeParse(localStorage.getItem('phc_awareness_cards'), fallback);
  });

  const defaultInternalMedicines = {
    catalog: [
      { id: "M001", name: "Paracetamol 500mg", type: "Tablet", currentStock: 2500, reorderLevel: 500, estimatedDepletionDays: 14, riskBand: "Stable" },
      { id: "M002", name: "Amoxicillin 250mg", type: "Capsule", currentStock: 150, reorderLevel: 200, estimatedDepletionDays: 3, riskBand: "Watchlist" },
      { id: "M003", name: "Metformin 500mg", type: "Tablet", currentStock: 1800, reorderLevel: 500, estimatedDepletionDays: 30, riskBand: "Stable" },
      { id: "M004", name: "ORS Sachets", type: "Packet", currentStock: 0, reorderLevel: 100, estimatedDepletionDays: 0, riskBand: "Out of Stock" },
      { id: "M005", name: "Iron+Folic Acid", type: "Tablet", currentStock: 1200, reorderLevel: 400, estimatedDepletionDays: 45, riskBand: "Stable" }
    ],
    transactions: [
      { id: "txn1", date: new Date().toISOString(), type: "IN", medId: "M001", qty: 2000, user: "System", source: "District Warehouse" },
      { id: "txn2", date: new Date(Date.now() - 3600000).toISOString(), type: "OUT", medId: "M002", qty: 20, user: "System", patientRef: "OPD Walk-in" }
    ],
    alerts: [
      { id: "alt1", date: new Date().toISOString(), type: "LOW_STOCK", medId: "M002", message: "Amoxicillin stock is below reorder level.", resolved: false },
      { id: "alt2", date: new Date().toISOString(), type: "STOCK_OUT_PATTERN", medId: "M004", message: "ORS Sachets are completely out of stock.", resolved: false }
    ],
    reconciliationRecords: [],
    auditTrail: [
      { id: "aud1", action: "SYSTEM_INIT", user: "System", date: new Date().toISOString(), details: "Initialized demo ledger." }
    ]
  };

  const [internalMedicines, setInternalMedicines] = useState(() => safeParse(localStorage.getItem('phc_internal_medicines'), defaultInternalMedicines));


  const normalizeAuditDetails = (details) => {
    if (details == null) return "";
    if (typeof details === "string") {
      try {
        const parsed = JSON.parse(details);
        return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(", ");
      } catch {
        return details;
      }
    }
    if (typeof details === "object") {
      return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(", ");
    }
    return String(details);
  };

  const normalizeMedicinePayload = (payload) => {
    if (!payload) return null;
    return {
      catalog: payload.catalog || [],
      transactions: payload.transactions || [],
      alerts: payload.alerts || [],
      reconciliationRecords: payload.reconciliations || payload.reconciliationRecords || [],
      auditTrail: (payload.auditTrail || []).map((a) => ({
        id: a.id,
        action: a.action || "UNKNOWN",
        user: a.actor || a.user || "System",
        date: a.created_at || a.date || new Date().toISOString(),
        details: normalizeAuditDetails(a.details)
      }))
    };
  };

  const fetchBackendData = async () => {
    try {
      const [phcRes, invRes] = await Promise.all([
        phcAPI.getStatus().catch(() => null),
        medicinesAPI.getDashboard().catch(() => inventoryAPI.getStatus().catch(() => null))
      ]);

      if (phcRes) {
        setPhcData(phcRes);
        localStorage.setItem('phc_data', JSON.stringify(phcRes));
      }
      
      const normalizedMeds = normalizeMedicinePayload(invRes);
      if (normalizedMeds) {
        setInternalMedicines(normalizedMeds);
      }
    } catch (e) {
      console.warn("Backend fetch failed, using local/fallback data.", e);
    }
  };

  useEffect(() => {
    fetchBackendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePhcData = async (updates) => {
    // Optimistic UI update
    const newData = { ...phcData, ...updates, lastUpdated: new Date().toISOString() };
    setPhcData(newData);
    localStorage.setItem('phc_data', JSON.stringify(newData));

    try {
      await phcAPI.updateStatus(updates);
    } catch (e) {
      console.warn("Backend update failed, but local state updated.", e);
    }
  };

  const getAvailableStock = (medId) => {
    const med = internalMedicines.catalog.find(m => m.id === medId);
    return med ? med.currentStock : 0;
  };

  const addStockInwardEntry = async ({ medId, qty, source, user, remarks }) => {
    try {
      await medicinesAPI.inward({ medId, qty: Number(qty), source, user, remarks });
      await fetchBackendData();
      return true;
    } catch (e) {
      try {
        await inventoryAPI.recordTransaction({ medId, type: 'IN', qty: Number(qty), source, user, remarks });
        await fetchBackendData();
        return true;
      } catch {
        console.warn("Transaction failed", e);
        return false;
      }
    }
  };

  const addIssueEntry = async ({ medId, qty, patientRef, user, remarks }) => {
    try {
      await medicinesAPI.issue({ medId, qty: Number(qty), patientRef, user, remarks });
      await fetchBackendData();
      return true;
    } catch (e) {
      try {
        await inventoryAPI.recordTransaction({ medId, type: 'OUT', qty: Number(qty), patientRef, user, remarks });
        await fetchBackendData();
        return true;
      } catch {
        console.warn("Transaction failed", e);
        return false;
      }
    }
  };

  const submitReconciliation = async ({ medId, expectedQty, actualQty, user, remarks }) => {
    try {
      await medicinesAPI.reconcile({ medId, expectedQty: Number(expectedQty), actualQty: Number(actualQty), user, remarks });
      await fetchBackendData();
      return true;
    } catch (e) {
      try {
        await inventoryAPI.reconcile({ medId, expectedQty: Number(expectedQty), actualQty: Number(actualQty), user, remarks });
        await fetchBackendData();
        return true;
      } catch {
        console.warn("Reconciliation failed", e);
        return false;
      }
    }
  };

  const resolveAlert = async (alertId, resolutionNotes, user) => {
    try {
      await medicinesAPI.resolveAlert(alertId, { resolutionNotes, user });
      await fetchBackendData();
      return true;
    } catch (e) {
      try {
        await inventoryAPI.resolveAlert(alertId, { resolutionNotes, user });
        await fetchBackendData();
        return true;
      } catch {
        console.warn("Alert resolution failed", e);
        return false;
      }
    }
  };

  const [aiScoreData, setAiScoreData] = useState(null);
  const [aiWaitData, setAiWaitData] = useState(null);
  const [aiDemandData, setAiDemandData] = useState(null);
  const [isScoreLoading, setIsScoreLoading] = useState(false);
  const [isWaitLoading, setIsWaitLoading] = useState(false);

  const loadDemoMedicines = () => {
    setInternalMedicines(defaultInternalMedicines);
    localStorage.setItem('phc_internal_medicines', JSON.stringify(defaultInternalMedicines));
  };

  useEffect(() => {
    localStorage.setItem('phc_internal_medicines', JSON.stringify(internalMedicines));
  }, [internalMedicines]);

  useEffect(() => {
    localStorage.setItem('phc_teleopd_bookings', JSON.stringify(teleopdBookings));
  }, [teleopdBookings]);

  useEffect(() => {
    localStorage.setItem('phc_sop_completions', JSON.stringify(sopCompletions));
  }, [sopCompletions]);

  useEffect(() => {
    localStorage.setItem('phc_awareness_cards', JSON.stringify(awarenessCards));
  }, [awarenessCards]);

  useEffect(() => {
    const publicMedicines = {};
    internalMedicines.catalog.forEach((med, index) => {
      let status = "In Stock";
      if (med.currentStock === 0) status = "Out of Stock";
      else if (med.currentStock <= med.reorderLevel) status = "Low";

      const pubId = "med" + (index + 1);
      publicMedicines[pubId] = { name: med.name, status, rawStock: med.currentStock };
    });

    if (Object.keys(publicMedicines).length > 0) {
      const newData = { ...phcData, medicines: publicMedicines };
      setPhcData(newData);
      localStorage.setItem('phc_data', JSON.stringify(newData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalMedicines.catalog]);

  // AI Debounced Fetch
  useEffect(() => {
    setIsScoreLoading(true);
    setIsWaitLoading(true);
    const timer = setTimeout(() => {
      fetchAIScore();
      fetchAIWait();
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phcData.queue, phcData.doctors, phcData.medicines, phcData.emergency, phcData.symptoms]);

  const computeReadinessBreakdown = (data) => {
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const queue = Number(data?.queue || 0);

    let queueScore = 40;
    if (queue > 5) queueScore = 40 - (queue - 5) * 1.5;
    queueScore = Math.round(clamp(queueScore, 0, 40));

    const docs = Object.values(data?.doctors || {});
    const totalDocs = docs.length || 1;
    const docW = { Available: 1, Busy: 0.8, Break: 0.5, Absent: 0 };
    const docSum = docs.reduce((acc, d) => acc + (docW[d?.status] ?? 0.7), 0);
    const doctorScore = Math.round(clamp((docSum / totalDocs) * 30, 0, 30));

    const meds = Object.values(data?.medicines || {});
    const totalMeds = meds.length || 1;
    const medW = { "In Stock": 1, Low: 0.5, "Out of Stock": 0 };
    const medSum = meds.reduce((acc, m) => acc + (medW[m?.status] ?? 0.6), 0);
    const medicineScore = Math.round(clamp((medSum / totalMeds) * 20, 0, 20));

    const alertsCount = (data?.alerts || []).length;
    let alertScore = 10;
    alertScore -= Math.min(4, alertsCount * 2);
    if (data?.emergency) alertScore -= 6;
    alertScore = Math.round(clamp(alertScore, 0, 10));

    const total = clamp(queueScore + doctorScore + medicineScore + alertScore, 0, 100);

    return {
      total,
      parts: {
        queue: { score: queueScore, max: 40 },
        doctors: { score: doctorScore, max: 30 },
        medicines: { score: medicineScore, max: 20 },
        alerts: { score: alertScore, max: 10 }
      }
    };
  };

  const fetchAIScore = async () => {
    setIsScoreLoading(true);
    const breakdown = computeReadinessBreakdown(phcData);
    const score = breakdown.total;
    let grade = "Optimal";
    if (score < 75) grade = "Moderate";
    if (score < 50) grade = "Critical";

    const absentCount = Object.values(phcData.doctors || {}).filter(d => d.status === "Absent").length;
    let insight = "Operations look stable.";
    if (phcData.emergency) insight = "Emergency mode is active. Expect delays in regular OPD.";
    else if (phcData.queue > 25) insight = "High queue load. Wait time is likely higher than usual.";
    else if (absentCount > 0) insight = "Staff availability is reduced. Service speed may slow down.";

    setAiScoreData({
      score, grade, breakdown,
      note: "Decision support based on live operational inputs (not diagnosis).",
      keyFactors: ["Queue", "Doctors", "Medicines", "Alerts/Emergency"],
      aiInsight: insight
    });
    setIsScoreLoading(false);
  };

  const fetchAIWait = async () => {
    setIsWaitLoading(true);
    try {
      const waitRes = await insightsAPI.getWaitTime();
      setAiWaitData({
        ...waitRes,
        confidence: 0.88,
        reasoning: "Estimated using queue size, active doctors, and operational demand patterns."
      });

      const demandRes = await insightsAPI.getDemand();
      setAiDemandData(demandRes);
    } catch {
      // Fallback if backend is down
      const availableDocs = Object.values(phcData.doctors || {}).filter(d => d.status === "Available" || d.status === "Busy").length || 1;
      let waitTime = Math.round((phcData.queue * 5) / availableDocs);
      if (phcData.emergency) waitTime += 15;
      
      setAiWaitData({
        estimatedWaitMinutes: waitTime,
        predictedWaitMinutes: Math.round(waitTime * 1.1),
        confidenceRange: "±" + Math.max(2, Math.round(waitTime * 0.1)) + " min",
        confidence: 0.88,
        reasoning: "Estimated wait based on queue size and currently active doctors.",
        peakWarning: false,
        bestTimeToVisit: "Anytime",
        bestArrivalWindow: "Anytime",
        forecastHorizonMinutes: 60,
        assumptions: {
          queueCount: phcData.queue || 0,
          activeDoctors: availableDocs,
          averageConsultationMinutes: 6,
          emergencyPriority: Boolean(phcData.emergency)
        }
      });

      setAiDemandData({
        trend: "Stable", color: "var(--success)", msg: "Current patient traffic is manageable.",
        bars: [4, 5, 8, 10, 9, 6, 4, 3, 5, 7, 9, 6], hour: new Date().getHours(),
        outlook: [
          { hour: "10:00", expectedLoad: "Moderate", insight: "Moderate increase expected in the next hour." },
          { hour: "11:00", expectedLoad: "High", insight: "Peak traffic likely this morning." },
          { hour: "12:00", expectedLoad: "Moderate", insight: "Expected to remain stable in this window." },
          { hour: "13:00", expectedLoad: "Low", insight: "Load expected to ease gradually." }
        ]
      });
    }
    setIsWaitLoading(false);
  };

  const login = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('phc_role', selectedRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('phc_role');
  };

  const createTeleopdBooking = ({ category, slot, phone }) => {
    const id = "TLP-" + Date.now().toString().slice(-6);
    const booking = { id, phcId: "PHC_001", category: category || "General", slot: slot || "Anytime", phone: phone || "", status: "Booked", createdAt: new Date().toISOString() };
    setTeleopdBookings(prev => [booking, ...prev]);
    return booking;
  };

  const toggleSopCompletion = (roleName, sopId) => {
    const roleKey = roleName || "Nurse";
    setSopCompletions(prev => {
      const roleMap = prev[roleKey] || {};
      const nextRoleMap = { ...roleMap };
      if (nextRoleMap[sopId]) delete nextRoleMap[sopId];
      else nextRoleMap[sopId] = new Date().toISOString();
      return { ...prev, [roleKey]: nextRoleMap };
    });
  };

  const isSopCompleted = (roleName, sopId) => Boolean(sopCompletions?.[roleName || "Nurse"]?.[sopId]);

  const addAwarenessCard = ({ icon, title, text }) => {
    const newCard = { id: "aw-" + Date.now().toString().slice(-6), icon: (icon || "📢").trim(), title: (title || "Awareness").trim(), text: (text || "").trim(), active: true };
    setAwarenessCards(prev => [newCard, ...prev]);
  };

  const toggleAwarenessCard = (id) => setAwarenessCards(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const deleteAwarenessCard = (id) => setAwarenessCards(prev => prev.filter(c => c.id !== id));

  const getReadinessScore = () => aiScoreData?.score || 70;
  const getWaitTime = () => aiWaitData?.estimatedWaitMinutes || 20;

  return (
    <PHCContext.Provider value={{
      role, login, logout,
      phcData, updatePhcData,
      teleopdBookings, createTeleopdBooking,
      sopCompletions, toggleSopCompletion, isSopCompleted,
      awarenessCards, addAwarenessCard, toggleAwarenessCard, deleteAwarenessCard,
      internalMedicines, setInternalMedicines, loadDemoMedicines,
      getAvailableStock, addStockInwardEntry, addIssueEntry, submitReconciliation, resolveAlert,
      getReadinessScore, getWaitTime,
      aiScoreData, aiWaitData, aiDemandData, isScoreLoading, isWaitLoading, fetchBackendData
    }}>
      {children}
    </PHCContext.Provider>
  );
};
