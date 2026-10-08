import { fail, redirect } from '@sveltejs/kit';
import { presentationContext } from '#lib/ssr/host-policy.server.ts';
import type { Actions, PageServerLoad } from './$types';
const families = [
  'app-shell',
  'command-palette',
  'button',
  'link',
  'menu',
  'dialog',
  'drawer',
  'popover',
  'tabs',
  'form-field',
  'error-summary',
  'date-picker',
  'date-range-picker',
  'occupancy-editor',
  'market-picker',
  'geography-picker',
  'data-grid',
  'responsive-record-list',
  'bulk-action-bar',
  'rate-grid',
  'remote-state',
  'skeleton',
  'status-chip',
  'deadline-chip',
  'money',
  'drift-diff',
  'timeline',
  'document-status',
  'notification-center',
  'theme-provider',
  'chart-shell',
  'map-shell',
  'calendar',
  'file-import-review',
  'price-breakdown',
  'price-drift-diff',
  'pricing-stage-trace',
] as const;
const states = [
  'loading',
  'loaded',
  'empty',
  'filtered-empty',
  'refreshing',
  'stale',
  'retryable',
  'terminal',
  'forbidden',
  'not-found',
] as const;
export const load: PageServerLoad = ({ url }) => ({
  applied: url.searchParams.get('applied') === '1',
  section: families.find((x) => x === url.searchParams.get('section')) ?? 'button',
  density:
    url.searchParams.get('density') === 'compact' ? ('compact' as const) : ('comfortable' as const),
  brand: url.searchParams.get('brand') === 'indigo' ? ('indigo' as const) : ('forest' as const),
  state: states.find((x) => x === url.searchParams.get('state')) ?? 'loaded',
  drawerOpen: url.searchParams.get('drawer') === '1',
});
export const actions: Actions = {
  default: async ({ request, url }) => {
    const form = await request.formData();
    const theme = form.get('theme');
    if (theme !== 'light' && theme !== 'dark') return fail(400, { invalid: true });
    const next = new URLSearchParams({
      locale: presentationContext(url).locale,
      theme,
      applied: '1',
    });
    redirect(303, `/?${next}`);
  },
};
