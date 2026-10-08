<script lang="ts">
  import Component from '../components/remote-state/remote-state.svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';

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

<Component {locale} state={previewState} onretry={() => count++}><p>{copy.fixture}</p></Component>
<p aria-live="polite">{copy.retry}: {count}</p>
