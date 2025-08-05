<script lang="ts">
	import { cn } from '$utils';

	export let variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'default';
	export let size: 'sm' | 'md' = 'md';

	const baseClasses = 'inline-flex items-center font-medium rounded-full';

	const variants = {
		default: 'bg-border text-foreground',
		primary: 'bg-primary text-white',
		secondary: 'bg-secondary text-white',
		success: 'bg-success text-white',
		warning: 'bg-warning text-secondary',
		error: 'bg-error text-white'
	};

	const sizes = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-1 text-sm'
	};

	$: classes = cn(
		baseClasses,
		variants[variant],
		sizes[size],
		$$props.class
	);
</script>

<span class={classes} {...$$restProps}>
	<slot />
</span>
