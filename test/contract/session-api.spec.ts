// @vitest-environment node
import { it, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { createCanonicalHandlers } from '@xtrip/api-mocks';
import { createApiClient } from '@xtrip/api-client';
import { apiFault, safeProblem } from '@xtrip/web-runtime/errors';
it('maps canonical authentication errors without private detail', async () => {
  const server = setupServer(
    ...createCanonicalHandlers('http://session.invalid', [
      { operationId: 'postV1IdentityCredentialsLogin', status: 401 },
    ]),
  );
  server.listen({ onUnhandledRequest: 'error' });
  try {
    const result = await createApiClient({ baseUrl: 'http://session.invalid' }).POST(
      '/v1/identity/credentials/login',
      { body: { email: 'test@example.invalid', password: 'fixture-password' } },
    );
    expect(safeProblem(apiFault(result.response.status, result.error))).toEqual({
      kind: 'authentication',
      status: 401,
    });
    expect(safeProblem(apiFault(503, { detail: 'private' }))).toEqual({
      kind: 'unexpected',
      status: 502,
    });
  } finally {
    server.close();
  }
});
