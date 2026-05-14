/**
 * CLYRO — Admin shared utilities (JS puro, sin JSX)
 * Exportado aquí para romper la dependencia circular:
 *   AdminDashboardPage → OrdersView → AdminDashboardPage
 */

/* ── Status badge config ─────────────────────────────────── */
export const STATUS_META = {
  pending:    { label: 'Pendiente',  bg: '#f2e8e0', color: '#6a3a1a' },
  processing: { label: 'En proceso', bg: '#f2ede0', color: '#6a5a1a' },
  shipped:    { label: 'Enviado',    bg: '#e0ecf2', color: '#1a4a6a' },
  delivered:  { label: 'Entregado',  bg: '#e6f2e0', color: '#3a6a2a' },
}

/* ── Shared button-xs style ──────────────────────────────── */
export const btnXs = {
  fontSize: 12, color: 'var(--i3)',
  border: '.5px solid var(--b)', borderRadius: 'var(--rp)',
  padding: '6px 14px', cursor: 'pointer',
  background: 'var(--c)', fontFamily: "'DM Sans',sans-serif",
  display: 'inline-flex', alignItems: 'center', gap: 6,
  transition: 'border-color .2s, color .2s',
}
