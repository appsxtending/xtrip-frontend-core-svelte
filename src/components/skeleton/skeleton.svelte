<script lang="ts">
  let { label, lines = 3 }: { label: string; lines?: number } = $props();
</script>

<div class="ui-stack" role="status" aria-label={label}>
  {#each Array.from({ length: Math.max(1, Math.min(8, lines)) }, (_, index) => index) as index (index)}<div
      class="ui-skeleton"
      aria-hidden="true"
    ></div>{/each}<span class="sr-only">{label}</span>
</div>
