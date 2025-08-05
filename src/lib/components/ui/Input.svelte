<script lang="ts">
	import { cn } from '$utils';

	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let required = false;
	export let error = '';
	export let label = '';
	export let id = '';

	const baseClasses = 'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

	$: classes = cn(
		baseClasses,
		error && 'border-error focus:ring-error',
		$$props.class
	);
</script>

<div class="space-y-1">
	{#if label}
		<label for={id} class="block text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-error">*</span>
			{/if}
		</label>
	{/if}
	
	<input
		{id}
		{type}
		{placeholder}
		{disabled}
		{required}
		bind:value
		class={classes}
		{...$$restProps}
	/>
	
	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
