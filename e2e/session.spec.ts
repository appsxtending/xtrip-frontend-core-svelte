import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const tenant = '11edded3-947c-5c8a-afcb-0c1a404d85e0';
test('core-session-and-reconciliation: SSR login, refresh, polling and logout without token leakage', async ({
  page,
  context,
}, info) => {
  let polls = 0;
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/session/poll') polls++;
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Session integration', exact: true }).click();
  await expect(page).toHaveURL(/session\/login/);
  await page.getByLabel('Email', { exact: true }).fill('test@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByLabel('Tenant ID').fill(tenant);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Session integration' })).toBeVisible();
  await expect(page.getByText('Bangkok', { exact: true })).toBeVisible();
  expect(await page.content()).not.toMatch(/accessToken|refreshToken|fixture-password/);
  expect((await context.cookies()).find((c) => c.name === 'xtrip-session')).toMatchObject({
    httpOnly: true,
    sameSite: 'Strict',
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await info.attach('session-visual', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  expect(polls).toBe(0);
  await page.getByRole('button', { name: 'Check for updates' }).click();
  await expect(page.getByRole('status')).toHaveText('Up to date');
  expect(polls).toBe(1);
  await page.getByRole('button', { name: 'Refresh session', exact: true }).click();
  await expect(page.getByText('Bangkok', { exact: true })).toBeVisible();
  await page.route('**/session/poll', (route) =>
    route.fulfill({
      json: {
        suggestions: [{ id: 'foreign', name: 'PRIVATE-OTHER-PRINCIPAL' }],
        principalKey: 'foreign',
        updatedAt: 0,
      },
    }),
  );
  await page.getByRole('button', { name: 'Check for updates' }).click();
  await expect(page.getByRole('status')).toHaveText('Access unavailable. Sign in again.');
  await expect(page.getByText('PRIVATE-OTHER-PRINCIPAL', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Bangkok', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/session\/login/);
  await page.goto('/session');
  await expect(page).toHaveURL(/session\/login/);
});
test('no-JS login and Arabic responsive sign-in', async ({ browser, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/session/login?locale=ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const c = await browser.newContext({ javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto('http://127.0.0.1:4173/session/login');
  await p.getByLabel('Email', { exact: true }).fill('test@example.invalid');
  await p.getByLabel('Password', { exact: true }).fill('fixture-password');
  await p.getByLabel('Tenant ID').fill(tenant);
  await p.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(p.getByText('Bangkok', { exact: true })).toBeVisible();
  await p.getByRole('button', { name: 'Sign out' }).click();
  await expect(p).toHaveURL(/session\/login/);
  await c.close();
});
test('missing CSRF is refused and MFA does not expose protected reads', async ({
  page,
  request,
}) => {
  expect(
    (
      await request.post('/session/login', {
        form: { email: 'test@example.invalid', password: 'fixture-password', tenantId: tenant },
        headers: { origin: 'http://127.0.0.1:4173' },
      })
    ).status(),
  ).toBe(403);
  await page.goto('/session/login');
  await page.getByLabel('Email', { exact: true }).fill('mfa@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByLabel('Tenant ID').fill(tenant);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByLabel('Verification code')).toBeVisible();
  await expect(page.getByText('Bangkok', { exact: true })).toHaveCount(0);
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page.getByText('Bangkok', { exact: true })).toBeVisible();
});
