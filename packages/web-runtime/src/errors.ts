export type FaultKind =
  | 'authentication'
  | 'forbidden'
  | 'conflict'
  | 'validation'
  | 'not-found'
  | 'retryable'
  | 'unexpected';
export interface SafeProblem {
  kind: FaultKind;
  status: number;
  retryAfter?: number;
}
export class RuntimeFault extends Error {
  constructor(
    public kind: FaultKind,
    public status: number,
    public retryAfter?: number,
  ) {
    super('Request could not be completed');
  }
}
export function safeProblem(error: unknown): SafeProblem {
  return error instanceof RuntimeFault
    ? {
        kind: error.kind,
        status: error.status,
        ...(error.retryAfter !== undefined ? { retryAfter: error.retryAfter } : {}),
      }
    : { kind: 'unexpected', status: 503 };
}
export function apiFault(status: number, body: unknown): RuntimeFault {
  if (!body || typeof body !== 'object') return new RuntimeFault('unexpected', 502);
  const b = body as Record<string, unknown>;
  if (
    b.status !== status ||
    !['type', 'title', 'detail', 'instance', 'code', 'message_key', 'trace_id', 'timestamp'].every(
      (k) => typeof b[k] === 'string',
    )
  )
    return new RuntimeFault('unexpected', 502);
  const known: Record<string, number> = {
    AUTHENTICATION_REQUIRED: 401,
    FORBIDDEN: 403,
    TENANT_SUSPENDED: 403,
    UPGRADE_REQUIRED: 403,
    NOT_FOUND: 404,
    EDIT_CONFLICT: 409,
    INVALID_STATE_TRANSITION: 409,
    RETRY_LATER: 409,
    VALIDATION_FAILED: 422,
    RATE_LIMITED: 429,
    SERVICE_UNAVAILABLE: 503,
  };
  if (known[String(b.code)] !== status) return new RuntimeFault('unexpected', 502);
  const kind: FaultKind =
    status === 401
      ? 'authentication'
      : status === 403
        ? 'forbidden'
        : status === 404
          ? 'not-found'
          : status === 409
            ? 'conflict'
            : status === 422
              ? 'validation'
              : status === 429 || status === 503
                ? 'retryable'
                : 'unexpected';
  const retry =
    typeof b.retry_after_seconds === 'number' && Number.isFinite(b.retry_after_seconds)
      ? Math.min(60, Math.max(1, b.retry_after_seconds))
      : undefined;
  return new RuntimeFault(kind, status, retry);
}
