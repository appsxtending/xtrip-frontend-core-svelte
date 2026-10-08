<script lang="ts">
  import Component from '../components/timeline/timeline.svelte';
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
      label={copy.progress}
      events={[
        {
          id: '1',
          title: copy.preview,
          datetime: '2026-10-08T10:00:00Z',
          description: copy.fixture,
        },
        { id: '2', title: copy.loaded, datetime: '2026-10-08T11:00:00Z', description: copy.intro },
      ]}
    />
  </div></RemoteState
>
