import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
const families = readdirSync('src/components');
for (const [index, family] of families.entries())
  test(`workbench ${family}: SSR, responsive and accessible`, async ({ page }, info) => {
    const locale = ['en', 'ar', 'th', 'en-XA'][index % 4];
    const width = index % 2 ? 390 : 1440;
    const theme = index % 2 ? 'dark' : 'light';
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      `/?section=${family}&locale=${locale}&theme=${theme}&density=${index % 2 ? 'compact' : 'comfortable'}`,
    );
    await expect(page.locator('#example-title')).toHaveText(family.replaceAll('-', ' '));
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const audit = await new AxeBuilder({ page })
      .include('#example')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    expect(errors).toEqual([]);
    await info.attach('component-visual', {
      body: await page.locator('#example').screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    });
  });
test('dialog traps and restores focus; tabs support RTL keyboard navigation', async ({ page }) => {
  await page.goto('/?section=dialog');
  const trigger = page.locator('#example').getByRole('button', { name: 'Open', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[role=dialog]').analyze()).violations).toEqual(
    [],
  );
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.goto('/?section=tabs&locale=ar');
  const tabs = page.locator('#example').getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
});
test('URL drawer survives reload and browser history', async ({ page }) => {
  await page.goto('/?section=drawer');
  await page.locator('#example').getByRole('link', { name: /Open/ }).click();
  await expect(page.locator('.ui-drawer')).toBeVisible();
  await page.reload();
  await expect(page.locator('.ui-drawer')).toBeVisible();
  await page.locator('.ui-drawer').getByRole('link', { name: 'Close' }).click();
  await expect(page.locator('.ui-drawer')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('.ui-drawer')).toBeVisible();
});
test('preview controls preserve component and data-state selections through SSR', async ({
  page,
}) => {
  await page.goto('/?section=money&locale=th');
  await page.locator('select[name=density]').selectOption('compact');
  await page.locator('select[name=state]').selectOption('forbidden');
  await page.locator('form[method=GET]').getByRole('button').click();
  await expect(page).toHaveURL(/section=money/);
  await expect(page.locator('#example').getByRole('status')).toBeVisible();
  await expect(page.locator('#example')).not.toContainText('9007199254740993.01');
});
