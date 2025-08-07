<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import { TrendingUp, BarChart, Target, Activity } from '$lib/components/icons';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Professional market data visualization
	const marketData = [
		{ symbol: 'EURUSD', price: 1.0892, change: 0.85, trend: 'up' },
		{ symbol: 'GBPUSD', price: 1.2734, change: -0.23, trend: 'down' },
		{ symbol: 'USDJPY', price: 149.85, change: 1.12, trend: 'up' },
		{ symbol: 'AUDUSD', price: 0.6543, change: 0.45, trend: 'up' },
		{ symbol: 'USDCAD', price: 1.3621, change: -0.67, trend: 'down' }
	];

	const features = [
		{ label: 'Real-Time Analysis', icon: Activity },
		{ label: 'Institutional Data', icon: BarChart },
		{ label: 'Professional Tools', icon: Target }
	];
</script>

<section class="relative overflow-hidden">
	<!-- Professional background pattern -->
	<div class="absolute inset-0">
		<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
		<div class="absolute inset-0 opacity-30">
			<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs>
					<pattern id="professional-grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
					</pattern>
				</defs>
				<rect width="100" height="100" fill="url(#professional-grid)" />
			</svg>
		</div>
	</div>

	<div class="relative container py-24 sm:py-32">
		<div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8 items-center">
			<!-- Content Column -->
			<div class="space-y-8">
				<div class="space-y-6">
					<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
						<TrendingUp size={16} />
						Professional Trading Platform
					</div>
					
					<h1 class="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
						<span class="block">Master the</span>
						<span class="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Financial Markets
						</span>
					</h1>
					
					<p class="text-xl text-muted max-w-2xl leading-relaxed">
						Professional-grade trading infrastructure with institutional-quality data feeds, 
						advanced analytics, and systematic education designed for serious market participants.
					</p>
				</div>

				<!-- Professional feature highlights -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{#each features as feature}
						<div class="flex items-center gap-3 p-4 bg-surface-elevated rounded-xl border border-border">
							<div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
								<svelte:component this={feature.icon} class="text-primary" size={16} />
							</div>
							<span class="text-sm font-semibold text-foreground">{feature.label}</span>
						</div>
					{/each}
				</div>

				<!-- Professional CTA Buttons -->
				<div class="flex flex-col sm:flex-row gap-4">
					{#if $auth.isAuthenticated}
						<a href="/app/dashboard" class="btn btn-primary text-lg px-8 py-4 font-semibold">
							Access Platform
						</a>
					{:else}
						<a href="/register" class="btn btn-primary text-lg px-8 py-4 font-semibold">
							Start Professional Trial
						</a>
					{/if}
					
					<a href="/features" class="btn btn-secondary text-lg px-8 py-4 font-semibold">
						Explore Capabilities
					</a>
				</div>

				<!-- Professional trust indicators -->
				<div class="pt-8 border-t border-border">
					<p class="text-sm text-muted mb-6 font-medium">Trusted by professional traders worldwide</p>
					<div class="grid grid-cols-3 gap-8">
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">10,000+</div>
							<div class="text-xs text-muted font-medium uppercase tracking-wider">Active Traders</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">50+</div>
							<div class="text-xs text-muted font-medium uppercase tracking-wider">Countries</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">99.9%</div>
							<div class="text-xs text-muted font-medium uppercase tracking-wider">Uptime</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Professional Visualization Column -->
			<div class="relative">
				<!-- Professional trading interface mockup -->
				<div class="card-elevated p-6">
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-3">
							<div class="w-3 h-3 bg-success rounded-full"></div>
							<h3 class="text-lg font-bold text-foreground">Live Market Data</h3>
						</div>
						<div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
							<Activity size={14} />
							Real-Time
						</div>
					</div>
					
					<!-- Professional market data display -->
					<div class="space-y-3">
						{#each marketData as data, i}
							<div 
								class="flex items-center justify-between p-4 bg-background rounded-lg border border-border transition-all duration-300"
								style="animation-delay: {mounted ? i * 100 : 0}ms"
								class:animate-fade-in-up={mounted}
							>
								<div class="flex items-center gap-3">
									<div class="w-2 h-2 rounded-full {data.trend === 'up' ? 'bg-success' : 'bg-error'}"></div>
									<span class="font-semibold text-foreground font-mono">{data.symbol}</span>
								</div>
								<div class="text-right">
									<div class="font-bold text-foreground font-mono">{data.price}</div>
									<div class="text-xs font-semibold {data.change >= 0 ? 'text-success' : 'text-error'}">
										{data.change >= 0 ? '+' : ''}{data.change}%
									</div>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Professional chart visualization -->
					<div class="mt-6 h-32 bg-background rounded-lg border border-border p-4">
						<div class="h-full flex items-end justify-between gap-1">
							{#each Array(12) as _, i}
								<div 
									class="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-sm transition-all duration-1000"
									style="height: {mounted ? Math.random() * 80 + 20 : 0}%; animation-delay: {i * 50}ms"
								></div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Professional floating indicators -->
				<div class="absolute -top-4 -right-4 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
					Live Data
				</div>
				
				<div class="absolute -bottom-4 -left-4 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
					Professional
				</div>
			</div>
		</div>
	</div>
</section>