<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$stores/auth';
	import Logo from '$components/Logo.svelte';
	import { 
		Activity, BarChart, Target, Calendar, GraduationCap, 
		BookOpen, Users, Shield, Settings 
	} from '$lib/components/icons';

	export let open = false;

	const navigation = [
		{
			name: 'Dashboard',
			href: '/app/dashboard',
			icon: Activity,
			description: 'Performance overview'
		},
		{
			name: 'Macro Analysis',
			href: '/app/bias',
			icon: TrendingUp,
			description: 'AI-driven market bias'
		},
		{
			name: 'Currency Matrix',
			href: '/app/heatman',
			icon: BarChart,
			description: 'Strength visualization'
		},
		{
			name: 'Market Opportunities',
			href: '/app/topsetups',
			icon: Target,
			description: 'Ranked setups'
		},
		{
			name: 'Seasonal Patterns',
			href: '/app/seasonality',
			icon: Calendar,
			description: 'Historical trends'
		},
		{
			name: 'Education Center',
			href: '/app/levels',
			icon: GraduationCap,
			description: 'Structured learning'
		},
		{
			name: 'Trading Journal',
			href: '/app/journal',
			icon: BookOpen,
			description: 'Performance analytics'
		},
		{
			name: 'Community Hub',
			href: '/app/community',
			icon: Users,
			description: 'Challenges & networking'
		},
		{
			name: 'Risk Management',
			href: '/app/risk-manager',
			icon: Shield,
			description: 'Capital protection'
		},
		{
			name: 'Account Settings',
			href: '/app/settings',
			icon: Settings,
			description: 'Profile & preferences'
		}
	];

	$: currentPath = $page.url.pathname;
</script>

<!-- Professional desktop sidebar -->
<div class="hidden lg:flex lg:flex-shrink-0">
	<div class="flex flex-col w-72">
		<div class="flex flex-col flex-grow bg-secondary pt-6 pb-4 overflow-y-auto">
			<!-- Professional logo -->
			<div class="flex items-center flex-shrink-0 px-6 mb-8">
				<Logo class="h-8 w-8 text-primary" />
				<div class="ml-3">
					<div class="text-xl font-bold text-white">PriceActionTalk</div>
					<div class="text-xs text-gray-400 font-medium uppercase tracking-wider">Professional</div>
				</div>
			</div>

			<!-- Professional user info -->
			{#if $auth.user}
				<div class="px-6 mb-8">
					<div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
								<span class="text-white font-bold text-lg">
									{$auth.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-white">
									{$auth.user.username}
								</p>
								<div class="flex items-center gap-2">
									<span class="text-xs text-gray-300">Level {$auth.user.level}</span>
									<span class="text-xs text-gray-500">•</span>
									<span class="text-xs text-accent font-medium">{$auth.user.xp.toLocaleString()} XP</span>
								</div>
							</div>
						</div>
						
						<!-- Professional subscription indicator -->
						<div class="mt-3 pt-3 border-t border-gray-700">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</span>
								<span class="text-xs font-bold text-accent capitalize">
									{$auth.user.subscription_tier}
								</span>
							</div>
							{#if $auth.user.subscription_tier === 'free'}
								<a href="/pricing" class="mt-2 block text-xs text-primary hover:text-primary/80 font-medium">
									Upgrade to Professional
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Professional navigation -->
			<nav class="flex-1 px-4 space-y-2">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 {
							currentPath === item.href
								? 'bg-primary text-white shadow-lg'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'
						}"
					>
						<div class="w-5 h-5 flex-shrink-0">
							<svelte:component this={item.icon} size={20} />
						</div>
						<div class="flex-1">
							<div class="font-semibold">{item.name}</div>
							<div class="text-xs opacity-75 font-normal">{item.description}</div>
						</div>
						
						{#if currentPath === item.href}
							<div class="w-2 h-2 bg-white rounded-full"></div>
						{/if}
					</a>
				{/each}
			</nav>
		</div>
	</div>
</div>

<!-- Professional mobile sidebar -->
<div class="lg:hidden">
	<div class="fixed inset-y-0 left-0 z-50 w-72 bg-secondary transform transition-transform duration-300 ease-in-out {
		open ? 'translate-x-0' : '-translate-x-full'
	}">
		<div class="flex flex-col h-full pt-6 pb-4 overflow-y-auto">
			<!-- Professional mobile logo -->
			<div class="flex items-center flex-shrink-0 px-6 mb-8">
				<Logo class="h-8 w-8 text-primary" />
				<div class="ml-3">
					<div class="text-xl font-bold text-white">PriceActionTalk</div>
					<div class="text-xs text-gray-400 font-medium uppercase tracking-wider">Professional</div>
				</div>
			</div>

			<!-- Professional mobile user info -->
			{#if $auth.user}
				<div class="px-6 mb-8">
					<div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
								<span class="text-white font-bold text-lg">
									{$auth.user.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div class="flex-1">
								<p class="text-sm font-semibold text-white">
									{$auth.user.username}
								</p>
								<div class="flex items-center gap-2">
									<span class="text-xs text-gray-300">Level {$auth.user.level}</span>
									<span class="text-xs text-gray-500">•</span>
									<span class="text-xs text-accent font-medium">{$auth.user.xp.toLocaleString()} XP</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Professional mobile navigation -->
			<nav class="flex-1 px-4 space-y-2">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 {
							currentPath === item.href
								? 'bg-primary text-white shadow-lg'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'
						}"
					>
						<div class="w-5 h-5 flex-shrink-0">
							<svelte:component this={item.icon} size={20} />
						</div>
						<div class="flex-1">
							<div class="font-semibold">{item.name}</div>
							<div class="text-xs opacity-75 font-normal">{item.description}</div>
						</div>
					</a>
				{/each}
			</nav>
		</div>
	</div>
</div>