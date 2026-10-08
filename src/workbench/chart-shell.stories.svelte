<script lang="ts">
  import Component from '../components/chart-shell/chart-shell.svelte';
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
      title={copy.progress}
      summary={copy.fixture}
      rows={[
        { label: 'Bangkok', value: '24' },
        { label: 'Chiang Mai', value: '12' },
      ]}
    />
  </div></RemoteState
>
