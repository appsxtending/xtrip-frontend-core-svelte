import { describe, it, expect } from 'vitest';
import { isSafeAction, presentationContext } from '../../src/lib/ssr/host-policy.server';
import { presentationCopy } from '../../src/lib/index';
describe('SSR presentation boundary', () => {
  it('rejects injected presentation values and keeps per-request context isolated', () => {
    expect(
      presentationContext(new URL('https://example.test/?locale=ar&theme=dark')),
    ).toMatchObject({ direction: 'rtl', theme: 'dark' });
    expect(
      presentationContext(new URL('https://example.test/?locale=%22%3E&theme=script')),
    ).toMatchObject({ locale: 'en', theme: 'light' });
  });
  it('rejects missing, foreign and cross-site action origins', () => {
    const url = new URL('https://example.test/');
    const rejected: Record<string, string>[] = [
      {},
      { origin: 'https://evil.test' },
      { origin: url.origin, 'sec-fetch-site': 'cross-site' },
    ];
    for (const headers of rejected)
      expect(isSafeAction(new Request(url, { method: 'POST', headers }), url)).toBe(false);
    expect(
      isSafeAction(
        new Request(url, {
          method: 'POST',
          headers: { origin: url.origin, 'sec-fetch-site': 'same-origin' },
        }),
        url,
      ),
    ).toBe(true);
  });
  it('provides Arabic, Thai and expanded text without mutating the English fixture', () => {
    expect(presentationCopy('ar').title).toContain('رحلة');
    expect(presentationCopy('th').title).toContain('เดินทาง');
    expect(presentationCopy('en-XA').title.length).toBeGreaterThan(
      presentationCopy('en').title.length * 2,
    );
  });
});
