<script lang="ts">
  let {
    label,
    value = $bindable(''),
    min,
    max,
    required = false,
  }: { label: string; value?: string; min?: string; max?: string; required?: boolean } = $props();
</script>

<label class="ui-field">{label}<input type="date" bind:value {min} {max} {required} /></label>
