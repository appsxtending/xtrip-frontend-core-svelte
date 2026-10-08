<script lang="ts">
  import Component from '../components/tabs/tabs.svelte';
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
  let value = $state('');
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack">
    <Component
      label={copy.components}
      items={[
        { id: 'overview', label: copy.preview },
        { id: 'details', label: copy.details },
      ]}
      bind:selected={value}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >{#snippet children(active)}<p>
          {active === 'overview' ? copy.intro : copy.fixture}
        </p>{/snippet}</Component
    >
  </div></RemoteState
>
