import { test, expect } from '@playwright/test';
import { uiCopy, sessionCopy, type PresentationLocale } from '@xtrip/i18n';
import { gates, audit, syntheticLogin } from './quality-fixtures';
for (const locale of gates.locales)
  test(`core-quality-gates locale ${locale}`, async ({ page }, info) => {
    const language = locale as PresentationLocale;
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto('/?locale=' + locale);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(uiCopy(language).workbench);
    await page
      .getByRole('link', { name: uiCopy(language).sessionIntegration, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp('locale=' + locale));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(sessionCopy(locale).signIn);
    await audit(page, info);
  });
test('core-quality-gates direction survives hydrated navigation and history', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[lang="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
test('core-quality-gates localized freshness keeps machine-readable UTC', async ({ page }) => {
  await syntheticLogin(page);
  await page.goto('/session?locale=th');
  const time = page.locator('time');
  await expect(time).toHaveAttribute('datetime', /T.*Z$/);
  await expect(time).not.toHaveText((await time.getAttribute('datetime')) ?? '');
  await expect(time).toContainText('UTC');
});
