<script lang="ts">
	import { cn } from '$utils';

	export let padding: 'none' | 'sm' | 'md' | 'lg' = 'lg';
	export let hover = false;

	const baseClasses = 'bg-surface border border-border rounded-xl transition-all duration-200';

	const paddings = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	$: classes = cn(
		baseClasses,
		paddings[padding],
		hover && 'hover:shadow-md hover:-translate-y-0.5',
		$$props.class
	);
</script>

<div class={classes} {...$$restProps}>
	<slot />
</div>
