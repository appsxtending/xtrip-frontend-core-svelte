export type PrincipalClass = 'TENANT' | 'AGENT' | 'PLATFORM';
export interface Principal {
  userId: string;
  tenantId: string | null;
  principalClass: PrincipalClass;
  permissions: string[];
  fingerprint: string;
  expiresAt: number;
}
export interface SessionView {
  principal: Principal;
  pendingMfa: boolean;
  expiresAt: number;
}
export type RemotePhase =
  'loaded' | 'refreshing' | 'stale' | 'paused' | 'stopped' | 'forbidden' | 'error';
