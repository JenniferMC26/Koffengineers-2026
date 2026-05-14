/**
 * CLYRO — Route Guards
 * ──────────────────────────────────────────────────────────────
 * ProtectedRoute   — requires isAuthenticated
 * AdminRoute       — requires isAuthenticated AND role === 'admin'
 *
 * Both redirect to /login?redirect=<currentPath> while showing
 * a loading spinner until AuthContext resolves.
 * ──────────────────────────────────────────────────────────────
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { IconLoader2 } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

/* ── Shared loading screen ────────────────────────────────── */
function AuthLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--c)',
      }}
    >
      <IconLoader2
        size={28}
        stroke={1.5}
        style={{ animation: 'spin 1s linear infinite', color: 'var(--i4)' }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── ProtectedRoute ──────────────────────────────────────── */
/**
 * Wrap any route that requires the user to be logged-in.
 * Renders <Outlet /> (children) when authenticated.
 * Redirects to /login?redirect=<currentPath> otherwise.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}

/* ── AdminRoute ──────────────────────────────────────────── */
/**
 * Wrap admin-only routes.
 * 1. Not authenticated → redirect to /login?redirect=…
 * 2. Authenticated but not admin → redirect to / (home)
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
