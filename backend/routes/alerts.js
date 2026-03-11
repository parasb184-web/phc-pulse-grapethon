const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

function normalizeTrigger(triggerType) {
  if (!triggerType) return '3_ahead';
  const clean = String(triggerType).trim().toLowerCase();
  if (clean === 'next' || clean === 'when_near' || clean === 'near_turn') return 'near_turn';
  return '3_ahead';
}

function triggerLabel(triggerType) {
  return triggerType === 'near_turn' ? 'Alert when my turn is near' : 'Alert when 3 patients remain';
}

// 5. Token Alert Registration (SMS-ready prototype)
router.post('/register', async (req, res) => {
  try {
    const db = getDB();
    const { phone, triggerType } = req.body;

    const cleanedPhone = String(phone || '').replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number for queue alert registration.'
      });
    }

    const normalizedTrigger = normalizeTrigger(triggerType);
    // In production this would enqueue SMS/WhatsApp jobs; prototype stores registration intent only.
    const id = "TOK-" + Date.now().toString().slice(-6);

    await db.run(
      'INSERT INTO token_alerts (id, phone, triggerType, status) VALUES (?, ?, ?, ?)',
      [id, cleanedPhone, normalizedTrigger, 'registered']
    );

    res.json({
      success: true,
      message: "Queue notification request captured.",
      alertId: id,
      triggerType: normalizedTrigger,
      triggerLabel: triggerLabel(normalizedTrigger),
      status: 'notification-ready prototype',
      note: 'Delivery gateway integration (SMS/WhatsApp) can be attached in the next phase.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/token-alerts', async (req, res) => {
  try {
    const db = getDB();
    const alerts = await db.all('SELECT * FROM token_alerts ORDER BY date DESC');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Epidemic Early Warning Signal
router.get('/epidemic-signals', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get('SELECT data FROM phc_status WHERE id = ?', ['phc_1']);
    const phcData = row && row.data ? JSON.parse(row.data) : { symptoms: {} };

    const signals = [];
    const symptoms = phcData.symptoms || {};

    // Lightweight rule-based signal:
    // flag symptoms when current count exceeds baseline by ratio + absolute floor.
    Object.keys(symptoms).forEach(key => {
      const s = symptoms[key];
      const currentCount = Number(s.count || 0);
      const baseline = Number(s.avg || 0);
      if (!baseline || !currentCount) return;

      const ratio = currentCount / baseline;
      if (currentCount >= Math.max(6, Math.ceil(baseline * 1.5))) {
        const severe = currentCount >= Math.max(10, Math.ceil(baseline * 2.1));
        const isFever = key === 'fever' || String(s.name || '').toLowerCase().includes('fever');
        const message = severe
          ? (isFever
            ? 'Fever cluster alert detected in recent entries.'
            : `Possible ${String(s.name || key).toLowerCase()} cluster signal under review.`)
          : 'Unusual symptom trend observed.';

        signals.push({
          id: `SIG-${key}-${Date.now()}`,
          type: key,
          name: s.name,
          level: severe ? 'High Risk' : 'Watchlist',
          currentCount,
          baseline,
          ratio: Number(ratio.toFixed(2)),
          message,
          timestamp: new Date().toISOString()
        });
      }
    });

    const hasMultiSymptomCluster = signals.length >= 2;
    const hasHighRisk = signals.some((s) => s.level === 'High Risk');
    const overallStatus = hasHighRisk || hasMultiSymptomCluster ? 'Review Recommended' : 'Stable';
    const summary = hasHighRisk || hasMultiSymptomCluster
      ? 'Possible outbreak signal under review.'
      : 'No significant outbreak-style signal from current symptom entries.';

    res.json({
      success: true,
      activeSignals: signals,
      signals, // compatibility for older UI paths
      overallStatus,
      summary,
      generatedAt: new Date().toISOString(),
      logicNote: 'Rule-based early warning from symptom spikes vs baseline averages.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
