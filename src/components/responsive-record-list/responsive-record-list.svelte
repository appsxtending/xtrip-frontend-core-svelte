<script lang="ts">
  let {
    items = [],
    label,
  }: { label: string; items?: { id: string; title: string; description: string; href: string }[] } =
    $props();
</script>

<ul class="ui-records" aria-label={label}>
  {#each items as item (item.id)}<li class="ui-card">
      <h3><a class="ui-link" href={item.href}>{item.title}</a></h3>
      <p class="ui-muted">{item.description}</p>
    </li>{/each}
</ul>
