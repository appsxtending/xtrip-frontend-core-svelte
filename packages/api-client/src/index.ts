import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema.generated.js';
import { operations } from './operations.generated.js';
export type { paths, components, operations as ApiOperations } from './schema.generated.js';
export { operations } from './operations.generated.js';
export type { OperationId } from './operations.generated.js';

export interface ApiClientOptions {
  baseUrl: string;
  /** One client per server request/principal. Never serialize this value. */
  accessToken?: string;
  fetch?: typeof globalThis.fetch;
}

export function resolveApiOrigin(value: string): string {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error('API base URL must be an HTTP(S) origin without credentials, query or path');
  }
  return url.origin;
}

/** Typed transport only: no token persistence, refresh, retry or business decisions. */
export function createApiClient(options: ApiClientOptions) {
  const baseUrl = resolveApiOrigin(options.baseUrl);
  const accessToken = options.accessToken;
  const client = createClient<paths>({
    baseUrl,
    fetch: options.fetch,
    credentials: 'omit',
    redirect: 'error',
  });
  const guard: Middleware = {
    onRequest({ request, schemaPath }) {
      if (!operations.some((o) => o.path === schemaPath && o.method === request.method))
        throw new Error('Operation is not frontend-consumed');
      if (new URL(request.url).origin !== baseUrl)
        throw new Error('API request escaped configured origin');
      // Credentials belong to this immutable client instance, not individual caller overrides.
      const pathname = new URL(request.url).pathname;
      const pattern = new RegExp(
        '^' +
          schemaPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[^}]+\\\}/g, '[^/]+') +
          '$',
      );
      if (!pattern.test(pathname)) throw new Error('API path parameter escaped its segment');
      request.headers.delete('authorization');
      if (accessToken) request.headers.set('authorization', `Bearer ${accessToken}`);
      request.headers.delete('cookie');
      return new Request(request, { credentials: 'omit', redirect: 'error' });
    },
  };
  client.use(guard);
  // Do not expose middleware mutation or a generic untyped fetch escape hatch.
  return Object.freeze({
    GET: client.GET,
    POST: client.POST,
    PUT: client.PUT,
    PATCH: client.PATCH,
    DELETE: client.DELETE,
    HEAD: client.HEAD,
    OPTIONS: client.OPTIONS,
  });
}
