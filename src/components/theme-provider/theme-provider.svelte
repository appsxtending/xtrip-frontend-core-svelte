<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themePreset, type Theme, type Density, type Brand } from '@xtrip/design-tokens';
  let {
    theme = 'light',
    density = 'comfortable',
    brand = 'forest',
    direction = 'ltr',
    children,
  }: {
    theme?: Theme;
    density?: Density;
    brand?: Brand;
    direction?: 'ltr' | 'rtl';
    children?: Snippet;
  } = $props();
</script>

<div
  class="ui-theme"
  data-theme={theme}
  data-density={density}
  data-brand={themePreset(brand)}
  dir={direction}
>
  {#if children}{@render children()}{/if}
</div>
