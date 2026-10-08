<script lang="ts">
  import Component from '../components/price-breakdown/price-breakdown.svelte';
  import { type PresentationLocale } from '@xtrip/i18n';
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
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component
      {locale}
      currency="USD"
      total="150.46"
      signature="illustrative-reference"
      lines={[{ id: 'room', label: 'Room', amount: '150.46' }]}
    />
  </div></RemoteState
>
