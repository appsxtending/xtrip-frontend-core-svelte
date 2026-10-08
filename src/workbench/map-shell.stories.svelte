<script lang="ts">
  import Component from '../components/map-shell/map-shell.svelte';
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
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component
      {locale}
      label={copy.map}
      locations={[
        { id: 'bkk', name: 'Bangkok', address: 'Thailand' },
        { id: 'cnx', name: 'Chiang Mai', address: 'Thailand' },
      ]}
    />
  </div></RemoteState
>
