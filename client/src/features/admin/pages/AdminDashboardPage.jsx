/**
 * CLYRO — Admin Dashboard
 * ──────────────────────────────────────────────────────────────
 * Shell principal del panel administrativo.
 * Estructura: .admin-wrap (220px sidebar | 1fr contenido)
 *
 * Vistas internas (state: view):
 *   'dashboard' → Stats KPI + preview órdenes + acceso productos
 *   'orders'    → Tabla completa de órdenes con cambio de estado
 *   'products'  → CRUD de inventario
 *
 * Protección: AdminRoute (auth + role=admin) en el router.
 * JWT automático via interceptor de api.js.
 * ──────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import {
  IconChartBar,
  IconCurrencyDollar,
  IconDownload,
  IconLayoutDashboard,
  IconLogout,
  IconPackage,
  IconReceipt,
  IconTag,
  IconTruck,
  IconUsers,
} from '@tabler/icons-react'
import { Toaster } from 'sonner'
import { useAuth } from '../../../context/AuthContext'
import OrdersView   from '../components/OrdersView'
import ProductsView from '../components/ProductsView'
import { getAdminOrders } from '../api'
import { STATUS_META, btnXs } from '../adminUtils'
export { STATUS_META, btnXs }

/* ── Mock fallbacks ──────────────────────────────────────── */
const MOCK_STATS = {
  sales_today:     12480,
  orders_count:    34,
  active_products: 128,
  users_count:     891,
}

const MOCK_ORDERS = [
  { id: 1, customer_name: 'Jennifer M.', customer_initials: 'JM', total: 1397, shipping_method: 'Express',     date: '13 may', status: 'processing' },
  { id: 2, customer_name: 'Ana R.',      customer_initials: 'AR', total: 349,  shipping_method: 'Estándar',    date: '12 may', status: 'shipped'    },
  { id: 3, customer_name: 'Carlos L.',   customer_initials: 'CL', total: 899,  shipping_method: 'Express',     date: '11 may', status: 'delivered'  },
  { id: 4, customer_name: 'María G.',    customer_initials: 'MG', total: 549,  shipping_method: 'Recolección', date: '11 may', status: 'pending'    },
  { id: 5, customer_name: 'Pedro H.',    customer_initials: 'PH', total: 229,  shipping_method: 'Estándar',    date: '10 may', status: 'delivered'  },
]

/* ── Sidebar config ──────────────────────────────────────── */
const SIDEBAR = [
  { section: 'General', items: [
    { id: 'dashboard', label: 'Dashboard',  Icon: IconLayoutDashboard },
    { id: 'analytics', label: 'Analíticas', Icon: IconChartBar, disabled: true },
  ]},
  { section: 'Catálogo', items: [
    { id: 'products',   label: 'Productos',  Icon: IconPackage },
    { id: 'categories', label: 'Categorías', Icon: IconTag,   disabled: true },
  ]},
  { section: 'Ventas', items: [
    { id: 'orders',   label: 'Órdenes',  Icon: IconReceipt },
    { id: 'users',    label: 'Usuarios', Icon: IconUsers,   disabled: true },
    { id: 'shipping', label: 'Envíos',   Icon: IconTruck,   disabled: true },
  ]},
]

/* ═══════════════════════════════════════════════════════════
   SHELL
   ═══════════════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [view, setView] = useState('dashboard')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { fontFamily: "'DM Sans',sans-serif", fontSize: 13, borderRadius: 'var(--rp)' } }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: 'var(--c)' }}>

        {/* ── Sidebar ── */}
        <AdminSidebar
          view={view}
          onNavigate={setView}
          user={user}
          onLogout={handleLogout}
        />

        {/* ── Main content ── */}
        <div style={{ padding: '40px 48px', overflowY: 'auto', minHeight: '100vh' }}>
          {view === 'dashboard' && <DashboardView onNavigate={setView} user={user} />}
          {view === 'orders'    && <OrdersView    />}
          {view === 'products'  && <ProductsView  />}
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          [data-adm-wrap]  { grid-template-columns: 1fr !important; }
          [data-adm-side]  { display: none !important; }
          [data-adm-main]  { padding: 24px 16px !important; }
          [data-adm-stats] { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:600px){
          [data-adm-stats] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════════════════ */
function AdminSidebar({ view, onNavigate, user, onLogout }) {
  return (
    <aside style={{
      borderRight: '.5px solid var(--b)',
      padding: '32px 16px',
      display: 'flex', flexDirection: 'column', gap: 2,
      background: 'var(--c)',
      position: 'sticky', top: 0,
      height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        fontSize: 16, fontWeight: 300, letterSpacing: '.35em',
        color: 'var(--ink)', padding: '0 12px 24px',
        borderBottom: '.5px solid var(--b)', marginBottom: 16,
        flexShrink: 0,
      }}>
        CLYRO ◦
      </div>

      {/* Nav */}
      {SIDEBAR.map(({ section, items }) => (
        <div key={section}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--i4)', padding: '12px 12px 4px' }}>
            {section}
          </div>
          {items.map(({ id, label, Icon, disabled }) => (
            <SideItem
              key={id}
              label={label}
              Icon={Icon}
              active={view === id}
              disabled={disabled}
              onClick={() => !disabled && onNavigate(id)}
            />
          ))}
        </div>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User + logout */}
      <div style={{ borderTop: '.5px solid var(--b)', paddingTop: 16, flexShrink: 0 }}>
        {user && (
          <div style={{ fontSize: 11, color: 'var(--i4)', padding: '0 12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name ?? user.email}
          </div>
        )}
        <SideItem label="Cerrar sesión" Icon={IconLogout} onClick={onLogout} />
      </div>
    </aside>
  )
}

function SideItem({ label, Icon, active, disabled, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 'var(--r)',
        fontSize: 13,
        color: active
          ? 'var(--ink)'
          : disabled ? 'var(--b2)'
          : hov ? 'var(--ink)' : 'var(--i3)',
        background: (active || hov) && !disabled ? 'var(--c2)' : 'transparent',
        fontWeight: active ? 500 : 400,
        cursor: disabled ? 'default' : 'pointer',
        border: 'none', width: '100%', textAlign: 'left',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .2s',
      }}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={17} stroke={1.5} aria-hidden="true" />
      {label}
      {disabled && (
        <span style={{ marginLeft: 'auto', fontSize: 8, letterSpacing: '.06em', background: 'var(--c3)', color: 'var(--i4)', padding: '1px 6px', borderRadius: 10 }}>
          PRONTO
        </span>
      )}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD OVERVIEW VIEW
   ══════════════════════════════════════════════════════════ */
function DashboardView({ onNavigate, user }) {
  const [stats,  setStats]  = useState(MOCK_STATS)
  const [orders, setOrders] = useState(MOCK_ORDERS)

  useEffect(() => {
    // Sin endpoint de stats en el backend; se usan los mocks como referencia
    getAdminOrders()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        if (list.length) setOrders(list.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--i4)' }}>
            {today[0].toUpperCase() + today.slice(1)} · Bienvenida, {user?.name ?? 'Admin'}
          </p>
        </div>
        <button style={btnXs}>
          <IconDownload size={13} stroke={1.5} /> Exportar
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div
        data-adm-stats
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}
      >
        <StatCard Icon={IconCurrencyDollar} label="Ventas hoy"        value={`$${(stats.sales_today ?? 0).toLocaleString('es-MX')}`} delta="+18% vs ayer"   up />
        <StatCard Icon={IconReceipt}        label="Órdenes"           value={stats.orders_count   ?? 0}                              delta="+6 nuevas"      up />
        <StatCard Icon={IconPackage}        label="Productos activos"  value={stats.active_products ?? 0}                             delta="3 sin stock"   up={false} />
        <StatCard Icon={IconUsers}          label="Usuarios"           value={stats.users_count    ?? 0}                              delta="+12 hoy"       up />
      </div>

      {/* ── Recent orders preview ── */}
      <SectionHeader
        title="Órdenes recientes"
        action="Ver todas →"
        onAction={() => onNavigate('orders')}
      />
      <PreviewOrdersTable orders={orders} />

      {/* ── Products shortcut ── */}
      <SectionHeader
        title="Gestión de productos"
        action="→ Ir a productos"
        onAction={() => onNavigate('products')}
        style={{ marginTop: 28 }}
      />
      <p style={{ fontSize: 13, color: 'var(--i4)', paddingTop: 8, lineHeight: 1.7 }}>
        Gestiona el inventario, precios y publicaciones del catálogo desde el panel de productos.
      </p>
    </div>
  )
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ Icon, label, value, delta, up }) {
  return (
    <div style={{ background: 'var(--c2)', borderRadius: 'var(--r)', padding: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'var(--c3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--i3)', marginBottom: 12,
      }}>
        <Icon size={18} stroke={1.5} aria-hidden="true" />
      </div>
      <div style={{ fontSize: 11, color: 'var(--i4)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 200, color: 'var(--ink)', letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: 11, marginTop: 4, color: up ? '#4a7a3a' : '#8a3a3a' }}>
        {up ? '↑' : '↓'} {delta}
      </div>
    </div>
  )
}

/* ── Read-only mini orders table (Dashboard view only) ───── */
function PreviewOrdersTable({ orders }) {
  const cols = '2fr 1fr 1.2fr 1fr 1fr'
  return (
    <div style={{ border: '.5px solid var(--b)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 8 }} role="table" aria-label="Órdenes recientes">
      <div role="row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '11px 18px', background: 'var(--c2)', fontSize: 10, color: 'var(--i4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
        <div>Cliente</div><div>Total</div><div>Envío</div><div>Fecha</div><div>Estado</div>
      </div>
      {orders.map(o => {
        const sm = STATUS_META[o.status] ?? STATUS_META.pending
        const initials = o.customer_initials
          ?? o.customer_name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()
          ?? '?'
        return (
          <div key={o.id} role="row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 18px', borderTop: '.5px solid var(--b)', alignItems: 'center', fontSize: 13, color: 'var(--ink)', transition: '.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--c2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--i3)', flexShrink: 0 }}>
                {initials}
              </div>
              {o.customer_name}
            </div>
            <div>${(o.total ?? 0).toLocaleString('es-MX')}</div>
            <div style={{ fontSize: 12, color: 'var(--i3)' }}>{o.shipping_method ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--i4)' }}>{o.date ?? (o.created_at?.slice(5,10) ?? '—')}</div>
            <div>
              <span style={{ display: 'inline-block', fontSize: 10, padding: '3px 10px', borderRadius: 'var(--rp)', letterSpacing: '.04em', background: sm.bg, color: sm.color }}>
                {sm.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Section header ──────────────────────────────────────── */
/* ── Section header (solo usado internamente en este archivo) */
function SectionHeader({ title, action, onAction, style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, ...style }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
      {action && (
        <button
          onClick={onAction}
          style={btnXs}
          onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--ink)', color: 'var(--ink)' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--b)', color: 'var(--i3)' })}
        >
          {action}
        </button>
      )}
    </div>
  )
}
