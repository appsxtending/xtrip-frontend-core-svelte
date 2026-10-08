<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    title,
    subtitle = '',
    items = [],
    permissions = [],
    locale = 'en',
    children,
  }: {
    title: string;
    subtitle?: string;
    items?: { label: string; href: string; permission?: string; active?: boolean }[];
    permissions?: string[];
    locale?: PresentationLocale;
    children?: Snippet;
  } = $props();
  let collapsed = $state(false);
  const id = $props.id();
  const copy = $derived(uiCopy(locale));
</script>

<div class="ui-shell" data-collapsed={collapsed}>
  <aside class="ui-sidebar">
    <a class="ui-brand" href="/" dir="ltr"
      ><span class="ui-monogram" aria-hidden="true">X</span> xtrip<span class="text-accent"
        >360</span
      ></a
    ><button
      class="ui-button"
      data-variant="secondary"
      aria-expanded={!collapsed}
      aria-controls={id}
      onclick={() => (collapsed = !collapsed)}>{copy.navigation}</button
    >
    <nav {id} aria-label={copy.navigation} hidden={collapsed}>
      {#each items.filter((item) => !item.permission || permissions.includes(item.permission)) as item (item.href)}<a
          class="ui-nav-link"
          href={item.href}
          aria-current={item.active ? 'page' : undefined}>{item.label}</a
        >{/each}
    </nav>
    <p class="ui-sidebar-note">{copy.fixture}</p>
  </aside>
  <div class="ui-shell-body">
    <header class="ui-shell-header">
      <div>
        <p class="ui-eyebrow">XTRIP / {copy.workbench}</p>
        <h1>{title}</h1>
        <p class="ui-muted">{subtitle}</p>
      </div>
      <span class="ui-status" data-tone="success">{copy.loaded}</span>
    </header>
    <main id="content" class="ui-main">
      {#if children}{@render children()}{/if}
    </main>
  </div>
</div>
