// @vitest-environment node
import { expect, it } from 'vitest';
import { createApiClient } from '../../packages/api-client/src/index.js';
it('isolates concurrent SSR credentials and blocks redirects/cookie forwarding', async () => {
  const received: Request[] = [];
  const fetch: typeof globalThis.fetch = async (input) => {
    await Promise.resolve();
    received.push(input as Request);
    return new Response('{"suggestions":[]}', { headers: { 'content-type': 'application/json' } });
  };
  const options = { baseUrl: 'http://localhost:4000', accessToken: 'synthetic-A', fetch };
  const a = createApiClient(options);
  options.accessToken = 'mutated';
  const b = createApiClient({ ...options, accessToken: 'synthetic-B' });
  const guest = createApiClient({ baseUrl: options.baseUrl, fetch });
  await Promise.all(
    [a, b, guest].map((client) =>
      client.POST('/v1/geography/suggest', {
        body: { keyword: 'Bang' },
        headers: { authorization: 'caller-override' },
      }),
    ),
  );
  expect(received.map((r) => r.headers.get('authorization'))).toEqual([
    'Bearer synthetic-A',
    'Bearer synthetic-B',
    null,
  ]);
  for (const request of received) {
    expect(request.credentials).toBe('omit');
    expect(request.redirect).toBe('error');
  }
  expect(JSON.stringify(a)).not.toContain('synthetic-A');
});
