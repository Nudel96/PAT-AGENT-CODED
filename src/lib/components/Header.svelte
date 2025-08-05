<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$stores/theme';
	import { auth } from '$stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	import Logo from './Logo.svelte';

	let mobileMenuOpen = false;

	const navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Features', href: '/features' },
		{ name: 'Pricing', href: '/pricing' },
		{ name: 'About', href: '/about' },
		{ name: 'Blog', href: '/blog' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
	<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<Logo class="h-8 w-8" />
					<span class="text-xl font-bold text-foreground">PriceActionTalk</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					{#each navigation as item}
						<a
							href={item.href}
							class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {$page.url.pathname === item.href
								? 'text-primary bg-primary/10'
								: 'text-muted hover:text-foreground hover:bg-surface'}"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>

			<!-- Right side buttons -->
			<div class="hidden md:flex items-center space-x-4">
				<ThemeToggle />
				
				{#if $auth.isAuthenticated}
					<a href="/app/dashboard" class="btn btn-primary">
						Dashboard
					</a>
					<button on:click={auth.logout} class="btn btn-secondary">
						Logout
					</button>
				{:else}
					<a href="/login" class="btn btn-secondary">
						Login
					</a>
					<a href="/register" class="btn btn-primary">
						Get Started
					</a>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden flex items-center space-x-2">
				<ThemeToggle />
				<button
					on:click={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
				>
					<span class="sr-only">Open main menu</span>
					{#if !mobileMenuOpen}
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{:else}
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface rounded-lg mt-2 border border-border">
					{#each navigation as item}
						<a
							href={item.href}
							on:click={closeMobileMenu}
							class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {$page.url.pathname === item.href
								? 'text-primary bg-primary/10'
								: 'text-muted hover:text-foreground hover:bg-background'}"
						>
							{item.name}
						</a>
					{/each}
					
					<div class="border-t border-border pt-4 pb-3">
						{#if $auth.isAuthenticated}
							<a href="/app/dashboard" on:click={closeMobileMenu} class="block px-3 py-2 text-base font-medium text-primary">
								Dashboard
							</a>
							<button on:click={() => { auth.logout(); closeMobileMenu(); }} class="block w-full text-left px-3 py-2 text-base font-medium text-muted hover:text-foreground">
								Logout
							</button>
						{:else}
							<a href="/login" on:click={closeMobileMenu} class="block px-3 py-2 text-base font-medium text-muted hover:text-foreground">
								Login
							</a>
							<a href="/register" on:click={closeMobileMenu} class="block px-3 py-2 text-base font-medium text-primary">
								Get Started
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</nav>
</header>
