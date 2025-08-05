<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$stores/auth';
	import Sidebar from '$components/app/Sidebar.svelte';
	import AppHeader from '$components/app/AppHeader.svelte';

	let sidebarOpen = false;

	onMount(() => {
		// Check authentication
		if (!$auth.isAuthenticated && !$auth.isLoading) {
			goto('/login');
		}
	});

	// Close sidebar when route changes on mobile
	$: if ($page.url.pathname) {
		sidebarOpen = false;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<svelte:head>
	<title>Dashboard - PriceActionTalk</title>
</svelte:head>

{#if $auth.isLoading}
	<!-- Loading state -->
	<div class="min-h-screen bg-background flex items-center justify-center">
		<div class="text-center">
			<div class="spinner w-8 h-8 mx-auto mb-4"></div>
			<p class="text-muted">Loading your dashboard...</p>
		</div>
	</div>
{:else if !$auth.isAuthenticated}
	<!-- Not authenticated - will redirect -->
	<div class="min-h-screen bg-background flex items-center justify-center">
		<div class="text-center">
			<p class="text-muted">Redirecting to login...</p>
		</div>
	</div>
{:else}
	<!-- Authenticated app layout -->
	<div class="h-screen bg-background flex overflow-hidden">
		<!-- Sidebar -->
		<Sidebar bind:open={sidebarOpen} />

		<!-- Main content area -->
		<div class="flex-1 flex flex-col overflow-hidden">
			<!-- App header -->
			<AppHeader on:toggleSidebar={toggleSidebar} />

			<!-- Page content -->
			<main class="flex-1 overflow-auto bg-surface">
				<div class="p-4 sm:p-6 lg:p-8">
					<slot />
				</div>
			</main>
		</div>
	</div>

	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div 
			class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
			on:click={() => sidebarOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
		></div>
	{/if}
{/if}
