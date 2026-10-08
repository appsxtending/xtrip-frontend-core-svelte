<script lang="ts">
  import Component from '../components/button/button.svelte';
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
  let count = $state(0);
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component label={copy.save} onclick={() => count++} />
    <p aria-live="polite">{copy.loaded}: {count}</p>
  </div></RemoteState
>
