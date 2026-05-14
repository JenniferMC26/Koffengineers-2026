/**
 * CLYRO — Test helpers (ESM)
 * Mock data y utilidades de setup compartidas por todos los specs.
 */

/* ── JWT mock ────────────────────────────────────────────── */
// Base64 estándar que atob() en el navegador puede decodificar sin problemas.
// exp: 9999999999 (año 2286) — nunca expira en las pruebas.
function encodedPayload(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '')
}

const CLIENT_PAYLOAD = encodedPayload({
  sub: '1', role: 'client',
  name: 'Jennifer M.', email: 'jennifer@clyro.com',
  exp: 9999999999,
})

const ADMIN_PAYLOAD = encodedPayload({
  sub: '99', role: 'admin',
  name: 'Admin CLYRO', email: 'admin@clyro.com',
  exp: 9999999999,
})

const HEADER = encodedPayload({ alg: 'HS256', typ: 'JWT' })

export const CLIENT_TOKEN = `${HEADER}.${CLIENT_PAYLOAD}.mock_sig`
export const ADMIN_TOKEN  = `${HEADER}.${ADMIN_PAYLOAD}.mock_sig`

/* ── Mock API data ───────────────────────────────────────── */
export const MOCK_USER = {
  id: 1, name: 'Jennifer M.', email: 'jennifer@clyro.com', role: 'client',
}

export const MOCK_ADMIN_USER = {
  id: 99, name: 'Admin CLYRO', email: 'admin@clyro.com', role: 'admin',
}

export const MOCK_PRODUCTS = [
  {
    id: 1, slug: 'auriculares-bt-pro',
    name: 'Auriculares Bluetooth Pro',
    category: 'Electrónica', price: 899, old_price: 1200,
    image_url: 'https://picsum.photos/seed/headphones/480/480',
    description: 'Sonido envolvente con cancelación activa de ruido.',
    stock: 50, active: true,
  },
  {
    id: 2, slug: 'lampara-stone',
    name: 'Lámpara Stone Edition',
    category: 'Hogar', price: 1250, old_price: null,
    image_url: 'https://picsum.photos/seed/lamp/480/480',
    description: 'Luminaria de concreto pulido.',
    stock: 20, active: true,
  },
  {
    id: 3, slug: 'tote-canvas',
    name: 'Tote Canvas Natural',
    category: 'Moda', price: 380, old_price: null,
    image_url: 'https://picsum.photos/seed/tote/480/480',
    description: 'Bolso de algodón orgánico.',
    stock: 80, active: true,
  },
]

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Electrónica' },
  { id: 2, name: 'Hogar' },
  { id: 3, name: 'Moda' },
  { id: 4, name: 'Deporte' },
  { id: 5, name: 'Libros' },
]

export const MOCK_CART_ITEMS = [
  {
    id: 1, name: 'Auriculares Bluetooth Pro',
    price: 899, qty: 1, category: 'Electrónica',
    image_url: '',
  },
]

export const MOCK_ORDERS = [
  { id: 1, customer_name: 'Jennifer M.', customer_initials: 'JM', total: 1397, shipping_method: 'Express',  created_at: '2026-05-13', status: 'processing' },
  { id: 2, customer_name: 'Ana R.',      customer_initials: 'AR', total: 349,  shipping_method: 'Estándar', created_at: '2026-05-12', status: 'shipped'    },
]

export const MOCK_STATS = {
  sales_today: 12480, orders_count: 34, active_products: 128, users_count: 891,
}

/* ── loginAs: inyecta sesión autenticada ─────────────────── */
// page.route y page.addInitScript DEBEN llamarse ANTES de page.goto().
// Usamos regex (no glob) porque la URL completa de axios incluye
// el origin (http://localhost:5173) y el glob puede no coincidir.
export async function loginAs(page, role = 'client') {
  const token = role === 'admin' ? ADMIN_TOKEN : CLIENT_TOKEN
  const user  = role === 'admin' ? MOCK_ADMIN_USER : MOCK_USER

  // Captura-todo para /api/* — garantiza que auth/me y cart
  // sean interceptados antes de que lleguen al proxy de Vite.
  await page.route(/\/api\//, async (route) => {
    const url = route.request().url()
    if (url.includes('/api/auth/me')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(user),
      })
    }
    if (url.includes('/api/cart')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    }
    return route.continue()
  })

  // Inyectar token en localStorage ANTES de que React inicie
  await page.addInitScript((tkn) => {
    localStorage.setItem('clyro_token', tkn)
  }, token)
}

/* ── mockCatalog: SOLO intercepta el endpoint de lista ───── */
// Regex: /api/products seguido de fin de cadena o query string.
// NO captura /api/products/auriculares-bt-pro (rutas de detalle).
export async function mockCatalog(page) {
  await page.route(/\/api\/products(\?.*)?$/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      products: MOCK_PRODUCTS,
      total: MOCK_PRODUCTS.length,
      pages: 1,
    }),
  }))
  await page.route('**/api/categories', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_CATEGORIES),
  }))
}

/* ── mockProduct: intercepta detalle de producto ─────────── */
export async function mockProduct(page, slug = 'auriculares-bt-pro') {
  const product = MOCK_PRODUCTS.find(p => p.slug === slug) ?? MOCK_PRODUCTS[0]
  await page.route(new RegExp(`/api/products/${slug}$`), route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(product),
  }))
}

/* ── mockAdmin: endpoints del panel admin ────────────────── */
export async function mockAdmin(page) {
  await page.route('**/api/admin/stats', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_STATS),
  }))
  await page.route('**/api/admin/orders', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_ORDERS),
  }))
  await page.route('**/api/admin/products**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_PRODUCTS),
  }))
}
