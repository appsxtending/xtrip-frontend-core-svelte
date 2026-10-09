import { expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
export const gates = JSON.parse(readFileSync('contracts/quality-gates.json', 'utf8')) as {
  locales: string[];
  families: string[];
  matrix: {
    id: string;
    locale: string;
    width: number;
    theme: string;
    brand: string;
    density: string;
  }[];
  routes: { id: string; path: string; authenticated?: boolean }[];
  limits: Record<string, number>;
  visual: { widths: number[]; section: string; maxDiffPixels: number; threshold: number };
};
export async function syntheticLogin(page: Page) {
  await page.goto('/session/login');
  await page.getByLabel('Email', { exact: true }).fill('test@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByLabel('Tenant ID').fill('11edded3-947c-5c8a-afcb-0c1a404d85e0');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Bangkok', { exact: true })).toBeVisible();
}
export async function audit(page: Page, info: TestInfo, selector?: string) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
  if (selector) builder = builder.include(selector);
  const result = await builder.analyze();
  await info.attach('accessibility', {
    body: JSON.stringify({
      url: new URL(page.url()).pathname,
      violations: result.violations,
      passes: result.passes.map((x) => x.id),
    }),
    contentType: 'application/json',
  });
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
}
export async function observePerformance(page: Page) {
  await page.addInitScript(() => {
    const samples = { lcpMs: 0, cls: 0, interactionMs: 0, interactions: 0 };
    Object.assign(window, { qualityMetrics: samples });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) samples.lcpMs = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) samples.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    const interaction = () => {
      const start = performance.now();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          samples.interactionMs = Math.max(samples.interactionMs, performance.now() - start);
          samples.interactions++;
        }),
      );
    };
    document.addEventListener('click', interaction);
    document.addEventListener('keydown', interaction);
  });
}
