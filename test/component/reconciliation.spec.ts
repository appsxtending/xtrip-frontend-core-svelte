// @vitest-environment node
import { it, expect, vi } from 'vitest';
import { ReconciliationBudget } from '@xtrip/web-runtime/reconciliation';
it('pauses offline, prevents overlap and stops at the finite attempt budget', async () => {
  const b = new ReconciliationBudget(2);
  const read = vi.fn(async () => 1);
  await b.run(read, false);
  expect(read).not.toHaveBeenCalled();
  expect(b.phase).toBe('paused');
  await Promise.all([b.run(read), b.run(read)]);
  expect(read).toHaveBeenCalledTimes(1);
  await b.run(read);
  await b.run(read);
  expect(read).toHaveBeenCalledTimes(2);
  expect(b.phase).toBe('stopped');
});
it('aborts pending reads and stops on auth errors or deadline', async () => {
  let now = 0;
  const b = new ReconciliationBudget(5, 100, () => now);
  const pending = b.run(
    (signal) => new Promise((resolve) => signal.addEventListener('abort', () => resolve(1))),
  );
  b.pause();
  await pending;
  expect(b.phase).toBe('paused');
  await b.run(async () => {
    throw { status: 403 };
  });
  expect(b.phase).toBe('forbidden');
  const read = vi.fn();
  await b.run(read);
  expect(read).not.toHaveBeenCalled();
  const c = new ReconciliationBudget(5, 100, () => now);
  now = 101;
  await c.run(read);
  expect(c.phase).toBe('stopped');
});

it('honors bounded retry-after and stops terminal errors', async () => {
  let now = 0;
  const b = new ReconciliationBudget(5, 60000, () => now);
  await b.run(async () => {
    throw { status: 429, retryAfter: 20 };
  });
  const read = vi.fn(async () => 1);
  now = 10000;
  await b.run(read);
  expect(read).not.toHaveBeenCalled();
  now = 20000;
  await b.run(read);
  expect(read).toHaveBeenCalledOnce();
  await b.run(async () => {
    throw { status: 404 };
  });
  expect(b.phase).toBe('stopped');
});
