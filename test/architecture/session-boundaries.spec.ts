// @vitest-environment node
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
it('keeps credentials and auth dependencies outside UI/browser exports', () => {
  const source = readFileSync('src/lib/index.ts', 'utf8');
  expect(source).not.toMatch(/web-runtime|session|api-client/);
  const pkg = JSON.parse(readFileSync('packages/web-runtime/package.json', 'utf8'));
  expect(pkg.exports['./server'].default).toContain('.server.js');
  for (const file of ['errors.ts', 'reconciliation.ts', 'types.ts'])
    expect(readFileSync('packages/web-runtime/src/' + file, 'utf8')).not.toMatch(
      /node:crypto|accessToken|refreshToken|api-client/,
    );
  expect(readFileSync('src/lib/session/reconciliation.svelte.ts', 'utf8')).toContain(
    "fetch('/session/poll'",
  );
});
