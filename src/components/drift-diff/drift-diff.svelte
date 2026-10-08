<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    changes = [],
    locale = 'en',
  }: { changes?: { label: string; before: string; after: string }[]; locale?: PresentationLocale } =
    $props();
  const copy = $derived(uiCopy(locale));
</script>

<dl class="ui-diff">
  {#each changes as change (change.label)}<div>
      <dt>{change.label}</dt>
      <dd>
        <span class="ui-muted">{copy.before}: <s>{change.before}</s></span><span
          >{copy.after}: <ins>{change.after}</ins></span
        >
      </dd>
    </div>{/each}
</dl>
