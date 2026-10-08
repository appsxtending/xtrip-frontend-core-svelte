import { fail, redirect } from '@sveltejs/kit';
import {
  sessionRuntime,
  sessionId,
  setSession,
  clearSession,
} from '#lib/session/runtime.server.ts';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = () => {
  sessionRuntime();
  return {};
};
export const actions: Actions = {
  default: async (event) => {
    const form = await event.request.formData();
    const email = form.get('email'),
      password = form.get('password'),
      tenantId = form.get('tenantId');
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof tenantId !== 'string' ||
      email.length > 254 ||
      password.length > 1024 ||
      !/^[0-9a-f-]{36}$/i.test(tenantId)
    )
      return fail(400, { invalid: true });
    const r = sessionRuntime();
    const old = sessionId(event);
    if (old) await r.logout(old);
    clearSession(event);
    try {
      const session = await r.login({ email, password, tenantId });
      setSession(event, session.id, session.expiresAt);
    } catch {
      return fail(401, { invalid: true });
    }
    redirect(303, '/session' + (event.url.searchParams.get('locale') === 'ar' ? '?locale=ar' : ''));
  },
};
