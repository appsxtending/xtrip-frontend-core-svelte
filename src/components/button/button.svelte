<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    label,
    children,
    pending = false,
    disabled = false,
    type = 'button',
    onclick,
    variant = 'primary',
  }: {
    label?: string;
    children?: Snippet;
    pending?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  } = $props();
</script>

<button
  class="ui-button"
  data-variant={variant}
  {type}
  disabled={disabled || pending}
  aria-busy={pending}
  onclick={(event) => {
    if (!disabled && !pending) onclick?.(event);
  }}
  >{#if pending}<span aria-hidden="true">◌</span
    >{/if}{#if children}{@render children()}{:else}{label}{/if}</button
>
