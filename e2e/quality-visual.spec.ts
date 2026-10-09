import { test, expect } from '@playwright/test';
import { gates } from './quality-fixtures';
for (const locale of gates.locales)
  for (const width of gates.visual.widths)
    test(`core-quality-gates visual ${locale} ${width}`, async ({ page }) => {
      test.skip(
        process.platform !== 'linux',
        'Reference pixels are generated and compared only on pinned Linux Chromium',
      );
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.setFixedTime(new Date('2026-10-09T00:00:00Z'));
      await page.goto(
        `/?section=${gates.visual.section}&locale=${locale}&theme=light&brand=forest&density=comfortable`,
      );
      await expect(page.locator('[data-hydration-ms]')).toHaveAttribute(
        'data-hydration-ms',
        /[0-9]/,
      );
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${locale}-${width}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: gates.visual.maxDiffPixels,
        threshold: gates.visual.threshold,
      });
    });
