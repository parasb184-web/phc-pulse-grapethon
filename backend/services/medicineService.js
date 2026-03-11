const { getDB } = require('../database');
const { makeId } = require('../utils/id');

async function logAudit(action, entityType, entityId, details, actor = 'system') {
  const db = getDB();
  await db.run(
    'INSERT INTO audit_trail (id, action, entityType, entityId, actor, details) VALUES (?, ?, ?, ?, ?, ?)',
    [makeId('AUD'), action, entityType, entityId, actor, JSON.stringify(details || {})]
  );
}

async function computeInventoryStatus(db) {
  const catalog = await db.all('SELECT * FROM medicines_catalog');
  const transactions = await db.all('SELECT * FROM medicine_transactions ORDER BY date DESC');

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return catalog.map((med) => {
    let currentStock = med.stock;
    let recentIssueQty = 0;

    transactions.forEach((t) => {
      if (t.medId !== med.id) return;
      if (t.type === 'IN') currentStock += t.qty;
      if (t.type === 'OUT') {
        currentStock -= t.qty;
        const txnDate = new Date(t.date);
        if (txnDate >= oneWeekAgo) recentIssueQty += t.qty;
      }
    });

    currentStock = Math.max(0, currentStock);
    const dailyBurnRate = recentIssueQty > 0 ? (recentIssueQty / 7) : 10;
    const estimatedDepletionDays = Number((currentStock / dailyBurnRate).toFixed(1));

    let riskBand = 'Stable';
    if (currentStock === 0) riskBand = 'Out of Stock';
    else if (estimatedDepletionDays <= 2) riskBand = 'High Risk';
    else if (estimatedDepletionDays <= 7 || currentStock <= med.reorderLevel) riskBand = 'Watchlist';

    return {
      ...med,
      currentStock,
      estimatedDepletionDays,
      riskBand,
      dailyBurnRate
    };
  });
}

async function getInventoryDashboard() {
  const db = getDB();
  const catalog = await computeInventoryStatus(db);
  const transactions = await db.all('SELECT * FROM medicine_transactions ORDER BY date DESC LIMIT 100');
  const alerts = await db.all('SELECT * FROM medicine_alerts ORDER BY date DESC LIMIT 100');
  const reconciliations = await db.all('SELECT * FROM reconciliation_records ORDER BY date DESC LIMIT 100');
  const auditTrail = await db.all('SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT 100');

  return {
    catalog,
    transactions,
    alerts,
    reconciliations,
    auditTrail
  };
}

async function ensureMedExists(db, medId) {
  const med = await db.get('SELECT id, name, reorderLevel, stock FROM medicines_catalog WHERE id = ?', [medId]);
  if (!med) throw new Error(`Unknown medicine id: ${medId}`);
  return med;
}

async function createAlertIfMissing(db, { medId, type, message }) {
  const existing = await db.get(
    'SELECT id FROM medicine_alerts WHERE medId = ? AND type = ? AND resolved = 0',
    [medId, type]
  );
  if (existing) return null;

  const alertId = makeId('ALR');
  await db.run(
    'INSERT INTO medicine_alerts (id, medId, type, message) VALUES (?, ?, ?, ?)',
    [alertId, medId, type, message]
  );
  return alertId;
}

async function maybeCreateStockAlerts(db, medId, qty) {
  const inventory = await computeInventoryStatus(db);
  const med = inventory.find((m) => m.id === medId);
  if (!med) return;

  const approxStockBeforeIssue = med.currentStock + qty;
  if (qty >= Math.max(15, Math.round(approxStockBeforeIssue * 0.35))) {
    await createAlertIfMissing(db, {
      medId,
      type: 'SUDDEN_DROP',
      message: `Anomaly detected: ${qty} units of ${med.name} moved in one issue event. Review needed.`
    });
  }

  const spikeThreshold = Math.max(20, Math.round(med.dailyBurnRate * 1.8));
  if (qty >= spikeThreshold) {
    await createAlertIfMissing(db, {
      medId,
      type: 'UNUSUAL_CONSUMPTION_SPIKE',
      message: `Unusual consumption spike for ${med.name}: issued ${qty} units vs expected daily burn near ${Math.round(med.dailyBurnRate)}.`
    });
  }

  if (med.currentStock === 0 && med.dailyBurnRate < 20) {
    await createAlertIfMissing(db, {
      medId,
      type: 'STOCK_OUT_PATTERN',
      message: `${med.name} reached stock-out despite weak issue history. Diversion risk indicator; review needed.`
    });
  }

  if (med.currentStock <= med.reorderLevel && med.currentStock > 0) {
    await createAlertIfMissing(db, {
      medId,
      type: 'LOW_STOCK',
      message: `${med.name} stock (${med.currentStock}) fell below reorder level (${med.reorderLevel}).`
    });
  }
}

async function recordInward({ medId, qty, source, user, remarks }) {
  const db = getDB();
  if (!medId || !qty || Number(qty) <= 0) throw new Error('medId and positive qty are required');
  const q = Number(qty);
  await ensureMedExists(db, medId);

  const id = makeId('TXN');
  await db.run(
    'INSERT INTO medicine_transactions (id, medId, type, qty, source, patientRef, user, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, medId, 'IN', q, source || null, null, user || 'staff', remarks || null]
  );

  await logAudit('MEDICINE_INWARD', 'MEDICINE_TRANSACTION', id, { medId, qty: q, source, remarks }, user || 'staff');
  return { transactionId: id };
}

async function recordIssue({ medId, qty, patientRef, user, remarks }) {
  const db = getDB();
  if (!medId || !qty || Number(qty) <= 0) throw new Error('medId and positive qty are required');
  const q = Number(qty);
  await ensureMedExists(db, medId);

  const currentInventory = await computeInventoryStatus(db);
  const med = currentInventory.find((m) => m.id === medId);
  if (!med || med.currentStock < q) throw new Error('Insufficient stock for issue transaction');

  const id = makeId('TXN');
  await db.run(
    'INSERT INTO medicine_transactions (id, medId, type, qty, source, patientRef, user, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, medId, 'OUT', q, null, patientRef || 'Walk-in OPD', user || 'staff', remarks || null]
  );

  await maybeCreateStockAlerts(db, medId, q);
  await logAudit('MEDICINE_ISSUE', 'MEDICINE_TRANSACTION', id, { medId, qty: q, patientRef, remarks }, user || 'staff');
  return { transactionId: id };
}

async function reconcileStock({ medId, expectedQty, actualQty, user, remarks }) {
  const db = getDB();
  if (!medId || expectedQty === undefined || actualQty === undefined) {
    throw new Error('medId, expectedQty and actualQty are required');
  }

  const exp = Number(expectedQty);
  const actual = Number(actualQty);
  const discrepancy = actual - exp;
  await ensureMedExists(db, medId);

  const id = makeId('REC');
  await db.run(
    'INSERT INTO reconciliation_records (id, medId, expectedQty, actualQty, matched, remarks, user) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, medId, exp, actual, discrepancy === 0, remarks || null, user || 'auditor']
  );

  let adjustmentTransactionId = null;
  let alertId = null;

  if (discrepancy !== 0) {
    adjustmentTransactionId = makeId('TXN-ADJ');
    await db.run(
      'INSERT INTO medicine_transactions (id, medId, type, qty, source, patientRef, user, remarks, isAdjustment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        adjustmentTransactionId,
        medId,
        discrepancy > 0 ? 'IN' : 'OUT',
        Math.abs(discrepancy),
        'Reconciliation',
        'Reconciliation',
        user || 'auditor',
        `Adjustment from reconciliation. Expected: ${exp}, Actual: ${actual}`,
        true
      ]
    );

    const med = await db.get('SELECT name FROM medicines_catalog WHERE id = ?', [medId]);
    const medName = med ? med.name : medId;
    const alertMsg = discrepancy < 0
      ? `Suspicious mismatch detected for ${medName}: ${Math.abs(discrepancy)} units unaccounted for. Diversion risk indicator.`
      : `Anomaly detected for ${medName}: Found ${discrepancy} more units than expected. Manual adjustment logged.`;

    alertId = makeId('ALR');
    await db.run(
      'INSERT INTO medicine_alerts (id, medId, type, message) VALUES (?, ?, ?, ?)',
      [alertId, medId, 'MISMATCH', alertMsg]
    );

    const adjustmentActivity = await db.get(
      "SELECT COUNT(*) as count FROM medicine_transactions WHERE medId = ? AND isAdjustment = 1 AND date >= datetime('now', '-14 days')",
      [medId]
    );
    if ((adjustmentActivity?.count || 0) >= 3) {
      await createAlertIfMissing(db, {
        medId,
        type: 'TOO_MANY_ADJUSTMENTS',
        message: `${medName} has repeated stock adjustments in the last 14 days. Anomaly detected; review needed.`
      });
    }
  }

  await logAudit(
    'MEDICINE_RECONCILIATION',
    'RECONCILIATION_RECORD',
    id,
    { medId, expectedQty: exp, actualQty: actual, discrepancy, alertId, adjustmentTransactionId },
    user || 'auditor'
  );

  return { reconciliationId: id, adjustmentTransactionId, alertId };
}

async function resolveAlert(alertId, { resolutionNotes, user }) {
  const db = getDB();
  if (!alertId) throw new Error('alert id is required');
  if (!resolutionNotes || !String(resolutionNotes).trim()) throw new Error('resolutionNotes is required');

  const existing = await db.get('SELECT id FROM medicine_alerts WHERE id = ?', [alertId]);
  if (!existing) throw new Error('Alert not found');

  await db.run(
    'UPDATE medicine_alerts SET resolved = 1, resolutionNotes = ?, resolvedBy = ?, resolvedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [resolutionNotes, user || 'reviewer', alertId]
  );

  await logAudit('MEDICINE_ALERT_RESOLVED', 'MEDICINE_ALERT', alertId, { resolutionNotes }, user || 'reviewer');
  return { alertId };
}

async function getAlerts({ includeResolved = true, limit = 100 } = {}) {
  const db = getDB();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  if (includeResolved) {
    return db.all('SELECT * FROM medicine_alerts ORDER BY date DESC LIMIT ?', [safeLimit]);
  }
  return db.all('SELECT * FROM medicine_alerts WHERE resolved = 0 ORDER BY date DESC LIMIT ?', [safeLimit]);
}

async function getReconciliations({ limit = 100 } = {}) {
  const db = getDB();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return db.all('SELECT * FROM reconciliation_records ORDER BY date DESC LIMIT ?', [safeLimit]);
}

async function getAuditTrail({ limit = 100 } = {}) {
  const db = getDB();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return db.all('SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT ?', [safeLimit]);
}

module.exports = {
  getInventoryDashboard,
  recordInward,
  recordIssue,
  reconcileStock,
  resolveAlert,
  getAlerts,
  getReconciliations,
  getAuditTrail
};
