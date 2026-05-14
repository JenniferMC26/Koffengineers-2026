/**
 * CLYRO — CartPage
 * Vista completa del carrito en /cart.
 * Muestra todos los ítems con controles de cantidad y botón
 * para continuar al checkout.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconX,
} from '@tabler/icons-react'
import { useCart } from '../../../context/CartContext'

export default function CartPage() {
  const { items, subtotal, itemCount, removeItem, updateQty } = useCart()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c)', paddingBottom: 60 }}>
      {/* Back */}
      <div style={{ padding: '28px 0 0', paddingLeft: 'max(32px,90px)' }}>
        <button
          onClick={() => navigate(-1)}
          style={backBtn}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
        >
          <IconArrowLeft size={14} stroke={1.5} /> Volver
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px 0' }}>
        {/* Heading */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(26px,3vw,34px)', fontWeight: 400,
          color: 'var(--ink)', marginBottom: 6,
        }}>
          Tu carrito
        </h1>
        <p style={{ fontSize: 12, color: 'var(--i4)', marginBottom: 36, letterSpacing: '.02em' }}>
          {itemCount === 0
            ? 'Vacío'
            : `${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
        </p>

        {items.length === 0 ? (
          <EmptyCart onBrowse={() => navigate('/catalog')} />
        ) : (
          <>
            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
              {items.map(item => (
                <CartRow
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onQtyChange={(q) => updateQty(item.id, q)}
                />
              ))}
            </div>

            {/* Summary card */}
            <div style={{
              background: 'var(--c2)', borderRadius: 'var(--rl)',
              padding: '28px 32px',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span style={{ fontSize: 12, color: 'var(--i4)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  Subtotal
                </span>
                <span style={{ fontSize: 26, fontWeight: 300, color: 'var(--ink)', letterSpacing: '-.02em' }}>
                  ${subtotal.toLocaleString('es-MX')}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--i4)', lineHeight: 1.6 }}>
                El costo de envío se calculará al confirmar tu pedido.
              </p>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-dark"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                Continuar al pago
              </button>
              <button
                onClick={() => navigate('/catalog')}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Cart item row ───────────────────────────────────────── */
function CartRow({ item, onRemove, onQtyChange }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 0',
      borderBottom: '.5px solid var(--b)',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 76, height: 76, borderRadius: 12,
        background: 'var(--c3)', overflow: 'hidden',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!imgErr && item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <IconShoppingBag size={28} stroke={0.8} style={{ color: 'var(--b2)' }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
          {item.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--i4)' }}>{item.category}</p>
      </div>

      {/* Qty stepper */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        border: '0.5px solid var(--b)', borderRadius: 'var(--rp)', overflow: 'hidden',
      }}>
        <button
          onClick={() => item.qty > 1 ? onQtyChange(item.qty - 1) : onRemove()}
          aria-label="Reducir cantidad"
          style={stepBtn}
        >
          <IconMinus size={11} stroke={2.5} />
        </button>
        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, color: 'var(--ink)' }}>
          {item.qty}
        </span>
        <button
          onClick={() => onQtyChange(item.qty + 1)}
          aria-label="Aumentar cantidad"
          style={stepBtn}
        >
          <IconPlus size={11} stroke={2.5} />
        </button>
      </div>

      {/* Line total */}
      <p style={{
        fontSize: 15, color: 'var(--ink)', fontWeight: 400,
        minWidth: 90, textAlign: 'right',
      }}>
        ${(item.price * item.qty).toLocaleString('es-MX')}
      </p>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label={`Eliminar ${item.name}`}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--i4)',
          display: 'flex', alignItems: 'center',
          transition: 'color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
      >
        <IconX size={16} stroke={1.5} />
      </button>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyCart({ onBrowse }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', textAlign: 'center',
      gap: 16, paddingTop: 80,
    }}>
      <IconShoppingBag size={60} stroke={0.7} style={{ color: 'var(--b2)' }} />
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22, fontWeight: 400, color: 'var(--ink)',
      }}>
        Tu carrito está vacío
      </p>
      <p style={{ fontSize: 13, color: 'var(--i4)', maxWidth: 280, lineHeight: 1.7 }}>
        Explora el catálogo y encuentra algo que ames en tu camino.
      </p>
      <button
        onClick={onBrowse}
        className="btn-dark"
        style={{ marginTop: 8 }}
      >
        Explorar catálogo
      </button>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const backBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  fontSize: 12, letterSpacing: '.06em', color: 'var(--i4)',
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans',sans-serif", transition: 'color .2s',
}

const stepBtn = {
  width: 32, height: 32,
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--i3)',
}
