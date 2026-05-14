/**
 * CLYRO — CartDrawer
 * Panel lateral con glassmorphism que se desliza desde la derecha.
 * Se abre automáticamente al añadir un producto y desde el ícono de carrito.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconX,
} from '@tabler/icons-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, subtotal, itemCount, isOpen, setIsOpen, removeItem, updateQty } = useCart()
  const navigate = useNavigate()

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,25,24,.30)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 800,
          animation: 'clyro-fadein .25s ease both',
        }}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(420px, 100vw)',
          background: 'rgba(244,242,237,.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '0.5px solid var(--b)',
          display: 'flex', flexDirection: 'column',
          zIndex: 900,
          boxShadow: '-8px 0 48px rgba(26,25,24,.12)',
          animation: 'drawer-slide-in .38s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px',
          borderBottom: '0.5px solid var(--b)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconShoppingBag size={18} stroke={1.5} style={{ color: 'var(--ink)' }} />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 400, color: 'var(--ink)',
            }}>
              Tu carrito
            </span>
            {itemCount > 0 && (
              <span style={{
                background: 'var(--ink)', color: 'var(--c)',
                borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 500, flexShrink: 0,
              }}>
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--i3)', padding: 6,
              display: 'flex', alignItems: 'center',
              borderRadius: 8, transition: 'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--i3)'}
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {/* Items list */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {items.length === 0 ? (
            <EmptyState onClose={() => setIsOpen(false)} navigate={navigate} />
          ) : (
            items.map(item => (
              <DrawerItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onQtyChange={(q) => updateQty(item.id, q)}
              />
            ))
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '0.5px solid var(--b)',
            flexShrink: 0,
          }}>
            {/* Subtotal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 12, color: 'var(--i4)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Subtotal
              </span>
              <span style={{ fontSize: 22, fontWeight: 300, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                ${subtotal.toLocaleString('es-MX')}
              </span>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => { setIsOpen(false); navigate('/checkout') }}
              className="btn-dark"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, letterSpacing: '.06em' }}
            >
              Continuar al pago
            </button>

            {/* Keep shopping */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--i4)', marginTop: 10, padding: 6,
                fontFamily: "'DM Sans', sans-serif", transition: 'color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

/* ── Item row inside drawer ───────────────────────────────── */
function DrawerItem({ item, onRemove, onQtyChange }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* Thumbnail */}
      <div style={{
        width: 64, height: 64, borderRadius: 10,
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
          <IconShoppingBag size={24} stroke={0.8} style={{ color: 'var(--b2)' }} />
        )}
      </div>

      {/* Info + controls */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 500, color: 'var(--ink)',
          lineHeight: 1.3, marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--i4)', marginBottom: 8 }}>
          {item.category}
        </p>

        {/* Qty stepper + remove link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            border: '0.5px solid var(--b)', borderRadius: 'var(--rp)', overflow: 'hidden',
          }}>
            <button
              onClick={() => item.qty > 1 ? onQtyChange(item.qty - 1) : onRemove()}
              aria-label="Reducir cantidad"
              style={stepBtn}
            >
              <IconMinus size={10} stroke={2.5} />
            </button>
            <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink)' }}>
              {item.qty}
            </span>
            <button
              onClick={() => onQtyChange(item.qty + 1)}
              aria-label="Aumentar cantidad"
              style={stepBtn}
            >
              <IconPlus size={10} stroke={2.5} />
            </button>
          </div>

          <button
            onClick={onRemove}
            style={{
              fontSize: 11, color: 'var(--i4)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Line price */}
      <p style={{ fontSize: 14, color: 'var(--ink)', flexShrink: 0, paddingTop: 2 }}>
        ${(item.price * item.qty).toLocaleString('es-MX')}
      </p>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────── */
function EmptyState({ onClose, navigate }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, paddingTop: 60, textAlign: 'center',
    }}>
      <IconShoppingBag size={52} stroke={0.8} style={{ color: 'var(--b2)' }} />
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 18, fontWeight: 400, color: 'var(--ink)',
      }}>
        Tu carrito está vacío
      </p>
      <p style={{ fontSize: 12, color: 'var(--i4)', maxWidth: 220 }}>
        Explora el catálogo y añade algo bonito a tu camino
      </p>
      <button
        onClick={() => { onClose(); navigate('/catalog') }}
        className="btn-outline"
        style={{ marginTop: 8, fontSize: 12 }}
      >
        Ver catálogo
      </button>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const stepBtn = {
  width: 28, height: 28,
  background: 'none', border: 'none',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--i3)',
}
