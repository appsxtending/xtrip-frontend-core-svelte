<script lang="ts">
  let { amount, currency, label }: { amount: string; currency: string; label?: string } = $props();
  const valid = $derived(
    typeof amount === 'string' &&
      typeof currency === 'string' &&
      /^-?\d+(\.\d+)?$/.test(amount) &&
      /^[A-Z]{3}$/.test(currency),
  );
</script>

<span class="ui-money" aria-label={label}
  ><bdi>{valid ? amount : '—'} {valid ? currency : ''}</bdi></span
>
