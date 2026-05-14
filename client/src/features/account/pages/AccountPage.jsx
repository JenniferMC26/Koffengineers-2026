/**
 * CLYRO — AccountPage
 * Perfil del usuario + historial de pedidos.
 * GET /api/pedidos       → lista de pedidos del usuario
 * GET /api/pedidos/:id   → detalle con items (on demand)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconLogout,
  IconPackage,
  IconReceipt,
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'

/* ── Estado de pedido ───────────────────────────────────── */
const STATUS = {
  pendiente: { label: 'Pendiente',  bg: '#fdf3e8', color: '#9a5a1a' },
  pagado:    { label: 'Pagado',     bg: '#e8f5ee', color: '#1a7a3a' },
  enviado:   { label: 'Enviado',    bg: '#e8f0fd', color: '#1a3a9a' },
  entregado: { label: 'Entregado',  bg: '#edf5e8', color: '#2a6a1a' },
}

/* ═══════════════════════════════════════════════════════════ */
export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)   // id_pedido abierto
  const [details,  setDetails]  = useState({})     // { id_pedido: orderDetail }
  const [loadingDetail, setLoadingDetail] = useState(null)

  /* ── Cargar pedidos ─────────────────────────────────────── */
  useEffect(() => {
    api.get('/pedidos')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* ── Expandir pedido → cargar detalle ───────────────────── */
  const toggle = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (id in details) return // ya cargado (null = falló, no reintentar)

    setLoadingDetail(id)
    try {
      const { data } = await api.get(`/pedidos/${id}`)
      setDetails(prev => ({ ...prev, [id]: data }))
    } catch {
      setDetails(prev => ({ ...prev, [id]: null }))
    } finally {
      setLoadingDetail(null)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--c)',
      padding: 'clamp(40px,5vw,60px) clamp(20px,5vw,60px)',
      paddingLeft: 'max(clamp(20px,5vw,60px), 90px)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
            Mi cuenta
          </h1>
          <p style={{ fontSize: 13, color: 'var(--i4)', marginTop: 6 }}>
            Gestiona tu perfil e historial de pedidos
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--i4)',
            background: 'none', border: '0.5px solid var(--b)',
            borderRadius: 'var(--rp)', padding: '8px 16px',
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.color = 'var(--i4)' }}
        >
          <IconLogout size={14} stroke={1.5} /> Cerrar sesión
        </button>
      </div>

      {/* ── Profile card ── */}
      <div style={{
        background: 'var(--c2)', borderRadius: 'var(--rl)',
        padding: '24px 28px', marginBottom: 32,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontFamily: "'Playfair Display',serif", flexShrink: 0,
        }}>
          {user?.name ? user.name[0].toUpperCase() : <IconUser size={22} stroke={1.5} />}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{user?.name ?? 'Usuario'}</div>
          <div style={{ fontSize: 13, color: 'var(--i4)', marginTop: 2 }}>{user?.email ?? ''}</div>
        </div>
      </div>

      {/* ── Orders section ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <IconReceipt size={18} stroke={1.5} style={{ color: 'var(--ink)' }} />
        <h2 style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
          Mis pedidos
        </h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <IconLoader2 size={28} stroke={1.5} style={{ color: 'var(--i4)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders onShop={() => navigate('/catalog')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(order => (
            <OrderCard
              key={order.id_pedido}
              order={order}
              open={expanded === order.id_pedido}
              detail={details[order.id_pedido]}
              loadingDetail={loadingDetail === order.id_pedido}
              onToggle={() => toggle(order.id_pedido)}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Order card ─────────────────────────────────────────── */
function OrderCard({ order, open, detail, loadingDetail, onToggle }) {
  const st = STATUS[order.estado] ?? STATUS.pendiente
  const date = order.fecha_pedido
    ? new Date(order.fecha_pedido).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div style={{
      border: open ? '0.5px solid var(--ink)' : '0.5px solid var(--b)',
      borderRadius: 'var(--rl)', overflow: 'hidden',
      transition: 'border-color .2s',
    }}>
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, background: 'var(--c)', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif", flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <IconPackage size={18} stroke={1.5} style={{ color: 'var(--i4)', flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
              Pedido #{order.id_pedido}
            </div>
            <div style={{ fontSize: 12, color: 'var(--i4)', marginTop: 2 }}>{date}</div>
          </div>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 'var(--rp)',
            background: st.bg, color: st.color, fontWeight: 500,
          }}>
            {st.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--ink)' }}>
            ${parseFloat(order.total).toLocaleString('es-MX')}
          </span>
          {open
            ? <IconChevronUp size={16} stroke={1.5} style={{ color: 'var(--i4)' }} />
            : <IconChevronDown size={16} stroke={1.5} style={{ color: 'var(--i4)' }} />
          }
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: '0.5px solid var(--b)', padding: '20px 24px', background: 'var(--c2)' }}>
          {loadingDetail ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <IconLoader2 size={20} stroke={1.5} style={{ color: 'var(--i4)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : detail ? (
            <OrderDetail order={order} detail={detail} />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--i4)', textAlign: 'center' }}>No se pudo cargar el detalle.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Order detail (items + address) ─────────────────────── */
function OrderDetail({ order, detail }) {
  const items = detail.items ?? []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Items */}
      {items.length > 0 && (
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--i4)', marginBottom: 10 }}>
            Productos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'var(--c3)', flexShrink: 0, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.imagen_url
                    ? <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <IconPackage size={18} stroke={1} style={{ color: 'var(--i4)' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--i4)' }}>x{item.cantidad}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', flexShrink: 0 }}>
                  ${(parseFloat(item.precio_unitario) * item.cantidad).toLocaleString('es-MX')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary row */}
      <div style={{ height: .5, background: 'var(--b)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--i4)' }}>
        <span>Envío ({order.metodo_envio})</span>
        <span>{order.tiempo_estimado}</span>
      </div>
      {detail.metodo_pago && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--i4)' }}>
          <span>Método de pago</span>
          <span>{detail.metodo_pago}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
        <span>Total</span>
        <span>${parseFloat(order.total).toLocaleString('es-MX')}</span>
      </div>

      {/* Address */}
      <div style={{ height: .5, background: 'var(--b)' }} />
      <div>
        <p style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--i4)', marginBottom: 6 }}>
          Dirección de entrega
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
          {detail.direccion_calle}, {detail.ciudad}, CP {detail.codigo_postal}
        </p>
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyOrders({ onShop }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--c2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <IconReceipt size={28} stroke={1} style={{ color: 'var(--b2)' }} />
      </div>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 400, color: 'var(--ink)', marginBottom: 8 }}>
        Sin pedidos aún
      </p>
      <p style={{ fontSize: 13, color: 'var(--i4)', marginBottom: 24 }}>
        Cuando realices tu primera compra aparecerá aquí.
      </p>
      <button
        onClick={onShop}
        style={{
          background: 'var(--ink)', color: 'var(--c)',
          border: 'none', borderRadius: 'var(--rp)', padding: '12px 28px',
          fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
        }}
      >
        Explorar catálogo
      </button>
    </div>
  )
}
