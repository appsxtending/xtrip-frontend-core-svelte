<script lang="ts">
  import Drift from '../drift-diff/drift-diff.svelte';
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    changes = [],
    locale = 'en',
    pending = false,
    onaccept,
  }: {
    changes?: { label: string; before: string; after: string }[];
    locale?: PresentationLocale;
    pending?: boolean;
    onaccept?: () => void;
  } = $props();
  let accepted = $state(false);
  const copy = $derived(uiCopy(locale));
</script>

<section class="ui-stack">
  <Drift {changes} {locale} /><label class="ui-check"
    ><input type="checkbox" bind:checked={accepted} disabled={pending} />{copy.accept}</label
  ><button
    class="ui-button"
    disabled={!accepted || pending || !changes.length}
    aria-busy={pending}
    onclick={onaccept}>{copy.apply}</button
  >
</section>
