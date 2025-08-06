<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';

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
			// Load user stats
			const statsResponse = await fetch('/api/users/stats', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (statsResponse.ok) {
				const statsData = await statsResponse.json();
				if (statsData.success) {
					stats = {
						totalTrades: statsData.data.trading.total_trades,
						winRate: statsData.data.trading.win_rate,
						totalPnL: statsData.data.trading.total_pnl,
						currentLevel: $auth.user?.level || 1,
						xpProgress: 75 // Mock progress to next level
					};
				}
			}

			// Load recent trades
			const tradesResponse = await fetch('/api/trading?limit=5', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (tradesResponse.ok) {
				const tradesData = await tradesResponse.json();
				if (tradesData.success) {
					recentTrades = tradesData.data;
				}
			}

			// Load macro data
			const macroResponse = await fetch('/api/macro/bias', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (macroResponse.ok) {
				const macroDataResponse = await macroResponse.json();
				if (macroDataResponse.success) {
					macroData = macroDataResponse.data.slice(0, 8); // Show top 8 currencies
				}
			}

		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			isLoading = false;
		}
	}

	function getHeatScoreColor(score: number): string {
		const normalizedScore = (score + 5) / 10; // Normalize -5 to +5 range to 0-1
		
		if (normalizedScore <= 0.2) return 'bg-red-500';
		if (normalizedScore <= 0.4) return 'bg-orange-500';
		if (normalizedScore <= 0.6) return 'bg-yellow-500';
		if (normalizedScore <= 0.8) return 'bg-green-400';
		return 'bg-green-500';
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
	<title>Dashboard - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome header -->
	<div class="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
		<h1 class="text-2xl font-bold mb-2">
			Welcome back, {$auth.user?.username || 'Trader'}! 👋
		</h1>
		<p class="opacity-90">
			Ready to master the markets today? Check your latest performance and market insights below.
		</p>
	</div>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each Array(4) as _}
				<div class="card animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4"></div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Stats cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Total Trades</p>
						<p class="text-2xl font-bold text-foreground">{stats.totalTrades}</p>
					</div>
					<div class="text-3xl">📊</div>
				</div>
			</div>

			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Win Rate</p>
						<p class="text-2xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</p>
					</div>
					<div class="text-3xl">🎯</div>
				</div>
			</div>

			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Total P&L</p>
						<p class="text-2xl font-bold {stats.totalPnL >= 0 ? 'text-success' : 'text-error'}">
							{formatCurrency(stats.totalPnL)}
						</p>
					</div>
					<div class="text-3xl">{stats.totalPnL >= 0 ? '📈' : '📉'}</div>
				</div>
			</div>

			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Level {stats.currentLevel}</p>
						<div class="flex items-center space-x-2 mt-1">
							<div class="flex-1 bg-border rounded-full h-2">
								<div 
									class="bg-accent h-2 rounded-full transition-all duration-300"
									style="width: {stats.xpProgress}%"
								></div>
							</div>
							<span class="text-xs text-muted">{stats.xpProgress}%</span>
						</div>
					</div>
					<div class="text-3xl">🎓</div>
				</div>
			</div>
		</div>

		<!-- Main content grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Recent trades -->
			<div class="lg:col-span-2">
				<div class="card">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-foreground">Recent Trades</h2>
						<a href="/app/journal" class="text-primary hover:text-primary/80 text-sm">
							View all →
						</a>
					</div>

					{#if recentTrades.length === 0}
						<div class="text-center py-8">
							<div class="text-4xl mb-2">📝</div>
							<p class="text-muted">No trades yet</p>
							<a href="/app/journal" class="btn btn-primary mt-4">
								Log your first trade
							</a>
						</div>
					{:else}
						<div class="space-y-3">
							{#each recentTrades as trade}
								<div class="flex items-center justify-between p-3 bg-background rounded-lg">
									<div class="flex items-center space-x-3">
										<div class="w-2 h-2 rounded-full {trade.side === 'buy' ? 'bg-success' : 'bg-error'}"></div>
										<div>
											<p class="font-medium text-foreground">{trade.instrument}</p>
											<p class="text-xs text-muted">{formatDate(trade.entry_time)}</p>
										</div>
									</div>
									<div class="text-right">
										<p class="font-medium {trade.pnl >= 0 ? 'text-success' : 'text-error'}">
											{trade.pnl ? formatCurrency(trade.pnl) : 'Open'}
										</p>
										<p class="text-xs text-muted capitalize">{trade.status}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Macro bias overview -->
			<div class="card">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground">Macro Bias</h2>
					<a href="/app/bias" class="text-primary hover:text-primary/80 text-sm">
						View details →
					</a>
				</div>

				{#if macroData.length === 0}
					<div class="text-center py-8">
						<div class="text-4xl mb-2">🎯</div>
						<p class="text-muted">Loading macro data...</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each macroData as currency}
							<div class="flex items-center justify-between">
								<span class="font-medium text-foreground">{currency.currency}</span>
								<div class="flex items-center space-x-2">
									<span class="text-sm text-muted">{currency.heat_score.toFixed(1)}</span>
									<div class="w-3 h-3 rounded-full {getHeatScoreColor(currency.heat_score)}"></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Quick actions -->
		<div class="card">
			<h2 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<a href="/app/journal" class="btn btn-secondary flex flex-col items-center p-4">
					<span class="text-2xl mb-2">📝</span>
					<span class="text-sm">Log Trade</span>
				</a>
				<a href="/app/bias" class="btn btn-secondary flex flex-col items-center p-4">
					<span class="text-2xl mb-2">🎯</span>
					<span class="text-sm">Check Bias</span>
				</a>
				<a href="/app/heatman" class="btn btn-secondary flex flex-col items-center p-4">
					<span class="text-2xl mb-2">🔥</span>
					<span class="text-sm">Heatmap</span>
				</a>
				<a href="/app/levels" class="btn btn-secondary flex flex-col items-center p-4">
					<span class="text-2xl mb-2">🎓</span>
					<span class="text-sm">Learn</span>
				</a>
			</div>
		</div>
	{/if}
</div>
