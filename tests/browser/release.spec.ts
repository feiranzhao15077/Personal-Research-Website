import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('release: nine widths, five routes, text reflow and semantic content', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'One complete width matrix; engine smoke tests run separately');
  test.setTimeout(90000);
  const measurements = [];
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/projects/emvision/', '/projects/lowalt-md/', '/projects/em-trace/', '/projects/quadcontrol-lab/']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      measurements.push({ width, route, overflow });
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.locator('main h1')).toHaveCount(1);
      if (route === '/') {
        const order = await page.locator('main > section').evaluateAll((sections) => sections.slice(0, 4).map((section) => section.id || section.classList[0]));
        expect(order).toEqual(['hero', 'research-map', 'approach', 'projects']);
        const heroLinks = page.locator('.hero a');
        for (const link of await heroLinks.all()) {
          expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
        }
        if ([320, 390, 768, 1024, 1440].includes(width)) {
          fs.mkdirSync('.screenshots', { recursive: true });
          await page.screenshot({ path: `.screenshots/phase8b1-hero-${width}.png` });
        }
      }
      await expect(page.locator('main')).toContainText('不支持以下解读');
      for (const link of await page.locator('.site-nav a').all()) {
        const box = await link.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
  await page.setViewportSize({ width: 640, height: 700 });
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; } body { font-size: 200%; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  fs.mkdirSync('.scratch', { recursive: true });
  fs.writeFileSync('.scratch/phase7a-widths.json', JSON.stringify(measurements, null, 2));
});

test('release: viewer loading failure is recoverable; landscape controls remain reachable', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'Single targeted failure and landscape audit');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/projects/emvision/');
  await page.route('**/evidence/originals/**', (route) => route.abort());
  const figure = page.locator('.figure-image-link').first();
  await figure.click();
  const viewer = page.locator('.figure-viewer');
  await expect(viewer.getByRole('status')).toContainText('加载失败');
  await expect(viewer.getByRole('button', { name: '放大图片' })).toBeDisabled();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const close = viewer.getByRole('button', { name: '关闭图片' });
  await expect(close).toBeInViewport();
  await close.click();
  await expect(figure).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});
