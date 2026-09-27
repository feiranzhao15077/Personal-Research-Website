import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const projects = ['emvision', 'lowalt-md', 'em-trace', 'quadcontrol-lab'];
async function loadFigures(page: import('@playwright/test').Page) {
  for (const img of await page.locator('.figure-frame img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('research routes, figures, boundaries, materials and width stay available', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /从物理模型/ })).toBeVisible();
  for (const id of projects) await expect(page.locator(`a[href="/projects/${id}/"]`).first()).toBeVisible();
  await expect(page.locator('#research-map')).toBeVisible();
  await expect(page.locator('a[href="/documents/research-overview.pdf"]').first()).toBeVisible();
  await expect(page.locator('a[href^="https://github.com/feiranzhao15077/Research-Portfolio"]').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  if (testInfo.project.name.includes('mobile') || testInfo.project.name.includes('narrow')) {
    expect(await page.locator('.map-nodes').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
  }
  if (testInfo.project.name === 'chromium-desktop' || testInfo.project.name === 'chromium-mobile') {
    fs.mkdirSync('.screenshots', { recursive: true });
    await loadFigures(page);
    await page.screenshot({ path: `.screenshots/home-${testInfo.project.name}.png`, fullPage: true });
    await page.screenshot({ path: `.screenshots/home-${testInfo.project.name}-viewport.png` });
  }
  for (const slug of projects) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.evidence-block').first()).toBeVisible();
    await expect(page.locator('.boundary').first()).toBeVisible();
    await expect(page.locator('.figure-frame').first()).toBeVisible();
    await expect(page.locator('.source-list a').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    if (slug === 'emvision' && (testInfo.project.name === 'chromium-desktop' || testInfo.project.name === 'chromium-mobile')) {
      await loadFigures(page);
      await page.screenshot({ path: `.screenshots/emvision-${testInfo.project.name}.png`, fullPage: true });
      await page.screenshot({ path: `.screenshots/emvision-${testInfo.project.name}-viewport.png` });
    }
  }
});

test('keyboard reaches links and native evidence disclosure', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳转到正文' })).toBeFocused();
  await page.goto('/projects/emvision/');
  const disclosure = page.locator('.deep-evidence summary');
  await disclosure.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.deep-evidence')).toHaveAttribute('open', '');
});

test('core content remains readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#research-map')).toContainText('EM-Trace');
  await page.goto('/projects/emvision/');
  await expect(page.locator('#evidence')).toContainText('EVM-02');
  await expect(page.locator('.figure-frame').first()).toBeVisible();
  await context.close();
});
