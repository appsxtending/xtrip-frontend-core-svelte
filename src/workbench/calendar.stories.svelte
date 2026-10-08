<script lang="ts">
  import Component from '../components/calendar/calendar.svelte';
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
      events={[
        { id: '1', date: '2026-10-08', title: copy.preview },
        { id: '2', date: '2026-10-09', title: copy.loaded },
      ]}
    />
  </div></RemoteState
>
