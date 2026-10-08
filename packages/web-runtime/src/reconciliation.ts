import type { RemotePhase } from './types.js';
export class ReconciliationBudget {
  attempts = 0;
  phase: RemotePhase = 'loaded';
  private started: number;
  private busy = false;
  private nextAttempt = 0;
  private controller?: AbortController;
  constructor(
    private maxAttempts = 5,
    private maxMs = 60000,
    private now = Date.now,
  ) {
    this.started = now();
  }
  async run<T>(read: (signal: AbortSignal) => Promise<T>, active = true): Promise<T | undefined> {
    if (this.phase === 'stopped' || this.phase === 'forbidden' || this.busy) return;
    if (this.attempts >= this.maxAttempts || this.now() - this.started >= this.maxMs) {
      this.stop();
      return;
    }
    if (!active) {
      this.phase = 'paused';
      return;
    }
    if (this.now() < this.nextAttempt) return;
    this.busy = true;
    this.phase = 'refreshing';
    this.attempts++;
    this.controller = new AbortController();
    try {
      const value = await read(this.controller.signal);
      if (this.controller.signal.aborted) return;
      this.phase = 'loaded';
      return value;
    } catch (e) {
      if (!this.controller.signal.aborted) {
        const { status, retryAfter } = e as { status?: number; retryAfter?: number };
        this.phase =
          status === 401 || status === 403
            ? 'forbidden'
            : status !== undefined && status >= 400 && status < 500 && status !== 429
              ? 'stopped'
              : 'stale';
        if (typeof retryAfter === 'number' && Number.isFinite(retryAfter))
          this.nextAttempt = this.now() + Math.min(60, Math.max(1, retryAfter)) * 1000;
      }
      return undefined;
    } finally {
      this.busy = false;
      this.controller = undefined;
    }
  }
  pause() {
    if (this.phase === 'stopped' || this.phase === 'forbidden') return;
    this.phase = 'paused';
    this.controller?.abort();
  }
  stop() {
    this.phase = 'stopped';
    this.controller?.abort();
  }
}
