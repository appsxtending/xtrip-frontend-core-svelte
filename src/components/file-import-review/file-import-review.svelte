<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    issues = [],
    locale = 'en',
    pending = false,
    validated = false,
    onfile,
    onconfirm,
  }: {
    issues?: { row: number; message: string }[];
    locale?: PresentationLocale;
    pending?: boolean;
    validated?: boolean;
    onfile?: (file: File) => void;
    onconfirm?: () => void;
  } = $props();
  let filename = $state('');
  let approved = $state(false);
  const copy = $derived(uiCopy(locale));
</script>

<section class="ui-stack">
  <label class="ui-field"
    >{copy.file}<input
      type="file"
      accept=".csv,.xlsx"
      disabled={pending}
      onchange={(event) => {
        const file = event.currentTarget.files?.[0];
        approved = false;
        filename = file?.name ?? '';
        if (file) onfile?.(file);
      }}
    /></label
  ><output>{filename}</output>{#if issues.length}<div class="ui-callout" role="alert">
      <p>{copy.blocked}</p>
      <ul>
        {#each issues as issue (issue.row + issue.message)}<li>
            {issue.row}: {issue.message}
          </li>{/each}
      </ul>
    </div>{/if}<label class="ui-check"
    ><input
      type="checkbox"
      bind:checked={approved}
      disabled={!filename || !!issues.length || !validated}
    />{copy.preview}</label
  ><button
    class="ui-button"
    disabled={!approved || !!issues.length || pending || !validated}
    aria-busy={pending}
    onclick={onconfirm}>{copy.apply}</button
  >
</section>
