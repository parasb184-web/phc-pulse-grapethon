const express = require('express');
const router = express.Router();
const medicineService = require('../services/medicineService');

router.get('/', async (req, res) => {
  try {
    const dashboard = await medicineService.getInventoryDashboard();
    res.json({
      catalog: dashboard.catalog,
      transactions: dashboard.transactions,
      alerts: dashboard.alerts,
      reconciliations: dashboard.reconciliations,
      auditTrail: dashboard.auditTrail
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transaction', async (req, res) => {
  try {
    const { medId, type, qty, source, patientRef, user, remarks } = req.body;
    let result;
    if (type === 'IN') {
      result = await medicineService.recordInward({ medId, qty, source, user, remarks });
    } else if (type === 'OUT') {
      result = await medicineService.recordIssue({ medId, qty, patientRef, user, remarks });
    } else {
      return res.status(400).json({ error: "type must be either 'IN' or 'OUT'" });
    }

    res.json({ success: true, transactionId: result.transactionId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reconcile', async (req, res) => {
  try {
    const { medId, expectedQty, actualQty, user, remarks } = req.body;
    const result = await medicineService.reconcileStock({ medId, expectedQty, actualQty, user, remarks });
    res.json({ success: true, reconciliationId: result.reconciliationId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, user } = req.body;

    await medicineService.resolveAlert(id, { resolutionNotes, user });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
