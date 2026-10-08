<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, children }: { label: string; children?: Snippet } = $props();
</script>

<details class="ui-popover">
  <summary class="ui-button" data-variant="secondary">{label}</summary>
  <div class="ui-card">
    {#if children}{@render children()}{/if}
  </div>
</details>
