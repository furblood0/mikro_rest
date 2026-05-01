const API_BASE = '';

export const menuApi = {
  getAll: () => fetch(`${API_BASE}/menu/api/menu-items`).then(r => r.json()),
  getAvailable: () => fetch(`${API_BASE}/menu/api/menu-items/available`).then(r => r.json()),
  getById: (id) => fetch(`${API_BASE}/menu/api/menu-items/${id}`).then(r => r.json()),
  getByCategory: (cat) => fetch(`${API_BASE}/menu/api/menu-items/category/${cat}`).then(r => r.json()),
  search: (name) => fetch(`${API_BASE}/menu/api/menu-items/search?name=${encodeURIComponent(name)}`).then(r => r.json()),
  create: (item) => fetch(`${API_BASE}/menu/api/menu-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then(r => r.json()),
  update: (id, item) => fetch(`${API_BASE}/menu/api/menu-items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then(r => r.json()),
  delete: (id) => fetch(`${API_BASE}/menu/api/menu-items/${id}`, { method: 'DELETE' }),
  toggleAvailability: (id) => fetch(`${API_BASE}/menu/api/menu-items/${id}/toggle-availability`, { method: 'PATCH' }).then(r => r.json()),
};

export const orderApi = {
  getAll: () => fetch(`${API_BASE}/order/api/orders`).then(r => r.json()),
  getById: (id) => fetch(`${API_BASE}/order/api/orders/${id}`).then(r => r.json()),
  getByStatus: (status) => fetch(`${API_BASE}/order/api/orders/status/${status}`).then(r => r.json()),
  getByTable: (table) => fetch(`${API_BASE}/order/api/orders/table/${table}`).then(r => r.json()),
  create: (order) => fetch(`${API_BASE}/order/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }).then(r => r.json()),
  updateStatus: (id, status) => fetch(`${API_BASE}/order/api/orders/${id}/status?status=${status}`, { method: 'PUT' }).then(r => r.json()),
  cancel: (id) => fetch(`${API_BASE}/order/api/orders/${id}/cancel`, { method: 'PUT' }),
};

export const kitchenApi = {
  getAll: () => fetch(`${API_BASE}/kitchen/api/kitchen-orders`).then(r => r.json()),
  getByOrderId: (orderId) => fetch(`${API_BASE}/kitchen/api/kitchen-orders/${orderId}`).then(r => r.json()),
  getByStatus: (status) => fetch(`${API_BASE}/kitchen/api/kitchen-orders/status/${status}`).then(r => r.json()),
  receive: (data) => fetch(`${API_BASE}/kitchen/api/kitchen-orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  updateStatus: (orderId, status) => fetch(`${API_BASE}/kitchen/api/kitchen-orders/${orderId}/status?status=${status}`, { method: 'PUT' }).then(r => r.json()),
  addNotes: (orderId, notes) => fetch(`${API_BASE}/kitchen/api/kitchen-orders/${orderId}/notes`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) }).then(r => r.json()),
};
