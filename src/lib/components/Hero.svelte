<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Mock candlestick data for animation
	const candlesticks = [
		{ open: 100, high: 110, low: 95, close: 105, bullish: true },
		{ open: 105, high: 115, low: 100, close: 112, bullish: true },
		{ open: 112, high: 120, low: 108, close: 118, bullish: true },
		{ open: 118, high: 125, low: 115, close: 122, bullish: true },
		{ open: 122, high: 130, low: 120, close: 128, bullish: true }
	];
</script>

<section class="relative overflow-hidden bg-gradient-to-br from-background via-surface to-background">
	<!-- Background pattern -->
	<div class="absolute inset-0 opacity-5">
		<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
			<defs>
				<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
					<path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/>
				</pattern>
			</defs>
			<rect width="100" height="100" fill="url(#grid)" />
		</svg>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
			<!-- Left column - Content -->
			<div class="space-y-8">
				<div class="space-y-4">
					<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						<span class="block">The Future of</span>
						<span class="block text-primary">Trading is Here</span>
					</h1>
					
					<p class="text-xl text-muted max-w-2xl">
						Master price action trading with comprehensive data-driven tools, education, and community features. 
						<span class="text-accent font-semibold">All-In-One Trading Hub</span> powered by Germany.
					</p>
				</div>

				<!-- Feature highlights -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div class="flex items-center space-x-2">
						<div class="w-2 h-2 bg-accent rounded-full"></div>
						<span class="text-sm font-medium text-foreground">Live Coaching</span>
					</div>
					<div class="flex items-center space-x-2">
						<div class="w-2 h-2 bg-accent rounded-full"></div>
						<span class="text-sm font-medium text-foreground">Strategy Courses</span>
					</div>
					<div class="flex items-center space-x-2">
						<div class="w-2 h-2 bg-accent rounded-full"></div>
						<span class="text-sm font-medium text-foreground">Community</span>
					</div>
				</div>

				<!-- CTA Buttons -->
				<div class="flex flex-col sm:flex-row gap-4">
					{#if $auth.isAuthenticated}
						<a href="/app/dashboard" class="btn btn-primary text-lg px-8 py-3">
							Go to Dashboard
						</a>
					{:else}
						<a href="/register" class="btn btn-primary text-lg px-8 py-3">
							Get Started
						</a>
					{/if}
					
					<a href="/features" class="btn btn-secondary text-lg px-8 py-3">
						Explore Features
					</a>
				</div>

				<!-- Social proof -->
				<div class="pt-8 border-t border-border">
					<p class="text-sm text-muted mb-4">Trusted by traders worldwide</p>
					<div class="flex items-center space-x-6">
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">1,000+</div>
							<div class="text-xs text-muted">Active Traders</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">50+</div>
							<div class="text-xs text-muted">Countries</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-foreground">24/7</div>
							<div class="text-xs text-muted">Support</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right column - Visual -->
			<div class="relative">
				<!-- Animated candlestick chart -->
				<div class="bg-surface rounded-xl p-6 border border-border shadow-lg">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold text-foreground">EURUSD</h3>
						<div class="flex items-center space-x-2">
							<span class="text-success text-sm">+0.85%</span>
							<span class="text-xs text-muted">1.0892</span>
						</div>
					</div>
					
					<!-- Mock chart -->
					<div class="h-48 flex items-end justify-between space-x-2">
						{#each candlesticks as candle, i}
							<div 
								class="flex-1 relative transition-all duration-1000 ease-out"
								style="animation-delay: {i * 200}ms"
							>
								{#if mounted}
									<div 
										class="w-full {candle.bullish ? 'bg-success' : 'bg-error'} rounded-sm transition-all duration-1000"
										style="height: {(candle.close - 90) * 2}px"
									></div>
								{/if}
							</div>
						{/each}
					</div>
					
					<!-- Mock indicators -->
					<div class="mt-4 flex justify-between text-xs text-muted">
						<span>9:00</span>
						<span>12:00</span>
						<span>15:00</span>
						<span>18:00</span>
						<span>21:00</span>
					</div>
				</div>

				<!-- Floating elements -->
				<div class="absolute -top-4 -right-4 bg-accent text-secondary px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
					Live Data
				</div>
				
				<div class="absolute -bottom-4 -left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
					Real-time
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.6s ease-out forwards;
	}
</style>
