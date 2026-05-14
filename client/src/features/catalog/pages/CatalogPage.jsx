/**
 * CLYRO — CatalogPage
 * ──────────────────────────────────────────────────────────────
 * Layout:
 *   • Playfair heading + minimal search bar (top row)
 *   • Category chip pills (horizontal scroll on mobile)
 *   • Product grid — auto-fill minmax(220px,1fr)
 *   • Skeleton cards while loading
 *   • Empty state with sage illustration text
 *
 * Data:
 *   GET /api/products?search=&category=&page=  (400ms debounce on search)
 *   GET /api/categories
 *   Falls back to MOCK data if API unavailable.
 * ──────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconSearch, IconX } from '@tabler/icons-react'
import { getCategories, getProducts } from '../api'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../mockData'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/SkeletonCard'

const DEBOUNCE_MS = 400
const PAGE_SIZE   = 12

export default function CatalogPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  /* ── State ─────────────────────────────────────────────── */
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'Todos')

  const debounceRef = useRef(null)

  /* ── Load categories once ────────────────────────────────── */
  useEffect(() => {
    getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories(MOCK_CATEGORIES))
  }, [])

  /* ── Load products ──────────────────────────────────────── */
  const fetchProducts = useCallback(async (search, category) => {
    setLoading(true)
    const params = { page: 1, limit: PAGE_SIZE }
    if (search)   params.search   = search
    if (category && category !== 'Todos') params.category = category

    try {
      const data = await getProducts(params)
      const list = Array.isArray(data) ? data : data.products ?? []
      setProducts(list)
    } catch {
      // Filter mock data locally
      let list = [...MOCK_PRODUCTS]
      if (search)   list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      if (category && category !== 'Todos') list = list.filter(p => p.category === category)
      setProducts(list)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Sync URL params → state on mount ────────────────────── */
  useEffect(() => {
    fetchProducts(searchInput, activeCategory)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs only once on mount

  /* ── Search with debounce ────────────────────────────────── */
  const handleSearch = (value) => {
    setSearchInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchParams(p => {
        const next = new URLSearchParams(p)
        value ? next.set('search', value) : next.delete('search')
        return next
      })
      fetchProducts(value, activeCategory)
    }, DEBOUNCE_MS)
  }

  /* ── Category chip click ─────────────────────────────────── */
  const handleCategory = (cat) => {
    setActiveCategory(cat)
    setSearchParams(p => {
      const next = new URLSearchParams(p)
      cat === 'Todos' ? next.delete('category') : next.set('category', cat)
      return next
    })
    fetchProducts(searchInput, cat)
  }

  return (
    <div style={{
      padding: 'clamp(40px,5vw,60px) clamp(20px,5vw,60px) 60px',
      paddingLeft: 'max(clamp(20px,5vw,60px), 80px)',
      background: 'var(--c)',
      minHeight: '100vh',
    }}>

      {/* ── Header row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px,3vw,42px)', fontWeight: 400,
            color: 'var(--ink)', letterSpacing: '-.01em', margin: 0,
          }}
        >
          Catálogo
        </h1>

        {/* Search bar */}
        <label
          htmlFor="catalog-search"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--c2)', border: '0.5px solid var(--b)',
            borderRadius: 'var(--rp)', padding: '10px 20px',
            fontSize: 13, color: 'var(--i4)',
            minWidth: 240, cursor: 'text',
            transition: 'border-color .2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--ink)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--b)'}
        >
          <IconSearch size={15} stroke={1.5} aria-hidden="true" />
          <input
            id="catalog-search"
            type="search"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar productos..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif",
              width: '100%',
            }}
            aria-label="Buscar productos"
          />
          {searchInput && (
            <button
              onClick={() => handleSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--i4)', display: 'flex' }}
              aria-label="Limpiar búsqueda"
            >
              <IconX size={14} stroke={1.5} />
            </button>
          )}
        </label>
      </div>

      {/* ── Category chips ── */}
      <div
        style={{ display: 'flex', gap: 6, marginBottom: 36, flexWrap: 'wrap' }}
        role="group"
        aria-label="Filtrar por categoría"
      >
        {['Todos', ...categories.map(c => c.name)].map(cat => (
          <button
            key={cat}
            id={`cat-chip-${cat}`}
            onClick={() => handleCategory(cat)}
            style={{
              fontSize: 12, padding: '7px 18px',
              borderRadius: 'var(--rp)',
              border: activeCategory === cat ? '0.5px solid var(--ink)' : '0.5px solid var(--b)',
              background: activeCategory === cat ? 'var(--ink)' : 'var(--c)',
              color: activeCategory === cat ? 'var(--c)' : 'var(--i3)',
              cursor: 'pointer',
              transition: 'all .2s',
              fontFamily: "'DM Sans', sans-serif",
              userSelect: 'none',
            }}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Product grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {Array.from({ length: PAGE_SIZE }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--c2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 28,
          }}>
            ◌
          </div>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontSize: 22,
            fontWeight: 400, color: 'var(--ink)', marginBottom: 8,
          }}>
            Sin resultados
          </p>
          <p style={{ fontSize: 13, color: 'var(--i4)' }}>
            Intenta con otra búsqueda o categoría.
          </p>
          <button
            onClick={() => { handleSearch(''); handleCategory('Todos') }}
            style={{
              marginTop: 24, background: 'var(--ink)', color: 'var(--c)',
              border: 'none', borderRadius: 'var(--rp)', padding: '12px 24px',
              fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Ver todo
          </button>
        </div>
      ) : (
        <div
          id="product-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}
        >
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => navigate(`/product/${p.slug}`)}
            />
          ))}
        </div>
      )}

      {/* Count label */}
      {!loading && products.length > 0 && (
        <p style={{ marginTop: 32, fontSize: 11, color: 'var(--i4)', letterSpacing: '.06em' }}>
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
