import '$app/server';
import { randomBytes } from 'node:crypto';
import {
  CookieCodec,
  CsrfChallenges,
  MemorySessionStore,
  SessionRuntime,
  runtimeConfig,
  cookieOptions,
} from '@xtrip/web-runtime/server';
import type { RequestEvent } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
let runtime: SessionRuntime | undefined;
const challengeKey = randomBytes(32);
export const challenges = new CsrfChallenges();
export function challengeCodec(origin: string) {
  return new CookieCodec(challengeKey, origin);
}
export function sessionRuntime() {
  if (process.env.XTRIP_SESSION_ENABLED !== 'true') error(404, 'Page not found');
  if (!runtime) {
    try {
      if (process.env.XTRIP_SESSION_STORE !== 'single-process-workbench')
        throw Error('Store adapter unavailable');
      runtime = new SessionRuntime(runtimeConfig(process.env), new MemorySessionStore());
    } catch {
      error(503, 'Session configuration unavailable');
    }
  }
  return runtime;
}
export function sessionId(event: RequestEvent) {
  const r = sessionRuntime();
  return new CookieCodec(r.config.cookieKey, r.config.webOrigin).open(
    event.cookies.get('xtrip-session'),
    'session',
  );
}
export function requireSession(event: RequestEvent) {
  const id = sessionId(event);
  if (!id) redirect(303, '/session/login');
  return id;
}
export function setSession(event: RequestEvent, id: string, expiresAt: number) {
  const r = sessionRuntime();
  event.cookies.set(
    'xtrip-session',
    new CookieCodec(r.config.cookieKey, r.config.webOrigin).seal(id, 'session', expiresAt),
    cookieOptions(
      !r.config.allowLoopback,
      Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
    ),
  );
}
export function clearSession(event: RequestEvent) {
  event.cookies.delete('xtrip-session', { path: '/' });
}
