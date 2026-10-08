<script lang="ts">
  import { uiCopy } from '@xtrip/i18n';
  let { data, form } = $props();
  const copy = $derived(uiCopy.session(data.locale));
</script>

<svelte:head><title>{copy.signIn} · XTrip</title></svelte:head>
<main class="ui-panel ui-stack">
  <a class="ui-link" href="/">XTrip</a>
  <h1>{copy.signIn}</h1>
  <p>{copy.demo}</p>
  <form method="POST" class="ui-stack">
    <input type="hidden" name="csrf" value={data.csrf} />
    <label class="ui-field"
      >{copy.email}<input name="email" type="email" autocomplete="username" required /></label
    >
    <label class="ui-field"
      >{copy.password}<input
        name="password"
        type="password"
        autocomplete="current-password"
        required
      /></label
    >
    <label class="ui-field"
      >{copy.tenant}<input name="tenantId" required autocomplete="off" /></label
    >
    {#if form?.invalid}<p role="alert">{copy.invalid}</p>{/if}<button
      class="ui-button"
      type="submit">{copy.signIn}</button
    >
  </form>
</main>
