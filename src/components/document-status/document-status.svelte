<script lang="ts">
  import Status from '../status-chip/status-chip.svelte';
  let { title, status, href }: { title: string; status: string; href?: string } = $props();
</script>

<article class="ui-card ui-row">
  <h3>{title}</h3>
  <Status label={status} />{#if href && /^(https?:|\/)/.test(href)}<a class="ui-link" {href}
      >{title} ↗</a
    >{/if}
</article>
