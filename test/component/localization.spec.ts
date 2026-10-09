import { describe, it, expect } from 'vitest';
import { foundationCopy, messages, uiCopy, sessionCopy, formatFreshness } from '@xtrip/i18n';
describe('complete locale dictionaries and deterministic dates', () => {
  for (const locale of ['en', 'ar', 'th'] as const)
    it(locale + ' has every foundation, UI and session key', () => {
      for (const [actual, english] of [
        [foundationCopy[locale], foundationCopy.en],
        [messages[locale], messages.en],
        [sessionCopy(locale), sessionCopy('en')],
      ]) {
        expect(Object.keys(actual).sort()).toEqual(Object.keys(english).sort());
        expect(
          Object.values(actual).every(
            (value) => typeof value === 'string' && value.trim().length > 0,
          ),
        ).toBe(true);
      }
      expect(formatFreshness(0, locale)).toContain('UTC');
    });
  it('pseudo locale expands every UI key without changing the source', () => {
    for (const [key, value] of Object.entries(uiCopy('en')))
      expect(uiCopy('en-XA')[key as keyof typeof messages.en].length).toBeGreaterThan(value.length);
    for (const [key, value] of Object.entries(sessionCopy('en')))
      expect(
        sessionCopy('en-XA')[key as keyof ReturnType<typeof sessionCopy>].length,
      ).toBeGreaterThan(value.length);
    expect(formatFreshness(0, 'en-XA')).toBe(formatFreshness(0, 'en'));
  });
});
