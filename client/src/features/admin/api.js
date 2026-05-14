/**
 * CLYRO — Admin API
 * Thin wrappers over the shared Axios instance.
 * JWT se inyecta automáticamente vía el interceptor de api.js.
 *
 * Normalizadores: traduce los nombres de campo del backend (español)
 * al contrato en inglés que usan los componentes de vista.
 */
import api from '../../lib/api'

/* ── Traducción de estados ──────────────────────────────── */
const STATUS_TO_ES = {
  pending:    'pendiente',
  processing: 'pagado',
  shipped:    'enviado',
  delivered:  'entregado',
}
const STATUS_TO_EN = {
  pendiente: 'pending',
  pagado:    'processing',
  enviado:   'shipped',
  entregado: 'delivered',
}

/* ── Normalizadores ─────────────────────────────────────── */
function normalizeOrder(o) {
  const name = o.nombre_completo ?? 'Cliente'
  return {
    id:                o.id_pedido,
    customer_name:     name,
    customer_initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    total:             parseFloat(o.total),
    shipping_method:   o.metodo_envio ?? '',
    created_at:        o.fecha_pedido,
    date:              o.fecha_pedido
      ? new Date(o.fecha_pedido).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      : '',
    status:            STATUS_TO_EN[o.estado] ?? o.estado,
  }
}

function normalizeProduct(p) {
  return {
    id:           p.id_producto,
    id_categoria: p.id_categoria,
    name:         p.nombre,
    price:        parseFloat(p.precio),
    description:  p.descripcion ?? '',
    stock:        p.stock,
    image_url:    p.imagen_url ?? '',
    category:     p.categoria ?? '',
  }
}

/* ── Orders ─────────────────────────────────────────────── */
export const getAdminOrders = (estado = '') =>
  api.get('/admin/pedidos', { params: estado ? { estado } : {} })
    .then(r => {
      const list = Array.isArray(r.data) ? r.data : []
      return list.map(normalizeOrder)
    })

export const updateOrderStatus = (id, statusEn) =>
  api.patch(`/admin/pedidos/${id}/estado`, { estado: STATUS_TO_ES[statusEn] ?? statusEn })
    .then(r => r.data)

/* ── Products ───────────────────────────────────────────── */
export const getAdminProducts = () =>
  api.get('/productos', { params: { per_page: 50 } }).then(r => {
    const raw  = r.data
    const list = Array.isArray(raw) ? raw : (raw.data ?? [])
    return list.map(normalizeProduct)
  })

export const createAdminProduct = (data) =>
  api.post('/admin/productos', {
    id_categoria: data.id_categoria,
    nombre:       data.name,
    descripcion:  data.description ?? '',
    precio:       data.price,
    stock:        data.stock,
    imagen_url:   data.image_url ?? '',
  }).then(r => r.data)

export const updateAdminProduct = (id, data) => {
  const payload = {}
  if (data.id_categoria !== undefined) payload.id_categoria = data.id_categoria
  if (data.name        !== undefined) payload.nombre       = data.name
  if (data.description !== undefined) payload.descripcion  = data.description
  if (data.price       !== undefined) payload.precio       = data.price
  if (data.stock       !== undefined) payload.stock        = data.stock
  if (data.image_url   !== undefined) payload.imagen_url   = data.image_url
  return api.put(`/admin/productos/${id}`, payload).then(r => r.data)
}

export const deleteAdminProduct = (id) =>
  api.delete(`/admin/productos/${id}`).then(r => r.data)

/* ── Low stock ──────────────────────────────────────────── */
export const getAdminLowStock = (umbral = 5) =>
  api.get('/admin/stock-bajo', { params: { umbral } }).then(r => r.data)
