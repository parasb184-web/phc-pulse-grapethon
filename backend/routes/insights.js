const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

const CLINIC_OPEN_HOUR = 8;
const CLINIC_CLOSE_HOUR = 19;
const CONSULT_MINUTES = 6;

function getHourBaseDemand(hour) {
  if (hour < CLINIC_OPEN_HOUR || hour > CLINIC_CLOSE_HOUR) return 2;
  if (hour >= 9 && hour <= 11) return 10;
  if (hour >= 12 && hour <= 13) return 9;
  if (hour >= 17 && hour <= 19) return 8;
  if (hour >= 14 && hour <= 16) return 6;
  return 5;
}

function demandBand(score) {
  if (score >= 11) return 'Very High';
  if (score >= 8) return 'High';
  if (score >= 6) return 'Moderate';
  return 'Low';
}

function demandColor(band) {
  if (band === 'Very High' || band === 'High') return 'var(--error)';
  if (band === 'Moderate') return 'var(--warning)';
  return 'var(--success)';
}

function buildDemandScore(hour, queueCount, activeDoctors) {
  const base = getHourBaseDemand(hour);
  const queuePressure = Math.min(5, Math.round((queueCount || 0) / 8));
  const doctorPressure = activeDoctors <= 1 ? 3 : activeDoctors === 2 ? 2 : 1;
  return Math.max(2, Math.min(14, base + queuePressure + doctorPressure - 2));
}

function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function trendFromPair(current, next) {
  const delta = next - current;
  if (delta >= 2) return 'Increasing';
  if (delta <= -2) return 'Decreasing';
  if (current >= 11) return 'Peaking';
  return 'Stable';
}

function getOutlookInsight(currentBand, nextBand, index) {
  if (index === 0 && (nextBand === 'High' || nextBand === 'Very High')) {
    return 'Moderate increase expected in the next hour.';
  }
  if (index <= 1 && nextBand === 'Very High') {
    return 'Peak traffic likely this morning.';
  }
  if (index >= 2 && (nextBand === 'High' || nextBand === 'Very High')) {
    return 'Evening rush risk rising.';
  }
  if (currentBand === nextBand) {
    return 'Expected to remain stable in this window.';
  }
  return nextBand === 'Low' ? 'Load expected to ease gradually.' : 'Steady pressure expected; keep counters ready.';
}

function estimateWaitMinutes({ queueCount, activeDoctors, emergency, hour }) {
  const consultLoad = (queueCount * CONSULT_MINUTES) / Math.max(1, activeDoctors);
  const hourDemandBoost = getHourBaseDemand(hour) >= 9 ? 1.18 : getHourBaseDemand(hour) >= 7 ? 1.08 : 1;
  const emergencyBoost = emergency ? 1.25 : 1;
  return Math.max(2, Math.round(consultLoad * hourDemandBoost * emergencyBoost));
}

function findBestArrivalWindow(queueCount, activeDoctors, emergency, currentHour) {
  if (currentHour > CLINIC_CLOSE_HOUR) return `${hourLabel(CLINIC_OPEN_HOUR)} - ${hourLabel(CLINIC_OPEN_HOUR + 1)}`;
  const startHour = Math.max(CLINIC_OPEN_HOUR, currentHour);
  const windows = [];
  for (let hour = startHour; hour <= Math.min(CLINIC_CLOSE_HOUR, startHour + 5); hour += 1) {
    const projectionQueue = Math.max(1, queueCount - (hour - startHour) * Math.max(2, activeDoctors) + Math.round(getHourBaseDemand(hour) / 2));
    const wait = estimateWaitMinutes({ queueCount: projectionQueue, activeDoctors, emergency, hour });
    windows.push({ hour, wait });
  }
  const best = windows.reduce((min, item) => (item.wait < min.wait ? item : min), windows[0]);
  const start = best.hour;
  const end = Math.min(best.hour + 1, 23);
  return `${hourLabel(start)} - ${hourLabel(end)}`;
}

function classifyMedicineAvailability(medicines = {}) {
  const meds = Object.values(medicines || {});
  if (!meds.length) return 'Moderate';
  const inStock = meds.filter((m) => m.status === 'In Stock').length;
  const ratio = inStock / meds.length;
  if (ratio >= 0.75) return 'Good';
  if (ratio >= 0.45) return 'Moderate';
  return 'Limited';
}

function readinessLabel(waitTime, doctorsAvailable, medicineAvailability) {
  let score = 100;
  score -= Math.min(45, waitTime);
  score += Math.min(10, doctorsAvailable * 2);
  if (medicineAvailability === 'Moderate') score -= 8;
  if (medicineAvailability === 'Limited') score -= 16;
  if (score >= 75) return 'Optimal';
  if (score >= 55) return 'Moderate';
  return 'Stretched';
}

// 1. Demand Prediction Engine
router.get('/demand', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get('SELECT data FROM phc_status WHERE id = ?', ['phc_1']);
    const phcData = row && row.data ? JSON.parse(row.data) : { queue: 0, doctors: {} };

    const queueCount = Number(phcData.queue || 0);
    const activeDoctors = Object.values(phcData.doctors || {}).filter(
      (d) => d.status === 'Available' || d.status === 'Busy'
    ).length || 1;
    const hour = new Date().getHours();

    const bars = [];
    for (let h = CLINIC_OPEN_HOUR; h <= CLINIC_CLOSE_HOUR; h += 1) {
      bars.push(buildDemandScore(h, queueCount, activeDoctors));
    }

    const currentIdx = Math.max(0, Math.min(bars.length - 1, hour - CLINIC_OPEN_HOUR));
    const currentScore = bars[currentIdx];
    const nextScore = bars[Math.min(currentIdx + 1, bars.length - 1)];
    const currentBand = demandBand(currentScore);
    const trend = trendFromPair(currentScore, nextScore);
    const color = demandColor(currentBand);

    let msg = 'Operational load remains manageable in this block.';
    if (currentBand === 'Very High') msg = 'High operational pressure likely. Queue discipline and triage focus recommended.';
    else if (currentBand === 'High') msg = 'Heavy patient flow expected. Moderate delays may persist.';
    else if (currentBand === 'Moderate') msg = 'Moderate increase expected in outpatient demand.';

    const outlook = [];
    for (let step = 1; step <= 4; step += 1) {
      const idx = Math.min(currentIdx + step, bars.length - 1);
      const band = demandBand(bars[idx]);
      outlook.push({
        hour: hourLabel(CLINIC_OPEN_HOUR + idx),
        expectedLoad: band,
        insight: getOutlookInsight(currentBand, band, step - 1)
      });
    }

    res.json({ trend, color, msg, bars, hour, outlook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Predictive Queue Forecasting
router.get('/wait-time', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get('SELECT data FROM phc_status WHERE id = ?', ['phc_1']);
    const phcData = row && row.data ? JSON.parse(row.data) : { queue: 0, doctors: {}, emergency: false };

    const queueCount = Number(phcData.queue || 0);
    const availableDocs = Object.values(phcData.doctors || {}).filter(
      (d) => d.status === 'Available' || d.status === 'Busy'
    ).length || 1;
    const hour = new Date().getHours();
    const emergency = Boolean(phcData.emergency);

    const estimatedWaitMinutes = estimateWaitMinutes({
      queueCount,
      activeDoctors: availableDocs,
      emergency,
      hour
    });

    const nextHour = Math.min(hour + 1, 23);
    const demandDelta = getHourBaseDemand(nextHour) - getHourBaseDemand(hour);
    const projectedQueue = Math.max(0, queueCount + demandDelta * 2 - Math.round(availableDocs * 1.5));
    const predictedWaitMinutes = estimateWaitMinutes({
      queueCount: projectedQueue,
      activeDoctors: availableDocs,
      emergency,
      hour: nextHour
    });

    const peakWarning = estimatedWaitMinutes >= 35 || predictedWaitMinutes >= 40;
    const bestArrivalWindow = findBestArrivalWindow(queueCount, availableDocs, emergency, hour);

    res.json({
      estimatedWaitMinutes,
      predictedWaitMinutes,
      confidenceRange: "±" + Math.max(2, Math.round(estimatedWaitMinutes * 0.12)) + " min",
      peakWarning,
      bestTimeToVisit: bestArrivalWindow,
      bestArrivalWindow,
      forecastHorizonMinutes: 60,
      assumptions: {
        activeDoctors: availableDocs,
        queueCount,
        averageConsultationMinutes: CONSULT_MINUTES,
        emergencyPriority: emergency
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Nearby PHC comparison (lightweight prototype)
router.get('/nearby-comparison', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get('SELECT data FROM phc_status WHERE id = ?', ['phc_1']);
    const phcData = row && row.data ? JSON.parse(row.data) : { phcName: 'Current PHC', queue: 0, doctors: {}, medicines: {}, emergency: false };

    const currentDoctors = Object.values(phcData.doctors || {}).filter(
      (d) => d.status === 'Available' || d.status === 'Busy'
    ).length || 1;
    const currentWait = estimateWaitMinutes({
      queueCount: Number(phcData.queue || 0),
      activeDoctors: currentDoctors,
      emergency: Boolean(phcData.emergency),
      hour: new Date().getHours()
    });
    const currentMedicineAvailability = classifyMedicineAvailability(phcData.medicines);
    const currentReadiness = readinessLabel(currentWait, currentDoctors, currentMedicineAvailability);

    const options = [
      {
        id: 'ALT-1',
        name: 'Sadar PHC',
        distanceKm: 2.1,
        waitTimeMinutes: Math.max(6, Math.round(currentWait * 0.7)),
        doctorsAvailable: Math.max(2, currentDoctors + 1),
        medicineStatus: 'Good'
      },
      {
        id: 'ALT-2',
        name: 'Community Health Centre',
        distanceKm: 3.8,
        waitTimeMinutes: Math.max(8, Math.round(currentWait * 0.85)),
        doctorsAvailable: Math.max(2, currentDoctors),
        medicineStatus: 'Moderate'
      },
      {
        id: 'ALT-3',
        name: 'District Hospital OPD',
        distanceKm: 5.6,
        waitTimeMinutes: Math.max(10, Math.round(currentWait * 0.95)),
        doctorsAvailable: Math.max(3, currentDoctors + 2),
        medicineStatus: 'Good'
      }
    ].map((item) => ({
      ...item,
      readiness: readinessLabel(item.waitTimeMinutes, item.doctorsAvailable, item.medicineStatus)
    }));

    const best = options.reduce((min, item) => (item.waitTimeMinutes < min.waitTimeMinutes ? item : min), options[0]);
    const recommendation = best.waitTimeMinutes + 8 < currentWait
      ? `Visit ${best.name} instead - slightly farther, significantly less waiting.`
      : 'Current PHC remains a reasonable option based on current queue conditions.';

    res.json({
      generatedAt: new Date().toISOString(),
      prototype: true,
      note: 'Prototype comparison panel using current operational data with deterministic nearby assumptions.',
      currentPhc: {
        name: phcData.phcName || 'Current PHC',
        waitTimeMinutes: currentWait,
        doctorsAvailable: currentDoctors,
        medicineStatus: currentMedicineAvailability,
        readiness: currentReadiness
      },
      options,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
