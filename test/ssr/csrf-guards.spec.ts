// @vitest-environment node
import { it, expect } from 'vitest';
import {
  CsrfChallenges,
  safeOrigin,
  safeReturn,
  SessionRuntime,
  MemorySessionStore,
  cookieOptions,
} from '@xtrip/web-runtime/server';
import { fixture, tenant } from '../fixtures/session-api.server';
it('binds one-use CSRF challenges to identity and expiry', () => {
  let now = 0;
  const c = new CsrfChallenges(() => now);
  const x = c.issue('a');
  expect(c.consume(x.id, x.token, 'b')).toBe(false);
  expect(c.consume(x.id, x.token, 'a')).toBe(false);
  const y = c.issue('a');
  expect(c.consume(y.id, y.token, 'a')).toBe(true);
  expect(c.consume(y.id, y.token, 'a')).toBe(false);
  const z = c.issue('a');
  now = 600001;
  expect(c.consume(z.id, z.token, 'a')).toBe(false);
});
it('requires same origin and safe metadata, never external return URLs', () => {
  const origin = 'https://app.invalid';
  expect(
    safeOrigin(
      new Request(origin, { headers: { origin, 'sec-fetch-site': 'cross-site' } }),
      origin,
    ),
  ).toBe(false);
  expect(safeOrigin(new Request(origin, { headers: { origin } }), origin)).toBe(true);
  expect(safeReturn('//evil.invalid')).toBe('/session');
  expect(cookieOptions(true, 20)).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
});
it('blocks absent permissions and pending MFA before data loading', async () => {
  const f = fixture();
  const r = new SessionRuntime(f.config, new MemorySessionStore(), f.transport);
  for (const email of ['forbidden@example.invalid', 'mfa@example.invalid']) {
    const s = await r.login({ email, password: 'fixture-password', tenantId: tenant });
    await expect(r.geography(s.id)).rejects.toThrow();
    if (s.pendingMfa) {
      await expect(r.verifyMfa(s.id, '000000')).rejects.toThrow();
      await r.verifyMfa(s.id, '123456');
      await r.geography(s.id);
    }
  }
  expect(f.reads).toBe(1);
});
