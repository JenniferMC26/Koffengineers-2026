/**
 * CLYRO — Admin API
 * Thin wrappers over the shared Axios instance.
 * JWT se inyecta automáticamente vía el interceptor de api.js.
 */
import api from '../../lib/api'

/* ── Stats ─────────────────────────────────────────────── */
export const getAdminStats = () =>
  api.get('/admin/stats').then(r => r.data)

/* ── Orders ─────────────────────────────────────────────── */
export const getAdminOrders = () =>
  api.get('/admin/orders').then(r => r.data)

export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data)

/* ── Products ───────────────────────────────────────────── */
export const getAdminProducts = () =>
  api.get('/admin/products').then(r => r.data)

export const createAdminProduct = (data) =>
  api.post('/admin/products', data).then(r => r.data)

export const updateAdminProduct = (id, data) =>
  api.put(`/admin/products/${id}`, data).then(r => r.data)

export const deleteAdminProduct = (id) =>
  api.delete(`/admin/products/${id}`).then(r => r.data)
