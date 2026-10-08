<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    items,
    selected = $bindable(''),
    label = 'Sections',
    dir = 'ltr',
    children,
  }: {
    items: { id: string; label: string }[];
    selected?: string;
    label?: string;
    dir?: 'ltr' | 'rtl';
    children?: Snippet<[string]>;
  } = $props();
  const id = $props.id();
  const active = $derived(items.some((x) => x.id === selected) ? selected : items[0]?.id);
  function move(event: KeyboardEvent, index: number) {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'ArrowRight')
      next = (index + (dir === 'rtl' ? -1 : 1) + items.length) % items.length;
    else if (event.key === 'ArrowLeft')
      next = (index + (dir === 'rtl' ? 1 : -1) + items.length) % items.length;
    else return;
    event.preventDefault();
    selected = items[next].id;
    const buttons = (
      event.currentTarget as HTMLElement
    ).parentElement?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[next]?.focus();
  }
</script>

<div class="ui-tabs" role="tablist" aria-label={label} {dir}>
  {#each items as item, index (item.id)}<button
      type="button"
      id={id + '-tab-' + index}
      role="tab"
      aria-selected={active === item.id}
      aria-controls={id + '-panel'}
      tabindex={active === item.id ? 0 : -1}
      onclick={() => (selected = item.id)}
      onkeydown={(event) => move(event, index)}>{item.label}</button
    >{/each}
</div>
<div
  class="ui-tab-panel"
  id={id + '-panel'}
  role="tabpanel"
  aria-labelledby={id + '-tab-' + items.findIndex((x) => x.id === active)}
  tabindex="0"
>
  {#if children && active}{@render children(active)}{/if}
</div>
