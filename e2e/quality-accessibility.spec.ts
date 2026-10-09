import { test, expect } from '@playwright/test';
import { gates, audit, syntheticLogin } from './quality-fixtures';
for (const variant of gates.matrix)
  for (const family of gates.families) {
    test(`core-quality-gates ${family} ${variant.id}`, async ({ page }, info) => {
      await page.setViewportSize({ width: variant.width, height: 1000 });
      const params = new URLSearchParams({
        section: family,
        locale: variant.locale,
        theme: variant.theme,
        brand: variant.brand,
        density: variant.density,
      });
      await page.goto('/?' + params);
      await expect(page.locator('[data-hydration-ms]')).toHaveAttribute(
        'data-hydration-ms',
        /[0-9]/,
      );
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        variant.locale === 'ar' ? 'rtl' : 'ltr',
      );
      await audit(page, info, '#example');
    });
  }
test('core-quality-gates keyboard, forced colors, reduced motion and text resize', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/?section=dialog&locale=en');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  const trigger = page.locator('#example').getByRole('button', { name: 'Open', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await audit(page, info);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
});
test('core-quality-gates session forms keyboard and accessible error', async ({ page }, info) => {
  await page.goto('/session/login');
  await page.getByLabel('Email', { exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Tenant ID')).toBeFocused();
  await audit(page, info);
  await syntheticLogin(page);
  await page.getByRole('button', { name: 'Check for updates' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Up to date');
  await audit(page, info);
});

for (const state of [
  'loading',
  'empty',
  'filtered-empty',
  'refreshing',
  'stale',
  'retryable',
  'terminal',
  'forbidden',
  'not-found',
])
  test(`core-quality-gates remote ${state}`, async ({ page }, info) => {
    await page.goto('/?section=remote-state&locale=ar&state=' + state);
    await audit(page, info, '#example');
    await expect(page.locator('#example')).not.toContainText('9007199254740993.01');
  });
