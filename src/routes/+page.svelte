<script lang="ts">
  let hydrationMs = $state<number | undefined>();
  onMount(() => {
    hydrationMs = performance.now();
  });
  import { onMount } from 'svelte';
  import {
    presentationCopy,
    uiCopy,
    type PresentationLocale,
    type PresentationTheme,
  } from '@xtrip/i18n';
  import AppShell from '../components/app-shell/app-shell.svelte';
  import ThemeProvider from '../components/theme-provider/theme-provider.svelte';
  import Story0 from '../workbench/app-shell.stories.svelte';
  import Story1 from '../workbench/command-palette.stories.svelte';
  import Story2 from '../workbench/button.stories.svelte';
  import Story3 from '../workbench/link.stories.svelte';
  import Story4 from '../workbench/menu.stories.svelte';
  import Story5 from '../workbench/dialog.stories.svelte';
  import Story6 from '../workbench/drawer.stories.svelte';
  import Story7 from '../workbench/popover.stories.svelte';
  import Story8 from '../workbench/tabs.stories.svelte';
  import Story9 from '../workbench/form-field.stories.svelte';
  import Story10 from '../workbench/error-summary.stories.svelte';
  import Story11 from '../workbench/date-picker.stories.svelte';
  import Story12 from '../workbench/date-range-picker.stories.svelte';
  import Story13 from '../workbench/occupancy-editor.stories.svelte';
  import Story14 from '../workbench/market-picker.stories.svelte';
  import Story15 from '../workbench/geography-picker.stories.svelte';
  import Story16 from '../workbench/data-grid.stories.svelte';
  import Story17 from '../workbench/responsive-record-list.stories.svelte';
  import Story18 from '../workbench/bulk-action-bar.stories.svelte';
  import Story19 from '../workbench/rate-grid.stories.svelte';
  import Story20 from '../workbench/remote-state.stories.svelte';
  import Story21 from '../workbench/skeleton.stories.svelte';
  import Story22 from '../workbench/status-chip.stories.svelte';
  import Story23 from '../workbench/deadline-chip.stories.svelte';
  import Story24 from '../workbench/money.stories.svelte';
  import Story25 from '../workbench/drift-diff.stories.svelte';
  import Story26 from '../workbench/timeline.stories.svelte';
  import Story27 from '../workbench/document-status.stories.svelte';
  import Story28 from '../workbench/notification-center.stories.svelte';
  import Story29 from '../workbench/theme-provider.stories.svelte';
  import Story30 from '../workbench/chart-shell.stories.svelte';
  import Story31 from '../workbench/map-shell.stories.svelte';
  import Story32 from '../workbench/calendar.stories.svelte';
  import Story33 from '../workbench/file-import-review.stories.svelte';
  import Story34 from '../workbench/price-breakdown.stories.svelte';
  import Story35 from '../workbench/price-drift-diff.stories.svelte';
  import Story36 from '../workbench/pricing-stage-trace.stories.svelte';
  type State =
    | 'loading'
    | 'loaded'
    | 'empty'
    | 'filtered-empty'
    | 'refreshing'
    | 'stale'
    | 'retryable'
    | 'terminal'
    | 'forbidden'
    | 'not-found';
  type PageData = {
    csrf?: string;
    locale: PresentationLocale;
    theme: PresentationTheme;
    applied: boolean;
    section?: string;
    density?: 'comfortable' | 'compact';
    brand?: 'forest' | 'indigo';
    state?: State;
    drawerOpen?: boolean;
  };
  let { data, form = null }: { data: PageData; form?: { invalid?: boolean } | null } = $props();
  const stories = {
    'app-shell': Story0,
    'command-palette': Story1,
    button: Story2,
    link: Story3,
    menu: Story4,
    dialog: Story5,
    drawer: Story6,
    popover: Story7,
    tabs: Story8,
    'form-field': Story9,
    'error-summary': Story10,
    'date-picker': Story11,
    'date-range-picker': Story12,
    'occupancy-editor': Story13,
    'market-picker': Story14,
    'geography-picker': Story15,
    'data-grid': Story16,
    'responsive-record-list': Story17,
    'bulk-action-bar': Story18,
    'rate-grid': Story19,
    'remote-state': Story20,
    skeleton: Story21,
    'status-chip': Story22,
    'deadline-chip': Story23,
    money: Story24,
    'drift-diff': Story25,
    timeline: Story26,
    'document-status': Story27,
    'notification-center': Story28,
    'theme-provider': Story29,
    'chart-shell': Story30,
    'map-shell': Story31,
    calendar: Story32,
    'file-import-review': Story33,
    'price-breakdown': Story34,
    'price-drift-diff': Story35,
    'pricing-stage-trace': Story36,
  };
  const section = $derived(
    data.section && data.section in stories ? (data.section as keyof typeof stories) : 'button',
  );
  const Story = $derived(stories[section]);
  const copy = $derived(uiCopy(data.locale));
  const foundation = $derived(presentationCopy(data.locale));
  let expanded = $state(false);
  function href(name: string, extra: Record<string, string> = {}) {
    return (
      '/?' +
      new URLSearchParams({
        locale: data.locale,
        theme: data.theme,
        density: data.density ?? 'comfortable',
        brand: data.brand ?? 'forest',
        state: data.state ?? 'loaded',
        section: name,
        ...extra,
      })
    );
  }
  const names = Object.keys(stories);
</script>

<span hidden data-hydration-ms={hydrationMs}></span>

<svelte:head
  ><title>XTrip360 · {copy.workbench}</title><meta
    name="description"
    content={copy.intro}
  /></svelte:head
>
<a class="skip" href="#content">{foundation.skip}</a>
<ThemeProvider
  theme={data.theme}
  density={data.density}
  brand={data.brand}
  direction={data.locale === 'ar' ? 'rtl' : 'ltr'}
>
  <AppShell
    title={copy.workbench}
    subtitle={copy.intro}
    locale={data.locale}
    items={names.map((name) => ({
      label: name.replaceAll('-', ' '),
      href: href(name),
      active: name === section,
    }))}
  >
    <section id="workbench-controls" class="ui-card ui-stack" aria-label={copy.preview}>
      <div class="ui-section-heading">
        <div>
          <p class="ui-eyebrow">XTRIP DESIGN SYSTEM / 0.2</p>
          <h2>{foundation.title}</h2>
          <p class="ui-muted">{copy.fixture}</p>
        </div>
        <span class="ui-status">37 {copy.components}</span>
      </div>
      <nav class="ui-row" aria-label={copy.language}>
        {#each [['en', 'English'], ['ar', 'العربية'], ['th', 'ไทย'], ['en-XA', 'Expanded']] as [code, label] (code)}<a
            class="ui-link"
            href={href(section, { locale: code })}
            lang={code === 'en-XA' ? 'en' : code}
            data-sveltekit-reload
            aria-current={data.locale === code ? 'true' : undefined}>{label}</a
          >{/each}
      </nav>
      <form method="GET" class="ui-controls">
        <input type="hidden" name="locale" value={data.locale} /><input
          type="hidden"
          name="theme"
          value={data.theme}
        /><label class="ui-field"
          >{copy.components}<select name="section" value={section}
            >{#each names as name (name)}<option value={name}>{name.replaceAll('-', ' ')}</option
              >{/each}</select
          ></label
        ><label class="ui-field"
          >{copy.density}<select name="density" value={data.density ?? 'comfortable'}
            ><option value="comfortable">{copy.comfortable}</option><option value="compact"
              >{copy.compact}</option
            ></select
          ></label
        ><label class="ui-field"
          >{copy.brand}<select name="brand" value={data.brand ?? 'forest'}
            ><option value="forest">Forest</option><option value="indigo">Indigo</option></select
          ></label
        ><label class="ui-field"
          >{copy.state}<select name="state" value={data.state ?? 'loaded'}
            >{#each ['loading', 'loaded', 'empty', 'filtered-empty', 'refreshing', 'stale', 'retryable', 'terminal', 'forbidden', 'not-found'] as state (state)}<option
                value={state}>{copy[state as State]}</option
              >{/each}</select
          ></label
        ><button class="ui-button" type="submit">{copy.preview}</button>
      </form>
      <form method="POST" class="ui-row">
        <input type="hidden" name="csrf" value={data.csrf} />
        <div class="ui-field">
          <label for="appearance-control">{foundation.appearance}</label><select
            id="appearance-control"
            name="theme"
            value={data.theme}
            ><option value="light">{foundation.light}</option><option value="dark"
              >{foundation.dark}</option
            ></select
          >
        </div>
        <button class="ui-button" type="submit">{foundation.apply}</button>
      </form>
      {#if data.applied}<p role="status">{foundation.saved}</p>{/if}{#if form?.invalid}<p
          role="alert"
        >
          {foundation.invalid}
        </p>{/if}
    </section>
    <section class="ui-card ui-example" id="example" aria-labelledby="example-title">
      <div class="ui-section-heading">
        <h2 id="example-title" lang="en">{section.replaceAll('-', ' ')}</h2>
        <span class="ui-muted">{copy.preview}</span>
      </div>
      <Story
        locale={data.locale}
        state={data.state ?? 'loaded'}
        drawerOpen={data.drawerOpen}
        openHref={href(section, { drawer: '1' })}
        closeHref={href(section)}
      />
    </section>
    <a class="ui-link" href={`/session/login?locale=${data.locale}`}>{copy.sessionIntegration}</a>
    <footer class="ui-card">
      <button
        class="ui-disclosure"
        aria-expanded={expanded}
        aria-controls="next-description"
        onclick={() => (expanded = !expanded)}
        >{foundation.next}<span aria-hidden="true">{expanded ? '−' : '+'}</span></button
      >
      <p id="next-description" hidden={!expanded}>{foundation.nextBody}</p>
    </footer>
  </AppShell>
</ThemeProvider>
