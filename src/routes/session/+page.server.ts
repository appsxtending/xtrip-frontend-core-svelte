import { fail, redirect } from '@sveltejs/kit';
import { safeProblem } from '@xtrip/web-runtime/errors';
import {
  sessionRuntime,
  requireSession,
  setSession,
  clearSession,
} from '#lib/session/runtime.server.ts';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
  const runtime = sessionRuntime();
  const id = requireSession(event);
  try {
    const session = await runtime.resolve(id);

    if (session.pendingMfa) return { session: runtime.view(session), initial: null, problem: null };
    try {
      return {
        session: runtime.view(session),
        initial: await runtime.geography(id),
        problem: null,
      };
    } catch (e) {
      return { session: runtime.view(session), initial: null, problem: safeProblem(e) };
    }
  } catch {
    clearSession(event);
    redirect(303, '/session/login');
  }
};
export const actions: Actions = {
  logout: async (event) => {
    const runtime = sessionRuntime();
    const id = requireSession(event);
    await runtime.logout(id);
    clearSession(event);
    redirect(303, '/session/login');
  },
  refresh: async (event) => {
    const runtime = sessionRuntime();
    const id = requireSession(event);
    try {
      const s = await runtime.resolve(id, true);
      setSession(event, id, s.expiresAt);
    } catch {
      clearSession(event);
      redirect(303, '/session/login');
    }
    redirect(303, '/session');
  },
  verify: async (event) => {
    const id = requireSession(event);
    const code = (await event.request.formData()).get('code');
    try {
      if (typeof code !== 'string') return fail(400, { invalid: true });
      const s = await sessionRuntime().verifyMfa(id, code);
      setSession(event, id, s.expiresAt);
    } catch {
      return fail(401, { invalid: true });
    }
    redirect(303, '/session');
  },
};
