import { generateKeyPairSync, sign, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { canonicalFixtures, validateCanonical } from '@xtrip/api-mocks';
export const tenant = '11edded3-947c-5c8a-afcb-0c1a404d85e0';
export const user = '22edded3-947c-5c8a-afcb-0c1a404d85e0';
export function fixture() {
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicKey = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const config = {
    apiOrigin: 'http://127.0.0.1:4109',
    webOrigin: 'http://127.0.0.1:4173',
    publicKey,
    issuer: 'session-test',
    audience: 'session-test-client',
    cookieKey: randomBytes(32),
    allowLoopback: true,
  };
  function token(overrides: Record<string, unknown> = {}) {
    const now = Math.floor(Date.now() / 1000);
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(
      JSON.stringify({
        sub: user,
        tenantId: tenant,
        principalClass: 'TENANT',
        roles: [],
        permissions: ['masterdata:read'],
        iss: config.issuer,
        aud: config.audience,
        iat: now,
        exp: now + 900,
        jti: randomUUID(),
        ...overrides,
      }),
    ).toString('base64url');
    return (
      h +
      '.' +
      p +
      '.' +
      sign('RSA-SHA256', Buffer.from(h + '.' + p), keys.privateKey).toString('base64url')
    );
  }
  let refreshes = 0;
  let reads = 0;
  const tokens = new Map<string, { permissions: string[]; requiresMfa: boolean }>();
  function pair(profile = { permissions: ['masterdata:read'], requiresMfa: false }) {
    const refreshToken = randomBytes(32).toString('base64url');
    tokens.set(refreshToken, profile);
    return {
      accessToken: token({ permissions: profile.permissions }),
      refreshToken,
      expiresAt: new Date(Date.now() + 900000).toISOString(),
    };
  }
  const transport: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const op = canonicalFixtures.operations.find(
      (x) => x.path === new URL(request.url).pathname && x.method === request.method,
    );
    if (!op) throw Error('Unexpected test operation');
    const body = (await request.json()) as Record<string, string>;
    if (op.request[0] && validateCanonical(op.request[0].schema, body).length)
      throw Error('Invalid fixture request');
    let status = 200;
    let response: unknown;
    if (op.id === 'postV1IdentityCredentialsLogin') {
      if (body.password !== 'fixture-password') {
        status = 401;
      } else {
        const profile = {
          permissions: body.email === 'forbidden@example.invalid' ? [] : ['masterdata:read'],
          requiresMfa: body.email === 'mfa@example.invalid',
        };
        response = { ...pair(profile), requiresMfa: profile.requiresMfa, userId: user };
      }
    } else if (op.id === 'postV1IdentityTokensRefresh') {
      refreshes++;
      const profile = tokens.get(body.refreshToken);
      tokens.delete(body.refreshToken);
      if (!profile) status = 401;
      else response = pair(profile);
    } else if (op.id === 'postV1IdentityLogout') {
      tokens.delete(body.refreshToken);
      response = { success: true, revokedAt: new Date().toISOString() };
    } else if (op.id === 'postV1IdentityMfaTotpVerify') {
      response = { isVerified: body.code === '123456', verifiedAt: new Date().toISOString() };
    } else if (op.id === 'postV1GeographySuggest') {
      reads++;
      if (!request.headers.get('authorization')) status = 401;
    } else throw Error('Unexpected test operation');
    const media = op.responses[String(status)][0];
    response ??= structuredClone(media.examples.canonical);
    if (validateCanonical(media.schema, response).length) throw Error('Invalid fixture response');
    return Response.json(response, { status });
  };
  return {
    config,
    token,
    transport,
    pair,
    get refreshes() {
      return refreshes;
    },
    get reads() {
      return reads;
    },
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const f = fixture();
  const server = createServer(async (req, res) => {
    try {
      let body = '';
      for await (const chunk of req) body += chunk;
      const response = await f.transport('http://127.0.0.1:4109' + req.url, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: body || undefined,
      });
      res.writeHead(response.status, { 'content-type': 'application/json' });
      res.end(await response.text());
    } catch {
      res.writeHead(500);
      res.end('{}');
    }
  });
  await new Promise<void>((r) => server.listen(4109, '127.0.0.1', r));
  const app = spawn(process.execPath, ['build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: '4173',
      XTRIP_SESSION_ENABLED: 'true',
      XTRIP_SESSION_STORE: 'single-process-workbench',
      XTRIP_ALLOW_LOOPBACK_SESSION: 'true',
      XTRIP_API_ORIGIN: f.config.apiOrigin,
      XTRIP_WEB_ORIGIN: f.config.webOrigin,
      XTRIP_SESSION_KEY: f.config.cookieKey.toString('base64'),
      XTRIP_JWT_PUBLIC_KEY_BASE64: Buffer.from(f.config.publicKey).toString('base64'),
      XTRIP_JWT_ISSUER: f.config.issuer,
      XTRIP_JWT_AUDIENCE: f.config.audience,
    },
  });
  const close = () => {
    app.kill();
    server.close();
  };
  process.on('SIGTERM', close);
  process.on('SIGINT', close);
  app.on('exit', (code) => {
    server.close();
    process.exitCode = code ?? 1;
  });
}
