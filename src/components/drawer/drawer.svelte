<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    title,
    open = false,
    openHref,
    closeHref,
    children,
    locale = 'en',
  }: {
    title: string;
    open?: boolean;
    openHref: string;
    closeHref: string;
    children?: Snippet;
    locale?: PresentationLocale;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<a class="ui-button" href={openHref} aria-expanded={open}>{copy.open} · {title}</a>
{#if open}<aside class="ui-drawer" aria-label={title}>
    <h2>{title}</h2>
    <a class="ui-link" href={closeHref}>{copy.close}</a>{#if children}{@render children()}{/if}
  </aside>{/if}
