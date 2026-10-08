<script lang="ts">
  import { uiCopy, type PresentationLocale } from '@xtrip/i18n';
  let {
    stages = [],
    locale = 'en',
  }: {
    stages?: { stage: number; code: string; description: string; suppressed?: boolean }[];
    locale?: PresentationLocale;
  } = $props();
  const copy = $derived(uiCopy(locale));
</script>

<ol class="ui-timeline" aria-label={copy.stage}>
  {#each stages as stage (stage.stage)}<li>
      <details>
        <summary
          >{stage.stage}. <bdi>{stage.code}</bdi>{stage.suppressed
            ? ' · ' + copy.warning
            : ''}</summary
        >
        <p>{stage.description}</p>
      </details>
    </li>{/each}
</ol>
