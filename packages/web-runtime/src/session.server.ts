import { randomBytes } from 'node:crypto';
import { createApiClient, type components } from '@xtrip/api-client';
import type { RuntimeConfig } from './config.server.js';
import { verifyPrincipal } from './principal.server.js';
import { authorize } from './guards.server.js';
import { apiFault, RuntimeFault } from './errors.js';
import type { SessionStore, SessionRecord } from './store.server.js';
import type { SessionView } from './types.js';
export class SessionRuntime {
  constructor(
    readonly config: RuntimeConfig,
    readonly store: SessionStore,
    private transport: typeof fetch = fetch,
    private now = Date.now,
  ) {}
  private client(accessToken?: string) {
    return createApiClient({
      baseUrl: this.config.apiOrigin,
      accessToken,
      fetch: (input, init) =>
        this.transport(input, {
          ...init,
          signal: AbortSignal.any([
            ...(init?.signal ? [init.signal] : []),
            AbortSignal.timeout(10000),
          ]),
        }),
    });
  }
  view(r: SessionRecord): SessionView {
    return { principal: r.principal, pendingMfa: r.pendingMfa, expiresAt: r.expiresAt };
  }
  async login(body: components['schemas']['LoginRequest']) {
    try {
      const result = await this.client().POST('/v1/identity/credentials/login', { body });
      if (
        !result.data ||
        result.response.status !== 200 ||
        typeof result.data.accessToken !== 'string' ||
        typeof result.data.refreshToken !== 'string' ||
        typeof result.data.requiresMfa !== 'boolean' ||
        typeof result.data.userId !== 'string' ||
        typeof result.data.expiresAt !== 'string'
      )
        throw Error('Login failed');
      const p = verifyPrincipal(result.data.accessToken, this.config, this.now());
      if (
        p.userId !== result.data.userId ||
        p.tenantId !== (body.tenantId ?? null) ||
        p.principalClass === 'PLATFORM' ||
        !result.data.refreshToken ||
        !Number.isFinite(Date.parse(result.data.expiresAt)) ||
        Math.abs(Date.parse(result.data.expiresAt) - p.expiresAt) > 1000
      )
        throw Error('Invalid login');
      const r: SessionRecord = {
        id: randomBytes(32).toString('base64url'),
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        principal: p,
        pendingMfa: result.data.requiresMfa,
        expiresAt: this.now() + (result.data.requiresMfa ? 300000 : 28800000),
      };
      this.store.create(r);
      return r;
    } catch {
      throw new RuntimeFault('authentication', 401);
    }
  }
  async resolve(id: string, force = false): Promise<SessionRecord> {
    const observed = this.store.get(id);
    if (!observed) throw new RuntimeFault('authentication', 401);
    return this.store.exclusive(id, async () => {
      const r = this.store.get(id);
      if (!r) throw new RuntimeFault('authentication', 401);
      if (r.pendingMfa) {
        if (r.principal.expiresAt <= this.now()) {
          this.store.delete(id);
          throw new RuntimeFault('authentication', 401);
        }
        return r;
      }
      if (
        (!force && r.principal.expiresAt > this.now() + 30000) ||
        r.accessToken !== observed.accessToken
      )
        return r;
      try {
        if (!r.principal.tenantId) throw Error('Missing tenant context');
        const result = await this.client().POST('/v1/identity/tokens/refresh', {
          body: { refreshToken: r.refreshToken, tenantId: r.principal.tenantId },
        });
        if (
          !result.data ||
          result.response.status !== 200 ||
          typeof result.data.accessToken !== 'string' ||
          typeof result.data.refreshToken !== 'string' ||
          !result.data.refreshToken ||
          result.data.refreshToken === r.refreshToken
        )
          throw Error('Refresh failed');
        const p = verifyPrincipal(result.data.accessToken, this.config, this.now());
        if (
          p.userId !== r.principal.userId ||
          p.tenantId !== r.principal.tenantId ||
          p.principalClass !== r.principal.principalClass
        )
          throw Error('Principal mismatch');
        const next = {
          ...r,
          principal: p,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };
        if (!this.store.replace(next)) throw Error('Session revoked');
        return next;
      } catch {
        this.store.delete(id);
        throw new RuntimeFault('authentication', 401);
      }
    });
  }
  async verifyMfa(id: string, code: string) {
    return this.store.exclusive(id, async () => {
      const r = this.store.get(id);
      if (
        !r?.pendingMfa ||
        !r.principal.tenantId ||
        r.principal.expiresAt <= this.now() ||
        !/^\d{6}$/.test(code)
      )
        throw new RuntimeFault('authentication', 401);
      const result = await this.client(r.accessToken).POST('/v1/identity/mfa/totp/verify', {
        body: { userId: r.principal.userId, tenantId: r.principal.tenantId, code },
      });
      if (result.data?.isVerified !== true || !Number.isFinite(Date.parse(result.data.verifiedAt)))
        throw new RuntimeFault('authentication', 401);
      const next = { ...r, pendingMfa: false, expiresAt: this.now() + 28800000 };
      if (!this.store.replace(next)) throw new RuntimeFault('authentication', 401);
      return next;
    });
  }
  async geography(id: string) {
    const r = authorize(await this.resolve(id), 'postV1GeographySuggest');
    const result = await this.client(r.accessToken).POST('/v1/geography/suggest', {
      body: { keyword: 'Bang', locale: 'en', limit: 10 },
    });
    if (!result.data) {
      const fault = apiFault(result.response.status, result.error);
      if (fault.status === 401 || fault.status === 403) this.store.delete(id);
      throw fault;
    }
    if (
      !Array.isArray(result.data.suggestions) ||
      !result.data.suggestions.every((x) => typeof x.id === 'string' && typeof x.name === 'string')
    )
      throw new RuntimeFault('unexpected', 502);
    if (!this.store.get(id)) throw new RuntimeFault('authentication', 401);
    return {
      suggestions: result.data.suggestions.map((x) => ({ id: x.id, name: x.name })),
      principalKey: r.principal.fingerprint,
      updatedAt: this.now(),
    };
  }
  async logout(id: string) {
    const r = this.store.get(id);
    this.store.delete(id);
    if (!r?.principal.tenantId) return false;
    try {
      const result = await this.client(r.accessToken).POST('/v1/identity/logout', {
        body: { refreshToken: r.refreshToken, tenantId: r.principal.tenantId },
      });
      return result.data?.success === true;
    } catch {
      return false;
    }
  }
}
