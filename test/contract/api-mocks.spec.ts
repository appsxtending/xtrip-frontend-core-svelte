// @vitest-environment node
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { createApiClient } from '../../packages/api-client/src/index.js';
import {
  canonicalFixtures,
  createCanonicalHandlers,
  validateCanonical,
} from '../../packages/api-mocks/src/index.js';
const origin = 'http://api.test.invalid';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
it('returns the canonical success through the generated client', async () => {
  server.use(
    ...createCanonicalHandlers(origin, [{ operationId: 'postV1GeographySuggest', status: 200 }]),
  );
  const result = await createApiClient({ baseUrl: origin }).POST('/v1/geography/suggest', {
    body: { keyword: 'Bang', locale: 'en', limit: 10 },
  });
  expect(result.response.status).toBe(200);
  expect(result.data?.suggestions[0].name).toBe('Bangkok');
});
it('preserves governed problem details and makes no retry on rate limit', async () => {
  server.use(
    ...createCanonicalHandlers(origin, [{ operationId: 'postV1GeographySuggest', status: 429 }]),
  );
  const result = await createApiClient({ baseUrl: origin }).POST('/v1/geography/suggest', {
    body: { keyword: 'Bang' },
  });
  expect(result.response.status).toBe(429);
  expect(result.error).toMatchObject({ status: 429, code: 'RATE_LIMITED', retry_after_seconds: 1 });
});
it('validates required fields and rejects extra request properties', () => {
  const operation = canonicalFixtures.operations.find((o) => o.id === 'postV1GeographySuggest')!;
  expect(validateCanonical(operation.request[0].schema, { keyword: 'Bang' })).toEqual([]);
  expect(
    validateCanonical(operation.request[0].schema, { keyword: 'Bang', tenantOverride: 'A' }),
  ).not.toEqual([]);
  expect(validateCanonical(operation.request[0].schema, { limit: 100 })).not.toEqual([]);
});
it('never installs a canonical response that contradicts its schema', () => {
  const invalid = canonicalFixtures.operations.flatMap((o) =>
    Object.entries(o.responses)
      .filter(([, media]) =>
        media.some((m) =>
          Object.values(m.examples).some((body) => validateCanonical(m.schema, body).length),
        ),
      )
      .map(([status]) => ({ operationId: o.id, status: Number(status) })),
  );
  for (const scenario of invalid)
    expect(() => createCanonicalHandlers(origin, [scenario])).toThrow('Invalid canonical response');
}, 30_000);
