import { test, expect } from '@playwright/test'
import { loginAs, mockAdmin, mockCatalog } from './helpers.js'

test.describe('ADMIN — Acceso protegido y Dashboard', () => {

  test('[ADM-01] /admin redirige a /login sin sesión', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('clyro_token'))
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('[ADM-02] role="client" es redirigido al home desde /admin', async ({ page }) => {
    await loginAs(page, 'client')
    // Mock catálogo para la página de inicio / catálogo a la que redirige
    await mockCatalog(page)

    await page.goto('/admin')
    // AdminRoute redirige a "/" cuando isAdmin=false.
    // Esperamos navegar FUERA de /admin (la ruta exacta, no query params)
    await page.waitForURL(url => !new URL(url).pathname.startsWith('/admin'), { timeout: 12_000 })
    await expect(page).not.toHaveURL(/localhost:5173\/admin/, { timeout: 5_000 })
  })

  test('[ADM-03] Admin accede al dashboard', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    // Esperar a que la URL se quede en /admin (auth completó y es admin)
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('CLYRO ◦')).toBeVisible()
  })

  test('[ADM-04] Las 4 tarjetas de estadísticas se renderizan', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await expect(page.getByText('Ventas hoy')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Órdenes')).toBeVisible()
    await expect(page.getByText('Productos activos')).toBeVisible()
    await expect(page.getByText('Usuarios')).toBeVisible()
  })

  test('[ADM-05] El sidebar tiene las secciones de navegación', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await expect(page.getByText('General')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Catálogo')).toBeVisible()
    await expect(page.getByText('Ventas')).toBeVisible()
    await expect(page.getByRole('button', { name: /Productos/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Órdenes/ }).first()).toBeVisible()
  })

  test('[ADM-06] Vista de Órdenes renderiza la tabla', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await page.getByRole('button', { name: /Órdenes/ }).first().click()
    await expect(page.getByRole('table', { name: /[Óó]rdenes/ })).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Jennifer M.')).toBeVisible()
  })

  test('[ADM-07] La tabla de órdenes tiene el selector de estado', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await page.getByRole('button', { name: /Órdenes/ }).first().click()
    const statusSelects = page.locator('select[aria-label*="Estado"]')
    await expect(statusSelects.first()).toBeVisible({ timeout: 8_000 })
  })

  test('[ADM-08] Vista de Productos renderiza la lista de inventario', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await page.getByRole('button', { name: /Productos/ }).first().click()
    await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Inventario')).toBeVisible()
  })

  test('[ADM-09] Botón "Nuevo producto" muestra formulario en blanco', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await page.getByRole('button', { name: /Productos/ }).first().click()
    const newBtn = page.getByRole('button', { name: /Nuevo producto/ })
    await expect(newBtn).toBeVisible({ timeout: 8_000 })
    await newBtn.click()

    await expect(page.getByText('Nuevo producto').last()).toBeVisible()
  })

  test('[ADM-10] El sidebar muestra el nombre del usuario admin', async ({ page }) => {
    await loginAs(page, 'admin')
    await mockAdmin(page)

    await page.goto('/admin')
    await page.waitForURL(/\/admin$/, { timeout: 12_000 })

    await expect(page.getByText('Admin CLYRO')).toBeVisible({ timeout: 8_000 })
  })
})
