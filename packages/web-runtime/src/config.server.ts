import { resolveApiOrigin } from '@xtrip/api-client';
export interface RuntimeConfig {
  apiOrigin: string;
  webOrigin: string;
  publicKey: string;
  issuer: string;
  audience: string;
  cookieKey: Buffer;
  allowLoopback: boolean;
}
export function runtimeConfig(env: Record<string, string | undefined>): RuntimeConfig {
  const webOrigin = resolveApiOrigin(env.XTRIP_WEB_ORIGIN ?? 'http://127.0.0.1:4173');
  const url = new URL(webOrigin);
  const allowLoopback =
    env.XTRIP_ALLOW_LOOPBACK_SESSION === 'true' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  const key = Buffer.from(env.XTRIP_SESSION_KEY ?? '', 'base64');
  const publicKey = Buffer.from(env.XTRIP_JWT_PUBLIC_KEY_BASE64 ?? '', 'base64').toString('utf8');
  if (
    key.length !== 32 ||
    !publicKey.includes('BEGIN PUBLIC KEY') ||
    !env.XTRIP_JWT_ISSUER ||
    !env.XTRIP_JWT_AUDIENCE ||
    (url.protocol !== 'https:' && !allowLoopback)
  )
    throw Error('Session configuration unavailable');
  const apiOrigin = resolveApiOrigin(env.XTRIP_API_ORIGIN ?? 'http://localhost:4000');
  if (
    new URL(apiOrigin).protocol !== 'https:' &&
    !(allowLoopback && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(apiOrigin).hostname))
  )
    throw Error('API transport configuration unavailable');
  return {
    webOrigin,
    apiOrigin,
    publicKey,
    issuer: env.XTRIP_JWT_ISSUER,
    audience: env.XTRIP_JWT_AUDIENCE,
    cookieKey: key,
    allowLoopback,
  };
}
