import { randomBytes, timingSafeEqual } from 'node:crypto';
export class CsrfChallenges {
  private values = new Map<string, { token: string; scope: string; expires: number }>();
  constructor(private now = Date.now) {}
  read(id: string | null, scope: string) {
    if (!id) return null;
    const v = this.values.get(id);
    return v && v.scope === scope && v.expires > this.now() ? { id, token: v.token } : null;
  }
  issue(scope: string) {
    for (const [id, v] of this.values) if (v.expires <= this.now()) this.values.delete(id);
    if (this.values.size >= 5000) throw Error('Challenge capacity reached');
    const id = randomBytes(24).toString('base64url');
    const token = randomBytes(32).toString('base64url');
    this.values.set(id, { token, scope, expires: this.now() + 600000 });
    return { id, token };
  }
  consume(id: string | null, token: unknown, scope: string) {
    if (!id) return false;
    const v = this.values.get(id);
    this.values.delete(id);
    if (!v || v.expires <= this.now() || v.scope !== scope || typeof token !== 'string')
      return false;
    const a = Buffer.from(token),
      b = Buffer.from(v.token);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
export function safeOrigin(request: Request, origin: string) {
  return (
    request.headers.get('origin') === origin &&
    ['same-origin', 'none', null].includes(request.headers.get('sec-fetch-site'))
  );
}
export function safeReturn(value: string | null) {
  return value === '/session' ? value : '/session';
}
