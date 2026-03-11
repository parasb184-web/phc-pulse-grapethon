const { getDB } = require('../database');
const { makeId } = require('../utils/id');

const PHC_ID = 'phc_1';

async function getStatus() {
  const db = getDB();
  const row = await db.get('SELECT data FROM phc_status WHERE id = ?', [PHC_ID]);
  if (!row || !row.data) return null;
  return JSON.parse(row.data);
}

async function logAudit(action, entityType, entityId, details, actor = 'system') {
  const db = getDB();
  await db.run(
    'INSERT INTO audit_trail (id, action, entityType, entityId, actor, details) VALUES (?, ?, ?, ?, ?, ?)',
    [makeId('AUD'), action, entityType, entityId, actor, JSON.stringify(details || {})]
  );
}

async function updateStatus(patch, actor = 'staff') {
  const db = getDB();
  const current = await getStatus();
  if (!current) return null;

  const updated = {
    ...current,
    ...patch,
    lastUpdated: new Date().toISOString()
  };

  await db.run(
    'UPDATE phc_status SET data = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(updated), PHC_ID]
  );

  await logAudit('PHC_STATUS_UPDATED', 'PHC_STATUS', PHC_ID, { patch }, actor);
  return updated;
}

module.exports = {
  getStatus,
  updateStatus
};
