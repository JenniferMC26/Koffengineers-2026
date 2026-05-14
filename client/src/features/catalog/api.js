/**
 * CLYRO — Catalog API
 * Thin wrappers over the shared Axios instance.
 * All endpoint paths match the Flask backend contract in the design spec.
 */
import api from '../../lib/api'

/** GET /api/products?search=&category=&page= */
export const getProducts = (params = {}) =>
  api.get('/products', { params }).then(r => r.data)

/** GET /api/products/:slug */
export const getProduct = (slug) =>
  api.get(`/products/${slug}`).then(r => r.data)

/** GET /api/categories */
export const getCategories = () =>
  api.get('/categories').then(r => r.data)
