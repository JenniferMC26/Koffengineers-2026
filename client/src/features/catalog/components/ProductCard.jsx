/**
 * CLYRO — ProductCard
 * ──────────────────────────────────────────────────────────────
 * Visual spec from clyro_v4.html  .pcard / .pc-*
 *
 * • No hard border — uses clyro-card bg instead
 * • 200 px image area with subtle gradient overlay
 * • Category label UPPERCASE / ink-4
 * • Name 14 px / 500 weight
 * • Price 17 px, optional strikethrough old price
 * • Circular add-to-cart button appears on hover (opacity 0 → 1)
 * • Card lifts 6px on hover with soft shadow
 *
 * Props:
 *   product   { id, slug, name, category, price, old_price, image_url }
 *   onAddToCart  (product) => void   — optional, fires cart action
 *   onClick      (product) => void   — optional, navigates to detail
 * ──────────────────────────────────────────────────────────────
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconShoppingBag } from '@tabler/icons-react'

export default function ProductCard({ product, onAddToCart, onClick }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [hovering, setHovering] = useState(false)

  const handleClick = () => {
    if (onClick) return onClick(product)
    navigate(`/product/${product.slug}`)
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (onAddToCart) onAddToCart(product)
  }

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: 'var(--c2)',
        borderRadius: 'var(--rl)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transform: hovering ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovering ? '0 20px 48px rgba(26,25,24,.10)' : 'none',
        transition: 'transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s cubic-bezier(.16,1,.3,1)',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${product.name}`}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {/* ── Image area ── */}
      <div
        style={{
          height: 200,
          background: 'var(--c3)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
              transform: hovering ? 'scale(1.04)' : 'scale(1)',
            }}
            loading="lazy"
          />
        ) : (
          /* Fallback emoji if image fails */
          <IconShoppingBag size={56} stroke={1} style={{ color: 'var(--b2)' }} />
        )}

        {/* Gradient overlay (always present) */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(26,25,24,.06))',
          }}
        />

        {/* Discount badge */}
        {discount && (
          <div
            style={{
              position: 'absolute', top: 12, left: 12,
              background: '#e8f2e4', color: '#4a7a3a',
              fontSize: 10, padding: '3px 10px',
              borderRadius: 'var(--rp)',
              letterSpacing: '.04em',
            }}
          >
            -{discount}%
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 18px 20px' }}>
        {/* Category */}
        <p style={{
          fontSize: 10, letterSpacing: '.14em',
          textTransform: 'uppercase', color: 'var(--i4)',
          marginBottom: 5,
        }}>
          {product.category}
        </p>

        {/* Name */}
        <p style={{
          fontSize: 14, fontWeight: 500, color: 'var(--ink)',
          lineHeight: 1.3, marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </p>

        {/* Price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 17, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              ${product.price.toLocaleString('es-MX')}
            </span>
            {product.old_price && (
              <span style={{ fontSize: 12, color: 'var(--i4)', textDecoration: 'line-through' }}>
                ${product.old_price.toLocaleString('es-MX')}
              </span>
            )}
          </div>

          {/* Circular add button — visible on hover only */}
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAdd}
            aria-label={`Agregar ${product.name} al carrito`}
            style={{
              width: 34, height: 34,
              background: 'var(--ink)',
              borderRadius: '50%',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--c)',
              cursor: 'pointer',
              opacity: hovering ? 1 : 0,
              transform: hovering ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity .25s, transform .25s',
              flexShrink: 0,
            }}
          >
            <IconPlus size={15} stroke={2} />
          </button>
        </div>
      </div>
    </article>
  )
}
