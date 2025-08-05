<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$stores/auth';
	import Logo from '$components/Logo.svelte';

	export let open = false;

	const navigation = [
		{
			name: 'Dashboard',
			href: '/app/dashboard',
			icon: '📊',
			description: 'Overview and KPIs'
		},
		{
			name: 'Macro Bias',
			href: '/app/bias',
			icon: '🎯',
			description: 'AI-driven market bias'
		},
		{
			name: 'Heatman',
			href: '/app/heatman',
			icon: '🔥',
			description: 'Currency strength heatmap'
		},
		{
			name: 'Top Setups',
			href: '/app/topsetups',
			icon: '⭐',
			description: 'Ranked opportunities'
		},
		{
			name: 'Seasonality',
			href: '/app/seasonality',
			icon: '📅',
			description: 'Historical patterns'
		},
		{
			name: 'Learning',
			href: '/app/levels',
			icon: '🎓',
			description: 'XP and progression'
		},
		{
			name: 'Journal',
			href: '/app/journal',
			icon: '📝',
			description: 'Trade logging & analytics'
		},
		{
			name: 'Community',
			href: '/app/community',
			icon: '👥',
			description: 'Challenges & chat'
		},
		{
			name: 'Forum',
			href: '/app/forum',
			icon: '💬',
			description: 'Discussion boards'
		},
		{
			name: 'Settings',
			href: '/app/settings',
			icon: '⚙️',
			description: 'Profile & preferences'
		}
	];

	$: currentPath = $page.url.pathname;
</script>

<!-- Desktop sidebar -->
<div class="hidden lg:flex lg:flex-shrink-0">
	<div class="flex flex-col w-64">
		<div class="flex flex-col flex-grow bg-secondary pt-5 pb-4 overflow-y-auto">
			<!-- Logo -->
			<div class="flex items-center flex-shrink-0 px-4">
				<Logo class="h-8 w-8 text-primary" />
				<span class="ml-2 text-xl font-bold text-white">PAT</span>
			</div>

			<!-- User info -->
			{#if $auth.user}
				<div class="mt-6 px-4">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
								<span class="text-white font-medium text-sm">
									{$auth.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-white">
								{$auth.user.username}
							</p>
							<p class="text-xs text-gray-300">
								Level {$auth.user.level} • {$auth.user.xp} XP
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Navigation -->
			<nav class="mt-8 flex-1 px-2 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 {
							currentPath === item.href
								? 'bg-primary text-white'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'
						}"
					>
						<span class="mr-3 text-lg">{item.icon}</span>
						<div class="flex-1">
							<div class="text-sm font-medium">{item.name}</div>
							<div class="text-xs opacity-75">{item.description}</div>
						</div>
					</a>
				{/each}
			</nav>

			<!-- Subscription status -->
			{#if $auth.user}
				<div class="flex-shrink-0 px-4 pb-4">
					<div class="bg-gray-800 rounded-lg p-3">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-gray-300">Plan</span>
							<span class="text-xs font-bold text-accent capitalize">
								{$auth.user.subscription_tier}
							</span>
						</div>
						{#if $auth.user.subscription_tier === 'free'}
							<a href="/pricing" class="mt-2 block text-xs text-primary hover:text-primary/80">
								Upgrade to Premium
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Mobile sidebar -->
<div class="lg:hidden">
	<div class="fixed inset-y-0 left-0 z-50 w-64 bg-secondary transform transition-transform duration-300 ease-in-out {
		open ? 'translate-x-0' : '-translate-x-full'
	}">
		<div class="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
			<!-- Logo -->
			<div class="flex items-center flex-shrink-0 px-4">
				<Logo class="h-8 w-8 text-primary" />
				<span class="ml-2 text-xl font-bold text-white">PAT</span>
			</div>

			<!-- User info -->
			{#if $auth.user}
				<div class="mt-6 px-4">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
								<span class="text-white font-medium text-sm">
									{$auth.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-white">
								{$auth.user.username}
							</p>
							<p class="text-xs text-gray-300">
								Level {$auth.user.level} • {$auth.user.xp} XP
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Navigation -->
			<nav class="mt-8 flex-1 px-2 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 {
							currentPath === item.href
								? 'bg-primary text-white'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'
						}"
					>
						<span class="mr-3 text-lg">{item.icon}</span>
						<div class="flex-1">
							<div class="text-sm font-medium">{item.name}</div>
							<div class="text-xs opacity-75">{item.description}</div>
						</div>
					</a>
				{/each}
			</nav>

			<!-- Subscription status -->
			{#if $auth.user}
				<div class="flex-shrink-0 px-4 pb-4">
					<div class="bg-gray-800 rounded-lg p-3">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-gray-300">Plan</span>
							<span class="text-xs font-bold text-accent capitalize">
								{$auth.user.subscription_tier}
							</span>
						</div>
						{#if $auth.user.subscription_tier === 'free'}
							<a href="/pricing" class="mt-2 block text-xs text-primary hover:text-primary/80">
								Upgrade to Premium
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
