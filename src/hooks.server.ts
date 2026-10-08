import { challengeCodec, challenges } from '#lib/session/runtime.server.ts';
import { cookieOptions } from '@xtrip/web-runtime/server';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import {
  isSafeAction,
  presentationContext,
  privateResponseHeaders,
} from '#lib/ssr/host-policy.server.ts';
export const handle: Handle = async ({ event, resolve }) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(event.request.method) &&
    !isSafeAction(event.request, event.url)
  ) {
    return new Response('Forbidden', { status: 403, headers: privateResponseHeaders });
  }
  const codec = challengeCodec(event.url.origin);
  const scope = event.cookies.get('xtrip-session') ?? 'anonymous';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
    let token: unknown = event.request.headers.get('x-csrf-token');
    try {
      if (!token) token = (await event.request.clone().formData()).get('csrf');
    } catch {
      token = null;
    }
    if (!challenges.consume(codec.open(event.cookies.get('xtrip-csrf'), 'csrf'), token, scope))
      return new Response('Forbidden', { status: 403, headers: privateResponseHeaders });
  }
  event.locals.csrf = '';
  if (event.url.pathname !== '/session/poll') {
    const challenge =
      challenges.read(codec.open(event.cookies.get('xtrip-csrf'), 'csrf'), scope) ??
      challenges.issue(scope);
    event.locals.csrf = challenge.token;
    event.cookies.set(
      'xtrip-csrf',
      codec.seal(challenge.id, 'csrf', Date.now() + 600000),
      cookieOptions(event.url.protocol === 'https:', 600),
    );
  }
  const context = presentationContext(event.url);
  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replace('%xtrip.lang%', context.language)
        .replace('%xtrip.dir%', context.direction)
        .replace('%xtrip.theme%', context.theme),
  });
  for (const [key, value] of Object.entries(privateResponseHeaders))
    response.headers.set(key, value);
  return response;
};
export const handleError: HandleServerError = (caught) => {
  const status = caught.kind === 'unknown' ? 500 : caught.error.status;
  return { message: status === 404 ? 'Page not found' : 'Unable to display this page', status };
};
