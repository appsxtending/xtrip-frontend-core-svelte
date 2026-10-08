<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    adults = $bindable(2),
    children = $bindable(0),
    maxAdults = 20,
    maxChildren = 10,
    locale = 'en',
  }: {
    adults?: number;
    children?: number;
    maxAdults?: number;
    maxChildren?: number;
    locale?: PresentationLocale;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<fieldset class="ui-fieldset">
  <legend>{copy.select}</legend>
  <div class="ui-row">
    <label class="ui-field"
      >{copy.adults}<input type="number" min="1" max={maxAdults} bind:value={adults} /></label
    ><label class="ui-field"
      >{copy.children}<input type="number" min="0" max={maxChildren} bind:value={children} /></label
    >
  </div>
</fieldset>
