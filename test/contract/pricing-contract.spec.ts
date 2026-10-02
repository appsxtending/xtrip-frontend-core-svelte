// @vitest-environment node
import { expect, it } from 'vitest';
import { canonicalFixtures, validateCanonical } from '../../packages/api-mocks/src/index.js';
import type { components } from '../../packages/api-client/src/index.js';
it('preserves canonical decimal strings and consumer projection without commercial fields', () => {
  const operation = canonicalFixtures.operations.find(
    (o) => o.id === 'getV1PublicSearchesSearchIdOffersOfferId',
  )!;
  const media = operation.responses['200'][0];
  const body = media.examples
    .canonical as components['schemas']['GetV1PublicSearchesSearchIdOffersOfferIdResponse'];
  expect(validateCanonical(media.schema, body)).toEqual([]);
  expect(typeof body.price.amount).toBe('string');
  expect(body.price.amount).toBe('150.46');
  expect(
    validateCanonical(media.schema, { ...body, price: { ...body.price, amount: 150.46 } }),
  ).not.toEqual([]);
  for (const key of [
    'supplier_net',
    'tenant_markup',
    'agent_buy_price',
    'commission',
    'internal_rule_trace',
  ]) {
    expect(JSON.stringify(body)).not.toContain(key);
    expect(validateCanonical(media.schema, { ...body, [key]: '1.00' })).not.toEqual([]);
  }
});
