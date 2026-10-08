<script lang="ts">
  let {
    href,
    label,
    current = false,
  }: { href: string; label: string; current?: boolean } = $props();
  const safe = $derived(/^(https?:|mailto:|[/?#])/i.test(href) ? href : '#');
</script>

<a class="ui-link" href={safe} aria-current={current ? 'page' : undefined}>{label}</a>
