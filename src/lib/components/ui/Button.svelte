<script lang="ts">
	import { cn } from '$utils';

	export let variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let loading = false;
	export let href: string | undefined = undefined;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variants = {
		primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary',
		secondary: 'bg-transparent text-foreground border border-border hover:bg-surface focus:ring-primary',
		accent: 'bg-accent text-secondary hover:opacity-90 focus:ring-accent',
		ghost: 'bg-transparent text-foreground hover:bg-surface focus:ring-primary',
		danger: 'bg-error text-white hover:opacity-90 focus:ring-error'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	$: classes = cn(
		baseClasses,
		variants[variant],
		sizes[size],
		$$props.class
	);
</script>

{#if href}
	<a {href} class={classes} {...$$restProps}>
		{#if loading}
			<div class="spinner w-4 h-4 mr-2"></div>
		{/if}
		<slot />
	</a>
{:else}
	<button {type} {disabled} class={classes} {...$$restProps}>
		{#if loading}
			<div class="spinner w-4 h-4 mr-2"></div>
		{/if}
		<slot />
	</button>
{/if}
