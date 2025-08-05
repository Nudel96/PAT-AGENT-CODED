<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { theme } from '$stores/theme';
	import { auth } from '$stores/auth';
	import '../app.css';

	onMount(() => {
		// Initialize theme
		theme.init();
		
		// Check authentication status
		auth.checkAuth();
	});

	$: isAppRoute = $page.url.pathname.startsWith('/app');
	$: isPublicRoute = !isAppRoute;
</script>

<svelte:head>
	<title>PriceActionTalk - The Future of Trading is Here</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground transition-colors duration-200">
	{#if isPublicRoute}
		<!-- Public layout with header/footer -->
		<main class="flex-1">
			<slot />
		</main>
	{:else}
		<!-- App layout with sidebar -->
		<div class="flex h-screen">
			<!-- Sidebar will be added here -->
			<main class="flex-1 overflow-auto">
				<slot />
			</main>
		</div>
	{/if}
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
</style>
