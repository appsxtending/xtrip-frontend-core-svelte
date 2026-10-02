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
const issues = [];
const invalidExamples = new Set();
const affectedOperations = new Set();
for (const o of fixtures.operations) {
  for (const [status, media] of [['request', o.request], ...Object.entries(o.responses)]) {
    for (const m of media) {
      const validate = ajv.compile(absolute(m.schema));
      if (!Object.keys(m.examples).length)
        issues.push(`${o.id}/${status}: missing canonical example`);
      for (const [name, value] of Object.entries(m.examples)) {
        count++;
        if (!validate(value)) {
          invalidExamples.add(`${o.id}/${status}/${name}`);
          affectedOperations.add(o.id);
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
if (issues.length) process.exitCode = 1;
