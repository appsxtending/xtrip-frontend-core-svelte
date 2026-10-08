import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('SSR direct load, action refusal, no-JS submission and safe errors', async ({
  browser,
  request,
}) => {
  const result = await request.get('/');
  expect(await result.text()).toContain('A shared foundation. Every journey.');
  expect(result.headers()['cache-control']).toContain('no-store');
  expect(result.headers()['x-robots-tag']).toContain('noindex');
  expect(result.headers()['content-security-policy']).toContain('nonce-');
  expect(result.headers()['content-security-policy']).toContain(
    "require-trusted-types-for 'script'",
  );
  const denied = await request.post('/', {
    form: { theme: 'dark' },
    headers: { origin: 'https://foreign.invalid' },
  });
  expect(denied.status()).toBe(403);
  const missing = await request.post('/', { form: { theme: 'dark' } });
  expect(missing.status()).toBe(403);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Apply appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('status')).toContainText('Appearance preview applied.');
  const error = await request.get('/unavailable');
  expect(error.status()).toBe(404);
  expect(await error.text()).not.toMatch(/stack trace|node_modules|accessToken/);
  await context.close();
});
for (const locale of ['en', 'ar', 'th', 'en-XA']) {
  for (const width of [390, 1440]) {
    test(`${locale} ${width}: accessible responsive deterministic visual`, async ({
      page,
    }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/?locale=${locale}`);
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.evaluate(() => document.fonts.ready);
      const first = await page.screenshot({ fullPage: true, animations: 'disabled' });
      expect(await page.screenshot({ fullPage: true, animations: 'disabled' })).toEqual(first);
      await info.attach('foundation-visual', { body: first, contentType: 'image/png' });
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link').first()).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}
test('hydration, dark theme, forced colors and page asset budgets', async ({ page }) => {
  await page.goto('/?theme=dark');
  await page.getByRole('button', { name: 'What comes next' }).click();
  await expect(page.getByRole('button', { name: 'What comes next' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect((await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()).violations).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Apply appearance' })).toBeVisible();
  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return {
      js: resources
        .filter((x) => x.name.endsWith('.js'))
        .reduce((n, x) => n + x.decodedBodySize, 0),
      css: resources
        .filter((x) => x.name.endsWith('.css'))
        .reduce((n, x) => n + x.decodedBodySize, 0),
      api: resources.filter((x) => x.name.includes('/v1/')).length,
    };
  });
  expect(metrics.js).toBeLessThan(200_000);
  expect(metrics.css).toBeLessThan(80_000);
  expect(metrics.api).toBe(0);
});

test('locale navigation, keyboard disclosure and invalid appearance', async ({ page, request }) => {
  await page.goto('/');
  await page.locator('a[lang="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  const disclosure = page.getByRole('button', { name: 'What comes next' });
  await disclosure.focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  const csrfPage = await request.get('/');
  const csrf = (await csrfPage.text()).match(/name="csrf" value="([^"]+)"/)?.[1];
  const invalid = await request.post('/', {
    form: { theme: 'injected', csrf: csrf ?? '' },
    headers: { origin: 'http://127.0.0.1:4173', accept: 'text/html' },
  });
  expect(invalid.status()).toBe(400);
  expect(await invalid.text()).toContain('Choose a supported appearance.');
});

test('laboratory rendering and interaction budgets', async ({ page }, info) => {
  await page.addInitScript(() => {
    const samples = { lcp: 0, cls: 0, eventMax: 0 };
    Object.assign(window, { foundationMetrics: samples });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) samples.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) samples.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        samples.eventMax = Math.max(samples.eventMax, entry.duration);
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
  });
  await page.goto('/');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { foundationMetrics: { lcp: number } }).foundationMetrics.lcp,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'What comes next' }).click();
  await expect(page.getByRole('button', { name: 'What comes next' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      ...(
        window as typeof window & {
          foundationMetrics: { lcp: number; cls: number; eventMax: number };
        }
      ).foundationMetrics,
      ttfb: navigation.responseStart - navigation.startTime,
    };
  });
  await info.attach('laboratory-performance', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  expect(metrics.ttfb).toBeLessThan(2000);
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.eventMax).toBeLessThan(200);
});
