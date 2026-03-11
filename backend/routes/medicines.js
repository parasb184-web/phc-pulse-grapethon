const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const medicineService = require('../services/medicineService');

router.get('/', async (req, res) => {
  try {
    const data = await medicineService.getInventoryDashboard();
    res.json(success(data, 'Medicine dashboard fetched'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const includeResolved = req.query.includeResolved !== 'false';
    const limit = req.query.limit;
    const alerts = await medicineService.getAlerts({ includeResolved, limit });
    res.json(success(alerts, 'Medicine alerts fetched'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/reconciliation', async (req, res) => {
  try {
    const reconciliations = await medicineService.getReconciliations({ limit: req.query.limit });
    res.json(success(reconciliations, 'Reconciliation records fetched'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/audit-trail', async (req, res) => {
  try {
    const auditTrail = await medicineService.getAuditTrail({ limit: req.query.limit });
    res.json(success(auditTrail, 'Audit trail fetched'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/inward', async (req, res) => {
  try {
    const result = await medicineService.recordInward(req.body || {});
    res.status(201).json(success(result, 'Stock inward recorded'));
  } catch (err) {
    res.status(400).json(error(err.message, 'INVALID_INWARD_PAYLOAD'));
  }
});

router.post('/issue', async (req, res) => {
  try {
    const result = await medicineService.recordIssue(req.body || {});
    res.status(201).json(success(result, 'Medicine issue recorded'));
  } catch (err) {
    res.status(400).json(error(err.message, 'INVALID_ISSUE_PAYLOAD'));
  }
});

router.post('/reconciliation', async (req, res) => {
  try {
    const result = await medicineService.reconcileStock(req.body || {});
    res.status(201).json(success(result, 'Reconciliation recorded'));
  } catch (err) {
    res.status(400).json(error(err.message, 'INVALID_RECONCILIATION_PAYLOAD'));
  }
});

router.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const result = await medicineService.resolveAlert(req.params.id, req.body || {});
    res.json(success(result, 'Alert resolved'));
  } catch (err) {
    const status = err.message === 'Alert not found' ? 404 : 400;
    const code = err.message === 'Alert not found' ? 'NOT_FOUND' : 'INVALID_ALERT_RESOLUTION';
    res.status(status).json(error(err.message, code));
  }
});

module.exports = router;
