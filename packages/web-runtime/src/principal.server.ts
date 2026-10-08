import { createPublicKey, verify, createHash } from 'node:crypto';
import type { RuntimeConfig } from './config.server.js';
import type { Principal, PrincipalClass } from './types.js';
export function verifyPrincipal(
  token: string,
  config: Pick<RuntimeConfig, 'publicKey' | 'issuer' | 'audience'>,
  now = Date.now(),
): Principal {
  if (token.length > 32768) throw Error('Invalid principal');
  const parts = token.split('.');
  if (parts.length !== 3) throw Error('Invalid principal');
  const [h, p, s] = parts;
  const header = JSON.parse(Buffer.from(h, 'base64url').toString());
  if (
    header.alg !== 'RS256' ||
    !verify(
      'RSA-SHA256',
      Buffer.from(h + '.' + p),
      createPublicKey(config.publicKey),
      Buffer.from(s, 'base64url'),
    )
  )
    throw Error('Invalid principal');
  const c = JSON.parse(Buffer.from(p, 'base64url').toString());
  const strings = (x: unknown): x is string[] =>
    Array.isArray(x) &&
    x.length <= 1000 &&
    x.every((v) => typeof v === 'string' && v.length <= 200);
  if (
    c.iss !== config.issuer ||
    c.aud !== config.audience ||
    !Number.isFinite(c.exp) ||
    c.exp * 1000 <= now ||
    !Number.isFinite(c.iat) ||
    c.iat * 1000 > now + 30000 ||
    (c.nbf !== undefined && (!Number.isFinite(c.nbf) || c.nbf * 1000 > now)) ||
    typeof c.sub !== 'string' ||
    !c.sub ||
    typeof c.jti !== 'string' ||
    !c.jti ||
    !strings(c.permissions) ||
    !strings(c.roles) ||
    !['TENANT', 'AGENT', 'PLATFORM'].includes(c.principalClass)
  )
    throw Error('Invalid principal');
  if (
    c.principalClass === 'PLATFORM'
      ? c.tenantId !== null
      : typeof c.tenantId !== 'string' || !c.tenantId
  )
    throw Error('Invalid principal');
  const permissions = [...new Set<string>(c.permissions)].sort();
  return {
    userId: c.sub,
    tenantId: c.tenantId,
    principalClass: c.principalClass as PrincipalClass,
    permissions,
    expiresAt: c.exp * 1000,
    fingerprint: createHash('sha256')
      .update(JSON.stringify([c.sub, c.tenantId, c.principalClass, permissions]))
      .digest('hex'),
  };
}
