<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    state = 'loaded',
    locale = 'en',
    children,
    onretry,
  }: {
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
    locale?: PresentationLocale;
    children?: Snippet;
    onretry?: () => void;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<section class="ui-stack" aria-busy={state === 'loading' || state === 'refreshing'}>
  {#if state !== 'loaded'}<div class="ui-callout" role="status">
      <p>{copy[state]}</p>
      {#if state === 'retryable' || state === 'stale'}<button
          class="ui-button"
          data-variant="secondary"
          onclick={onretry}>{copy.retry}</button
        >{/if}
    </div>{/if}{#if ['loaded', 'refreshing', 'stale'].includes(state) && children}{@render children()}{/if}
</section>
