<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import { Activity, TrendingUp, Target, Award, BarChart, Users } from '$lib/components/icons';

	let stats = {
		totalTrades: 0,
		winRate: 0,
		totalPnL: 0,
		currentLevel: 1,
		xpProgress: 0
	};

	let recentTrades: any[] = [];
	let macroData: any[] = [];
	let isLoading = true;

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			// Simulate loading with realistic data
			await new Promise(resolve => setTimeout(resolve, 800));
			
			stats = {
				totalTrades: 247,
				winRate: 68.4,
				totalPnL: 12847.50,
				currentLevel: $auth.user?.level || 8,
				xpProgress: 73
			};

			recentTrades = [
				{
					id: '1',
					instrument: 'EURUSD',
					side: 'buy',
					entry_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
					pnl: 245.80,
					status: 'closed'
				},
				{
					id: '2',
					instrument: 'GBPUSD',
					side: 'sell',
					entry_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
					pnl: -123.45,
					status: 'closed'
				},
				{
					id: '3',
					instrument: 'USDJPY',
					side: 'buy',
					entry_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
					pnl: null,
					status: 'open'
				}
			];

			macroData = [
				{ currency: 'USD', heat_score: 3.2 },
				{ currency: 'EUR', heat_score: -1.8 },
				{ currency: 'GBP', heat_score: 2.1 },
				{ currency: 'JPY', heat_score: -2.4 },
				{ currency: 'AUD', heat_score: 1.5 },
				{ currency: 'CAD', heat_score: 0.8 },
				{ currency: 'CHF', heat_score: -0.3 },
				{ currency: 'NZD', heat_score: 1.9 }
			];

		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			isLoading = false;
		}
	}

	function getHeatScoreColor(score: number): string {
		const normalizedScore = (score + 5) / 10;
		
		if (normalizedScore <= 0.2) return 'text-red-500';
		if (normalizedScore <= 0.4) return 'text-orange-500';
		if (normalizedScore <= 0.6) return 'text-yellow-500';
		if (normalizedScore <= 0.8) return 'text-green-400';
		return 'text-green-500';
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(value);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Professional Dashboard - PriceActionTalk</title>
</svelte:head>

<div class="space-y-8">
	<!-- Professional welcome header -->
	<div class="relative">
		<div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl"></div>
		<div class="relative bg-surface-elevated rounded-2xl p-8 border border-border">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-foreground mb-2">
						Welcome back, {$auth.user?.username || 'Professional Trader'}
					</h1>
					<p class="text-muted text-lg">
						Your trading performance and market insights dashboard
					</p>
				</div>
				<div class="hidden sm:flex items-center gap-4">
					<div class="text-right">
						<div class="text-sm text-muted font-medium">Market Status</div>
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
							<span class="text-sm font-semibold text-success">Markets Open</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if isLoading}
		<!-- Professional loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each Array(4) as _}
				<div class="metric-card animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-3"></div>
					<div class="h-8 bg-border rounded w-3/4"></div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Professional metrics cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="metric-card">
				<div class="flex items-center justify-between mb-4">
					<div>
						<p class="text-sm font-medium text-muted uppercase tracking-wider">Total Trades</p>
						<p class="text-3xl font-bold text-foreground">{stats.totalTrades}</p>
						<p class="text-xs text-success font-medium">+12 this month</p>
					</div>
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
						<Activity class="text-primary" size={24} />
					</div>
				</div>
			</div>

			<div class="metric-card">
				<div class="flex items-center justify-between mb-4">
					<div>
						<p class="text-sm font-medium text-muted uppercase tracking-wider">Win Rate</p>
						<p class="text-3xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</p>
						<p class="text-xs text-success font-medium">+2.3% vs last month</p>
					</div>
					<div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
						<Target class="text-success" size={24} />
					</div>
				</div>
			</div>

			<div class="metric-card">
				<div class="flex items-center justify-between mb-4">
					<div>
						<p class="text-sm font-medium text-muted uppercase tracking-wider">Total P&L</p>
						<p class="text-3xl font-bold {stats.totalPnL >= 0 ? 'text-success' : 'text-error'}">
							{formatCurrency(stats.totalPnL)}
						</p>
						<p class="text-xs text-success font-medium">+8.7% this quarter</p>
					</div>
					<div class="w-12 h-12 bg-{stats.totalPnL >= 0 ? 'success' : 'error'}/10 rounded-xl flex items-center justify-center">
						<TrendingUp class="text-{stats.totalPnL >= 0 ? 'success' : 'error'}" size={24} />
					</div>
				</div>
			</div>

			<div class="metric-card">
				<div class="flex items-center justify-between mb-4">
					<div>
						<p class="text-sm font-medium text-muted uppercase tracking-wider">Level Progress</p>
						<div class="flex items-baseline gap-2">
							<span class="text-3xl font-bold text-foreground">Level {stats.currentLevel}</span>
						</div>
						<div class="flex items-center gap-2 mt-2">
							<div class="flex-1 bg-border rounded-full h-2">
								<div 
									class="bg-accent h-2 rounded-full transition-all duration-1000"
									style="width: {stats.xpProgress}%"
								></div>
							</div>
							<span class="text-xs text-muted font-medium">{stats.xpProgress}%</span>
						</div>
					</div>
					<div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
						<Award class="text-accent" size={24} />
					</div>
				</div>
			</div>
		</div>

		<!-- Professional main content grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Professional recent trades -->
			<div class="lg:col-span-2">
				<div class="card-elevated">
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
								<BookOpen class="text-primary" size={18} />
							</div>
							<h2 class="text-xl font-bold text-foreground">Recent Trading Activity</h2>
						</div>
						<a href="/app/journal" class="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
							View All Trades
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>

					{#if recentTrades.length === 0}
						<div class="text-center py-12">
							<div class="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<BookOpen class="text-muted" size={32} />
							</div>
							<h3 class="text-lg font-semibold text-foreground mb-2">No trades recorded</h3>
							<p class="text-muted mb-6">Start logging your trades to track performance</p>
							<a href="/app/journal" class="btn btn-primary font-semibold">
								Log First Trade
							</a>
						</div>
					{:else}
						<div class="space-y-3">
							{#each recentTrades as trade}
								<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-200">
									<div class="flex items-center gap-4">
										<div class="w-3 h-3 rounded-full {trade.side === 'buy' ? 'bg-success' : 'bg-error'}"></div>
										<div>
											<p class="font-bold text-foreground font-mono">{trade.instrument}</p>
											<p class="text-xs text-muted font-medium">{formatDate(trade.entry_time)}</p>
										</div>
									</div>
									<div class="text-right">
										<p class="font-bold {trade.pnl ? (trade.pnl >= 0 ? 'text-success' : 'text-error') : 'text-muted'}">
											{trade.pnl ? formatCurrency(trade.pnl) : 'Active'}
										</p>
										<p class="text-xs text-muted font-medium uppercase tracking-wider">{trade.status}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Professional macro bias overview -->
			<div class="card-elevated">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
							<BarChart class="text-warning" size={18} />
						</div>
						<h2 class="text-xl font-bold text-foreground">Market Bias</h2>
					</div>
					<a href="/app/bias" class="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
						Detailed Analysis
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</div>

				{#if macroData.length === 0}
					<div class="text-center py-8">
						<div class="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
							<BarChart class="text-muted" size={32} />
						</div>
						<p class="text-muted">Loading market analysis...</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each macroData as currency}
							<div class="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
								<div class="flex items-center gap-3">
									<span class="font-bold text-foreground font-mono">{currency.currency}</span>
									<div class="w-2 h-2 rounded-full {currency.heat_score > 1 ? 'bg-success' : currency.heat_score < -1 ? 'bg-error' : 'bg-warning'}"></div>
								</div>
								<div class="text-right">
									<span class="text-sm font-bold {getHeatScoreColor(currency.heat_score)}">
										{currency.heat_score > 0 ? '+' : ''}{currency.heat_score.toFixed(1)}
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Professional quick actions -->
		<div class="card-elevated">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
					<Target class="text-accent" size={18} />
				</div>
				<h2 class="text-xl font-bold text-foreground">Quick Actions</h2>
			</div>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<a href="/app/journal" class="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-200 text-center">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
						<BookOpen class="text-primary" size={24} />
					</div>
					<span class="text-sm font-semibold text-foreground">Log Trade</span>
				</a>
				<a href="/app/bias" class="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-200 text-center">
					<div class="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-warning/20 transition-colors">
						<TrendingUp class="text-warning" size={24} />
					</div>
					<span class="text-sm font-semibold text-foreground">Market Analysis</span>
				</a>
				<a href="/app/heatman" class="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-200 text-center">
					<div class="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-error/20 transition-colors">
						<BarChart class="text-error" size={24} />
					</div>
					<span class="text-sm font-semibold text-foreground">Currency Matrix</span>
				</a>
				<a href="/app/levels" class="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-200 text-center">
					<div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
						<GraduationCap class="text-accent" size={24} />
					</div>
					<span class="text-sm font-semibold text-foreground">Education</span>
				</a>
			</div>
		</div>
	{/if}
</div>