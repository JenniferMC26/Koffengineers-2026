/**
 * CLYRO — Axios HTTP Client
 * ──────────────────────────────────────────────────────────────
 * Single Axios instance consumed by all feature api.js files.
 *
 * Request interceptor  → injects Authorization: Bearer <token>
 * Response interceptor → on 401: clears storage + dispatches
 *   a "clyro:logout" event so AuthContext can react without
 *   a circular dependency (context doesn't need to import this).
 * ──────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const TOKEN_KEY = 'clyro_token'

/* ── Instance ─────────────────────────────────────────────── */
const api = axios.create({
  baseURL: '/api',              // proxied to Flask via Vite in dev
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Request: inject JWT ─────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ── Response: handle 401 globally ──────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted credentials
      localStorage.removeItem(TOKEN_KEY)

      // Notify AuthContext (avoids circular import)
      window.dispatchEvent(new CustomEvent('clyro:logout'))
    }
    return Promise.reject(error)
  },
)

/* ── Helpers ────────────────────────────────────────────── */
export const setToken  = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = ()    => localStorage.removeItem(TOKEN_KEY)
export const getToken  = ()     => localStorage.getItem(TOKEN_KEY)

export default api
