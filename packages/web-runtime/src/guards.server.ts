import { operations, type OperationId } from '@xtrip/api-client';
import type { SessionRecord } from './store.server.js';
import { RuntimeFault } from './errors.js';
export function authorize(session: SessionRecord | undefined, id: OperationId) {
  if (!session || session.pendingMfa) throw new RuntimeFault('authentication', 401);
  const op = operations.find((x) => x.id === id);
  if (!op) throw new RuntimeFault('forbidden', 403);
  const classes: readonly string[] = op.principalClasses;
  if (
    !classes.includes(session.principal.principalClass) ||
    (op.permission && !session.principal.permissions.includes(op.permission))
  )
    throw new RuntimeFault('forbidden', 403);
  return session;
}
