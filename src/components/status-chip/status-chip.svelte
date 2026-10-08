<script lang="ts">
  let {
    label,
    tone = 'neutral',
  }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' } = $props();
</script>

<span class="ui-status" data-tone={tone}><span aria-hidden="true">●</span> {label}</span>
