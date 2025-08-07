<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$stores/theme';
	import { auth } from '$stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	import Logo from './Logo.svelte';
	import { ChevronDown, X } from '$lib/components/icons';

	let mobileMenuOpen = false;

	const navigation = [
		{ name: 'Platform', href: '/' },
		{ name: 'Features', href: '/features' },
		{ name: 'Pricing', href: '/pricing' },
		{ name: 'Resources', href: '/resources' },
		{ name: 'Company', href: '/about' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
	<nav class="container">
		<div class="flex h-16 items-center justify-between">
			<!-- Professional Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center gap-3">
					<Logo class="h-8 w-8" />
					<div class="flex flex-col">
						<span class="text-xl font-bold text-foreground">PriceActionTalk</span>
						<span class="text-xs text-muted font-medium uppercase tracking-wider">Professional</span>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:block">
				<div class="flex items-center space-x-1">
					{#each navigation as item}
						<a
							href={item.href}
							class="nav-link {$page.url.pathname === item.href ? 'active' : ''}"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>

			<!-- Professional action buttons -->
			<div class="hidden md:flex items-center gap-4">
				<ThemeToggle />
				
				{#if $auth.isAuthenticated}
					<a href="/app/dashboard" class="btn btn-primary font-semibold">
						Platform Access
					</a>
					<button on:click={auth.logout} class="btn btn-ghost">
						Sign Out
					</button>
				{:else}
					<a href="/login" class="btn btn-ghost">
						Sign In
					</a>
					<a href="/register" class="btn btn-primary font-semibold">
						Start Trial
					</a>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden flex items-center gap-2">
				<ThemeToggle />
				<button
					on:click={toggleMobileMenu}
					class="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				>
					<span class="sr-only">Open main menu</span>
					{#if !mobileMenuOpen}
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{:else}
						<X size={24} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Professional mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-4 pt-4 pb-6 space-y-2 bg-surface-elevated rounded-xl mt-4 border border-border shadow-xl">
					{#each navigation as item}
						<a
							href={item.href}
							on:click={closeMobileMenu}
							class="block px-4 py-3 rounded-lg text-base font-medium transition-colors {$page.url.pathname === item.href
								? 'text-primary bg-primary/10'
								: 'text-muted hover:text-foreground hover:bg-background'}"
						>
							{item.name}
						</a>
					{/each}
					
					<div class="border-t border-border pt-4 mt-4 space-y-2">
						{#if $auth.isAuthenticated}
							<a href="/app/dashboard" on:click={closeMobileMenu} class="block px-4 py-3 text-base font-semibold text-primary">
								Platform Access
							</a>
							<button on:click={() => { auth.logout(); closeMobileMenu(); }} class="block w-full text-left px-4 py-3 text-base font-medium text-muted hover:text-foreground">
								Sign Out
							</button>
						{:else}
							<a href="/login" on:click={closeMobileMenu} class="block px-4 py-3 text-base font-medium text-muted hover:text-foreground">
								Sign In
							</a>
							<a href="/register" on:click={closeMobileMenu} class="block px-4 py-3 text-base font-semibold text-primary">
								Start Trial
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</nav>
</header>