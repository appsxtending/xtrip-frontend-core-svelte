<script lang="ts">
  import Component from '../components/data-grid/data-grid.svelte';
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
  let selection = $state<string[]>([]);
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component
      {locale}
      label={copy.list}
      columns={[
        { key: 'name', label: copy.name },
        { key: 'status', label: copy.status },
      ]}
      rows={Array.from({ length: 8 }, (_, i) => ({
        id: String(i),
        name: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi'][i % 4] + ' ' + (i + 1),
        status: copy.loaded,
      }))}
      bind:selected={selection}
    />
  </div></RemoteState
>
