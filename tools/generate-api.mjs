import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { format } from 'prettier';
const require = createRequire(new URL('../packages/api-client/package.json', import.meta.url));
const { default: openapiTS, astToString } = require('openapi-typescript');
const root = new URL('../', import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const spec = await read('contracts/openapi.xtrip-api-node.json');
const baseline = await read('contracts/api-baseline.json');
for (const [name, hash] of Object.entries(baseline.artifacts)) {
  const bytes = await readFile(new URL(`contracts/${name}`, root));
  if (createHash('sha256').update(bytes).digest('hex') !== hash)
    throw new Error(`Pinned contract drift: ${name}`);
}
const catalog = await read('contracts/api-dependency-catalog.json');
const exclusions = await read('contracts/api-operation-exclusions.json');
const key = (method, path) => `${method.toUpperCase()} ${path.replace(/\{[^}]+\}|:[^/]+/g, '{}')}`;
const consumed = new Set(
  catalog.dependencies.flatMap((d) =>
    d.backend_binding.operations.map((o) => key(o.method, o.path)),
  ),
);
const excluded = new Set(exclusions.operations.map((o) => key(o.method, o.path)));
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
const selected = structuredClone(spec);
selected.paths = {};
const operations = [];
const fixtures = [];
let total = 0;
for (const [path, item] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!methods.includes(method)) continue;
    total++;
    const id = key(method, path);
    if (consumed.has(id) === excluded.has(id))
      throw new Error(`Unclassified or ambiguous operation: ${id}`);
    if (!consumed.has(id)) continue;
    selected.paths[path] ??= Object.fromEntries(
      Object.entries(item).filter(([k]) => !methods.includes(k)),
    );
    selected.paths[path][method] = operation;
    operations.push({
      id: operation.operationId,
      method: method.toUpperCase(),
      path,
      principalClasses: operation['x-principal-classes'] ?? [],
      permission: operation['x-required-permission'] ?? null,
    });
    const extract = (content) =>
      Object.entries(content ?? {}).map(([mediaType, entry]) => ({
        mediaType,
        schema: entry.schema,
        examples:
          'example' in entry
            ? { canonical: entry.example }
            : Object.fromEntries(
                Object.entries(entry.examples ?? {}).map(([name, example]) => {
                  if (!('value' in example))
                    throw new Error(
                      `Unresolved canonical example: ${operation.operationId}/${name}`,
                    );
                  return [name, example.value];
                }),
              ),
      }));
    fixtures.push({
      id: operation.operationId,
      method: method.toUpperCase(),
      path,
      parameters: [...(item.parameters ?? []), ...(operation.parameters ?? [])],
      requestRequired: operation.requestBody?.required ?? false,
      request: extract(operation.requestBody?.content),
      responses: Object.fromEntries(
        Object.entries(operation.responses).map(([status, response]) => [
          status,
          extract(response.content),
        ]),
      ),
    });
  }
}
if (
  total !== baseline.operationCount ||
  consumed.size !== baseline.consumedCount ||
  excluded.size !== baseline.excludedCount ||
  operations.length !== consumed.size
)
  throw new Error('Operation ownership count drift');
const outputs = {
  'packages/api-client/src/schema.generated.ts':
    '// Generated from the pinned frontend-consumed OpenAPI. DO NOT EDIT.\n' +
    astToString(await openapiTS(selected)),
  'packages/api-client/src/operations.generated.ts':
    '// Generated from the pinned OpenAPI. DO NOT EDIT.\nexport const operations = ' +
    JSON.stringify(operations) +
    ' as const;\nexport type OperationId = (typeof operations)[number]["id"];\n',
  'packages/api-mocks/src/fixtures.generated.json': JSON.stringify({
    apiCommit: baseline.apiCommit,
    components: spec.components,
    operations: fixtures,
  }),
};
for (const [path, source] of Object.entries(outputs)) {
  const output = await format(source, {
    filepath: path,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
  });
  if (process.argv.includes('--check')) {
    if ((await readFile(new URL(path, root), 'utf8')).replace(/\r\n/g, '\n') !== output)
      throw new Error(`Generated artifact drift: ${path}`);
  } else await writeFile(new URL(path, root), output);
}
console.log(
  `Generated contract verified: ${total} operations, ${operations.length} consumed, ${excluded.size} excluded.`,
);
