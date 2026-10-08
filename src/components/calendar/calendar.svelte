<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    date = $bindable('2026-10-08'),
    events = [],
    locale = 'en',
  }: {
    date?: string;
    events?: { id: string; date: string; title: string }[];
    locale?: PresentationLocale;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<section class="ui-stack">
  <label class="ui-field">{copy.date}<input type="date" bind:value={date} /></label>
  <ul class="ui-list">
    {#each events.filter((x) => x.date === date) as item (item.id)}<li class="ui-card">
        <time datetime={item.date}>{item.date}</time> · {item.title}
      </li>{:else}<li>{copy.empty}</li>{/each}
  </ul>
</section>
