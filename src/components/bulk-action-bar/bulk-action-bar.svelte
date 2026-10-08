<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    count = 0,
    pending = false,
    locale = 'en',
    onapply,
    onclear,
  }: {
    count?: number;
    pending?: boolean;
    locale?: PresentationLocale;
    onapply?: () => void;
    onclear?: () => void;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<div class="ui-callout ui-row" aria-label={copy.selectedRows}>
  <output>{copy.selected}: {count}</output><button
    class="ui-button"
    disabled={!count || pending}
    aria-busy={pending}
    onclick={onapply}>{copy.apply}</button
  ><button class="ui-button" data-variant="secondary" disabled={!count || pending} onclick={onclear}
    >{copy.clear}</button
  >
</div>
