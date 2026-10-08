import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
if (existsSync('.env.test')) process.loadEnvFile('.env.test');
test('core-session-real-api: SSR credential login, protected read, refresh and logout', async ({
  page,
}) => {
  const email = process.env.API_USERNAME,
    password = process.env.API_PASSWORD,
    tenantId = process.env.API_TENANT;
  if (!email || !password || !tenantId) throw Error('Owner synthetic profile unavailable');
  await page.goto('/session/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Tenant ID').fill(tenantId);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Session integration' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Up to date');
  expect(await page.content()).not.toMatch(/accessToken|refreshToken/);
  await page.getByRole('button', { name: 'Refresh session', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Up to date');
  await page.getByRole('button', { name: 'Check for updates' }).click();
  await expect(page.getByRole('status')).toHaveText('Up to date');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/session\/login/);
});
