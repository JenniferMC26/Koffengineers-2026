/**
 * CLYRO — CartContext
 * ──────────────────────────────────────────────────────────────
 * Global cart state: { items, subtotal, itemCount, isOpen }
 *
 * On mount (authenticated):
 *   GET /api/cart → server beats localStorage if non-empty
 *
 * Mutations (addItem / removeItem / updateQty / clearCart):
 *   1. Update React state immediately
 *   2. Persist to localStorage (fallback if user is offline or logged out)
 *   3. Debounced POST /api/cart for server sync (600 ms)
 *
 * Security: Authorization header is injected by the Axios interceptor
 * in api.js — no manual token handling needed here.
 * ──────────────────────────────────────────────────────────────
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const STORAGE_KEY = 'clyro_cart'

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

/* ── Provider ────────────────────────────────────────────── */
export function CartProvider({ children }) {
  const [items,  setItems]  = useState(loadFromStorage)
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const syncTimer = useRef(null)

  /* ── Hydrate from server on login ───────────────────────── */
  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/cart')
      .then(({ data }) => {
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items))
        }
      })
      .catch(() => {}) // silence — localStorage fallback already loaded
  }, [isAuthenticated])

  /* ── Debounced server sync ──────────────────────────────── */
  const pushToServer = useCallback((nextItems) => {
    if (!isAuthenticated) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      api.post('/cart', { items: nextItems }).catch(() => {})
    }, 600)
  }, [isAuthenticated])

  /* ── Internal state committer ───────────────────────────── */
  const commit = useCallback((updater) => {
    setItems(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      pushToServer(next)
      return next
    })
  }, [pushToServer])

  /* ── Public actions ─────────────────────────────────────── */
  const addItem = useCallback((product, qty = 1) => {
    commit(prev => {
      const idx = prev.findIndex(i => i.id === product.id)
      if (idx >= 0) {
        return prev.map((i, n) =>
          n === idx ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, {
        id:        product.id,
        name:      product.name,
        price:     product.price,
        image_url: product.image_url,
        category:  product.category,
        slug:      product.slug,
        qty,
      }]
    })
    setIsOpen(true)
  }, [commit])

  const removeItem = useCallback((id) => {
    commit(prev => prev.filter(i => i.id !== id))
  }, [commit])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    commit(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [commit])

  const clearCart = useCallback(() => commit([]), [commit])

  /* ── Derived values ─────────────────────────────────────── */
  const subtotal  = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty,           0), [items])

  const value = useMemo(() => ({
    items,
    subtotal,
    itemCount,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }), [items, subtotal, itemCount, isOpen, addItem, removeItem, updateQty, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

/* ── Hook ────────────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export default CartContext
