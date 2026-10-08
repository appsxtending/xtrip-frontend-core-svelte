<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    title,
    summary,
    rows = [],
    locale = 'en',
    children,
  }: {
    title: string;
    summary: string;
    rows?: { label: string; value: string }[];
    locale?: PresentationLocale;
    children?: Snippet;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<figure class="ui-card">
  <figcaption>
    <h3>{title}</h3>
    <p>{summary}</p>
  </figcaption>
  {#if children}{@render children()}{/if}
  <table class="ui-table">
    <caption>{copy.table}</caption><thead
      ><tr><th scope="col">{copy.name}</th><th scope="col">{copy.value}</th></tr></thead
    ><tbody
      >{#each rows as row (row.label)}<tr><th scope="row">{row.label}</th><td>{row.value}</td></tr
        >{/each}</tbody
    >
  </table>
</figure>
