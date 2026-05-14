/**
 * CLYRO — Catalog API
 * Thin wrappers over the shared Axios instance.
 * Normalizes backend Spanish field names to the English names used by components.
 */
import api from '../../lib/api'

/* Mapea un producto del backend al shape esperado por los componentes */
function normalizeProduct(p) {
  return {
    id:          p.id_producto,
    name:        p.nombre,
    price:       parseFloat(p.precio),
    image_url:   p.imagen_url,
    category:    p.categoria,
    description: p.descripcion,
    stock:       p.stock,
    // El backend no tiene slug; usamos el id como identificador de ruta
    slug:        String(p.id_producto),
  }
}

/** GET /api/productos?search=&category=&page= */
export const getProducts = (params = {}) =>
  api.get('/productos', { params }).then(r => {
    const raw  = r.data
    const list = Array.isArray(raw) ? raw : (raw.data ?? [])
    return list.map(normalizeProduct)
  })

/** GET /api/productos/:id */
export const getProduct = (id) =>
  api.get(`/productos/${id}`).then(r => normalizeProduct(r.data))

/** GET /api/categorias */
export const getCategories = () =>
  api.get('/categorias').then(r => {
    const list = Array.isArray(r.data) ? r.data : []
    return list.map(c => ({ id: c.id_categoria, name: c.nombre }))
  })
