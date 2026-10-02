// @vitest-environment node
import { expect, it, vi } from 'vitest';
import {
  createApiClient,
  operations,
  resolveApiOrigin,
} from '../../packages/api-client/src/index.js';
const response = () =>
  new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });
it('encodes path/query values and retains JSON strings and revision headers', async () => {
  const received: Request[] = [];
  const client = createApiClient({
    baseUrl: 'http://localhost:4000/',
    fetch: async (input) => {
      received.push(input as Request);
      return response();
    },
  });
  await client.GET('/v1/search/saved-searches/{savedSearchId}', {
    params: { path: { savedSearchId: 'a/b ?#' } },
  });
  expect(new URL(received[0].url).pathname).toBe('/v1/search/saved-searches/a%2Fb%20%3F%23');
  await client.POST('/v1/geography/suggest', {
    body: { keyword: 'กรุงเทพ & دبي', locale: 'ar', limit: 10 },
    headers: { 'if-match': 'revision-7' },
  });
  expect(await received[1].json()).toEqual({ keyword: 'กรุงเทพ & دبي', locale: 'ar', limit: 10 });
  expect(received[1].headers.get('if-match')).toBe('revision-7');
  await client.GET('/v1/search/saved-searches', {
    params: { query: { cursor: 'a+b &?=', limit: '10' } },
  });
  expect(new URL(received[2].url).searchParams.get('cursor')).toBe('a+b &?=');
  expect(new URL(received[2].url).searchParams.get('limit')).toBe('10');
});
it('propagates cancellation and does not retry transport failures', async () => {
  const controller = new AbortController();
  controller.abort();
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    (input as Request).signal.throwIfAborted();
    return response();
  });
  const client = createApiClient({ baseUrl: 'http://localhost:4000', fetch });
  await expect(
    client.POST('/v1/geography/suggest', { body: { keyword: 'Bang' }, signal: controller.signal }),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('rejects unclassified methods, caller origin overrides and credential-bearing origins before sending', async () => {
  const fetch = vi.fn(async () => response());
  const client = createApiClient({ baseUrl: 'http://localhost:4000', fetch });
  // Deliberate JavaScript/type-erasure caller: runtime guard must also fail closed.
  // @ts-expect-error internal operation must not be exposed
  await expect(client.GET('/internal/not-consumed')).rejects.toThrow('not frontend-consumed');
  await expect(
    client.POST('/v1/geography/suggest', {
      body: { keyword: 'Bang' },
      baseUrl: 'https://other.invalid',
    }),
  ).rejects.toThrow('escaped');
  for (const origin of [
    'https://name:password@example.invalid',
    'https://example.invalid/v1',
    'file:///tmp',
    'https://example.invalid/?token=x',
  ])
    expect(() => resolveApiOrigin(origin)).toThrow();
  expect(fetch).not.toHaveBeenCalled();
  expect(operations).toHaveLength(330);
});

it('rejects dot-segment path traversal before transport', async () => {
  const fetch = vi.fn(async () => response());
  const client = createApiClient({ baseUrl: 'http://localhost:4000', fetch });
  await expect(
    client.GET('/v1/search/saved-searches/{savedSearchId}', {
      params: { path: { savedSearchId: '..' } },
    }),
  ).rejects.toThrow('escaped its segment');
  expect(fetch).not.toHaveBeenCalled();
});
