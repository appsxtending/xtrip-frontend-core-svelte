<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    rows = [],
    locale = 'en',
    onchange,
  }: {
    rows?: {
      id: string;
      label: string;
      date: string;
      amount: string;
      currency: string;
      locked?: boolean;
    }[];
    locale?: PresentationLocale;
    onchange?: (id: string, value: string) => void;
  } = $props();
  const copy = $derived(uiCopy(locale));
  function edit(event: Event, id: string) {
    const input = event.currentTarget as HTMLInputElement;
    if (/^-?\d+(\.\d+)?$/.test(input.value)) {
      input.setCustomValidity('');
      onchange?.(id, input.value);
    } else input.setCustomValidity(copy.warning);
  }
</script>

<div class="ui-table-scroll">
  <table class="ui-table">
    <caption>{copy.value} · {copy.date}</caption><thead
      ><tr
        ><th scope="col">{copy.name}</th><th scope="col">{copy.date}</th><th scope="col"
          >{copy.value}</th
        ></tr
      ></thead
    ><tbody
      >{#each rows as row (row.id)}<tr
          ><th scope="row">{row.label}</th><td><time datetime={row.date}>{row.date}</time></td><td
            ><label class="ui-field"
              ><span class="sr-only">{row.label} {row.date} {row.currency}</span><input
                inputmode="decimal"
                value={row.amount}
                readonly={row.locked}
                onchange={(event) => edit(event, row.id)}
              /><span>{row.currency}</span></label
            ></td
          ></tr
        >{/each}</tbody
    >
  </table>
</div>
