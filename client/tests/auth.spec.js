import { test, expect } from '@playwright/test'
import { loginAs } from './helpers.js'

test.describe('AUTH — Login y Registro', () => {

  /* ── Mock helpers ───────────────────────────────────────── */
  async function mockLoginSuccess(page) {
    const token = 'eyJhbGciOiJIUzI1NiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwicm9sZSI6ImNsaWVudCIsIm5hbWUiOiJKZW5uaWZlciBNLiIsImVtYWlsIjoianRAY2x5cm8uY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock'
    await page.route('**/api/auth/login', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ token, user: { id: 1, name: 'Jennifer M.', email: 'jt@clyro.com', role: 'client' } }),
    }))
    await page.route('**/api/auth/me', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: 1, name: 'Jennifer M.', email: 'jt@clyro.com', role: 'client' }),
    }))
    await page.route(/\/api\/products(\?.*)?$/, route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ products: [], total: 0, pages: 1 }),
    }))
    await page.route('**/api/categories', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([]),
    }))
    await page.route('**/api/cart', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    }))
  }

  async function mockRegisterSuccess(page) {
    const token = 'eyJhbGciOiJIUzI1NiwidHlwIjoiSldUIn0.eyJzdWIiOiIyIiwicm9sZSI6ImNsaWVudCIsIm5hbWUiOiJOdWV2byBVc3VhcmlvIiwiZW1haWwiOiJuZXdAY2x5cm8uY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock'
    await page.route('**/api/auth/register', route => route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ token, user: { id: 2, name: 'Nuevo Usuario', email: 'new@clyro.com', role: 'client' } }),
    }))
    await page.route('**/api/auth/me', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: 2, name: 'Nuevo Usuario', email: 'new@clyro.com', role: 'client' }),
    }))
    await page.route(/\/api\/products(\?.*)?$/, route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ products: [], total: 0, pages: 1 }),
    }))
    await page.route('**/api/categories', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([]),
    }))
    await page.route('**/api/cart', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }),
    }))
  }

  /* ═══════════════════════════════════════════════════════ */

  test('[AUTH-01] La página de login renderiza correctamente', async ({ page }) => {
    // Sin token: AuthContext no llama auth/me, page carga inmediatamente
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto('/login')

    await expect(page).toHaveURL(/\/login/)
    // Tab "Iniciar sesión" visible (texto exacto del reference HTML)
    await expect(page.locator('#tab-login')).toContainText('Iniciar sesión')
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.locator('#login-submit')).toBeVisible()
  })

  test('[AUTH-02] Los tabs Iniciar sesión / Crear cuenta existen y cambian de vista', async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto('/login')

    await expect(page.locator('#tab-login')).toContainText('Iniciar sesión')
    await expect(page.locator('#tab-register')).toContainText('Crear cuenta')

    // Al hacer clic en Crear cuenta aparece el formulario de registro
    await page.click('#tab-register')
    await expect(page.locator('#reg-name')).toBeVisible()
    await expect(page.locator('#reg-email')).toBeVisible()
    await expect(page.locator('#reg-password')).toBeVisible()
    await expect(page.locator('#register-submit')).toBeVisible()
  })

  test('[AUTH-03] Validación cliente — login con campos vacíos muestra errores', async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto('/login')
    await page.click('#login-submit')
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
  })

  test('[AUTH-04] Validación cliente — correo inválido en login', async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto('/login')
    await page.fill('#login-email', 'no-es-un-email')
    await page.fill('#login-password', '123456')
    await page.click('#login-submit')
    await expect(page.locator('[role="alert"]').first()).toContainText(/[Cc]orreo/)
  })

  test('[AUTH-05] Login exitoso redirige al catálogo', async ({ page }) => {
    await mockLoginSuccess(page)
    await page.goto('/login')
    await page.fill('#login-email', 'jt@clyro.com')
    await page.fill('#login-password', 'password123')
    await page.click('#login-submit')
    await expect(page).toHaveURL(/\/catalog/, { timeout: 10_000 })
  })

  test('[AUTH-06] Validación cliente — registro con campos vacíos muestra errores', async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto('/login')
    await page.click('#tab-register')
    await page.click('#register-submit')
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
  })

  test('[AUTH-07] Registro exitoso redirige al catálogo', async ({ page }) => {
    await mockRegisterSuccess(page)
    await page.goto('/login')
    await page.click('#tab-register')
    await page.fill('#reg-name', 'Nuevo Usuario')
    await page.fill('#reg-email', 'new@clyro.com')
    await page.fill('#reg-password', 'password123')
    await page.click('#register-submit')
    await expect(page).toHaveURL(/\/catalog/, { timeout: 10_000 })
  })

  test('[AUTH-08] Usuario autenticado es redirigido fuera de /login', async ({ page }) => {
    // Mocks ANTES de navegar (regla estricta Playwright)
    await loginAs(page, 'client')
    // loginAs usa /api\// catch-all, pero catalog/categories
    // necesitan respuesta propia para que la página destino cargue
    await page.route(/\/api\/products(\?.*)?$/, r => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ products: [], total: 0, pages: 1 }),
    }))
    await page.route(/\/api\/categories/, r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([]),
    }))

    await page.goto('/login')
    // AuthPage detecta isAuthenticated y redirige a /catalog
    await page.waitForURL(/\/catalog/, { timeout: 12_000 })
  })
})
