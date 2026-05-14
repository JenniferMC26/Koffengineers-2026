// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * CLYRO — Playwright E2E config (ESM)
 * Levanta el servidor Vite automáticamente antes de correr los tests.
 * Solo Chromium headless para máxima velocidad en hackathon.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  timeout: 20_000,
  expect: { timeout: 8_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'retain-on-failure',
    actionTimeout:      8_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command:             'npm run dev',
    url:                 'http://localhost:5173',
    reuseExistingServer: true,
    timeout:             60_000,
    stdout:              'ignore',
    stderr:              'pipe',
  },
})
