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
