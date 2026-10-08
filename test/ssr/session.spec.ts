// @vitest-environment node
import { it, expect } from 'vitest';
import {
  CookieCodec,
  verifyPrincipal,
  MemorySessionStore,
  SessionRuntime,
} from '@xtrip/web-runtime/server';
import { fixture, tenant, user } from '../fixtures/session-api.server';
it('authenticates cookie purpose, origin, tampering and expiry', () => {
  const f = fixture();
  const c = new CookieCodec(f.config.cookieKey, f.config.webOrigin);
  const value = c.seal('opaque-id', 'session', 100);
  expect(c.open(value, 'session', 99)).toBe('opaque-id');
  expect(c.open(value, 'csrf', 99)).toBeNull();
  expect(c.open(value, 'session', 100)).toBeNull();
  expect(c.open(value.slice(0, -3) + 'aaa', 'session', 99)).toBeNull();
  expect(
    new CookieCodec(f.config.cookieKey, 'https://other.invalid').open(value, 'session', 99),
  ).toBeNull();
});
it('rejects invalid signature, issuer, audience, expiry and tenant claims', () => {
  const f = fixture();
  for (const override of [
    { iss: 'bad' },
    { aud: 'bad' },
    { exp: 0 },
    { principalClass: 'AGENT', tenantId: null },
  ])
    expect(() => verifyPrincipal(f.token(override), f.config)).toThrow();
  expect(() => verifyPrincipal(f.token(), fixture().config)).toThrow();
});
it('single-flights refresh, excludes secrets from views and logs out', async () => {
  const f = fixture();
  const r = new SessionRuntime(f.config, new MemorySessionStore(), f.transport);
  const s = await r.login({
    email: 'test@example.invalid',
    password: 'fixture-password',
    tenantId: tenant,
  });
  const results = await Promise.all([
    r.resolve(s.id, true),
    r.resolve(s.id, true),
    r.resolve(s.id, true),
  ]);
  expect(f.refreshes).toBe(1);
  expect(results[0].refreshToken).not.toBe(s.refreshToken);
  expect(JSON.stringify(r.view(s))).not.toMatch(/accessToken|refreshToken|fixture-password/);
  await r.logout(s.id);
  await expect(r.resolve(s.id)).rejects.toThrow();
});
it('fails closed on principal mismatch after refresh', async () => {
  const f = fixture();
  const transport: typeof fetch = async (input, init) => {
    const response = await f.transport(input, init);
    if (
      new URL(input instanceof Request ? input.url : String(input)).pathname.endsWith('/refresh')
    ) {
      const body = await response.json();
      return Response.json({ ...body, accessToken: f.token({ sub: 'another-user' }) });
    }
    return response;
  };
  const store = new MemorySessionStore();
  const r = new SessionRuntime(f.config, store, transport);
  const s = await r.login({
    email: 'test@example.invalid',
    password: 'fixture-password',
    tenantId: tenant,
  });
  await expect(r.resolve(s.id, true)).rejects.toThrow();
  expect(store.get(s.id)).toBeUndefined();
  expect(user).not.toBe('another-user');
});
it('does not retry an ambiguous refresh or resurrect a logged-out session', async () => {
  const f = fixture();
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const transport: typeof fetch = async (input, init) => {
    if ((input instanceof Request ? input.url : String(input)).endsWith('/refresh')) {
      await gate;
      throw Error('connection lost');
    }
    return f.transport(input, init);
  };
  const r = new SessionRuntime(f.config, new MemorySessionStore(), transport);
  const s = await r.login({
    email: 'test@example.invalid',
    password: 'fixture-password',
    tenantId: tenant,
  });
  const refresh = r.resolve(s.id, true);
  await Promise.resolve();
  await r.logout(s.id);
  release();
  await expect(refresh).rejects.toThrow();
  await expect(r.resolve(s.id)).rejects.toThrow();
});

it('rejects successful refresh completion after local logout', async () => {
  const f = fixture();
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  const gate = new Promise<void>((r) => (release = r));
  const transport: typeof fetch = async (input, init) => {
    if ((input instanceof Request ? input.url : String(input)).endsWith('/refresh')) {
      const result = await f.transport(input, init);
      entered();
      await gate;
      return result;
    }
    return f.transport(input, init);
  };
  const store = new MemorySessionStore();
  const r = new SessionRuntime(f.config, store, transport);
  const s = await r.login({
    email: 'test@example.invalid',
    password: 'fixture-password',
    tenantId: tenant,
  });
  const pending = r.resolve(s.id, true);
  await started;
  await r.logout(s.id);
  release();
  await expect(pending).rejects.toThrow();
  expect(store.get(s.id)).toBeUndefined();
});
it('bounds and expires local sessions without retaining caller mutations', () => {
  const f = fixture();
  const store = new MemorySessionStore(1, () => 100);
  const principal = verifyPrincipal(f.token(), f.config);
  const record = {
    id: 'a',
    accessToken: 'secret',
    refreshToken: 'secret2',
    principal,
    pendingMfa: false,
    expiresAt: 101,
  };
  store.create(record);
  record.principal.permissions = [];
  expect(store.get('a')?.principal.permissions).toEqual(['masterdata:read']);
  expect(() => store.create({ ...record, id: 'b' })).toThrow();
  store.delete('a');
  store.create({ ...record, id: 'b', expiresAt: 99 });
  expect(store.get('b')).toBeUndefined();
});
