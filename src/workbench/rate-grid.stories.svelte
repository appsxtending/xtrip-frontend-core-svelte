<script lang="ts">
  import Component from '../components/rate-grid/rate-grid.svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  import RemoteState from '../components/remote-state/remote-state.svelte';
  let {
    locale = 'en',
    state: previewState = 'loaded',
  }: {
    locale?: PresentationLocale;
    state?:
      | 'loading'
      | 'loaded'
      | 'empty'
      | 'filtered-empty'
      | 'refreshing'
      | 'stale'
      | 'retryable'
      | 'terminal'
      | 'forbidden'
      | 'not-found';
    drawerOpen?: boolean;
    openHref?: string;
    closeHref?: string;
  } = $props();
  const copy = $derived(uiCopy(locale));
  let value = $state('');
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component
      {locale}
      rows={[
        { id: 'room', label: 'Room', date: '2026-10-08', amount: '150.46', currency: 'USD' },
        {
          id: 'fixed',
          label: 'Locked',
          date: '2026-10-09',
          amount: '180.00',
          currency: 'USD',
          locked: true,
        },
      ]}
      onchange={(_, amount) => (value = amount)}
    />
    <p aria-live="polite">{copy.modified}: {value}</p>
  </div></RemoteState
>
