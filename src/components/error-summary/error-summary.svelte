<script lang="ts">
  let { title, errors = [] }: { title: string; errors?: { id: string; message: string }[] } =
    $props();
  const id = $props.id();
</script>

{#if errors.length}<section
    class="ui-callout"
    data-tone="danger"
    role="alert"
    tabindex="-1"
    aria-labelledby={id}
  >
    <h3 {id}>{title}</h3>
    <ul>
      {#each errors as error (error.id)}<li><a href={'#' + error.id}>{error.message}</a></li>{/each}
    </ul>
  </section>{/if}
