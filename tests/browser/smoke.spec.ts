import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const projects = ['emvision', 'lowalt-md', 'em-trace', 'quadcontrol-lab'];
async function loadFigures(page: import('@playwright/test').Page) {
  await page.locator('.deep-figures').evaluateAll((elements) => elements.forEach((element) => { (element as HTMLDetailsElement).open = true; }));
  for (const img of await page.locator('.figure-frame img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.locator('.deep-figures').evaluateAll((elements) => elements.forEach((element) => { (element as HTMLDetailsElement).open = false; }));
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
  const skip = page.getByRole('link', { name: '跳转到正文' });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
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
  await expect(page.locator('.figure-image-link').first()).toHaveAttribute('href', /\/evidence\/originals\//);
  await context.close();
});

test('figure viewer opens, zooms, closes and returns keyboard focus', async ({ page }) => {
  await page.goto('/projects/emvision/');
  const figure = page.locator('.figure-image-link').first();
  await figure.focus();
  await page.keyboard.press('Enter');
  const viewer = page.locator('.figure-viewer');
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('.viewer-image')).toHaveAttribute('src', /\/evidence\/originals\//);
  await viewer.getByRole('button', { name: '放大图片' }).click();
  await expect(viewer.locator('.viewer-image')).toHaveCSS('max-width', 'none');
  await expect(viewer.locator('.viewer-image')).toHaveCSS('max-height', 'none');
  await expect.poll(() => viewer.locator('.viewer-stage').evaluate((element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  await expect(figure).toBeFocused();
});

test('CV has a visible reserved slot without a fabricated download', async ({ page }) => {
  await page.goto('/');
  if (process.env.RELEASE_MODE === 'production' && process.env.RELEASE_TARGET === 'initial') {
    await expect(page.locator('.material-item.pending')).toHaveCount(0);
    await expect(page.locator('a[href*="/documents/cv.pdf"]')).toHaveCount(0);
    return;
  }
  const cv = page.locator('.material-item.pending');
  await expect(cv).toContainText('学术 CV');
  await expect(cv).toContainText('版本待确认');
  await expect(cv).not.toHaveAttribute('href', /./);
});

test('all thirteen scientific figures remain reachable on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'Mobile figure inventory');
  let count = 0;
  for (const slug of projects) {
    await page.goto(`/projects/${slug}/`);
    await page.locator('.deep-figures').evaluateAll((elements) => elements.forEach((element) => { (element as HTMLDetailsElement).open = true; }));
    for (const figure of await page.locator('.figure-frame').all()) {
      const image = figure.locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      await expect(figure.locator('figcaption')).toBeVisible();
      await expect(figure.locator('.figure-image-link')).toHaveAttribute('href', /\/evidence\/originals\//);
      count++;
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
  expect(count).toBe(13);
});

test('research map remains readable and tappable with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.map-node')).toHaveCount(3);
  await expect(page.locator('.map-branch')).toContainText('QuadControl-Lab');
  await page.locator('.map-node h3 a').first().tap();
  await expect(page).toHaveURL(/\/projects\/em-trace\/$/);
  await context.close();
});
