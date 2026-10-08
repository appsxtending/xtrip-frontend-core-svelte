<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    items = [],
    locale = 'en',
    onread,
  }: {
    items?: { id: string; title: string; read: boolean }[];
    locale?: PresentationLocale;
    onread?: (id: string) => void;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<ul class="ui-list">
  {#each items as item (item.id)}<li class="ui-card ui-row">
      <span>{item.title}</span>{#if !item.read}<button
          class="ui-button"
          data-variant="secondary"
          onclick={() => onread?.(item.id)}>{copy.read}</button
        >{:else}<span class="ui-status">✓ {copy.loaded}</span>{/if}
    </li>{:else}<li>{copy.empty}</li>{/each}
</ul>
