# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog.spec.js >> CATÁLOGO — Carga y filtrado de productos >> [CAT-07] Selector de cantidad +/- en producto funciona
- Location: tests\catalog.spec.js:50:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[aria-live="polite"]').first()
Expected substring: "2"
Received string:    ""
Timeout: 8000ms

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for locator('[aria-live="polite"]').first()
    19 × locator resolved to <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T"></section>
       - unexpected value ""

```

```yaml
- navigation "Navegación principal":
  - link "Inicio":
    - /url: /
  - link "Catálogo":
    - /url: /catalog
  - link "Buscar":
    - /url: /search
  - link "Cuenta":
    - /url: /login
  - button "Carrito"
- main:
  - region "Notifications alt+T"
  - button "Volver":
    - img
    - text: Volver
  - img "Auriculares Bluetooth Pro"
  - button "Imagen 1" [pressed]
  - button "Imagen 2"
  - button "Imagen 3"
  - paragraph: Electrónica
  - heading "Auriculares Bluetooth Pro" [level=1]
  - text: ★★★★☆ (42 reseñas) $899 $1,200 -25%
  - paragraph: Sonido envolvente con cancelación activa de ruido.
  - paragraph: Color
  - button "Color 1" [pressed]
  - button "Color 2"
  - button "Color 3"
  - button "Color 4"
  - button "Color 5"
  - paragraph: Cantidad
  - button "Disminuir cantidad":
    - img
  - text: "2"
  - button "Aumentar cantidad":
    - img
  - text: 50 disponibles
  - button "Añadir al carrito":
    - img
    - text: Añadir al carrito
  - button "Agregar a favoritos":
    - img
  - text: 🔒 Compra 100% segura · Devoluciones gratis en 30 días
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { mockCatalog, mockProduct } from './helpers.js'
  3  | 
  4  | test.describe('CATÁLOGO — Carga y filtrado de productos', () => {
  5  | 
  6  |   // beforeEach solo registra la lista — la regex NO captura rutas de detalle
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await mockCatalog(page)
  9  |   })
  10 | 
  11 |   test('[CAT-01] La página del catálogo carga y muestra productos', async ({ page }) => {
  12 |     await page.goto('/catalog')
  13 |     await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
  14 |     await expect(page.getByText('Lámpara Stone Edition')).toBeVisible()
  15 |     await expect(page.getByText('Tote Canvas Natural')).toBeVisible()
  16 |   })
  17 | 
  18 |   test('[CAT-02] Los chips de categoría se renderizan', async ({ page }) => {
  19 |     await page.goto('/catalog')
  20 |     await expect(page.getByText('Todos').first()).toBeVisible()
  21 |   })
  22 | 
  23 |   test('[CAT-03] Los precios se muestran correctamente', async ({ page }) => {
  24 |     await page.goto('/catalog')
  25 |     await expect(page.getByText(/899/).first()).toBeVisible()
  26 |   })
  27 | 
  28 |   test('[CAT-04] La página de inicio "/" renderiza sin errores', async ({ page }) => {
  29 |     await page.goto('/')
  30 |     await expect(page.locator('body')).toBeVisible()
  31 |     await expect(page).not.toHaveURL(/error/)
  32 |   })
  33 | 
  34 |   test('[CAT-05] Click en tarjeta de producto navega al detalle', async ({ page }) => {
  35 |     await mockProduct(page, 'auriculares-bt-pro')
  36 |     await page.goto('/catalog')
  37 |     await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
  38 |     await page.getByText('Auriculares Bluetooth Pro').first().click()
  39 |     await expect(page).toHaveURL(/\/product\//, { timeout: 10_000 })
  40 |   })
  41 | 
  42 |   test('[CAT-06] Página de detalle de producto renderiza correctamente', async ({ page }) => {
  43 |     await mockProduct(page, 'auriculares-bt-pro')
  44 |     await page.goto('/product/auriculares-bt-pro')
  45 |     await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible()
  46 |     await expect(page.getByText(/899/).first()).toBeVisible()
  47 |     await expect(page.getByText(/[Aa]ñadir al carrito/)).toBeVisible()
  48 |   })
  49 | 
  50 |   test('[CAT-07] Selector de cantidad +/- en producto funciona', async ({ page }) => {
  51 |     await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
  52 |     await mockProduct(page, 'auriculares-bt-pro')
  53 |     await page.goto('/product/auriculares-bt-pro')
  54 | 
  55 |     // Esperar a que el producto cargue (igual que CAT-06)
  56 |     await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible({ timeout: 8_000 })
  57 | 
  58 |     // Ahora el stepper debe estar disponible — usar aria-label para máxima robustez
  59 |     const incBtn = page.locator('[aria-label="Aumentar cantidad"]')
  60 |     await expect(incBtn).toBeVisible({ timeout: 5_000 })
  61 |     await incBtn.click()
  62 | 
> 63 |     await expect(page.locator('[aria-live="polite"]').first()).toContainText('2')
     |                                                                ^ Error: expect(locator).toContainText(expected) failed
  64 |   })
  65 | })
  66 | 
```