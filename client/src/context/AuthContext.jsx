/**
 * CLYRO — AuthContext
 * ──────────────────────────────────────────────────────────────
 * Global auth state:  { user, token, role, isLoading }
 *
 * On mount:
 *   Reads clyro_token from localStorage → calls GET /api/auth/me
 *   to validate. If 401 the interceptor clears storage and fires
 *   the "clyro:logout" event which we handle here.
 *
 * login(email, password) → POST /api/auth/login
 * register(data)         → POST /api/auth/register
 * logout()               → clears state + storage
 *
 * Security notes:
 *   • JWT is stored in localStorage (Flask doesn't use httpOnly cookies)
 *   • Token payload decoded client-side ONLY for UI decisions (role/exp)
 *   • Backend is the sole authority for access control
 *   • Passwords cleared from state immediately after use
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
import api, { clearToken, getToken, setToken } from '../lib/api'

/* ── Context ─────────────────────────────────────────────── */
const AuthContext = createContext(null)

/* ── Tiny JWT decoder (read only, no verification) ───────── */
function decodePayload(token) {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

/* ── Provider ────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [token,     setTokenState]= useState(getToken)
  const [role,      setRole]      = useState(null)
  const [isLoading, setIsLoading] = useState(true)  // starts true; resolves after /me check

  const isMounted = useRef(true)
  useEffect(() => () => { isMounted.current = false }, [])

  /* ── Internal: hydrate state from a raw token ───────────── */
  const hydrateFromToken = useCallback((rawToken, userData) => {
    const payload = decodePayload(rawToken)
    setToken(rawToken)
    setTokenState(rawToken)
    setUser(userData)
    setRole(payload?.role ?? userData?.role ?? 'client')
  }, [])

  /* ── Internal: wipe all auth state ─────────────────────── */
  const wipeAuth = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
    setRole(null)
  }, [])

  /* ── On mount: validate persisted token via /me ─────────── */
  useEffect(() => {
    const storedToken = getToken()
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    ;(async () => {
      try {
        const { data } = await api.get('/auth/me')
        if (isMounted.current) {
          hydrateFromToken(storedToken, data)
        }
      } catch {
        // 401 already handled by interceptor (wipes token)
        if (isMounted.current) wipeAuth()
      } finally {
        if (isMounted.current) setIsLoading(false)
      }
    })()
  }, [hydrateFromToken, wipeAuth])

  /* ── Listen for global logout event (fired by Axios on 401) */
  useEffect(() => {
    const handle = () => {
      if (isMounted.current) {
        wipeAuth()
        // Navigate to /login — use location replace to avoid history entry
        window.location.replace('/login')
      }
    }
    window.addEventListener('clyro:logout', handle)
    return () => window.removeEventListener('clyro:logout', handle)
  }, [wipeAuth])

  /* ── login ────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    // data = { token, user: { id, name, email, role } }
    hydrateFromToken(data.token, data.user)
    return data
  }, [hydrateFromToken])

  /* ── register ─────────────────────────────────────────── */
  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    // Backend returns token on register → auto-login
    hydrateFromToken(data.token, data.user)
    return data
  }, [hydrateFromToken])

  /* ── logout ───────────────────────────────────────────── */
  const logout = useCallback(() => {
    wipeAuth()
  }, [wipeAuth])

  /* ── Context value (memoised to avoid unnecessary renders) */
  const value = useMemo(() => ({
    user,
    token,
    role,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    login,
    register,
    logout,
  }), [user, token, role, isLoading, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Hook ────────────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
