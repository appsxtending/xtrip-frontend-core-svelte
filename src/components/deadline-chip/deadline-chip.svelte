<script lang="ts">
  let {
    label,
    datetime,
    expired = false,
  }: { label: string; datetime: string; expired?: boolean } = $props();
</script>

<span class="ui-status" data-tone={expired ? 'danger' : 'warning'}
  >{label} · <time {datetime}>{datetime}</time></span
>
