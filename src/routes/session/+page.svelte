<script lang="ts">
  let hydrationMs = $state<number | undefined>();
  onMount(() => {
    hydrationMs = performance.now();
  });
  import { onMount, untrack } from 'svelte';
  import { sessionCopy, formatFreshness } from '@xtrip/i18n';
  import { reconciliation } from '#lib/session/reconciliation.svelte.ts';
  import { sessionPresentation } from '#lib/session/session.svelte.ts';
  let { data, form } = $props();
  const copy = $derived(sessionCopy(data.locale));
  const initial = untrack(() => data);
  const session = sessionPresentation(initial.session);
  const poll = reconciliation(() => data.initial);
  $effect(() => {
    session.replace(data.session);
  });
  onMount(() => {
    let closed = false;
    let timer: ReturnType<typeof setTimeout>;
    const active = () => document.visibilityState === 'visible' && navigator.onLine;
    const tick = async () => {
      if (data.initial) await poll.refresh(active());
      if (!closed && !['stopped', 'forbidden'].includes(poll.phase))
        timer = setTimeout(tick, 10000);
    };
    const changed = () => {
      if (!active()) poll.pause();
    };
    document.addEventListener('visibilitychange', changed);
    window.addEventListener('offline', changed);
    timer = setTimeout(tick, 10000);
    return () => {
      closed = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', changed);
      window.removeEventListener('offline', changed);
      poll.destroy();
    };
  });
</script>

<span hidden data-hydration-ms={hydrationMs}></span>

<svelte:head><title>{copy.session} · XTrip</title></svelte:head>
<main class="ui-panel ui-stack">
  <a class="ui-link" href="/">XTrip</a>
  <h1>{copy.session}</h1>
  <p>{copy.demo}</p>
  {#if session.current.pendingMfa}
    <form method="POST" action="?/verify" class="ui-stack">
      <input type="hidden" name="csrf" value={data.csrf} /><label class="ui-field"
        >{copy.code}<input
          name="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern={'[0-9]{6}'}
          required
        /></label
      ><button class="ui-button">{copy.verify}</button>
    </form>
  {:else if data.problem}<p role="alert">{copy[data.problem.kind]}</p>
  {:else if data.initial}
    <p role="status">{copy[poll.phase as keyof typeof copy] ?? copy.stale}</p>
    {#if poll.phase !== 'forbidden' && poll.query.data?.principalKey === data.initial?.principalKey}<ul
      >
        {#each poll.query.data?.suggestions ?? [] as row (row.id)}<li>{row.name}</li>{/each}
      </ul>{/if}
    <p>
      {copy.freshness}:
      <time datetime={new Date(poll.query.data?.updatedAt ?? 0).toISOString()}
        >{formatFreshness(poll.query.data?.updatedAt ?? 0, data.locale)}</time
      >
    </p>
    <button
      class="ui-button"
      onclick={() => poll.refresh()}
      disabled={['stopped', 'forbidden', 'refreshing'].includes(poll.phase)}
      >{copy.reconcile}</button
    >
  {/if}
  {#if form?.invalid}<p role="alert">{copy.invalid}</p>{/if}
  <div class="ui-row">
    <form method="POST" action="?/refresh">
      <input type="hidden" name="csrf" value={data.csrf} /><button
        class="ui-button"
        disabled={session.current.pendingMfa}>{copy.refresh}</button
      >
    </form>
    <form method="POST" action="?/logout">
      <input type="hidden" name="csrf" value={data.csrf} /><button class="ui-button"
        >{copy.signOut}</button
      >
    </form>
  </div>
</main>
