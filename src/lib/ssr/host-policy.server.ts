import '$app/server';
import { presentationLocales, type PresentationLocale, type PresentationTheme } from '../index';
export function presentationContext(url: URL) {
  const candidate = url.searchParams.get('locale');
  const locale = presentationLocales.includes(candidate as PresentationLocale)
    ? (candidate as PresentationLocale)
    : 'en';
  const theme: PresentationTheme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';
  return {
    locale,
    theme,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    language: locale === 'en-XA' ? 'en' : locale,
  };
}
export function isSafeAction(request: Request, url: URL): boolean {
  return (
    request.headers.get('origin') === url.origin &&
    ['same-origin', 'none', null].includes(request.headers.get('sec-fetch-site'))
  );
}
export const privateResponseHeaders = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
