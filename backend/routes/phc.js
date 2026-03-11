const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const phcService = require('../services/phcService');

router.get('/status', async (req, res) => {
  try {
    const data = await phcService.getStatus();
    if (data) {
      // Keep legacy shape for existing frontend compatibility.
      res.json(data);
    } else {
      res.status(404).json({ error: "PHC not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/status', async (req, res) => {
  try {
    const actor = req.body?.actor || req.body?.user || 'staff';
    const updatedData = await phcService.updateStatus(req.body || {}, actor);
    if (updatedData) {
      // Keep legacy patch response shape for existing frontend compatibility.
      res.json({ success: true, data: updatedData });
    } else {
      res.status(404).json({ error: "PHC not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/status/update', async (req, res) => {
  try {
    const actor = req.body?.actor || req.body?.user || 'staff';
    const patch = req.body?.patch || req.body || {};
    const updatedData = await phcService.updateStatus(patch, actor);
    if (!updatedData) {
      return res.status(404).json(error('PHC not found', 'NOT_FOUND'));
    }
    res.json(success(updatedData, 'PHC status updated'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
