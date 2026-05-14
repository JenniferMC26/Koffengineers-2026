/**
 * CLYRO — Router
 * ──────────────────────────────────────────────────────────────
 * Route map:
 *   /              → HomePage           [MainLayout]
 *   /catalog       → CatalogPage        [MainLayout]
 *   /product/:id   → ProductPage        [MainLayout]
 *   /cart          → CartPage           [MainLayout]
 *   /checkout      → CheckoutPage       [MainLayout + ProtectedRoute]
 *   /login         → AuthPage           [full-screen, no layout]
 *   /admin         → AdminDashboardPage [AdminRoute — auth + admin role]
 *   *              → NotFoundPage
 * ──────────────────────────────────────────────────────────────
 */
import { createBrowserRouter } from 'react-router-dom'

// ── Layouts & Guards ─────────────────────────────────────
import MainLayout   from '../components/MainLayout'
import { ProtectedRoute, AdminRoute } from '../components/RouteGuards'

// ── Public pages ─────────────────────────────────────────
import HomePage           from '../features/catalog/pages/HomePage'
import CatalogPage        from '../features/catalog/pages/CatalogPage'
import ProductPage        from '../features/catalog/pages/ProductPage'
import CartPage           from '../features/cart/pages/CartPage'
import AuthPage           from '../features/auth/pages/AuthPage'
import NotFoundPage       from '../pages/NotFoundPage'

// ── Protected pages ───────────────────────────────────────
import CheckoutPage       from '../features/checkout/pages/CheckoutPage'
import AccountPage        from '../features/account/pages/AccountPage'
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'

const router = createBrowserRouter([
  /* ══ Public client routes wrapped in MainLayout ══ */
  {
    element: <MainLayout />,
    children: [
      { path: '/',           element: <HomePage />    },
      { path: '/catalog',    element: <CatalogPage /> },
      { path: '/product/:id',element: <ProductPage /> },
      { path: '/cart',       element: <CartPage />    },

      { path: '/checkout', element: <CheckoutPage /> },

      /* ── Rutas que requieren autenticación ── */
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/account', element: <AccountPage /> },
        ],
      },
    ],
  },

  /* ══ Auth — full-screen, no sidebar ══ */
  {
    path: '/login',
    element: <AuthPage />,
  },

  /* ══ Admin — requires auth + admin role ══ */
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
    ],
  },

  /* ══ 404 ══ */
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
