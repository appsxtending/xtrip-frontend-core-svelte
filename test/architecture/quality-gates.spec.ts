// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { it, expect } from 'vitest';
it('quality contract covers every exported family and approved route budgets', () => {
  const gates = JSON.parse(readFileSync('contracts/quality-gates.json', 'utf8'));
  expect(gates.families).toEqual(readdirSync('src/components').sort());
  expect(gates.locales).toEqual(['en', 'ar', 'th', 'en-XA']);
  expect(gates.matrix.map((row: { locale: string }) => row.locale)).toEqual(gates.locales);
  expect(gates.routes.map((row: { path: string }) => row.path)).toEqual([
    '/',
    '/session/login',
    '/session',
  ]);
  expect(
    Object.values(gates.limits).every(
      (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
    ),
  ).toBe(true);
  expect(gates.visual.maxDiffPixels).toBe(0);
});
