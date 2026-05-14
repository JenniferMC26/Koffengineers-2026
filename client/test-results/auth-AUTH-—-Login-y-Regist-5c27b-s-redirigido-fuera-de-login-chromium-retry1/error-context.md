# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> AUTH — Login y Registro >> [AUTH-08] Usuario autenticado es redirigido fuera de /login
- Location: tests\auth.spec.js:127:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 12000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- img [ref=e4]
```

# Test source

```ts
  42  |       status: 200, contentType: 'application/json',
  43  |       body: JSON.stringify({ products: [], total: 0, pages: 1 }),
  44  |     }))
  45  |     await page.route('**/api/categories', route => route.fulfill({
  46  |       status: 200, contentType: 'application/json', body: JSON.stringify([]),
  47  |     }))
  48  |     await page.route('**/api/cart', route => route.fulfill({
  49  |       status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }),
  50  |     }))
  51  |   }
  52  | 
  53  |   /* ═══════════════════════════════════════════════════════ */
  54  | 
  55  |   test('[AUTH-01] La página de login renderiza correctamente', async ({ page }) => {
  56  |     // Sin token: AuthContext no llama auth/me, page carga inmediatamente
  57  |     await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
  58  |     await page.goto('/login')
  59  | 
  60  |     await expect(page).toHaveURL(/\/login/)
  61  |     // Tab "Iniciar sesión" visible (texto exacto del reference HTML)
  62  |     await expect(page.locator('#tab-login')).toContainText('Iniciar sesión')
  63  |     await expect(page.locator('#login-email')).toBeVisible()
  64  |     await expect(page.locator('#login-password')).toBeVisible()
  65  |     await expect(page.locator('#login-submit')).toBeVisible()
  66  |   })
  67  | 
  68  |   test('[AUTH-02] Los tabs Iniciar sesión / Crear cuenta existen y cambian de vista', async ({ page }) => {
  69  |     await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
  70  |     await page.goto('/login')
  71  | 
  72  |     await expect(page.locator('#tab-login')).toContainText('Iniciar sesión')
  73  |     await expect(page.locator('#tab-register')).toContainText('Crear cuenta')
  74  | 
  75  |     // Al hacer clic en Crear cuenta aparece el formulario de registro
  76  |     await page.click('#tab-register')
  77  |     await expect(page.locator('#reg-name')).toBeVisible()
  78  |     await expect(page.locator('#reg-email')).toBeVisible()
  79  |     await expect(page.locator('#reg-password')).toBeVisible()
  80  |     await expect(page.locator('#register-submit')).toBeVisible()
  81  |   })
  82  | 
  83  |   test('[AUTH-03] Validación cliente — login con campos vacíos muestra errores', async ({ page }) => {
  84  |     await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
  85  |     await page.goto('/login')
  86  |     await page.click('#login-submit')
  87  |     await expect(page.locator('[role="alert"]').first()).toBeVisible()
  88  |   })
  89  | 
  90  |   test('[AUTH-04] Validación cliente — correo inválido en login', async ({ page }) => {
  91  |     await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
  92  |     await page.goto('/login')
  93  |     await page.fill('#login-email', 'no-es-un-email')
  94  |     await page.fill('#login-password', '123456')
  95  |     await page.click('#login-submit')
  96  |     await expect(page.locator('[role="alert"]').first()).toContainText(/[Cc]orreo/)
  97  |   })
  98  | 
  99  |   test('[AUTH-05] Login exitoso redirige al catálogo', async ({ page }) => {
  100 |     await mockLoginSuccess(page)
  101 |     await page.goto('/login')
  102 |     await page.fill('#login-email', 'jt@clyro.com')
  103 |     await page.fill('#login-password', 'password123')
  104 |     await page.click('#login-submit')
  105 |     await expect(page).toHaveURL(/\/catalog/, { timeout: 10_000 })
  106 |   })
  107 | 
  108 |   test('[AUTH-06] Validación cliente — registro con campos vacíos muestra errores', async ({ page }) => {
  109 |     await page.route('**/api/auth/me', route => route.fulfill({ status: 401, body: '{}' }))
  110 |     await page.goto('/login')
  111 |     await page.click('#tab-register')
  112 |     await page.click('#register-submit')
  113 |     await expect(page.locator('[role="alert"]').first()).toBeVisible()
  114 |   })
  115 | 
  116 |   test('[AUTH-07] Registro exitoso redirige al catálogo', async ({ page }) => {
  117 |     await mockRegisterSuccess(page)
  118 |     await page.goto('/login')
  119 |     await page.click('#tab-register')
  120 |     await page.fill('#reg-name', 'Nuevo Usuario')
  121 |     await page.fill('#reg-email', 'new@clyro.com')
  122 |     await page.fill('#reg-password', 'password123')
  123 |     await page.click('#register-submit')
  124 |     await expect(page).toHaveURL(/\/catalog/, { timeout: 10_000 })
  125 |   })
  126 | 
  127 |   test('[AUTH-08] Usuario autenticado es redirigido fuera de /login', async ({ page }) => {
  128 |     // Mocks ANTES de navegar (regla estricta Playwright)
  129 |     await loginAs(page, 'client')
  130 |     // loginAs usa /api\// catch-all, pero catalog/categories
  131 |     // necesitan respuesta propia para que la página destino cargue
  132 |     await page.route(/\/api\/products(\?.*)?$/, r => r.fulfill({
  133 |       status: 200, contentType: 'application/json',
  134 |       body: JSON.stringify({ products: [], total: 0, pages: 1 }),
  135 |     }))
  136 |     await page.route(/\/api\/categories/, r => r.fulfill({
  137 |       status: 200, contentType: 'application/json', body: JSON.stringify([]),
  138 |     }))
  139 | 
  140 |     await page.goto('/login')
  141 |     // AuthPage detecta isAuthenticated y redirige a /catalog
> 142 |     await page.waitForURL(/\/catalog/, { timeout: 12_000 })
      |                ^ TimeoutError: page.waitForURL: Timeout 12000ms exceeded.
  143 |   })
  144 | })
  145 | 
```