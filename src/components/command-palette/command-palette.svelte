<script lang="ts">
  import Dialog from '../dialog/dialog.svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    items = [],
    locale = 'en',
  }: { items?: { label: string; href: string }[]; locale?: PresentationLocale } = $props();
  let query = $state('');
  const copy = $derived(uiCopy(locale));
</script>

<Dialog title={copy.search} label={copy.search} {locale}
  ><label class="ui-field">{copy.search}<input type="search" bind:value={query} /></label>
  <ul class="ui-list">
    {#each items.filter((item) => item.label
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase())) as item (item.href)}<li>
        <a class="ui-link" href={item.href}>{item.label}</a>
      </li>{:else}<li>{copy.empty}</li>{/each}
  </ul></Dialog
>
