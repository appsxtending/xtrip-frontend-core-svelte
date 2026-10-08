import type { Principal } from './types.js';
export interface SessionRecord {
  id: string;
  accessToken: string;
  refreshToken: string;
  principal: Principal;
  pendingMfa: boolean;
  expiresAt: number;
}
/** Shared adapters must provide cross-worker exclusive locks and atomic replace-if-present. */
export interface SessionStore {
  get(id: string): SessionRecord | undefined;
  create(record: SessionRecord): void;
  replace(record: SessionRecord): boolean;
  delete(id: string): void;
  exclusive<T>(id: string, work: () => Promise<T>): Promise<T>;
}
/** Bounded single-process workbench adapter; restart deliberately signs everyone out. */
export class MemorySessionStore implements SessionStore {
  private records = new Map<string, SessionRecord>();
  private locks = new Map<string, Promise<void>>();
  constructor(
    private max = 1000,
    private now = Date.now,
  ) {}
  get(id: string) {
    const r = this.records.get(id);
    if (r && r.expiresAt <= this.now()) {
      this.records.delete(id);
      return undefined;
    }
    return r ? structuredClone(r) : undefined;
  }
  create(r: SessionRecord) {
    for (const id of this.records.keys()) this.get(id);
    if (this.records.size >= this.max) throw Error('Session capacity reached');
    this.records.set(r.id, structuredClone(r));
  }
  replace(r: SessionRecord) {
    if (!this.get(r.id)) return false;
    this.records.set(r.id, structuredClone(r));
    return true;
  }
  delete(id: string) {
    this.records.delete(id);
  }
  async exclusive<T>(id: string, work: () => Promise<T>): Promise<T> {
    const prior = this.locks.get(id) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((r) => (release = r));
    this.locks.set(id, current);
    await prior;
    try {
      return await work();
    } finally {
      release();
      if (this.locks.get(id) === current) this.locks.delete(id);
    }
  }
}
