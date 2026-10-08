<script lang="ts">
  let {
    label,
    events = [],
  }: {
    label: string;
    events?: { id: string; title: string; datetime: string; description: string }[];
  } = $props();
</script>

<ol class="ui-timeline" aria-label={label}>
  {#each events as event (event.id)}<li>
      <div>
        <h3>{event.title}</h3>
        <time datetime={event.datetime}>{event.datetime}</time>
        <p>{event.description}</p>
      </div>
    </li>{/each}
</ol>
