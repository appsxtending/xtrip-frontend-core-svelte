<script lang="ts">
  let {
    label,
    items = [],
  }: { label: string; items?: { label: string; disabled?: boolean; onselect: () => void }[] } =
    $props();
  let open = $state(false);
</script>

<details class="ui-popover" bind:open>
  <summary class="ui-button" data-variant="secondary">{label}</summary>
  <div class="ui-card ui-stack">
    {#each items as item (item.label)}<button
        class="ui-button"
        data-variant="secondary"
        disabled={item.disabled}
        onclick={() => {
          item.onselect();
          open = false;
        }}>{item.label}</button
      >{/each}
  </div>
</details>
