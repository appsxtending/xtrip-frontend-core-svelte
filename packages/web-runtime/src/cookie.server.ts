import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
export class CookieCodec {
  constructor(
    private key: Buffer,
    private origin: string,
  ) {
    if (key.length !== 32) throw Error('Invalid cookie key');
  }
  seal(value: string, purpose: string, expiresAt: number) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(this.origin + ':' + purpose));
    const body = Buffer.concat([
      cipher.update(JSON.stringify({ value, expiresAt }), 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
  }
  open(cookie: string | undefined, purpose: string, now = Date.now()): string | null {
    try {
      if (!cookie || cookie.length > 4096) return null;
      const b = Buffer.from(cookie, 'base64url');
      const decipher = createDecipheriv('aes-256-gcm', this.key, b.subarray(0, 12));
      decipher.setAAD(Buffer.from(this.origin + ':' + purpose));
      decipher.setAuthTag(b.subarray(12, 28));
      const result = JSON.parse(
        Buffer.concat([decipher.update(b.subarray(28)), decipher.final()]).toString('utf8'),
      );
      return typeof result.value === 'string' &&
        Number.isFinite(result.expiresAt) &&
        result.expiresAt > now
        ? result.value
        : null;
    } catch {
      return null;
    }
  }
}
export function cookieOptions(secure: boolean, maxAge: number) {
  return { path: '/', httpOnly: true, secure, sameSite: 'strict' as const, maxAge };
}
