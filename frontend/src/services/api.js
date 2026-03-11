const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchHelper(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}`, error);
    throw error;
  }
}

function unwrapApiData(payload) {
  if (payload && typeof payload === 'object' && payload.success === true && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

export const phcAPI = {
  getStatus: () => fetchHelper('/phc/status'),
  updateStatus: (data) => fetchHelper('/phc/status', {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};

export const insightsAPI = {
  getDemand: () => fetchHelper('/insights/demand'),
  getWaitTime: () => fetchHelper('/insights/wait-time'),
  getNearbyComparison: () => fetchHelper('/insights/nearby-comparison'),
};

export const inventoryAPI = {
  getStatus: () => fetchHelper('/inventory'),
  recordTransaction: (data) => fetchHelper('/inventory/transaction', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  reconcile: (data) => fetchHelper('/inventory/reconcile', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  resolveAlert: (id, data) => fetchHelper(`/inventory/alerts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};

export const alertsAPI = {
  registerToken: (data) => fetchHelper('/alerts/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getTokenAlerts: () => fetchHelper('/alerts/token-alerts'),
  getEpidemicSignals: () => fetchHelper('/alerts/epidemic-signals')
};

export const medicinesAPI = {
  getDashboard: async () => unwrapApiData(await fetchHelper('/medicines')),
  getAlerts: async () => unwrapApiData(await fetchHelper('/medicines/alerts')),
  getReconciliation: async () => unwrapApiData(await fetchHelper('/medicines/reconciliation')),
  getAuditTrail: async () => unwrapApiData(await fetchHelper('/medicines/audit-trail')),
  inward: async (data) => unwrapApiData(await fetchHelper('/medicines/inward', {
    method: 'POST',
    body: JSON.stringify(data)
  })),
  issue: async (data) => unwrapApiData(await fetchHelper('/medicines/issue', {
    method: 'POST',
    body: JSON.stringify(data)
  })),
  reconcile: async (data) => unwrapApiData(await fetchHelper('/medicines/reconciliation', {
    method: 'POST',
    body: JSON.stringify(data)
  })),
  resolveAlert: async (id, data) => unwrapApiData(await fetchHelper(`/medicines/alerts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }))
};
