<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { auth } from '$stores/auth';
	import ThemeToggle from '$components/ThemeToggle.svelte';

	const dispatch = createEventDispatcher();

	let showUserMenu = false;

	function toggleSidebar() {
		dispatch('toggleSidebar');
	}

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function handleLogout() {
		auth.logout();
		showUserMenu = false;
	}

	// Close user menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.user-menu-container')) {
			showUserMenu = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<header class="bg-background border-b border-border">
	<div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
		<!-- Left side -->
		<div class="flex items-center">
			<!-- Mobile menu button -->
			<button
				on:click={toggleSidebar}
				class="lg:hidden p-2 rounded-md text-muted hover:text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			<!-- Page title or breadcrumb could go here -->
			<div class="ml-4 lg:ml-0">
				<h1 class="text-lg font-semibold text-foreground">Dashboard</h1>
			</div>
		</div>

		<!-- Right side -->
		<div class="flex items-center space-x-4">
			<!-- Notifications -->
			<button class="p-2 rounded-md text-muted hover:text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary relative">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z" />
				</svg>
				<!-- Notification badge -->
				<span class="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
			</button>

			<!-- Theme toggle -->
			<ThemeToggle />

			<!-- User menu -->
			{#if $auth.user}
				<div class="relative user-menu-container">
					<button
						on:click={toggleUserMenu}
						class="flex items-center space-x-3 p-2 rounded-md text-muted hover:text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
							<span class="text-white font-medium text-sm">
								{$auth.user.username.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="hidden sm:block text-left">
							<p class="text-sm font-medium text-foreground">{$auth.user.username}</p>
							<p class="text-xs text-muted">Level {$auth.user.level}</p>
						</div>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					<!-- Dropdown menu -->
					{#if showUserMenu}
						<div class="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border z-50">
							<div class="py-1">
								<div class="px-4 py-2 border-b border-border">
									<p class="text-sm font-medium text-foreground">{$auth.user.username}</p>
									<p class="text-xs text-muted">{$auth.user.email}</p>
								</div>
								
								<a
									href="/app/settings"
									class="block px-4 py-2 text-sm text-foreground hover:bg-background"
									on:click={() => showUserMenu = false}
								>
									Settings
								</a>
								
								<a
									href="/app/profile"
									class="block px-4 py-2 text-sm text-foreground hover:bg-background"
									on:click={() => showUserMenu = false}
								>
									Profile
								</a>
								
								<a
									href="/help"
									class="block px-4 py-2 text-sm text-foreground hover:bg-background"
									on:click={() => showUserMenu = false}
								>
									Help & Support
								</a>
								
								<div class="border-t border-border">
									<button
										on:click={handleLogout}
										class="block w-full text-left px-4 py-2 text-sm text-error hover:bg-background"
									>
										Sign out
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</header>
