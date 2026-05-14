# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.js >> CHECKOUT — Formulario y selector de envío >> [CHK-04] Estándar ($49) actualiza el total a $948
- Location: tests\checkout.spec.js:46:3

# Error details

```
TimeoutError: locator.click: Timeout 8000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Estándar/ })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation "Navegación principal" [ref=e3]:
    - link "Inicio" [ref=e4] [cursor=pointer]:
      - /url: /
      - img [ref=e6]
      - generic: Inicio
    - link "Catálogo" [ref=e10] [cursor=pointer]:
      - /url: /catalog
      - img [ref=e12]
      - generic: Catálogo
    - link "Buscar" [ref=e17] [cursor=pointer]:
      - /url: /search
      - img [ref=e19]
      - generic: Buscar
    - link "Cuenta" [ref=e22] [cursor=pointer]:
      - /url: /login
      - img [ref=e24]
      - generic: Cuenta
    - button "Carrito, 1 artículos" [ref=e27] [cursor=pointer]:
      - generic [ref=e28]:
        - img [ref=e29]
        - generic [ref=e32]: "1"
      - generic: Carrito
  - main [ref=e33]:
    - img [ref=e35]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { loginAs } from './helpers.js'
  3   | 
  4   | const CART = [
  5   |   { id: 1, name: 'Auriculares Bluetooth Pro', price: 899, qty: 1, category: 'Electrónica', image_url: '' },
  6   | ]
  7   | 
  8   | test.describe('CHECKOUT — Formulario y selector de envío', () => {
  9   | 
  10  |   // Setup común: token + carrito en localStorage, mocks ANTES de page.goto
  11  |   async function setupCheckout(page) {
  12  |     await loginAs(page, 'client')
  13  |     await page.addInitScript((items) => {
  14  |       localStorage.setItem('clyro_cart', JSON.stringify(items))
  15  |     }, CART)
  16  |   }
  17  | 
  18  |   /* ═══════════════════════════════════════════════════════ */
  19  | 
  20  |   test('[CHK-01] Checkout protegido — redirige a /login sin sesión', async ({ page }) => {
  21  |     await page.addInitScript(() => localStorage.removeItem('clyro_token'))
  22  |     await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
  23  |     await page.goto('/checkout')
  24  |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  25  |   })
  26  | 
  27  |   test('[CHK-02] Usuario autenticado con carrito puede acceder al checkout', async ({ page }) => {
  28  |     await setupCheckout(page)
  29  |     await page.goto('/checkout')
  30  |     // Esperar a que auth complete: la URL debe quedarse en /checkout
  31  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  32  |     await expect(page.getByText(/[Cc]onfirmar pedido/)).toBeVisible({ timeout: 10_000 })
  33  |   })
  34  | 
  35  |   test('[CHK-03] Los dos métodos de envío obligatorios se muestran', async ({ page }) => {
  36  |     await setupCheckout(page)
  37  |     await page.goto('/checkout')
  38  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  39  | 
  40  |     await expect(page.getByText('Estándar')).toBeVisible({ timeout: 8_000 })
  41  |     await expect(page.getByText('Express')).toBeVisible()
  42  |     await expect(page.getByText('$49')).toBeVisible()
  43  |     await expect(page.getByText('$149')).toBeVisible()
  44  |   })
  45  | 
  46  |   test('[CHK-04] Estándar ($49) actualiza el total a $948', async ({ page }) => {
  47  |     await setupCheckout(page)
  48  |     await page.goto('/checkout')
  49  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  50  | 
  51  |     // El default ya es 'standard' ($49) → total = 899 + 49 = 948
> 52  |     await page.getByRole('button', { name: /Estándar/ }).click()
      |                                                          ^ TimeoutError: locator.click: Timeout 8000ms exceeded.
  53  |     await expect(page.getByText('$948')).toBeVisible({ timeout: 5_000 })
  54  |   })
  55  | 
  56  |   test('[CHK-05] Express ($149) actualiza el total a $1,048', async ({ page }) => {
  57  |     await setupCheckout(page)
  58  |     await page.goto('/checkout')
  59  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  60  | 
  61  |     await page.getByRole('button', { name: /Express/ }).click()
  62  |     // 899 + 149 = 1048 → formateado como "$1,048"
  63  |     await expect(page.getByText(/\$1[,.]?048/).first()).toBeVisible({ timeout: 5_000 })
  64  |   })
  65  | 
  66  |   test('[CHK-06] El panel de resumen muestra el producto del carrito', async ({ page }) => {
  67  |     await setupCheckout(page)
  68  |     await page.goto('/checkout')
  69  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  70  |     await expect(page.getByText('Auriculares Bluetooth Pro').last()).toBeVisible({ timeout: 8_000 })
  71  |   })
  72  | 
  73  |   test('[CHK-07] El formulario requiere campos obligatorios (no envía vacío)', async ({ page }) => {
  74  |     await setupCheckout(page)
  75  |     await page.goto('/checkout')
  76  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  77  | 
  78  |     await page.getByRole('button', { name: /[Pp]agar ahora/ }).click()
  79  |     // La validación HTML5 required impide el envío → permanecemos en /checkout
  80  |     await expect(page).toHaveURL(/\/checkout/)
  81  |   })
  82  | 
  83  |   test('[CHK-08] Envío exitoso muestra toast y redirige al home', async ({ page }) => {
  84  |     await setupCheckout(page)
  85  |     await page.route('**/api/orders', r => r.fulfill({
  86  |       status: 201, contentType: 'application/json',
  87  |       body: JSON.stringify({ order_id: 2026042 }),
  88  |     }))
  89  | 
  90  |     await page.goto('/checkout')
  91  |     await page.waitForURL(/\/checkout/, { timeout: 12_000 })
  92  | 
  93  |     await page.getByPlaceholder(/Tu nombre completo/).fill('Jennifer M.')
  94  |     await page.getByPlaceholder(/Calle, número/).fill('Av. Constitución 1234')
  95  |     await page.getByPlaceholder('Ciudad').fill('Monterrey')
  96  |     await page.getByRole('button', { name: /Estándar/ }).click()
  97  |     await page.getByRole('button', { name: /[Pp]agar ahora/ }).click()
  98  | 
  99  |     await expect(page.getByText(/[Oo]rden confirmada/)).toBeVisible({ timeout: 8_000 })
  100 |     await expect(page).toHaveURL(/\/$/, { timeout: 8_000 })
  101 |   })
  102 | })
  103 | 
```