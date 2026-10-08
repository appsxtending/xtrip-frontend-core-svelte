<script lang="ts">
  import { createDialog } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    title: heading,
    description: summary = '',
    label,
    children,
    locale = 'en',
  }: {
    title: string;
    description?: string;
    label: string;
    children?: Snippet;
    locale?: PresentationLocale;
  } = $props();
  const id = $props.id();
  const {
    elements: { trigger, overlay, content, title, description, close },
    states: { open },
  } = createDialog({
    portal: null,
    ids: { content: id + '-content', title: id + '-title', description: id + '-description' },
  });
  const copy = $derived(uiCopy(locale));
</script>

<button class="ui-button" {...$trigger} use:trigger>{label}</button>
{#if $open}<div class="ui-overlay" {...$overlay} use:overlay></div>
  <section class="ui-dialog" {...$content} use:content>
    <h2 {...$title} use:title>{heading}</h2>
    <p class="ui-muted" {...$description} use:description>{summary}</p>
    {#if children}{@render children()}{/if}<button
      class="ui-button"
      data-variant="secondary"
      {...$close}
      use:close>{copy.close}</button
    >
  </section>{/if}
