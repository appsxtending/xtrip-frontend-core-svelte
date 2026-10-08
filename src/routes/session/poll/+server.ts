import { json } from '@sveltejs/kit';
import { sessionRuntime, sessionId } from '#lib/session/runtime.server.ts';
import { safeProblem } from '@xtrip/web-runtime/errors';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async (event) => {
  if (!['same-origin', 'none', null].includes(event.request.headers.get('sec-fetch-site')))
    return json({ kind: 'forbidden', status: 403 }, { status: 403 });
  const runtime = sessionRuntime();
  const id = sessionId(event);
  if (!id) return json({ kind: 'authentication', status: 401 }, { status: 401 });
  try {
    return json(await runtime.geography(id));
  } catch (e) {
    const p = safeProblem(e);
    return json(p, { status: p.status });
  }
};
