<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let open = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

	const dispatch = createEventDispatcher();

	const sizes = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl'
	};

	function close() {
		open = false;
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		transition:fade={{ duration: 200 }}
		on:keydown={handleKeydown}
	>
		<!-- Backdrop -->
		<div
			class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
			on:click={handleBackdropClick}
		></div>

		<!-- Modal -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div
				class="relative w-full {sizes[size]} bg-surface rounded-xl shadow-xl border border-border"
				transition:scale={{ duration: 200, start: 0.95 }}
			>
				<!-- Header -->
				{#if title || $$slots.header}
					<div class="flex items-center justify-between p-6 border-b border-border">
						<div class="flex-1">
							{#if $$slots.header}
								<slot name="header" />
							{:else}
								<h3 class="text-lg font-semibold text-foreground">{title}</h3>
							{/if}
						</div>
						<button
							on:click={close}
							class="ml-4 p-1 rounded-md text-muted hover:text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/if}

				<!-- Body -->
				<div class="p-6">
					<slot />
				</div>

				<!-- Footer -->
				{#if $$slots.footer}
					<div class="flex items-center justify-end space-x-3 p-6 border-t border-border">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
