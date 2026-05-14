# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> ADMIN — Acceso protegido y Dashboard >> [ADM-05] El sidebar tiene las secciones de navegación
- Location: tests\admin.spec.js:50:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('General')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('General')

```

```yaml
- img
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { loginAs, mockAdmin, mockCatalog } from './helpers.js'
  3   | 
  4   | test.describe('ADMIN — Acceso protegido y Dashboard', () => {
  5   | 
  6   |   test('[ADM-01] /admin redirige a /login sin sesión', async ({ page }) => {
  7   |     await page.addInitScript(() => localStorage.removeItem('clyro_token'))
  8   |     await page.route('**/api/auth/me', r => r.fulfill({ status: 401, body: '{}' }))
  9   |     await page.goto('/admin')
  10  |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  11  |   })
  12  | 
  13  |   test('[ADM-02] role="client" es redirigido al home desde /admin', async ({ page }) => {
  14  |     await loginAs(page, 'client')
  15  |     // Mock catálogo para la página de inicio / catálogo a la que redirige
  16  |     await mockCatalog(page)
  17  | 
  18  |     await page.goto('/admin')
  19  |     // AdminRoute redirige a "/" cuando isAdmin=false.
  20  |     // Esperamos navegar FUERA de /admin (la ruta exacta, no query params)
  21  |     await page.waitForURL(url => !new URL(url).pathname.startsWith('/admin'), { timeout: 12_000 })
  22  |     await expect(page).not.toHaveURL(/localhost:5173\/admin/, { timeout: 5_000 })
  23  |   })
  24  | 
  25  |   test('[ADM-03] Admin accede al dashboard', async ({ page }) => {
  26  |     await loginAs(page, 'admin')
  27  |     await mockAdmin(page)
  28  | 
  29  |     await page.goto('/admin')
  30  |     // Esperar a que la URL se quede en /admin (auth completó y es admin)
  31  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  32  | 
  33  |     await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10_000 })
  34  |     await expect(page.getByText('CLYRO ◦')).toBeVisible()
  35  |   })
  36  | 
  37  |   test('[ADM-04] Las 4 tarjetas de estadísticas se renderizan', async ({ page }) => {
  38  |     await loginAs(page, 'admin')
  39  |     await mockAdmin(page)
  40  | 
  41  |     await page.goto('/admin')
  42  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  43  | 
  44  |     await expect(page.getByText('Ventas hoy')).toBeVisible({ timeout: 10_000 })
  45  |     await expect(page.getByText('Órdenes')).toBeVisible()
  46  |     await expect(page.getByText('Productos activos')).toBeVisible()
  47  |     await expect(page.getByText('Usuarios')).toBeVisible()
  48  |   })
  49  | 
  50  |   test('[ADM-05] El sidebar tiene las secciones de navegación', async ({ page }) => {
  51  |     await loginAs(page, 'admin')
  52  |     await mockAdmin(page)
  53  | 
  54  |     await page.goto('/admin')
  55  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  56  | 
> 57  |     await expect(page.getByText('General')).toBeVisible({ timeout: 8_000 })
      |                                             ^ Error: expect(locator).toBeVisible() failed
  58  |     await expect(page.getByText('Catálogo')).toBeVisible()
  59  |     await expect(page.getByText('Ventas')).toBeVisible()
  60  |     await expect(page.getByRole('button', { name: /Productos/ }).first()).toBeVisible()
  61  |     await expect(page.getByRole('button', { name: /Órdenes/ }).first()).toBeVisible()
  62  |   })
  63  | 
  64  |   test('[ADM-06] Vista de Órdenes renderiza la tabla', async ({ page }) => {
  65  |     await loginAs(page, 'admin')
  66  |     await mockAdmin(page)
  67  | 
  68  |     await page.goto('/admin')
  69  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  70  | 
  71  |     await page.getByRole('button', { name: /Órdenes/ }).first().click()
  72  |     await expect(page.getByRole('table', { name: /[Óó]rdenes/ })).toBeVisible({ timeout: 8_000 })
  73  |     await expect(page.getByText('Jennifer M.')).toBeVisible()
  74  |   })
  75  | 
  76  |   test('[ADM-07] La tabla de órdenes tiene el selector de estado', async ({ page }) => {
  77  |     await loginAs(page, 'admin')
  78  |     await mockAdmin(page)
  79  | 
  80  |     await page.goto('/admin')
  81  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  82  | 
  83  |     await page.getByRole('button', { name: /Órdenes/ }).first().click()
  84  |     const statusSelects = page.locator('select[aria-label*="Estado"]')
  85  |     await expect(statusSelects.first()).toBeVisible({ timeout: 8_000 })
  86  |   })
  87  | 
  88  |   test('[ADM-08] Vista de Productos renderiza la lista de inventario', async ({ page }) => {
  89  |     await loginAs(page, 'admin')
  90  |     await mockAdmin(page)
  91  | 
  92  |     await page.goto('/admin')
  93  |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  94  | 
  95  |     await page.getByRole('button', { name: /Productos/ }).first().click()
  96  |     await expect(page.getByText('Auriculares Bluetooth Pro')).toBeVisible({ timeout: 8_000 })
  97  |     await expect(page.getByText('Inventario')).toBeVisible()
  98  |   })
  99  | 
  100 |   test('[ADM-09] Botón "Nuevo producto" muestra formulario en blanco', async ({ page }) => {
  101 |     await loginAs(page, 'admin')
  102 |     await mockAdmin(page)
  103 | 
  104 |     await page.goto('/admin')
  105 |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  106 | 
  107 |     await page.getByRole('button', { name: /Productos/ }).first().click()
  108 |     const newBtn = page.getByRole('button', { name: /Nuevo producto/ })
  109 |     await expect(newBtn).toBeVisible({ timeout: 8_000 })
  110 |     await newBtn.click()
  111 | 
  112 |     await expect(page.getByText('Nuevo producto').last()).toBeVisible()
  113 |   })
  114 | 
  115 |   test('[ADM-10] El sidebar muestra el nombre del usuario admin', async ({ page }) => {
  116 |     await loginAs(page, 'admin')
  117 |     await mockAdmin(page)
  118 | 
  119 |     await page.goto('/admin')
  120 |     await page.waitForURL(/\/admin$/, { timeout: 12_000 })
  121 | 
  122 |     await expect(page.getByText('Admin CLYRO')).toBeVisible({ timeout: 8_000 })
  123 |   })
  124 | })
  125 | 
```