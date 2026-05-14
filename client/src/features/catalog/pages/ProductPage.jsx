/**
 * CLYRO — ProductPage (Detail)
 * ──────────────────────────────────────────────────────────────
 * Layout (from clyro_v4.html .detail-modal adapted as full page):
 *
 * [Left]  cream bg — large product image + thumbnail row
 * [Right] product info — brand / Playfair title / stars /
 *         divider / price / description / color dots /
 *         qty stepper / add-to-cart + wishlist
 *
 * Data:  GET /api/products/:slug
 *        Falls back to mock by matching slug in MOCK_PRODUCTS.
 * ──────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft, IconHeart, IconLoader2,
  IconMinus, IconPlus, IconShoppingBag,
} from '@tabler/icons-react'
import { toast, Toaster } from 'sonner'
import { getProduct }    from '../api'
import { MOCK_PRODUCTS } from '../mockData'
import { useCart }       from '../../../context/CartContext'

/* ── Colour swatch data (decorative) ─────────────────────── */
const COLOUR_SWATCHES = ['#E8E2D9', '#2B2926', '#7A8C78', '#C4B49A', '#D4C5B2']

export default function ProductPage() {
  const { id: slug } = useParams()
  const navigate = useNavigate()

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [qty,      setQty]      = useState(1)
  const [activeImg,setActiveImg]= useState(0)
  const [activeClr,setActiveClr]= useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError, setImgError] = useState(false)

  const { addItem } = useCart()

  /* ── Fake thumbnail array from same picsum seed variants ── */
  const thumbnails = product
    ? [
        product.image_url,
        `https://picsum.photos/seed/${slug}2/480/480`,
        `https://picsum.photos/seed/${slug}3/480/480`,
      ]
    : []

  /* ── Fetch product ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    ;(async () => {
      try {
        const data = await getProduct(slug)
        if (!cancelled) setProduct(data)
      } catch {
        // Fallback to mock
        const mock = MOCK_PRODUCTS.find(p => p.slug === slug || String(p.id) === slug)
        if (!cancelled) {
          if (mock) setProduct(mock)
          else setError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [slug])

  /* ── Qty handlers ──────────────────────────────────────── */
  const dec = () => setQty(q => Math.max(1, q - 1))
  const inc = () => setQty(q => Math.min(product?.stock ?? 99, q + 1))

  /* ── Add to cart ───────────────────────────────────────── */
  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success(`${product.name} añadido al carrito`)
  }

  /* ── Loading skeleton ──────────────────────────────────── */
  if (loading) return <DetailSkeleton />

  /* ── Error ─────────────────────────────────────────────── */
  if (error || !product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--c)' }}>
      <IconShoppingBag size={48} stroke={1} style={{ color: 'var(--b2)' }} />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--ink)' }}>Producto no encontrado</p>
      <button onClick={() => navigate('/catalog')} style={btnDark}>Volver al catálogo</button>
    </div>
  )

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "'DM Sans',sans-serif", fontSize: 13, borderRadius: 'var(--rp)' } }} />

      <div style={{ minHeight: '100vh', background: 'var(--c)' }}>
        {/* ── Back link ── */}
        <div style={{ padding: '24px 32px 0', paddingLeft: 'max(32px,80px)' }}>
          <button
            id="product-back-btn"
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12, letterSpacing: '.06em', color: 'var(--i4)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--i4)'}
          >
            <IconArrowLeft size={14} stroke={1.5} /> Volver
          </button>
        </div>

        {/* ════════════════════════════════════════════════
            SPLIT LAYOUT
            ════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 'calc(100vh - 60px)',
        }}>

          {/* ── Left: image panel ── */}
          <div style={{
            background: 'var(--c2)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 48, gap: 20,
            position: 'sticky', top: 0, alignSelf: 'start',
            minHeight: 'calc(100vh - 60px)',
          }}>
            {/* Main image */}
            <div style={{
              width: '100%', maxWidth: 340, aspectRatio: '1/1',
              borderRadius: 'var(--rl)', background: 'var(--c3)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!imgError ? (
                <img
                  src={thumbnails[activeImg]}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .3s' }}
                />
              ) : (
                <IconShoppingBag size={80} stroke={.8} style={{ color: 'var(--b2)' }} />
              )}
            </div>

            {/* Thumbnail strip */}
            <div style={{ display: 'flex', gap: 8 }}>
              {thumbnails.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setImgError(false) }}
                  style={{
                    width: 50, height: 50, borderRadius: 10,
                    overflow: 'hidden', border: activeImg === i ? '1.5px solid var(--ink)' : '1.5px solid transparent',
                    background: 'var(--c4)', cursor: 'pointer', padding: 0,
                    transition: 'border-color .2s',
                  }}
                  aria-label={`Imagen ${i + 1}`}
                  aria-pressed={activeImg === i}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: info panel ── */}
          <div style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Brand */}
            <p style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--i4)', marginBottom: 8 }}>
              {product.category}
            </p>

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(26px,3vw,36px)', fontWeight: 400,
                color: 'var(--ink)', lineHeight: 1.2, marginBottom: 10,
              }}
            >
              {product.name}
            </h1>

            {/* Stars (decorative) */}
            <div style={{ fontSize: 13, color: 'var(--ink)', letterSpacing: 2, marginBottom: 20 }}>
              ★★★★☆ <span style={{ fontSize: 12, color: 'var(--i4)', letterSpacing: 'normal', marginLeft: 4 }}>(42 reseñas)</span>
            </div>

            <Divider />

            {/* Prices */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, marginTop: 16 }}>
              <span style={{ fontSize: 'clamp(28px,3vw,36px)', fontWeight: 300, color: 'var(--ink)', letterSpacing: '-.02em' }}>
                ${product.price.toLocaleString('es-MX')}
              </span>
              {product.old_price && (
                <span style={{ fontSize: 15, color: 'var(--i4)', textDecoration: 'line-through' }}>
                  ${product.old_price.toLocaleString('es-MX')}
                </span>
              )}
              {discount && (
                <span style={{ fontSize: 11, background: '#e8f2e4', color: '#4a7a3a', padding: '3px 10px', borderRadius: 'var(--rp)' }}>
                  -{discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: 13, color: 'var(--i4)', lineHeight: 1.8, marginBottom: 20 }}>
              {product.description}
            </p>

            <Divider />

            {/* Colour selector */}
            <div style={{ marginTop: 16, marginBottom: 22 }}>
              <p style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--i4)', marginBottom: 8 }}>
                Color
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLOUR_SWATCHES.map((hex, i) => (
                  <button
                    key={hex}
                    onClick={() => setActiveClr(i)}
                    aria-label={`Color ${i + 1}`}
                    aria-pressed={activeClr === i}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: hex,
                      border: activeClr === i ? '2px solid var(--ink)' : '2px solid transparent',
                      outline: activeClr === i ? '2px solid rgba(26,25,24,.2)' : 'none',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      transform: activeClr === i ? 'scale(1.12)' : 'scale(1)',
                      transition: 'transform .2s, border-color .2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity stepper */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--i4)', marginBottom: 8 }}>
                Cantidad
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, border: '0.5px solid var(--b)', borderRadius: 'var(--rp)', overflow: 'hidden' }}>
                <button
                  id="qty-decrease"
                  onClick={dec}
                  disabled={qty <= 1}
                  style={qtyBtn}
                  aria-label="Disminuir cantidad"
                >
                  <IconMinus size={14} stroke={2} />
                </button>
                <span
                  style={{
                    minWidth: 48, textAlign: 'center',
                    fontSize: 15, fontWeight: 400, color: 'var(--ink)',
                    padding: '0 4px',
                  }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {qty}
                </span>
                <button
                  id="qty-increase"
                  onClick={inc}
                  disabled={qty >= (product.stock ?? 99)}
                  style={qtyBtn}
                  aria-label="Aumentar cantidad"
                >
                  <IconPlus size={14} stroke={2} />
                </button>
              </div>
              <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--i4)' }}>
                {product.stock} disponibles
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {/* Add to cart */}
              <button
                id="add-to-cart-main"
                onClick={handleAddToCart}
                style={{
                  ...btnDark, flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
                onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(26,25,24,.15)' })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
              >
                <IconShoppingBag size={16} stroke={1.5} />
                Añadir al carrito
              </button>

              {/* Wishlist */}
              <button
                id="wishlist-btn"
                onClick={() => setWishlisted(w => !w)}
                style={{
                  width: 50, height: 50,
                  borderRadius: '50%',
                  border: wishlisted ? '0.5px solid var(--ink)' : '0.5px solid var(--b2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  color: wishlisted ? 'var(--ink)' : 'var(--i3)',
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'border-color .2s, color .2s',
                }}
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-pressed={wishlisted}
              >
                <IconHeart size={18} stroke={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Secure badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 11, color: 'var(--i4)' }}>
              🔒 Compra 100% segura · Devoluciones gratis en 30 días
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media(max-width:768px){
          #product-detail-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function Divider() {
  return <div style={{ height: .5, background: 'var(--b)', margin: '8px 0' }} />
}

/* ── Shared styles ───────────────────────────────────────── */
const btnDark = {
  background: 'var(--ink)', color: 'var(--c)',
  border: 'none', borderRadius: 'var(--rp)', padding: 16,
  fontSize: 13, letterSpacing: '.06em', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s',
}

const qtyBtn = {
  width: 40, height: 40,
  background: 'transparent', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--ink)',
  transition: 'background .15s',
}

/* ── Skeleton ────────────────────────────────────────────── */
function DetailSkeleton() {
  const s = (w, h) => ({
    width: w, height: h,
    background: 'var(--c3)', borderRadius: 8,
    position: 'relative', overflow: 'hidden',
  })
  const sh = {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.4) 50%,transparent 100%)',
    animation: 'clyro-shimmer 1.6s infinite',
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: 'var(--c)' }}>
      <div style={{ background: 'var(--c2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 20 }}>
        <div style={{ ...s('100%', 340), borderRadius: 'var(--rl)' }}><div style={sh} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ ...s(50,50), borderRadius: 10 }}><div style={sh} /></div>)}
        </div>
      </div>
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[[60,10],[200,14],[120,12],[40,32],[300,14],[300,14],[200,14]].map(([w,h],i) => (
          <div key={i} style={s(w,h)}><div style={sh} /></div>
        ))}
      </div>
    </div>
  )
}
