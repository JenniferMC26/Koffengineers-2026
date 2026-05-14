import { test, expect } from '@playwright/test'
import { loginAs } from './helpers.js'

const CART = [
  { id: 1, name: 'Auriculares Bluetooth Pro', price: 899, qty: 1, category: 'Electrónica', image_url: '' },
]

test.describe('CHECKOUT — Formulario y selector de envío', () => {

  // Setup común: token + carrito en localStorage, mocks ANTES de page.goto
  async function setupCheckout(page) {
    await loginAs(page, 'client')
    await page.addInitScript((items) => {
      localStorage.setItem('clyro_cart', JSON.stringify(items))
    }, CART)
  }

  /* ═══════════════════════════════════════════════════════ */

  test('[CHK-01] Checkout protegido — redirige a /login sin sesión', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('clyro_token'))
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('[CHK-02] Usuario autenticado con carrito puede acceder al checkout', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    // Esperar a que auth complete: la URL debe quedarse en /checkout
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })
    await expect(page.getByText(/[Cc]onfirmar pedido/)).toBeVisible({ timeout: 10_000 })
  })

  test('[CHK-03] Los dos métodos de envío obligatorios se muestran', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })

    await expect(page.getByText('Estándar')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Express')).toBeVisible()
    await expect(page.getByText('$49')).toBeVisible()
    await expect(page.getByText('$149')).toBeVisible()
  })

  test('[CHK-04] Estándar ($49) actualiza el total a $948', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })

    // El default ya es 'standard' ($49) → total = 899 + 49 = 948
    await page.getByRole('button', { name: /Estándar/ }).click()
    await expect(page.getByText('$948')).toBeVisible({ timeout: 5_000 })
  })

  test('[CHK-05] Express ($149) actualiza el total a $1,048', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })

    await page.getByRole('button', { name: /Express/ }).click()
    // 899 + 149 = 1048 → formateado como "$1,048"
    await expect(page.getByText(/\$1[,.]?048/).first()).toBeVisible({ timeout: 5_000 })
  })

  test('[CHK-06] El panel de resumen muestra el producto del carrito', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })
    await expect(page.getByText('Auriculares Bluetooth Pro').last()).toBeVisible({ timeout: 8_000 })
  })

  test('[CHK-07] El formulario requiere campos obligatorios (no envía vacío)', async ({ page }) => {
    await setupCheckout(page)
    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })

    await page.getByRole('button', { name: /[Pp]agar ahora/ }).click()
    // La validación HTML5 required impide el envío → permanecemos en /checkout
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('[CHK-08] Envío exitoso muestra toast y redirige al home', async ({ page }) => {
    await setupCheckout(page)
    await page.route('**/api/orders', r => r.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ order_id: 2026042 }),
    }))

    await page.goto('/checkout')
    await page.waitForURL(/\/checkout/, { timeout: 12_000 })

    await page.getByPlaceholder(/Tu nombre completo/).fill('Jennifer M.')
    await page.getByPlaceholder(/Calle, número/).fill('Av. Constitución 1234')
    await page.getByPlaceholder('Ciudad').fill('Monterrey')
    await page.getByRole('button', { name: /Estándar/ }).click()
    await page.getByRole('button', { name: /[Pp]agar ahora/ }).click()

    await expect(page.getByText(/[Oo]rden confirmada/)).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/\/$/, { timeout: 8_000 })
  })
})
