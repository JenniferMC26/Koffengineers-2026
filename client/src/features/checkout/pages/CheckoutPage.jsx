/**
 * CLYRO — CheckoutPage
 * ──────────────────────────────────────────────────────────────
 * Layout: checkout-grid (2 columns)
 *   Left  — formulario de entrega + selector de envío
 *   Right — order-panel sticky con resumen dinámico
 *
 * Shipping methods (obligatorios):
 *   • Estándar  $49   5–7 días hábiles
 *   • Express   $149  1–2 días hábiles
 *
 * Submits POST /api/orders → toast → clearCart → redirect
 * JWT se inyecta automáticamente via el interceptor de api.js
 * ──────────────────────────────────────────────────────────────
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconLoader2,
  IconLock,
  IconShoppingBag,
} from '@tabler/icons-react'
import { toast, Toaster } from 'sonner'
import api from '../../../lib/api'
import { useCart } from '../../../context/CartContext'

/* ── Shipping options ────────────────────────────────────── */
const SHIP_OPTS = [
  { id: 'standard', label: 'Estándar', eta: '5–7 días hábiles', price: 49  },
  { id: 'express',  label: 'Express',  eta: '1–2 días hábiles', price: 149 },
]

/* ═══════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form,     setForm]     = useState({ name: '', phone: '', address: '', city: '', postal: '' })
  const [shipping, setShipping] = useState('standard')
  const [loading,  setLoading]  = useState(false)

  const shippingCost = SHIP_OPTS.find(o => o.id === shipping)?.price ?? 0
  const total        = subtotal + shippingCost

  const field = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!items.length) {
      toast.error('Tu carrito está vacío')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/orders', {
        items:            items.map(i => ({ product_id: i.id, qty: i.qty, price: i.price })),
        shipping_method:  shipping,
        shipping_cost:    shippingCost,
        shipping_address: form,
        total,
      })
      toast.success(`¡Orden confirmada! Pedido #${data?.order_id ?? new Date().getFullYear() + '-' + String(Date.now()).slice(-4)}`)
      clearCart()
      setTimeout(() => navigate('/'), 1600)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al procesar tu orden. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: "'DM Sans',sans-serif", fontSize: 13, borderRadius: 'var(--rp)' },
        }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--c)' }}>
        {/* Back */}
        <div style={{ padding: '24px 0 0', paddingLeft: 'max(32px,90px)' }}>
          <button
            onClick={() => navigate(-1)}
            style={backBtn}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
          >
            <IconArrowLeft size={14} stroke={1.5} /> Volver
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── checkout-grid ── */}
          <div className="ck-grid">

            {/* ══ LEFT: form ══════════════════════════════════ */}
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px,3vw,32px)', fontWeight: 400,
                color: 'var(--ink)', marginBottom: 32,
              }}>
                Confirmar pedido
              </h2>

              {/* ── Delivery info ── */}
              <SectionLabel>Información de entrega</SectionLabel>

              <div className="ck-frow">
                <Field label="Nombre completo">
                  <input
                    className="fi" type="text" required
                    placeholder="Tu nombre completo"
                    value={form.name} onChange={field('name')}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className="fi" type="tel"
                    placeholder="+52 81 0000 0000"
                    value={form.phone} onChange={field('phone')}
                  />
                </Field>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Field label="Dirección">
                  <input
                    className="fi" type="text" required
                    placeholder="Calle, número y colonia"
                    value={form.address} onChange={field('address')}
                  />
                </Field>
              </div>

              <div className="ck-frow">
                <Field label="Ciudad">
                  <input
                    className="fi" type="text" required
                    placeholder="Ciudad"
                    value={form.city} onChange={field('city')}
                  />
                </Field>
                <Field label="Código postal">
                  <input
                    className="fi" type="text"
                    placeholder="00000"
                    value={form.postal} onChange={field('postal')}
                  />
                </Field>
              </div>

              {/* ── Shipping selector ── */}
              <SectionLabel style={{ marginTop: 28 }}>Método de envío</SectionLabel>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0 24px' }}>
                {SHIP_OPTS.map(opt => {
                  const on = shipping === opt.id
                  return (
                    <ShipOption
                      key={opt.id}
                      opt={opt}
                      active={on}
                      onSelect={() => setShipping(opt.id)}
                    />
                  )
                })}
              </div>
            </div>

            {/* ══ RIGHT: order panel ══════════════════════════ */}
            <div style={{
              background: 'var(--c2)', borderRadius: 'var(--rl)',
              padding: 32, display: 'flex', flexDirection: 'column',
              alignSelf: 'start', position: 'sticky', top: 20,
            }}>
              <p style={{
                fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                marginBottom: 22, letterSpacing: '.02em',
              }}>
                Resumen del pedido
              </p>

              {/* Order items */}
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--i4)', fontSize: 13 }}>
                  <IconShoppingBag size={32} stroke={0.8} style={{ marginBottom: 8, color: 'var(--b2)' }} />
                  <p>Sin productos</p>
                </div>
              ) : (
                items.map(item => <OrderItem key={item.id} item={item} />)
              )}

              {/* Divider */}
              <div style={{ height: .5, background: 'var(--b)', margin: '16px 0' }} />

              {/* Cost breakdown */}
              <CostRow label="Subtotal"   value={`$${subtotal.toLocaleString('es-MX')}`} />
              <CostRow label="Envío"      value={`$${shippingCost.toLocaleString('es-MX')}`} />

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 20, color: 'var(--ink)', fontWeight: 300,
                marginTop: 14, paddingTop: 14,
                borderTop: '.5px solid var(--b)',
                letterSpacing: '-.01em',
              }}>
                <span>Total</span>
                <span>${total.toLocaleString('es-MX')}</span>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                disabled={loading || !items.length}
                style={{
                  width: '100%',
                  background: loading || !items.length ? 'var(--i3)' : 'var(--ink)',
                  color: 'var(--c)',
                  border: 'none', borderRadius: 'var(--rp)', padding: '16px',
                  fontSize: 13, letterSpacing: '.08em',
                  cursor: loading || !items.length ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans',sans-serif", marginTop: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .3s cubic-bezier(.16,1,.3,1)',
                }}
                onMouseEnter={e => {
                  if (!loading && items.length) {
                    Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(26,25,24,.18)' })
                  }
                }}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
              >
                {loading && <IconLoader2 size={15} stroke={2} className="spin" />}
                {loading ? 'Procesando...' : 'Pagar ahora'}
              </button>

              {/* Secure badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, marginTop: 12, fontSize: 11, color: 'var(--i4)',
              }}>
                <IconLock size={13} stroke={1.5} /> Pago 100% seguro
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        /* checkout-grid — mirrors clyro_v4.html */
        .ck-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          min-height: calc(100vh - 60px);
          padding: 40px 60px 60px 90px;
          gap: 32px;
        }
        .ck-frow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        /* fi — "field input" from reference */
        .fi {
          background: var(--c2);
          border: .5px solid var(--b);
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 14px;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          width: 100%;
          transition: border-color .2s, background .2s;
        }
        .fi:focus {
          border-color: var(--ink);
          background: var(--c);
        }
        .spin {
          animation: ck-spin .9s linear infinite;
        }
        @keyframes ck-spin { to { transform: rotate(360deg); } }

        @media (max-width: 960px) {
          .ck-grid { grid-template-columns: 1fr; padding: 40px 24px 60px 80px; }
        }
        @media (max-width: 768px) {
          .ck-grid { padding: 24px 16px 60px 16px; }
          .ck-frow { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

/* ── Shipping option card — mirrors .sopt / .sopt.on ──────── */
function ShipOption({ opt, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        border: active ? '.5px solid var(--ink)' : '.5px solid var(--b)',
        background: active ? 'var(--ink)' : 'transparent',
        borderRadius: 'var(--r)',
        cursor: 'pointer',
        transition: 'all .25s cubic-bezier(.16,1,.3,1)',
        fontFamily: "'DM Sans',sans-serif",
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--b2)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--b)' }}
    >
      {/* Left side: radio + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Radio circle */}
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          border: active ? '1.5px solid rgba(244,242,237,.4)' : '1.5px solid var(--b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'border-color .2s',
        }}>
          {active && (
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--c)' }} />
          )}
        </div>
        {/* Label */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: active ? 'var(--c)' : 'var(--ink)' }}>
            {opt.label}
          </div>
          <div style={{ fontSize: 11, color: active ? 'rgba(244,242,237,.6)' : 'var(--i4)', marginTop: 1 }}>
            {opt.eta}
          </div>
        </div>
      </div>
      {/* Price */}
      <div style={{ fontSize: 14, color: active ? 'var(--c)' : 'var(--ink)' }}>
        ${opt.price}
      </div>
    </button>
  )
}

/* ── Order item in summary panel ─────────────────────────── */
function OrderItem({ item }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <div style={{
        width: 54, height: 54, borderRadius: 10,
        background: 'var(--c3)', flexShrink: 0,
        overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!imgErr && item.image_url ? (
          <img
            src={item.image_url} alt={item.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 22 }}>🛍️</span>
        )}
        {/* Qty badge */}
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 17, height: 17, background: 'var(--ink)',
          borderRadius: '50%', fontSize: 9, color: 'var(--c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {item.qty}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--ink)',
          lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--i4)', marginTop: 1 }}>{item.category}</div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink)', marginLeft: 'auto' }}>
        ${(item.price * item.qty).toLocaleString('es-MX')}
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
      color: 'var(--i4)', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      ...style,
    }}>
      {children}
      <span style={{ flex: 1, height: .5, background: 'var(--b)', display: 'block' }} />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11, color: 'var(--i4)', letterSpacing: '.07em' }}>{label}</div>
      {children}
    </div>
  )
}

function CostRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontSize: 13, color: 'var(--i4)', marginBottom: 8,
    }}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

/* ── Shared inline styles ────────────────────────────────── */
const backBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  fontSize: 12, letterSpacing: '.06em', color: 'var(--i4)',
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans',sans-serif", transition: 'color .2s',
  marginBottom: 4,
}
