<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    start = $bindable(''),
    end = $bindable(''),
    locale = 'en',
  }: { start?: string; end?: string; locale?: PresentationLocale } = $props();
  const copy = $derived(uiCopy(locale));
  const invalid = $derived(!!start && !!end && end < start);
  const id = $props.id();
</script>

<fieldset class="ui-fieldset">
  <legend>{copy.date}</legend>
  <div class="ui-row">
    <label class="ui-field">{copy.start}<input type="date" bind:value={start} /></label><label
      class="ui-field"
      >{copy.end}<input
        type="date"
        bind:value={end}
        min={start || undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? id : undefined}
      /></label
    >
  </div>
  {#if invalid}<p class="ui-error" {id}>{copy.warning}: {copy.end} ≥ {copy.start}</p>{/if}
</fieldset>
