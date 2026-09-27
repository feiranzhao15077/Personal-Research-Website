import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: 'list',
  outputDir: '.screenshots/results',
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'off' },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'edge-desktop', use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1366, height: 768 } } },
    ...(process.env.PLAYWRIGHT_FIREFOX === '1' ? [{ name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } }] : []),
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'], viewport: { width: 393, height: 852 } } },
    { name: 'chromium-tablet', use: { ...devices['iPad (gen 7)'], browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-narrow', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 700 } } },
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4321', url: 'http://127.0.0.1:4321', reuseExistingServer: false, timeout: 60_000 }
});
