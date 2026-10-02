import { test, expect } from '@playwright/test';

test('opening plays once per session and remains replayable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/space/');
  const opening = page.locator('.space-opening');
  await expect(opening).toBeVisible();
  await page.locator('[data-opening-skip]').click();
  await expect(opening).not.toBeVisible();
  await page.reload();
  await expect(opening).not.toBeVisible();
  await page.locator('[data-opening-replay]').click();
  await expect(opening).toBeVisible();
  await page.locator('[data-opening-skip]').click();
  await expect(page.locator('[data-opening-replay]')).toBeFocused();
});

test('rapid photo switching and a late decode never restore a stale image', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/space/');
  await expect(page.locator('.space-card')).toHaveCount(18);
  await expect(page.locator('[data-space-photo]')).not.toHaveAttribute('src', /./);
  const first = page.locator('.space-card[data-slot="9"]');
  const src = await first.getAttribute('data-photo-src');
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**${src}`, async route => {
    const response = await route.fetch(); await waiting;
    await route.fulfill({ response });
  });
  await first.locator('button').click();
  await page.locator('[data-photo-step="1"]').click();
  await page.locator('[data-photo-step="1"]').click();
  await expect(page.locator('#space-dialog-title')).toHaveText('照片 12');
  await expect(page.locator('[data-space-photo]')).toHaveAttribute('alt', '跑步记录截图');
  await page.keyboard.press('Escape');
  await expect(first.locator('button')).toBeFocused();
  await page.locator('.space-card[data-slot="2"] button').click();
  release();
  await expect(page.locator('[data-space-photo]')).toHaveAttribute('alt', '写着跑步文字的鞋子');
  await expect(page.locator('#space-dialog-title')).toHaveText('照片 03');
});

test('narrow anchors and guide dock leave content unobstructed', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/projects/em-trace/#evidence');
  await expect.poll(() => page.evaluate(() => {
    const header = document.querySelector('.site-header')!.getBoundingClientRect();
    const title = document.querySelector('#evidence-heading')!.getBoundingClientRect();
    return title.top - header.bottom;
  })).toBeGreaterThanOrEqual(0);
  const trigger = page.locator('[data-guide-trigger]');
  await expect(page.locator('[data-reader-guide]')).toHaveAttribute('data-ready', 'true');
  const guide = await trigger.boundingBox(), strip = await page.locator('.project-return').boundingBox();
  expect(guide!.y).toBeGreaterThanOrEqual(strip!.y);
  expect(guide!.y + guide!.height).toBeLessThanOrEqual(strip!.y + strip!.height);
});

test('questions preserve input on failure and allow retry without unsafe HTML', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hasSeenHeroIntro', '1'));
  await page.goto('/projects/emvision/');
  await expect(page.locator('[data-reader-guide]')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-guide-trigger]').click();
  await page.locator('[data-guide-mode="ask"]').click();
  let count = 0;
  await page.route('**/api/guide', route => route.fulfill({ status: ++count === 1 ? 503 : 200,
    contentType: 'application/json', body: JSON.stringify(count === 1 ? { error: '服务暂不可用，请重试。' }
      : { answer: '结论限于固定合成测试域。<img src=x onerror=alert(1)>', links: [] }) }));
  await page.locator('#guide-question').fill('这个结果有什么适用条件？');
  await page.locator('.guide-submit').click();
  await expect(page.locator('#guide-question')).toHaveValue('这个结果有什么适用条件？');
  await expect(page.locator('[data-guide-ask-retry]')).toBeVisible();
  await page.locator('[data-guide-ask-retry]').click();
  await expect(page.locator('.guide-message-assistant')).toContainText('固定合成测试域');
  await expect(page.locator('.guide-message-assistant img')).toHaveCount(0);
});
