import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const fixtures = JSON.parse(
  await readFile(
    new URL('../packages/api-mocks/src/fixtures.generated.json', import.meta.url),
    'utf8',
  ),
);
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema({ $id: 'https://xtrip.invalid/canonical', components: fixtures.components });
const absolute = (x) =>
  Array.isArray(x)
    ? x.map(absolute)
    : x && typeof x === 'object'
      ? Object.fromEntries(
          Object.entries(x).map(([k, v]) => [
            k,
            k === '$ref' && v.startsWith('#') ? 'https://xtrip.invalid/canonical' + v : absolute(v),
          ]),
        )
      : x;
let count = 0;
const baseline = JSON.parse(
  await readFile(new URL('../contracts/api-baseline.json', import.meta.url), 'utf8'),
);
const deferral = baseline.canonicalExampleDeferral;
if (deferral && deferral.apiContractSha256 !== baseline.artifacts['openapi.xtrip-api-node.json'])
  throw new Error('Deferred examples must be reviewed when the API baseline changes');
const deferred = new Set(deferral?.examples ?? []);
const strict = process.argv.includes('--strict');
const issues = [];
const blocking = [];
const invalidExamples = new Set();
const affectedOperations = new Set();
for (const o of fixtures.operations) {
  for (const [status, media] of [['request', o.request], ...Object.entries(o.responses)]) {
    for (const m of media) {
      const validate = ajv.compile(absolute(m.schema));
      if (!Object.keys(m.examples).length) {
        const issue = `${o.id}/${status}: missing canonical example`;
        issues.push(issue);
        blocking.push(issue);
      }
      for (const [name, value] of Object.entries(m.examples)) {
        count++;
        if (!validate(value)) {
          invalidExamples.add(`${o.id}/${status}/${name}`);
          affectedOperations.add(o.id);
          if (strict || !deferred.has(`${o.id}/${status}/${name}`))
            blocking.push(`${o.id}/${status}/${name}`);
        }
        if (validate.errors)
          for (const e of validate.errors ?? [])
            issues.push(
              `${o.id}/${status}/${name}${e.instancePath || '/'}: ${e.keyword}${e.params.missingProperty ? ':' + e.params.missingProperty : ''}`,
            );
      }
    }
  }
}
console.log(
  `Validated ${count} frontend canonical examples; ${issues.length} contract violations across ${invalidExamples.size} examples and ${affectedOperations.size} operations.`,
);
for (const issue of issues) console.error(issue);
for (const key of deferred)
  if (!invalidExamples.has(key))
    blocking.push(`Resolved or missing deferral must be removed: ${key}`);
console.log(
  `Owner-deferred examples: ${deferred.size}; blocking findings: ${blocking.length}; mode: ${strict ? 'strict release' : 'frontend development'}.`,
);
if (blocking.length) process.exitCode = 1;
