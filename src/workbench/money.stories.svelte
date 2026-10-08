<script lang="ts">
  import Component from '../components/money/money.svelte';
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
    <div class="ui-stack">
      <Component amount="150.46" currency="USD" /><Component
        amount="-0.01"
        currency="USD"
      /><Component amount="9007199254740993.01" currency="USD" />
    </div>
  </div></RemoteState
>
