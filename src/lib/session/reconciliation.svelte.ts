import { QueryClient, createQuery } from '@tanstack/svelte-query';
import { ReconciliationBudget } from '@xtrip/web-runtime/reconciliation';
export interface Probe {
  suggestions: { id: string; name: string }[];
  principalKey: string;
  updatedAt: number;
}
export function reconciliation(initial: () => Probe | null) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  const key = () => ['session', initial()?.principalKey ?? 'anonymous', 'geography'];
  let budget = new ReconciliationBudget(5, 60000);
  let phase = $state('loaded');
  const query = createQuery(
    () => ({
      queryKey: key(),
      queryFn: async ({ signal, queryKey }) => {
        const response = await fetch('/session/poll', {
          signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
          credentials: 'same-origin',
          redirect: 'error',
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw Object.assign(Error('Read unavailable'), {
            status: response.status,
            retryAfter: problem.retryAfter,
          });
        }
        const value = (await response.json()) as Probe;
        if (value.principalKey !== queryKey[1]) {
          throw Object.assign(Error('Principal changed'), { status: 401 });
        }
        return value;
      },
      initialData: initial() ?? { suggestions: [], principalKey: '', updatedAt: 0 },
      enabled: false,
    }),
    () => client,
  );
  let previous = '';
  $effect(() => {
    const next = initial();
    if (!next) {
      client.clear();
      return;
    }
    if (previous && previous !== next.principalKey) {
      budget.stop();
      client.clear();
      budget = new ReconciliationBudget(5, 60000);
      phase = 'loaded';
    }
    previous = next.principalKey;
    client.setQueryData(key(), next);
  });
  return {
    query,
    get phase() {
      return phase;
    },
    async refresh(active = true) {
      const pending = budget.run(async (signal) => {
        const abort = () => {
          void client.cancelQueries({ queryKey: key() });
        };
        signal.addEventListener('abort', abort, { once: true });
        try {
          await client.invalidateQueries({ queryKey: key(), refetchType: 'none' });
          const result = await query.refetch({ throwOnError: true });
          return result.data;
        } finally {
          signal.removeEventListener('abort', abort);
        }
      }, active);
      phase = budget.phase;
      await pending;
      phase = budget.phase;
      if (phase === 'forbidden') client.clear();
    },
    pause() {
      budget.pause();
      phase = budget.phase;
    },
    destroy() {
      budget.stop();
      client.clear();
      phase = 'stopped';
    },
  };
}
