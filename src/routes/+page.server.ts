import { fail, redirect } from '@sveltejs/kit';
import { presentationContext } from '#lib/ssr/host-policy.server.ts';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ url }) => ({
  applied: url.searchParams.get('applied') === '1',
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
