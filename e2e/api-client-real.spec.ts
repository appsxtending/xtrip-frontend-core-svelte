import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { createApiClient, type components } from '../packages/api-client/src/index.js';
import { canonicalFixtures, validateCanonical } from '../packages/api-mocks/src/index.js';
const envFile = process.env.XTRIP_TEST_ENV_FILE ?? '.env.test';
if (existsSync(envFile)) process.loadEnvFile(envFile);
const baseUrl = process.env.XTRIP_API_ORIGIN ?? 'http://localhost:4000';
const client = createApiClient({ baseUrl });
const baseline = JSON.parse(readFileSync('contracts/api-baseline.json', 'utf8')) as {
  apiCommit: string;
};
function responseIssues(id: string, status: number, body: unknown): string[] {
  const media = canonicalFixtures.operations.find((o) => o.id === id)?.responses[
    String(status)
  ]?.[0];
  return media ? validateCanonical(media.schema, body) : ['undocumented response status'];
}
test.describe('generated-client-real-api', () => {
  test('live readiness and exact public contract match the pinned release', async () => {
    expect((await fetch(new URL('/health/ready', baseUrl))).status).toBe(200);
    const response = await fetch(new URL('/docs/openapi.json', baseUrl));
    expect(response.status).toBe(200);
    const live = await response.json();
    const pinned = JSON.parse(readFileSync('contracts/openapi.xtrip-api-node.json', 'utf8'));
    expect(live.servers).toEqual([{ url: baseUrl, description: 'Request server' }]);
    live.servers = pinned.servers;
    delete live.info.title;
    delete pinned.info.title;
    expect(live).toEqual(pinned);
  });
  test('anonymous geography access returns the governed authentication problem', async () => {
    const result = await client.POST('/v1/geography/suggest', {
      body: { keyword: 'Bang', locale: 'en', limit: 10 },
    });
    expect(result.response.status).toBe(401);
    expect(responseIssues('postV1GeographySuggest', 401, result.error)).toEqual([]);
  });
  test('existing synthetic profile authenticates and executes a schema-valid geography read', async ({
    baseURL,
  }, testInfo) => {
    void baseURL;
    const email = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;
    const tenantId = process.env.API_TENANT;
    if (!email || !password || !tenantId)
      throw new Error(
        'Authenticated acceptance requires API_USERNAME, API_PASSWORD and API_TENANT in the configured local test environment',
      );
    const body: components['schemas']['LoginRequest'] = { email, password, tenantId };
    const login = await client.POST('/v1/identity/credentials/login', { body });
    expect(login.response.status, 'synthetic profile login status').toBe(200);
    expect(responseIssues('postV1IdentityCredentialsLogin', 200, login.data)).toEqual([]);
    if (!login.data?.accessToken || login.data.requiresMfa)
      throw new Error(
        'Synthetic profile requires a usable test access token without an MFA challenge',
      );
    const authenticated = createApiClient({ baseUrl, accessToken: login.data.accessToken });
    const result = await authenticated.POST('/v1/geography/suggest', {
      body: { keyword: 'Bang', locale: 'en', limit: 10 },
    });
    expect(result.response.status, 'authenticated geography status').toBe(200);
    expect(responseIssues('postV1GeographySuggest', 200, result.data)).toEqual([]);
    await testInfo.attach('release-pair-evidence', {
      body: JSON.stringify({
        apiCommit: baseline.apiCommit,
        origin: baseUrl,
        profile: 'owner-provided-env-test',
        journey: 'login-geography-read',
        status: 'passed',
      }),
      contentType: 'application/json',
    });
  });
});
