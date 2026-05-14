/**
 * CLYRO — HomePage
 * ──────────────────────────────────────────────────────────────
 * Layout (from clyro_v4.html .hero):
 *
 * [Left]  Hero copy — tag / h1 Playfair / subtitle / CTA buttons
 * [Right] Animated ring + floating product circle + glassmorphism cards
 * [Below] Marquee bar (dark strip)
 * [Below] "Destacados" grid — top 4 products
 * ──────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import { getProducts }  from '../api'
import { MOCK_PRODUCTS } from '../mockData'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/SkeletonCard'

/* ── Marquee items ─────────────────────────────────────────── */
const MARQUEE = ['Electrónica', 'Hogar', 'Moda', 'Deporte', 'Libros',
                 'Todo claro en tu camino', 'On My Way']
const MARQUEE_DOUBLED = [...MARQUEE, ...MARQUEE] // infinite loop trick

/* ── Featured hero image (first product image) ────────────── */
const HERO_IMG = MOCK_PRODUCTS[0].image_url

export default function HomePage() {
  const navigate  = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)

  /* ── Fetch top 4 featured products ──────────────────────── */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getProducts({ page: 1, limit: 4 })
        // data may be { products: [...] } or directly an array
        const products = Array.isArray(data) ? data : data.products ?? []
        if (!cancelled) setFeatured(products.slice(0, 4))
      } catch {
        // API not available — use mock data
        if (!cancelled) setFeatured(MOCK_PRODUCTS.slice(0, 4))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const products = loading ? [] : featured

  return (
    <div style={{ background: 'var(--c)', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'clamp(280px,50%,640px) 1fr',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-labelledby="hero-heading"
      >
        {/* ── Left — Copy ── */}
        <div style={{
          padding: 'clamp(60px,8vw,120px) clamp(32px,5vw,80px) 60px clamp(48px,6vw,96px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24,
        }}>
          {/* Tag line */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--i4)',
          }}>
            <span style={{ width: 28, height: .5, background: 'var(--i4)', display: 'block' }} />
            nueva colección · primavera 2026
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px,5.5vw,72px)',
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: '-.02em',
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Todo claro<br />
            en tu <em style={{ fontStyle: 'italic', color: 'var(--i3)' }}>camino</em>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 14, color: 'var(--i4)', lineHeight: 1.8, maxWidth: 340, margin: 0,
          }}>
            Descubre productos cuidadosamente seleccionados. Sin ruido, sin prisa. Solo lo que necesitas.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            <Link
              to="/catalog"
              id="hero-cta-catalog"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--ink)', color: 'var(--c)',
                borderRadius: 'var(--rp)', padding: '14px 28px',
                fontSize: 13, letterSpacing: '.05em', textDecoration: 'none',
                transition: 'transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(26,25,24,.15)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: 'none' })}
            >
              Explorar catálogo <IconArrowRight size={15} stroke={1.5} />
            </Link>

            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                border: '0.5px solid var(--b2)', color: 'var(--i3)',
                borderRadius: 'var(--rp)', padding: '14px 28px',
                fontSize: 13, cursor: 'pointer', background: 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color .3s, color .3s',
              }}
              onClick={() => navigate('/catalog')}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--ink)', color: 'var(--ink)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--b2)', color: 'var(--i3)' })}
            >
              Ver novedades
            </button>
          </div>
        </div>

        {/* ── Right — Visual ── */}
        <div style={{
          background: 'var(--c2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
          aria-hidden="true"
        >
          {/* Spinning rings */}
          <div style={ring(420, 40)} />
          <div style={ring(520, 60, true)} />

          {/* Hero image circle */}
          <div style={{
            width: 300, height: 300, borderRadius: '50%',
            background: 'var(--c3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            overflow: 'hidden',
            animation: 'hero-float 6s ease-in-out infinite',
          }}>
            <img src={HERO_IMG} alt="Producto destacado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Float card — price */}
          <div style={{
            position: 'absolute', bottom: 40, left: 40,
            background: 'rgba(244,242,237,.92)',
            border: '0.5px solid var(--b)', borderRadius: 'var(--r)',
            padding: '14px 20px', backdropFilter: 'blur(20px)',
            zIndex: 2, animation: 'hero-slideup .8s .4s ease both',
          }}>
            <div style={{ fontSize: 10, color: 'var(--i4)', letterSpacing: '.1em', marginBottom: 3 }}>Producto destacado</div>
            <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              ${MOCK_PRODUCTS[0].price.toLocaleString('es-MX')} MXN
            </div>
            <div style={{ fontSize: 11, color: 'var(--sage)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 7 }}>●</span> En stock · 50 unidades
            </div>
          </div>

          {/* Float card 2 — discount */}
          <div style={{
            position: 'absolute', top: 40, right: 40,
            background: 'var(--ink)', borderRadius: 'var(--r)',
            padding: '14px 20px', zIndex: 2,
            animation: 'hero-slideup .8s .6s ease both',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(244,242,237,.4)', letterSpacing: '.1em', marginBottom: 3 }}>Ahorro</div>
            <div style={{ fontSize: 22, fontWeight: 200, color: 'var(--c)' }}>25%</div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          MARQUEE BAR
          ════════════════════════════════════════════════════ */}
      <div className="marquee-bar" aria-hidden="true">
        <div className="marquee-track">
          {MARQUEE_DOUBLED.map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          FEATURED PRODUCTS
          ════════════════════════════════════════════════════ */}
      <section
        style={{ padding: 'clamp(60px,8vw,96px) clamp(32px,6vw,96px)', paddingLeft: 'max(clamp(32px,6vw,96px), 88px)' }}
        aria-labelledby="featured-heading"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--i4)' }} />
              <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--i4)' }}>selección editorial</span>
            </div>
            <h2
              id="featured-heading"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px,3vw,42px)', fontWeight: 400,
                color: 'var(--ink)', letterSpacing: '-.01em', margin: 0,
              }}
            >
              Lo más claro
            </h2>
          </div>

          <Link
            to="/catalog"
            style={{
              fontSize: 13, color: 'var(--i3)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color .2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--i3)'}
          >
            Ver todo el catálogo <IconArrowRight size={14} stroke={1.5} />
          </Link>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {loading
            ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
            : products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => navigate(`/product/${p.slug}`)}
                />
              ))
          }
        </div>
      </section>

      {/* ── Keyframes (injected once) ── */}
      <style>{`
        @keyframes hero-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes hero-slideup  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-spin     { to{transform:rotate(360deg)} }
        @media(max-width:768px){
          section[aria-labelledby="hero-heading"]{grid-template-columns:1fr!important}
          section[aria-labelledby="hero-heading"] > div:last-child{display:none!important}
        }
      `}</style>
    </div>
  )
}

/* ── Ring helper ─────────────────────────────────────────── */
function ring(size, duration, reverse = false) {
  return {
    position: 'absolute',
    width: size, height: size,
    borderRadius: '50%',
    border: reverse ? '.5px dashed var(--b2)' : '.5px solid var(--b)',
    animation: `hero-spin ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
  }
}
