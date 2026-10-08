<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    rows = [],
    columns = [],
    selected = $bindable([]),
    locale = 'en',
    pageSize = 5,
    label = 'Records',
  }: {
    rows?: { id: string; [key: string]: string }[];
    columns?: { key: string; label: string }[];
    selected?: string[];
    locale?: PresentationLocale;
    pageSize?: number;
    label?: string;
  } = $props();
  let query = $state('');
  let sort = $state('');
  let descending = $state(false);
  let page = $state(0);
  const copy = $derived(uiCopy(locale));
  const filtered = $derived(
    rows
      .filter((row) =>
        Object.values(row).some((v) => v.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
      )
      .toSorted((a, b) =>
        sort
          ? (descending ? -1 : 1) *
            a[sort].localeCompare(b[sort], locale === 'en-XA' ? 'en' : locale)
          : 0,
      ),
  );
  const size = $derived(Math.max(1, pageSize));
  const last = $derived(Math.max(0, Math.ceil(filtered.length / size) - 1));
  const current = $derived(Math.min(page, last));
  const visible = $derived(filtered.slice(current * size, (current + 1) * size));
  function toggle(id: string) {
    selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
  }
</script>

<section class="ui-stack" aria-label={label}>
  <label class="ui-field"
    >{copy.search}<input type="search" bind:value={query} oninput={() => (page = 0)} /></label
  >
  <div class="ui-table-scroll">
    <table class="ui-table ui-data-grid">
      <caption>{label}</caption><thead
        ><tr
          ><th scope="col">{copy.select}</th>{#each columns as column (column.key)}<th
              scope="col"
              aria-sort={sort === column.key ? (descending ? 'descending' : 'ascending') : 'none'}
              ><button
                class="ui-sort"
                onclick={() => {
                  descending = sort === column.key ? !descending : false;
                  sort = column.key;
                }}>{column.label} <span aria-hidden="true">↕</span></button
              ></th
            >{/each}</tr
        ></thead
      ><tbody
        >{#each visible as row (row.id)}<tr
            ><td
              ><input
                type="checkbox"
                aria-label={copy.select + ' ' + (row[columns[0]?.key] || row.id)}
                checked={selected.includes(row.id)}
                onchange={() => toggle(row.id)}
              /></td
            >{#each columns as column (column.key)}<td data-label={column.label}
                >{row[column.key]}</td
              >{/each}</tr
          >{:else}<tr
            ><td colspan={columns.length + 1}>{query ? copy['filtered-empty'] : copy.empty}</td></tr
          >{/each}</tbody
      >
    </table>
  </div>
  <nav class="ui-row" aria-label={label + ' · ' + copy.next}>
    <button
      class="ui-button"
      data-variant="secondary"
      disabled={current === 0}
      onclick={() => (page = current - 1)}>{copy.previous}</button
    ><output>{current + 1} / {last + 1}</output><button
      class="ui-button"
      data-variant="secondary"
      disabled={current >= last}
      onclick={() => (page = current + 1)}>{copy.next}</button
    >
  </nav>
  <p role="status">{copy.selectedRows}: {selected.length}</p>
</section>
