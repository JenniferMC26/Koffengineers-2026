/**
 * CLYRO — ProductsView
 * CRUD completo de productos para el panel admin.
 * Estructura: .crud-grid (lista izquierda + panel de edición derecho)
 *
 * GET    /api/admin/products
 * POST   /api/admin/products
 * PUT    /api/admin/products/:id
 * DELETE /api/admin/products/:id
 */
import { useEffect, useState } from 'react'
import {
  IconLoader2,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../api'
import { btnXs } from '../adminUtils.js'

/* ── Mock fallback ───────────────────────────────────────── */
const MOCK_PRODUCTS = [
  { id: 1,  name: 'Auriculares Bluetooth Pro',   category: 'Electrónica', price: 899, stock: 50, description: 'Sonido envolvente, batería 30h, cancelación de ruido.', image_url: '' },
  { id: 2,  name: 'Lámpara LED Escritorio',       category: 'Hogar',       price: 349, stock: 30, description: 'Luz cálida ajustable, diseño minimalista.', image_url: '' },
  { id: 3,  name: 'Sudadera Hoodie Premium',      category: 'Moda',        price: 549, stock: 3,  description: 'Algodón 100%, corte oversized.', image_url: '' },
  { id: 4,  name: 'Botella Térmica 1L',           category: 'Deporte',     price: 229, stock: 60, description: 'Acero inoxidable, mantiene temperatura 24h.', image_url: '' },
  { id: 5,  name: 'Python Crash Course',          category: 'Libros',      price: 350, stock: 25, description: 'Aprende Python desde cero.', image_url: '' },
  { id: 6,  name: 'Cargador USB-C 65W',           category: 'Electrónica', price: 299, stock: 40, description: 'Carga rápida compatible con todos los dispositivos.', image_url: '' },
]

const CATEGORIES = ['Electrónica', 'Hogar', 'Moda', 'Deporte', 'Libros', 'Otro']

const LOW_STOCK = 5

const BLANK_FORM = {
  name: '', description: '', price: '', old_price: '',
  stock: '', category: 'Electrónica', image_url: '',
}

/* ═══════════════════════════════════════════════════════════ */
export default function ProductsView() {
  const [products,  setProducts]  = useState(MOCK_PRODUCTS)
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(MOCK_PRODUCTS[0])   // product being edited (null = new)
  const [form,      setForm]      = useState(toForm(MOCK_PRODUCTS[0]))
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [confirmDel,setConfirmDel]= useState(false)
  const [isNew,     setIsNew]     = useState(false)

  const load = () => {
    setLoading(true)
    getAdminProducts()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.products ?? [])
        if (list.length) {
          setProducts(list)
          const first = list[0]
          setSelected(first)
          setForm(toForm(first))
          setIsNew(false)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  /* ── Select existing product ────────────────────────────── */
  const handleSelect = (p) => {
    setSelected(p)
    setForm(toForm(p))
    setIsNew(false)
    setConfirmDel(false)
  }

  /* ── Open blank form for new product ────────────────────── */
  const handleNew = () => {
    setSelected(null)
    setForm(BLANK_FORM)
    setIsNew(true)
    setConfirmDel(false)
  }

  /* ── Form field change ──────────────────────────────────── */
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  /* ── Save (create or update) ────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }
    setSaving(true)
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      old_price:   form.old_price ? parseFloat(form.old_price) : null,
      stock:       parseInt(form.stock) || 0,
      category:    form.category,
      image_url:   form.image_url.trim() || null,
    }
    try {
      if (isNew) {
        const created = await createAdminProduct(payload)
        const newProduct = created?.product ?? { ...payload, id: Date.now() }
        setProducts(prev => [newProduct, ...prev])
        setSelected(newProduct)
        setForm(toForm(newProduct))
        setIsNew(false)
        toast.success('Producto creado ✓')
      } else {
        const updated = await updateAdminProduct(selected.id, payload)
        const newProduct = updated?.product ?? { ...selected, ...payload }
        setProducts(prev => prev.map(p => p.id === selected.id ? newProduct : p))
        setSelected(newProduct)
        toast.success('Producto actualizado ✓')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ──────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!selected) return
    if (!confirmDel) { setConfirmDel(true); return }
    setDeleting(true)
    try {
      await deleteAdminProduct(selected.id)
      const remaining = products.filter(p => p.id !== selected.id)
      setProducts(remaining)
      const next = remaining[0] ?? null
      setSelected(next)
      setForm(next ? toForm(next) : BLANK_FORM)
      setIsNew(!next)
      setConfirmDel(false)
      toast.success('Producto desactivado ✓')
    } catch (err) {
      toast.error('Error al eliminar el producto')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}>
            Productos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--i4)' }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} en inventario
          </p>
        </div>
        <button
          onClick={handleNew}
          style={{ ...btnXs, background: 'var(--ink)', color: 'var(--c)', borderColor: 'var(--ink)' }}
          onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'var(--i2)', borderColor: 'var(--i2)' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'var(--ink)', borderColor: 'var(--ink)' })}
        >
          <IconPlus size={13} stroke={2} /> Nuevo producto
        </button>
      </div>

      {/* crud-grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── Left: product list ── */}
        <div style={{ border: '.5px solid var(--b)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {/* List header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '.5px solid var(--b)',
            background: 'var(--c2)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Inventario</span>
            <span style={{ fontSize: 11, color: 'var(--i4)' }}>{products.length} ítems</span>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
              <IconLoader2 size={24} stroke={1.5} style={{ color: 'var(--i4)', animation: 'adm-spin 1s linear infinite' }} />
            </div>
          )}

          {/* Product rows */}
          {!loading && products.map(p => (
            <ProductListItem
              key={p.id}
              product={p}
              active={selected?.id === p.id && !isNew}
              onClick={() => handleSelect(p)}
            />
          ))}

          {!loading && products.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--i4)' }}>
              Sin productos. Crea el primero.
            </div>
          )}
        </div>

        {/* ── Right: edit panel ── */}
        <form
          onSubmit={handleSave}
          style={{
            border: '.5px solid var(--b)',
            borderRadius: 'var(--r)',
            padding: 20,
            background: 'var(--c)',
            alignSelf: 'start',
            position: 'sticky', top: 20,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 14 }}>
            {isNew ? 'Nuevo producto' : 'Editar producto'}
          </p>

          {/* Image preview */}
          <div style={{
            width: '100%', height: 140,
            background: 'var(--c2)',
            borderRadius: 'var(--r)',
            border: '.5px dashed var(--b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            overflow: 'hidden',
          }}>
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--b2)' }}>
                <IconPhoto size={36} stroke={1} />
                <span style={{ fontSize: 11, color: 'var(--i4)' }}>Sin imagen</span>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            <EditField label="Nombre">
              <input className="efi" type="text" required placeholder="Nombre del producto" value={form.name} onChange={set('name')} />
            </EditField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <EditField label="Precio">
                <input className="efi" type="number" min="0" step="0.01" required placeholder="0.00" value={form.price} onChange={set('price')} />
              </EditField>
              <EditField label="Stock">
                <input className="efi" type="number" min="0" placeholder="0" value={form.stock} onChange={set('stock')} />
              </EditField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <EditField label="Precio anterior">
                <input className="efi" type="number" min="0" step="0.01" placeholder="Opcional" value={form.old_price} onChange={set('old_price')} />
              </EditField>
              <EditField label="Categoría">
                <select className="efi" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </EditField>
            </div>

            <EditField label="URL de imagen">
              <input className="efi" type="url" placeholder="https://…" value={form.image_url} onChange={set('image_url')} />
            </EditField>

            <EditField label="Descripción">
              <textarea
                className="efi"
                rows={2}
                placeholder="Breve descripción del producto"
                value={form.description}
                onChange={set('description')}
                style={{ resize: 'none' }}
              />
            </EditField>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1, background: saving ? 'var(--i3)' : 'var(--ink)',
                  color: 'var(--c)', border: 'none', borderRadius: 'var(--rp)',
                  padding: 11, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans',sans-serif", transition: '.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {saving
                  ? <IconLoader2 size={14} stroke={2} style={{ animation: 'adm-spin 1s linear infinite' }} />
                  : <IconPencil size={14} stroke={1.5} />
                }
                {saving ? 'Guardando…' : (isNew ? 'Crear producto' : 'Guardar cambios')}
              </button>

              {/* Delete (only for existing) */}
              {!isNew && selected && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  title={confirmDel ? '¿Confirmar eliminación?' : 'Eliminar producto'}
                  style={{
                    width: confirmDel ? 'auto' : 40,
                    padding: confirmDel ? '0 12px' : 0,
                    borderRadius: confirmDel ? 'var(--rp)' : '50%',
                    border: `.5px solid ${confirmDel ? '#a05050' : 'var(--b2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6,
                    fontSize: confirmDel ? 12 : 17,
                    color: confirmDel ? '#a05050' : 'var(--i3)',
                    cursor: 'pointer', background: 'transparent',
                    transition: '.2s',
                    fontFamily: "'DM Sans',sans-serif",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: '#a05050', color: '#a05050' })}
                  onMouseLeave={e => {
                    if (!confirmDel) Object.assign(e.currentTarget.style, { borderColor: 'var(--b2)', color: 'var(--i3)' })
                  }}
                >
                  {deleting
                    ? <IconLoader2 size={14} stroke={2} style={{ animation: 'adm-spin 1s linear infinite' }} />
                    : <IconTrash size={16} stroke={1.5} />
                  }
                  {confirmDel && <span>¿Eliminar?</span>}
                </button>
              )}
            </div>

            {/* Confirm delete hint */}
            {confirmDel && (
              <p style={{ fontSize: 11, color: '#a05050', textAlign: 'center', marginTop: 2 }}>
                Haz clic de nuevo para confirmar la eliminación.{' '}
                <button
                  type="button"
                  onClick={() => setConfirmDel(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--i4)', fontSize: 11, fontFamily: "'DM Sans',sans-serif", textDecoration: 'underline' }}
                >
                  Cancelar
                </button>
              </p>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .efi {
          background: var(--c2);
          border: .5px solid var(--b);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .2s;
          width: 100%;
        }
        .efi:focus { border-color: var(--ink); }
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        @media(max-width:900px){
          [data-crud-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Product list item ───────────────────────────────────── */
function ProductListItem({ product, active, onClick }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const lowStock = (product.stock ?? 0) <= LOW_STOCK

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        borderBottom: '.5px solid var(--b)',
        cursor: 'pointer',
        background: active || hov ? 'var(--c2)' : 'transparent',
        transition: 'background .15s',
      }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Thumbnail */}
      <div style={{
        width: 44, height: 44, borderRadius: 8,
        background: 'var(--c3)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 22,
      }}>
        {!imgErr && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>🛍️</span>
        )}
      </div>

      {/* Name + category */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--i4)', marginTop: 1 }}>{product.category}</div>
      </div>

      {/* Price */}
      <div style={{ fontSize: 13, color: 'var(--ink)', marginLeft: 'auto', flexShrink: 0 }}>
        ${(product.price ?? 0).toLocaleString('es-MX')}
      </div>

      {/* Stock badge */}
      <div style={{
        fontSize: 10, padding: '3px 10px', borderRadius: 'var(--rp)',
        background: lowStock ? '#f2e8e0' : 'var(--c3)',
        color:      lowStock ? '#6a3a1a' : 'var(--i4)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {product.stock ?? 0} uds
      </div>
    </div>
  )
}

/* ── Edit panel field wrapper ────────────────────────────── */
function EditField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--i4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

/* ── Helper: product → form values ──────────────────────── */
function toForm(p) {
  if (!p) return BLANK_FORM
  return {
    name:        p.name        ?? '',
    description: p.description ?? '',
    price:       p.price       ?? '',
    old_price:   p.old_price   ?? '',
    stock:       p.stock       ?? '',
    category:    p.category    ?? 'Electrónica',
    image_url:   p.image_url   ?? '',
  }
}
