<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    label,
    locations = [],
    locale = 'en',
    children,
  }: {
    label: string;
    locations?: { id: string; name: string; address: string }[];
    locale?: PresentationLocale;
    children?: Snippet;
  } = $props();
  const copy = $derived(uiCopy(locale));
  let view = $state('list');
</script>

<section class="ui-stack" aria-label={label}>
  <div class="ui-row">
    <button
      class="ui-button"
      data-variant="secondary"
      aria-pressed={view === 'list'}
      onclick={() => (view = 'list')}>{copy.list}</button
    ><button
      class="ui-button"
      data-variant="secondary"
      aria-pressed={view === 'map'}
      disabled={!children}
      onclick={() => (view = 'map')}>{copy.map}</button
    >
  </div>
  {#if view === 'map' && children}{@render children()}{:else}<ul class="ui-records">
      {#each locations as item (item.id)}<li class="ui-card">
          <h3>{item.name}</h3>
          <p>{item.address}</p>
        </li>{/each}
    </ul>{/if}
</section>
