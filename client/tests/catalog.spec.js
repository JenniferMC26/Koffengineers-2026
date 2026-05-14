import { test, expect } from '@playwright/test'
import { mockCatalog, mockProduct } from './helpers.js'

test.describe('CATÁLOGO — Carga y filtrado de productos', () => {

  // beforeEach solo registra la lista — la regex NO captura rutas de detalle
  test.beforeEach(async ({ page }) => {
    await mockCatalog(page)
  })

  test('[CAT-01] La página del catálogo carga y muestra productos', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
    await expect(page.getByText('Lámpara Stone Edition')).toBeVisible()
    await expect(page.getByText('Tote Canvas Natural')).toBeVisible()
  })

  test('[CAT-02] Los chips de categoría se renderizan', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByText('Todos').first()).toBeVisible()
  })

  test('[CAT-03] Los precios se muestran correctamente', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByText(/899/).first()).toBeVisible()
  })

  test('[CAT-04] La página de inicio "/" renderiza sin errores', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page).not.toHaveURL(/error/)
  })

  test('[CAT-05] Click en tarjeta de producto navega al detalle', async ({ page }) => {
    await mockProduct(page, 'auriculares-bt-pro')
    await page.goto('/catalog')
    await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
    await page.getByText('Auriculares Bluetooth Pro').first().click()
    await expect(page).toHaveURL(/\/product\//, { timeout: 10_000 })
  })

  test('[CAT-06] Página de detalle de producto renderiza correctamente', async ({ page }) => {
    await mockProduct(page, 'auriculares-bt-pro')
    await page.goto('/product/auriculares-bt-pro')
    await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
    await expect(page.getByText(/899/).first()).toBeVisible()
    await expect(page.getByText(/[Aa]ñadir al carrito/)).toBeVisible()
  })

  test('[CAT-07] Selector de cantidad +/- en producto funciona', async ({ page }) => {
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockProduct(page, 'auriculares-bt-pro')
    await page.goto('/product/auriculares-bt-pro')

    // Esperar a que el producto cargue (igual que CAT-06)
    await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible({ timeout: 8_000 })

    // Ahora el stepper debe estar disponible — usar aria-label para máxima robustez
    const incBtn = page.locator('[aria-label="Aumentar cantidad"]')
    await expect(incBtn).toBeVisible({ timeout: 5_000 })
    await incBtn.click()

    await expect(page.locator('[aria-live="polite"]').first()).toContainText('2')
  })
})
