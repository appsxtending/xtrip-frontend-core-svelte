<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    label,
    options = [],
    value = $bindable(''),
    locale = 'en',
    onquery,
  }: {
    label: string;
    options?: { id: string; label: string }[];
    value?: string;
    locale?: PresentationLocale;
    onquery?: (query: string) => void;
  } = $props();
  let query = $state('');
  const copy = $derived(uiCopy(locale));
  const filtered = $derived(
    options.filter((x) => x.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
  );
</script>

<div class="ui-stack">
  <label class="ui-field"
    >{copy.search} · {label}<input
      type="search"
      bind:value={query}
      oninput={() => onquery?.(query)}
    /></label
  ><label class="ui-field"
    >{label}<select bind:value
      ><option value="">{copy.choose}</option>{#each filtered as item (item.id)}<option
          value={item.id}>{item.label}</option
        >{/each}</select
    ></label
  >{#if !filtered.length}<p role="status">{copy.empty}</p>{/if}
</div>
