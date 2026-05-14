# CLYRO Frontend — Design Spec
**Date:** 2026-05-13
**Project:** Koffengineers Hackathon Blink Galaxy 2026
**Stack:** React 18 + Vite + Tailwind CSS 3 + React Router DOM 7 + Axios
**Backend:** Flask + MariaDB (already complete — all endpoints available)

---

## 1. Aesthetic Contract

All UI decisions derive from `referencias-visuales/clyro_v4.html`. No deviations without explicit approval.

### Color Tokens (extend Tailwind)
| Token | Hex | Usage |
|---|---|---|
| `clyro-cream` | `#F4F2ED` | Main background |
| `clyro-card` | `#ECEAE3` | Card / secondary background |
| `clyro-soft` | `#E2DED5` | Tertiary / image backgrounds |
| `clyro-muted` | `#D5D0C5` | Thumbnails / quaternary |
| `clyro-border` | `#DEDAD1` | Subtle borders (0.5px) |
| `clyro-border2` | `#C8C4B8` | Secondary borders |
| `ink` | `#1A1918` | Primary text + dark buttons |
| `ink-2` | `#38372F` | Secondary text |
| `ink-3` | `#5C5A52` | Tertiary text |
| `ink-4` | `#9A9888` | Muted / labels |
| `sage` | `#8FA88A` | Accent — success badges, active states |

### Typography
- **UI / body:** `DM Sans` (weights 200–500)
- **Headings / display:** `Playfair Display` (400, 500 — italic on key words)
- Both loaded from Google Fonts in `index.html`

### Motion
- All transitions use `cubic-bezier(.16,1,.3,1)` (spring-like)
- Hover lifts: `translateY(-6px)` on cards, `translateY(-2px)` on buttons
- Fade-in pages: `opacity 0→1` + `translateY(12px→0)`, 0.5s
- No hard shadows — only `rgba(26,25,24,.10)` soft box-shadows on hover

### Border Radius Scale
- `--r`: 14px (inputs, small cards)
- `--rl`: 24px (product cards, modals)
- `--rp`: 40px (pill buttons, chips, search bar)

### Icons
- Library: **Tabler Icons** (`@tabler/icons-react`)
- Style: stroke, 1.5px weight, no fill
- Size: 17–20px in nav, 24px in rails

---

## 2. Architecture

### Pattern: Screaming Architecture (feature-first)

```
client/src/
├── features/
│   ├── auth/
│   │   ├── api.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/LoginForm.jsx
│   │   ├── components/RegisterForm.jsx
│   │   └── pages/AuthPage.jsx
│   ├── catalog/
│   │   ├── api.js
│   │   ├── components/ProductCard.jsx
│   │   ├── components/ProductGrid.jsx
│   │   ├── components/ProductDetail.jsx
│   │   ├── components/SearchBar.jsx
│   │   ├── components/CategoryChips.jsx
│   │   └── pages/CatalogPage.jsx
│   ├── cart/
│   │   ├── api.js
│   │   ├── context/CartContext.jsx
│   │   ├── components/CartItem.jsx
│   │   ├── components/CartDrawer.jsx
│   │   └── pages/CartPage.jsx
│   ├── checkout/
│   │   ├── api.js
│   │   ├── components/ShippingForm.jsx
│   │   ├── components/ShippingOptions.jsx
│   │   ├── components/OrderSummary.jsx
│   │   └── pages/CheckoutPage.jsx
│   │   └── pages/OrderConfirmationPage.jsx
│   └── admin/
│       ├── api.js
│       ├── components/ProductForm.jsx
│       ├── components/ProductTable.jsx
│       ├── components/OrderTable.jsx
│       ├── components/StatusBadge.jsx
│       └── pages/AdminDashboardPage.jsx
│       └── pages/AdminProductsPage.jsx
│       └── pages/AdminOrdersPage.jsx
├── shared/
│   ├── components/Button.jsx
│   ├── components/Input.jsx
│   ├── components/Modal.jsx
│   ├── components/Toast.jsx
│   ├── components/Skeleton.jsx
│   ├── components/Badge.jsx
│   └── hooks/useDebounce.js
├── layouts/
│   ├── RootLayout.jsx
│   └── AdminLayout.jsx
├── lib/
│   └── axios.js
├── router/
│   └── index.jsx
├── styles/
│   └── clyro.css
├── App.jsx
└── main.jsx
```

### State Management: Context API (Option A)

Two global contexts:

**`AuthContext`**
- State: `{ user, token, role, isLoading }`
- On mount: reads `localStorage['clyro_token']`, calls `GET /api/auth/me` to validate
- `login(email, password)` → stores token, sets user/role
- `logout()` → clears localStorage, resets state
- On 401 from any API call → triggers `logout()` automatically

**`CartContext`**
- State: `{ items: [], total: 0, count: 0 }`
- `items` shape: `{ id, product_id, name, price, image_url, slug, quantity, subtotal }`
- `addItem(product, qty)`: updates local state. If user is authenticated, calls `POST /api/cart` in background (fire-and-forget, no await)
- `removeItem(itemId)`: removes from local state. If authenticated, calls `DELETE /api/cart/:id`
- `updateQty(itemId, qty)`: local state update only (no dedicated PUT endpoint — handled by remove+add)
- `clearCart()`: clears local state. If authenticated, calls `DELETE /api/cart`
- `syncToServer()`: called by AuthContext after login. Iterates local items → `POST /api/cart` for each → refetches `GET /api/cart` to reconcile

---

## 3. HTTP Client

**`lib/axios.js`**
```js
// Single axios instance used by all feature api.js files
// Request interceptor: injects Authorization header from localStorage
// Response interceptor: on 401 → dispatches logout event
```
- Base URL: `/api` (proxied to Flask via Vite in dev, same origin in prod)
- No hardcoded IPs — Vite proxy handles dev, Flask serves static in prod

---

## 4. Routing

```
/                    → HomePage
/catalog             → CatalogPage
/product/:slug       → CatalogPage with ProductDetail open (or dedicated ProductPage)
/cart                → CartPage
/checkout            → CheckoutPage          [requires auth]
/orders/:id          → OrderConfirmationPage [requires auth]
/login               → AuthPage
/admin               → AdminDashboardPage    [requires auth + admin role]
/admin/products      → AdminProductsPage    [requires auth + admin role]
/admin/orders        → AdminOrdersPage      [requires auth + admin role]
*                    → NotFoundPage
```

**`ProtectedRoute`**: checks `AuthContext.user`. If null → redirects to `/login?redirect=<currentPath>`. After login, AuthPage reads `?redirect` param and navigates there.

**`AdminRoute`**: wraps `ProtectedRoute`, additionally checks `role === 'admin'`. If role is user → redirects to `/`.

---

## 5. Feature Designs

### 5.1 Auth (`/login`)

- Single `AuthPage` with animated toggle between Login and Register panels
- Visual reference: `referencialogin.jpg` — blurred warm background, minimal underline inputs, serif heading, pill CTA
- Background: large blurred div with `clyro-card` + decorative Playfair text
- Inputs: `LoginForm` / `RegisterForm` use `shared/Input.jsx`
- On login success → `CartContext.syncToServer()` → navigate to `?redirect` or `/catalog`
- On register success → auto-login (backend returns token on register)
- Error states: inline text under the button, no modals

### 5.2 Catalog (`/catalog`)

Layout:
```
[SearchBar                    ]
[Chip: Todos][Chip: Electrónica]...
[ProductCard][ProductCard][ProductCard]...
[ProductCard][ProductCard][ProductCard]...
```

- `SearchBar`: controlled input with 400ms debounce → updates URL query params → triggers `GET /api/products?search=&category=&page=`
- `CategoryChips`: fetches `GET /api/categories` once on mount. "Todos" chip resets category filter.
- `ProductGrid`: shows 12 products per page. Loading state = 8 `Skeleton` cards. Empty state = minimal text + sage color illustration.
- `ProductCard`: image (picsum or product url, `object-fit: cover`), category label (uppercase, ink-4), name (500 weight), price (`MXN $xxx`), circular add-to-cart button appears on hover
- `ProductDetail`: slides in from right as a drawer panel (not full modal). Contains: image, category, Playfair title, price in `MXN`, description, quantity stepper, "Agregar al carrito" button. Closes on overlay click or X.

### 5.3 Cart

**`CartDrawer`**: fixed right panel, `width: 420px`, slides in from right. Triggered by cart icon in FloatNav. Shows items, quantity controls, subtotal, "Ir al checkout" button.
- If not authenticated: button label changes to "Inicia sesión para comprar" → navigates to `/login?redirect=/checkout`
- Cart icon in FloatNav shows count badge (`.cart-dot` style from reference)

**`CartPage`** (`/cart`): full page, two-column layout on desktop (items left, order summary right sticky). Same data as drawer. "Ir al checkout" follows same auth-check logic.

### 5.4 Checkout (`/checkout`)

Two-column layout (desktop), single column (mobile). Requires auth (ProtectedRoute).

**Left column:**
1. `ShippingForm`: fields → nombre completo, dirección, ciudad, código postal, teléfono. All required except CP.
2. `ShippingOptions`: fetches `GET /api/shipping`. Renders 3 selectable cards:
   - Estándar — `$49 MXN` — 5-7 días
   - Express — `$149 MXN` — 1-2 días
   - Recoger en tienda — `$0 MXN` — inmediato
   Selected card inverts to `ink` background with cream text (exact style from `clyro_v4.html .sopt.on`).

**Right column (sticky):**
- `OrderSummary`: lists cart items (name, qty, `MXN` subtotal), divider, shipping cost, **Total en MXN** in large Playfair Display weight 300.
- "Confirmar pedido" button → calls `POST /api/orders` with form data + selected shipping method id.
- On success → navigate to `/orders/:id`

### 5.5 Order Confirmation (`/orders/:id`)

Fetches `GET /api/orders/:id`. Shows:
- Order number in Playfair Display
- Status badge (sage green for "pendiente")
- Items list
- Shipping address snapshot
- "Seguir comprando" button → `/catalog`

### 5.6 Admin Dashboard (`/admin`)

Three KPI cards:
- Total de órdenes (count from `GET /api/admin/orders`)
- Productos activos
- Órdenes pendientes

Quick-access links to `/admin/products` and `/admin/orders`.

**`AdminProductsPage`** (`/admin/products`):
- Table: nombre, categoría, `MXN` precio, stock, activo (badge)
- Per-row actions: Editar (opens `ProductForm` modal), Desactivar (`DELETE /api/admin/products/:id`)
- "Nuevo producto" → opens empty `ProductForm`
- `ProductForm` fields: nombre, slug (auto-derived from nombre, editable), categoría (select from `GET /api/categories`), descripción (textarea), precio, stock, URL imagen

**`AdminOrdersPage`** (`/admin/orders`):
- Table: ID, cliente, email, total `MXN`, método envío, status, fecha
- Status column: inline `<select>` → `PATCH /api/admin/orders/:id/status`
- Filter chips: Todos, Pendiente, Procesando, Enviado, Entregado, Cancelado

---

## 6. Shared Components Contract

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant: 'dark'\|'outline'\|'ghost'`, `size`, `loading`, `icon` | Pill shape (`border-radius: 40px`). `loading` shows spinner, disables click |
| `Input` | `label`, `error`, `...inputProps` | Renders label + input + error text. CLYRO style with focus border |
| `Modal` | `open`, `onClose`, `children` | Backdrop blur, `border-radius: 24px`, click-outside closes |
| `Toast` | — (global, triggered via `useToast` hook) | Bottom-right, auto-dismiss 3s, variants: success/error/info |
| `Skeleton` | `width`, `height`, `className` | Animated pulse, `background: clyro-card` |
| `Badge` | `variant: 'success'\|'warning'\|'error'\|'neutral'` | Small pill, maps order statuses to colors |

---

## 7. Security

- JWT stored in `localStorage['clyro_token']` (Flask doesn't use httpOnly cookies)
- Token payload decoded client-side only to read `role` and `exp` for UI decisions — never for access control (backend enforces that)
- `axios.js` response interceptor: 401 → `logout()` → redirect to `/login`
- Admin routes: double-checked by both `AdminRoute` component and Flask `@admin_required` decorator
- No user input is rendered as raw HTML (no `dangerouslySetInnerHTML`)
- Sensitive fields (password) cleared from component state after successful auth

---

## 8. Responsive Strategy

| Breakpoint | Layout Changes |
|---|---|
| Mobile < 768px | `CategoryRail` hidden. `FloatNav` = logo + cart icon + user icon. **Bottom nav bar** added (style: `referencianavbar.jpg`) with: Inicio, Catálogo, Carrito, Cuenta. Product grid: 1 column. Checkout: single column. |
| Tablet 768–1024px | `CategoryRail` visible collapsed. Product grid: 2 columns. Checkout: single column. No bottom nav. |
| Desktop > 1024px | Full layout. `CategoryRail` collapsed by default, expands on hover. Product grid: 3-4 columns. Checkout: 2-column split. |

Mobile-first CSS: base styles target mobile, `md:` and `lg:` prefixes for larger screens.

---

## 9. Backend API Reference

All endpoints already implemented in `server/app.py`. Frontend consumes:

| Endpoint | Method | Auth | Used by |
|---|---|---|---|
| `/api/auth/register` | POST | — | RegisterForm |
| `/api/auth/login` | POST | — | LoginForm |
| `/api/auth/me` | GET | JWT | AuthContext mount |
| `/api/categories` | GET | — | CategoryChips, ProductForm |
| `/api/products` | GET | — | CatalogPage |
| `/api/products/:slug` | GET | — | ProductDetail |
| `/api/cart` | GET/POST/DELETE | JWT | CartContext |
| `/api/cart/:id` | DELETE | JWT | CartContext.removeItem |
| `/api/shipping` | GET | — | ShippingOptions |
| `/api/orders` | GET/POST | JWT | CheckoutPage, OrdersPage |
| `/api/orders/:id` | GET | JWT | OrderConfirmationPage |
| `/api/admin/products` | POST | JWT+admin | ProductForm |
| `/api/admin/products/:id` | PUT/DELETE | JWT+admin | ProductForm, ProductTable |
| `/api/admin/orders` | GET | JWT+admin | AdminOrdersPage |
| `/api/admin/orders/:id/status` | PATCH | JWT+admin | OrderTable |

---

## 10. Deployment (Raspberry Pi)

`vite.config.js` already configured:
- `server.host: '0.0.0.0'` — accessible by IP on local network
- `server.proxy: { '/api': 'http://localhost:5000' }` — dev proxy to Flask
- `build.outDir: 'dist'` — Flask can serve static files from this dir

No changes needed to Vite config. `npm run dev` serves on `http://<RasPi-IP>:5173`.
