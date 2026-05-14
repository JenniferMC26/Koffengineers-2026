/**
 * CLYRO — OrdersView
 * Tabla completa de órdenes con cambio de estado inline.
 * GET  /api/admin/orders
 * PATCH /api/admin/orders/:id/status
 */
import { useEffect, useState } from 'react'
import { IconLoader2, IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'
import { getAdminOrders, updateOrderStatus } from '../api'
import { btnXs, STATUS_META } from '../adminUtils.js'

/* ── Mock fallback ───────────────────────────────────────── */
const MOCK = [
  { id: 1,  customer_name: 'Jennifer M.', customer_initials: 'JM', total: 1397, shipping_method: 'Express',     created_at: '2026-05-13', status: 'processing' },
  { id: 2,  customer_name: 'Ana R.',      customer_initials: 'AR', total: 349,  shipping_method: 'Estándar',    created_at: '2026-05-12', status: 'shipped'    },
  { id: 3,  customer_name: 'Carlos L.',   customer_initials: 'CL', total: 899,  shipping_method: 'Express',     created_at: '2026-05-11', status: 'delivered'  },
  { id: 4,  customer_name: 'María G.',    customer_initials: 'MG', total: 549,  shipping_method: 'Recolección', created_at: '2026-05-11', status: 'pending'    },
  { id: 5,  customer_name: 'Pedro H.',    customer_initials: 'PH', total: 229,  shipping_method: 'Estándar',    created_at: '2026-05-10', status: 'delivered'  },
  { id: 6,  customer_name: 'Laura V.',    customer_initials: 'LV', total: 1120, shipping_method: 'Express',     created_at: '2026-05-10', status: 'shipped'    },
  { id: 7,  customer_name: 'Roberto S.',  customer_initials: 'RS', total: 450,  shipping_method: 'Estándar',    created_at: '2026-05-09', status: 'pending'    },
  { id: 8,  customer_name: 'Daniela F.',  customer_initials: 'DF', total: 780,  shipping_method: 'Express',     created_at: '2026-05-09', status: 'processing' },
]

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pendiente'  },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped',    label: 'Enviado'    },
  { value: 'delivered',  label: 'Entregado'  },
]

const COLS = '2fr 1fr 1.2fr 1fr 1.4fr'

/* ═══════════════════════════════════════════════════════════ */
export default function OrdersView() {
  const [orders,  setOrders]  = useState(MOCK)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // order id being patched

  const load = () => {
    setLoading(true)
    getAdminOrders()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.orders ?? [])
        if (list.length) setOrders(list)
      })
      .catch(() => {}) // use mock on failure
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    // Optimistic update
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    )
    try {
      await updateOrderStatus(orderId, newStatus)
      const label = STATUS_META[newStatus]?.label ?? newStatus
      toast.success(`Orden #${orderId} → ${label}`)
    } catch (err) {
      toast.error('No se pudo actualizar el estado')
      // Revert on error
      load()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}>
            Órdenes
          </h1>
          <p style={{ fontSize: 13, color: 'var(--i4)' }}>
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} en total
          </p>
        </div>
        <button
          onClick={load}
          style={btnXs}
          title="Recargar órdenes"
          onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--ink)', color: 'var(--ink)' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--b)', color: 'var(--i3)' })}
        >
          <IconRefresh size={13} stroke={1.5} /> Actualizar
        </button>
      </div>

      {/* Status legend */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map(({ value, label }) => {
          const sm = STATUS_META[value]
          return (
            <span key={value} style={{
              fontSize: 11, padding: '4px 12px', borderRadius: 'var(--rp)',
              background: sm.bg, color: sm.color, letterSpacing: '.03em',
            }}>
              {label}
            </span>
          )
        })}
      </div>

      {/* Table */}
      <div
        role="table"
        aria-label="Tabla de órdenes"
        style={{ border: '.5px solid var(--b)', borderRadius: 'var(--r)', overflow: 'hidden' }}
      >
        {/* Table header */}
        <div role="row" style={{
          display: 'grid', gridTemplateColumns: COLS,
          padding: '11px 18px',
          background: 'var(--c2)',
          fontSize: 10, color: 'var(--i4)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div>Cliente</div>
          <div>Total</div>
          <div>Envío</div>
          <div>Fecha</div>
          <div>Estado</div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
            <IconLoader2 size={24} stroke={1.5} style={{ color: 'var(--i4)', animation: 'adm-spin 1s linear infinite' }} />
          </div>
        )}

        {/* Rows */}
        {!loading && orders.map(order => (
          <OrderRow
            key={order.id}
            order={order}
            onStatusChange={handleStatusChange}
            isUpdating={updating === order.id}
            cols={COLS}
          />
        ))}

        {!loading && orders.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: 'var(--i4)' }}>
            No hay órdenes registradas.
          </div>
        )}
      </div>

      <style>{`@keyframes adm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Order row with inline status selector ───────────────── */
function OrderRow({ order, onStatusChange, isUpdating, cols }) {
  const [hov, setHov] = useState(false)
  const sm = STATUS_META[order.status] ?? STATUS_META.pending

  const initials = order.customer_initials
    ?? order.customer_name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()
    ?? '?'

  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    : order.date ?? '—'

  return (
    <div
      role="row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: cols,
        padding: '13px 18px',
        borderTop: '.5px solid var(--b)',
        alignItems: 'center',
        fontSize: 13, color: 'var(--ink)',
        background: hov ? 'var(--c2)' : 'transparent',
        transition: 'background .15s',
        opacity: isUpdating ? .6 : 1,
      }}
    >
      {/* Customer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--c3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 500, color: 'var(--i3)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.customer_name}
        </span>
      </div>

      {/* Total */}
      <div style={{ fontWeight: 400 }}>
        ${(order.total ?? 0).toLocaleString('es-MX')}
      </div>

      {/* Shipping */}
      <div style={{ fontSize: 12, color: 'var(--i3)' }}>
        {order.shipping_method ?? '—'}
      </div>

      {/* Date */}
      <div style={{ fontSize: 12, color: 'var(--i4)' }}>
        {dateStr}
      </div>

      {/* Status selector — styled as badge but interactive */}
      <div>
        <select
          value={order.status}
          onChange={e => onStatusChange(order.id, e.target.value)}
          disabled={isUpdating}
          aria-label={`Estado de la orden ${order.id}`}
          style={{
            fontSize: 10,
            padding: '3px 8px 3px 10px',
            borderRadius: 'var(--rp)',
            background: sm.bg,
            color: sm.color,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            letterSpacing: '.04em',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='${encodeURIComponent(sm.color)}' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            paddingRight: 22,
            transition: 'opacity .2s',
          }}
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
