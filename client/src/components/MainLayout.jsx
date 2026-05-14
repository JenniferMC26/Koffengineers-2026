import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  IconHome,
  IconLayoutGrid,
  IconShoppingBag,
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

/* ──────────────────────────────────────────────────────────
   CLYRO – MainLayout
   Navigation: floating pill on the left (desktop) / bottom
   bar (mobile). Cart icon shows a live badge from CartContext.
   CartDrawer is rendered here so it's available on every page.
   ────────────────────────────────────────────────────────── */

/* ── Left rail (desktop) ──────────────────────────────────── */
function SideNav() {
  const location  = useLocation()
  const { itemCount, setIsOpen } = useCart()

  const NAV = [
    { to: '/',        label: 'Inicio',   Icon: IconHome       },
    { to: '/catalog', label: 'Catálogo', Icon: IconLayoutGrid },
    { to: '/account', label: 'Cuenta',   Icon: IconUser       },
  ]

  return (
    <nav
      className="cat-rail group"
      aria-label="Navegación principal"
      role="navigation"
    >
      {/* Regular nav items */}
      {NAV.map(({ to, label, Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/' && location.pathname.startsWith(to))

        return (
          <NavLink
            key={label}
            to={to}
            className={`cr-item ${isActive ? 'active' : ''}`}
            aria-label={label}
          >
            <span className="cr-icon">
              <Icon size={20} stroke={1.5} aria-hidden="true" />
            </span>
            <span className="cr-lbl">{label}</span>
          </NavLink>
        )
      })}

      {/* Cart — special: opens drawer + navigates to /cart */}
      <button
        onClick={() => setIsOpen(true)}
        className={`cr-item ${location.pathname === '/cart' ? 'active' : ''}`}
        aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} artículos` : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
      >
        <span className="cr-icon" style={{ position: 'relative' }}>
          <IconShoppingBag size={20} stroke={1.5} aria-hidden="true" />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 14, height: 14,
              background: 'var(--ink)', color: 'var(--c)',
              borderRadius: '50%', fontSize: 8, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </span>
        <span className="cr-lbl">Carrito</span>
      </button>
    </nav>
  )
}

/* ── Bottom nav (mobile) ─────────────────────────────────── */
function BottomNav() {
  const location  = useLocation()
  const { itemCount, setIsOpen } = useCart()

  const mobileItems = [
    { to: '/',        label: 'Inicio',   Icon: IconHome       },
    { to: '/catalog', label: 'Catálogo', Icon: IconLayoutGrid },
    { to: '/account', label: 'Cuenta',   Icon: IconUser       },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: 'rgba(244,242,237,.96)',
        borderTop: '0.5px solid var(--b)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      aria-label="Navegación móvil"
    >
      {mobileItems.map(({ to, label, Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/' && location.pathname.startsWith(to))

        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center justify-center flex-1 py-3 gap-1"
            style={{
              color: isActive ? 'var(--ink)' : 'var(--i4)',
              fontSize: '9px', letterSpacing: '.06em',
              textTransform: 'uppercase', transition: 'color .2s',
              textDecoration: 'none',
            }}
            aria-label={label}
          >
            <Icon size={20} stroke={isActive ? 2 : 1.5} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        )
      })}

      {/* Cart button (mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-3 gap-1"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--i4)',
          fontSize: '9px', letterSpacing: '.06em',
          textTransform: 'uppercase',
          fontFamily: "'DM Sans', sans-serif",
          position: 'relative',
        }}
        aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} artículos` : ''}`}
      >
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <IconShoppingBag size={20} stroke={1.5} aria-hidden="true" />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              width: 14, height: 14,
              background: 'var(--ink)', color: 'var(--c)',
              borderRadius: '50%', fontSize: 8, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </span>
        <span>Carrito</span>
      </button>
    </nav>
  )
}

/* ── Layout shell ────────────────────────────────────────── */
export default function MainLayout() {
  return (
    <>
      {/* Left category rail (desktop) */}
      <div className="hidden md:block">
        <SideNav />
      </div>

      {/* Main content */}
      <main
        className="min-h-screen md:pl-[72px] pb-20 md:pb-0 page-enter"
        id="main-content"
      >
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <BottomNav />

      {/* Cart drawer — rendered at layout level so it overlays everything */}
      <CartDrawer />
    </>
  )
}
