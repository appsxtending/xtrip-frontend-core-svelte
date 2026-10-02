<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head><title>XTrip · Page unavailable</title></svelte:head>
<main class="error-page">
  <p class="eyebrow">XTRIP</p>
  <h1>{page.status === 404 ? 'Page not found' : 'Unable to display this page'}</h1>
  <p>Please return to the foundation and try again.</p>
  <a href="/">Return to foundation</a>
</main>
