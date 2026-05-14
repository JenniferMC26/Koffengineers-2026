import { test, expect } from '@playwright/test'
import { loginAs, mockCatalog, mockProduct } from './helpers.js'

const ITEM = {
  id: 1, name: 'Auriculares Bluetooth Pro',
  price: 899, qty: 1, category: 'Electrónica', image_url: '',
}

test.describe('CARRITO — Agregar, gestionar y persistencia', () => {

  test('[CART-01] Drawer del carrito vacío muestra estado empty', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('clyro_cart'))
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockCatalog(page)
    await page.goto('/catalog')

    const cartBtn = page.locator('button[aria-label*="arrito"]').first()
    await cartBtn.waitFor({ state: 'visible' })
    await cartBtn.click()

    await expect(page.getByText(/Tu carrito está vacío/)).toBeVisible()
  })

  test('[CART-02] Añadir producto abre el CartDrawer con el ítem', async ({ page }) => {
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockCatalog(page)
    await mockProduct(page, 'auriculares-bt-pro')

    await page.goto('/product/auriculares-bt-pro')
    await page.locator('#add-to-cart-main').click()

    await expect(page.getByRole('dialog', { name: /[Cc]arrito/ })).toBeVisible()
    await expect(page.getByText('Auriculares Bluetooth Pro').last()).toBeVisible()
  })

  test('[CART-03] El badge del carrito se actualiza al añadir un producto', async ({ page }) => {
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockCatalog(page)
    await mockProduct(page, 'auriculares-bt-pro')

    await page.goto('/product/auriculares-bt-pro')
    await page.locator('#add-to-cart-main').click()

    // El drawer se abre y el badge muestra 1 artículo
    await expect(page.getByRole('dialog', { name: /[Cc]arrito/ })).toBeVisible()
    await expect(page.getByText('1').first()).toBeVisible()
  })

  test('[CART-04] El carrito persiste desde localStorage al recargar', async ({ page }) => {
    await page.addInitScript((item) => {
      localStorage.setItem('clyro_cart', JSON.stringify([item]))
    }, ITEM)
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockCatalog(page)
    await page.goto('/catalog')

    // El badge ya debe mostrar "1 artículo" desde localStorage
    const cartBtn = page.locator('button[aria-label*="artículo"]').first()
    await expect(cartBtn).toBeVisible({ timeout: 6_000 })
    await cartBtn.click()

    await expect(page.getByText('Auriculares Bluetooth Pro').last()).toBeVisible()
  })

  test('[CART-05] Se puede eliminar un ítem del carrito desde el drawer', async ({ page }) => {
    await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
    await mockCatalog(page)
    await mockProduct(page, 'auriculares-bt-pro')

    await page.goto('/product/auriculares-bt-pro')
    await page.locator('#add-to-cart-main').click()

    await expect(page.getByRole('dialog', { name: /[Cc]arrito/ })).toBeVisible()
    await page.getByText('Eliminar').first().click()
    await expect(page.getByText(/Tu carrito está vacío/)).toBeVisible()
  })

  test('[CART-06] "Continuar al pago" navega a /checkout (usuario autenticado)', async ({ page }) => {
    await loginAs(page, 'client')
    await mockCatalog(page)
    await page.addInitScript((item) => {
      localStorage.setItem('clyro_cart', JSON.stringify([item]))
    }, ITEM)

    await page.goto('/catalog')

    const cartBtn = page.locator('button[aria-label*="artículo"]').first()
    await expect(cartBtn).toBeVisible({ timeout: 8_000 })
    await cartBtn.click()

    await expect(page.getByRole('dialog', { name: /[Cc]arrito/ })).toBeVisible()
    await page.getByText('Continuar al pago').click()

    await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 })
  })
})
