import { test, expect } from '@playwright/test';
import { gates, syntheticLogin, observePerformance } from './quality-fixtures';
for (const route of gates.routes)
  test(`core-quality-gates performance ${route.id}`, async ({ page }, info) => {
    if (route.authenticated) await syntheticLogin(page);
    await observePerformance(page);
    let directApiRequests = 0,
      polls = 0;
    page.on('request', (request) => {
      const path = new URL(request.url()).pathname;
      if (path.startsWith('/v1/')) directApiRequests++;
      if (path === '/session/poll') polls++;
    });
    await page.goto(route.path);
    await expect(page.locator('[data-hydration-ms]')).toHaveAttribute('data-hydration-ms', /[0-9]/);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & { qualityMetrics: { lcpMs: number } }).qualityMetrics.lcpMs,
        ),
      )
      .toBeGreaterThan(0);
    expect(polls).toBe(gates.limits.initialPolls);
    if (route.id === 'foundation')
      await page.getByRole('button', { name: 'What comes next' }).click();
    else if (route.authenticated) {
      await page.getByRole('button', { name: 'Check for updates' }).click();
      await expect(page.getByRole('status')).toHaveText('Up to date');
      expect(polls).toBe(1);
    } else {
      await page.getByLabel('Email', { exact: true }).focus();
      await page.keyboard.press('a');
    }
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & { qualityMetrics: { interactions: number } }).qualityMetrics
              .interactions,
        ),
      )
      .toBeGreaterThan(0);
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const bytes = (extension: RegExp) =>
        resources
          .filter((r) => extension.test(new URL(r.name).pathname))
          .reduce((n, r) => n + r.decodedBodySize, 0);
      return {
        ...(
          window as typeof window & {
            qualityMetrics: {
              lcpMs: number;
              cls: number;
              interactionMs: number;
              interactions: number;
            };
          }
        ).qualityMetrics,
        ttfbMs: nav.responseStart - nav.startTime,
        hydrationMs: Number(
          document.querySelector('[data-hydration-ms]')?.getAttribute('data-hydration-ms'),
        ),
        jsBytes: bytes(/\.js$/),
        cssBytes: bytes(/\.css$/),
        imageBytes: bytes(/\.(png|jpg|jpeg|webp|svg|avif)$/),
      };
    });
    await info.attach('route-performance', {
      body: JSON.stringify(
        {
          route: route.path,
          metrics,
          directApiRequests,
          polls,
          interactionMetric: 'event-to-second-animation-frame laboratory latency; not field INP',
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });
    expect(metrics.jsBytes).toBeGreaterThan(0);
    expect(metrics.cssBytes).toBeGreaterThan(0);
    expect(metrics.hydrationMs).toBeGreaterThan(0);
    expect(metrics.interactionMs).toBeGreaterThan(0);
    for (const [name, value] of Object.entries(metrics))
      if (name in gates.limits) expect(value, name).toBeLessThan(gates.limits[name]);
    expect(directApiRequests).toBe(gates.limits.directApiRequests);
  });
