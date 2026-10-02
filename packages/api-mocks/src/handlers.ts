import { http, HttpResponse, type HttpHandler } from 'msw';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fixtures from './fixtures.generated.json' with { type: 'json' };

export interface MediaFixture {
  mediaType: string;
  schema: object;
  examples: Record<string, unknown>;
}
export interface OperationFixture {
  id: string;
  method: string;
  path: string;
  requestRequired: boolean;
  parameters: Array<{ name: string; in: string; required?: boolean; schema?: object }>;
  request: MediaFixture[];
  responses: Record<string, MediaFixture[]>;
}
export const canonicalFixtures = fixtures as unknown as {
  apiCommit: string;
  components: object;
  operations: OperationFixture[];
};
const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: true });
addFormats(ajv);
ajv.addSchema({ $id: 'https://xtrip.invalid/canonical', components: canonicalFixtures.components });
const validators = new Map<object, ReturnType<typeof ajv.compile>>();
function absoluteRefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(absoluteRefs);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      key === '$ref' && typeof item === 'string' && item.startsWith('#')
        ? 'https://xtrip.invalid/canonical' + item
        : absoluteRefs(item),
    ]),
  );
}
/** Diagnostics contain schema locations, never private request/response values. */
export function validateCanonical(schema: object, body: unknown): string[] {
  let validate = validators.get(schema);
  if (!validate) {
    validate = ajv.compile(absoluteRefs(schema) as object);
    validators.set(schema, validate);
  }
  return validate(body)
    ? []
    : (validate.errors ?? []).map(
        (error) =>
          `${error.instancePath || '/'}: ${error.keyword}${'missingProperty' in error.params ? ':' + error.params.missingProperty : ''}`,
      );
}
export function canonicalIssues(): string[] {
  return canonicalFixtures.operations.flatMap((operation) =>
    [
      ...operation.request.map((m) => ['request', m] as const),
      ...Object.entries(operation.responses).flatMap(([status, media]) =>
        media.map((m) => [status, m] as const),
      ),
    ].flatMap(([status, media]) =>
      Object.entries(media.examples).flatMap(([name, body]) =>
        validateCanonical(media.schema, body).map(
          (issue) => `${operation.id}/${status}/${name}${issue}`,
        ),
      ),
    ),
  );
}
export interface MockScenario {
  operationId: string;
  status: number;
  example?: string;
}
/** Explicit scenarios only. Missing/unhandled operations fail in setupServer(onUnhandledRequest: 'error'). */
export function createCanonicalHandlers(baseUrl: string, scenarios: MockScenario[]): HttpHandler[] {
  return scenarios.map((scenario) => {
    const operation = canonicalFixtures.operations.find((o) => o.id === scenario.operationId);
    if (!operation) throw new Error('Unknown frontend operation');
    const media = operation.responses[String(scenario.status)]?.[0];
    const name = scenario.example ?? 'canonical';
    if (!media || !(name in media.examples))
      throw new Error(`Missing canonical response: ${operation.id}/${scenario.status}`);
    const body = media.examples[name];
    if (validateCanonical(media.schema, body).length)
      throw new Error(`Invalid canonical response: ${operation.id}/${scenario.status}`);
    const path = operation.path.replace(/\{([^}]+)\}/g, ':$1');
    const method = operation.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    return http[method](new URL(path, baseUrl).href, async ({ request, params }) => {
      for (const parameter of operation.parameters) {
        const value =
          parameter.in === 'path'
            ? params[parameter.name]
            : parameter.in === 'query'
              ? new URL(request.url).searchParams.get(parameter.name)
              : request.headers.get(parameter.name);
        if ((value === null || value === undefined) && parameter.required)
          throw new Error(`Missing request parameter: ${parameter.name}`);
        if (value !== null && value !== undefined && parameter.schema) {
          const type = (parameter.schema as { type?: string }).type;
          const parsed =
            type === 'integer' && typeof value === 'string' && /^-?\d+$/.test(value)
              ? Number(value)
              : value;
          if (validateCanonical(parameter.schema, parsed).length)
            throw new Error(`Invalid request parameter: ${parameter.name}`);
        }
      }
      if (operation.request.length) {
        const requestMedia = operation.request.find(
          (m) => request.headers.get('content-type')?.split(';')[0] === m.mediaType,
        );
        if (!requestMedia) throw new Error('Unexpected request content type');
        if (validateCanonical(requestMedia.schema, await request.json()).length)
          throw new Error(`Invalid canonical request: ${operation.id}`);
      } else if (operation.requestRequired) throw new Error('Missing required canonical request');
      return HttpResponse.json(structuredClone(body) as Record<string, unknown>, {
        status: scenario.status,
        headers: { 'content-type': media.mediaType },
      });
    });
  });
}
