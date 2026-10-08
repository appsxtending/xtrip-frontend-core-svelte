<script lang="ts">
  import Component from '../components/error-summary/error-summary.svelte';
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
      title={copy.warning}
      errors={[{ id: 'example-field', message: copy.name + ' · ' + copy.warning }]}
    /><label class="ui-field" for="example-field">{copy.name}<input id="example-field" /></label>
  </div></RemoteState
>
