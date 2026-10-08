<script lang="ts">
  let {
    label,
    value = $bindable(''),
    name = '',
    type = 'text',
    hint = '',
    error = '',
    required = false,
    disabled = false,
  }: {
    label: string;
    value?: string;
    name?: string;
    type?: 'text' | 'email' | 'password' | 'search';
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  } = $props();
  const id = $props.id();
</script>

<div class="ui-field">
  <label for={id}>{label}{required ? ' *' : ''}</label><input
    {type}
    {name}
    {required}
    {disabled}
    {id}
    bind:value
    aria-invalid={!!error}
    aria-describedby={error ? id + '-error' : hint ? id + '-hint' : undefined}
  />{#if hint}<small id={id + '-hint'}>{hint}</small>{/if}{#if error}<p
      class="ui-error"
      id={id + '-error'}
    >
      {error}
    </p>{/if}
</div>
