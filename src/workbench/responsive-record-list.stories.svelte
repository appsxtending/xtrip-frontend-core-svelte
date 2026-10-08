<script lang="ts">
  import Component from '../components/responsive-record-list/responsive-record-list.svelte';
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
      label={copy.list}
      items={[
        { id: 'a', title: 'Bangkok', description: copy.fixture, href: '#example' },
        { id: 'b', title: 'Chiang Mai', description: copy.fixture, href: '#example' },
      ]}
    />
  </div></RemoteState
>
