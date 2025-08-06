<script lang="ts">
	import { cn } from '$utils';

	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'datetime-local' = 'text';
	export let value: string | number = '';
	export let placeholder = '';
	export let disabled = false;
	export let required = false;
	export let error = '';
	export let label = '';
	export let id = '';
	export let step: string | undefined = undefined;
	export let min: string | number | undefined = undefined;
	export let max: string | number | undefined = undefined;

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
	
	{#if type === 'number'}
		<input
			{id}
			type="number"
			{placeholder}
			{disabled}
			{required}
			{step}
			{min}
			{max}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else if type === 'datetime-local'}
		<input
			{id}
			type="datetime-local"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else if type === 'email'}
		<input
			{id}
			type="email"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else if type === 'password'}
		<input
			{id}
			type="password"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else if type === 'tel'}
		<input
			{id}
			type="tel"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else if type === 'url'}
		<input
			{id}
			type="url"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{:else}
		<input
			{id}
			type="text"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={classes}
			{...$$restProps}
		/>
	{/if}
	
	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
