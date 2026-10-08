// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
const root = process.cwd();
const ignored = new Set([
  '.git',
  '.kilo',
  'node_modules',
  '.svelte-kit',
  'dist',
  'build',
  'test-results',
  'playwright-report',
]);
function files(directory: string, prefix = ''): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name) || entry.name.startsWith('.env')) return [];
    const name = prefix + entry.name;
    return entry.isDirectory() ? files(join(directory, entry.name), name + '/') : [name];
  });
}
it('allows only exact reserved files and public package boundaries', () => {
  const catalog = JSON.parse(readFileSync('contracts/repository-file-catalog.json', 'utf8')) as {
    files: { repository: string; path: string }[];
  };
  const allowed = new Set(
    catalog.files.filter((x) => x.repository === 'xtrip-frontend-core-svelte').map((x) => x.path),
  );
  expect(files(root).filter((path) => !allowed.has(path))).toEqual([]);
  for (const path of files(join(root, 'src'), 'src/').filter((p) => /\.(ts|svelte)$/.test(p))) {
    const source = readFileSync(path, 'utf8');
    if (!path.startsWith('src/lib/session/'))
      expect(source).not.toMatch(
        /xtrip-api-node|xtrip-(tenant-web|agent-portal|admin-web|b2c-storefront)|fetch\s*\(|axios|@xtrip\/api-|packages\/api-/,
      );
    expect(source).not.toMatch(/\{@html|localStorage|sessionStorage/);
    if (!path.startsWith('src/components/')) expect(source).not.toContain('@melt-ui');
  }
  expect(readFileSync('src/lib/index.ts', 'utf8')).not.toMatch(/\.server|ssr\//);
});
it('pins stable dependencies and keeps SSR configuration enabled', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
    devDependencies: Record<string, string>;
  };
  for (const version of Object.values(pkg.devDependencies))
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(readFileSync('vite.config.ts', 'utf8')).toContain('adapter()');
  for (const path of files(join(root, 'src'), 'src/'))
    expect(readFileSync(path, 'utf8')).not.toMatch(/ssr\s*=\s*false/);
});
