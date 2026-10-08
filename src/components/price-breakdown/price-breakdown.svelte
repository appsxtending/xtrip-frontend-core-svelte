<script lang="ts">
  import Money from '../money/money.svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    lines = [],
    total,
    currency,
    signature,
    locale = 'en',
  }: {
    lines?: { id: string; label: string; amount: string }[];
    total: string;
    currency: string;
    signature: string;
    locale?: PresentationLocale;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<section class="ui-stack">
  <dl class="ui-prices">
    {#each lines as line (line.id)}<div>
        <dt>{line.label}</dt>
        <dd><Money amount={line.amount} {currency} /></dd>
      </div>{/each}
    <div class="ui-total">
      <dt>{copy.total}</dt>
      <dd><Money amount={total} {currency} /></dd>
    </div>
  </dl>
  <p class="ui-muted">{copy.signature}: <bdi>{signature}</bdi></p>
</section>
