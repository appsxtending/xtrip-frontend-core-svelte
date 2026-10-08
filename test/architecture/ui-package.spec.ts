// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
it('keeps UI exports separate from workbench, server and API packages', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.files).toEqual(['dist/lib/index.js', 'dist/lib/index.d.ts', 'dist/components']);
  const index = readFileSync('src/lib/index.ts', 'utf8');
  expect(index).not.toMatch(/\.server|workbench|api-client|api-mocks|routes/);
  expect(Object.keys(pkg.dependencies)).not.toContain('@xtrip/api-client');
  expect(readdirSync('src/components')).toHaveLength(37);
  for (const name of readdirSync('src/components')) {
    const source = readFileSync(`src/components/${name}/${name}.svelte`, 'utf8');
    expect(source).not.toMatch(/fetch\s*\(|localStorage|sessionStorage|\{@html|window\./);
    expect(source).not.toMatch(/class=["'][^"']*\[[^"']+["']/);
  }
});
it('keeps pricing displays free of arithmetic and styling on semantic utilities', () => {
  for (const name of ['money', 'price-breakdown', 'price-drift-diff', 'pricing-stage-trace'])
    expect(readFileSync(`src/components/${name}/${name}.svelte`, 'utf8')).not.toMatch(
      /parseFloat|parseInt|Math\.|Number\(|toFixed/,
    );
  expect(readFileSync('src/app.css', 'utf8')).toContain('@xtrip/design-tokens/tokens.css');
  const css = readFileSync('packages/design-tokens/src/tokens.css', 'utf8');
  expect(css).toContain('#1b704d');
  expect(css).not.toMatch(/\b(left|right|margin-left|padding-right)\s*:/);
});
