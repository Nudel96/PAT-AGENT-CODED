<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface Trade {
		id: string;
		instrument: string;
		side: 'buy' | 'sell';
		entry_price: number;
		exit_price?: number;
		quantity: number;
		stop_loss?: number;
		take_profit?: number;
		entry_time: string;
		exit_time?: string;
		strategy_tags: string[];
		emotions: string[];
		notes?: string;
		pnl?: number;
		status: 'open' | 'closed' | 'cancelled';
		created_at: string;
	}

	interface TradeAnalytics {
		total_trades: number;
		winning_trades: number;
		losing_trades: number;
		open_trades: number;
		win_rate: number;
		total_pnl: number;
		avg_pnl: number;
		best_trade: number;
		worst_trade: number;
		timeframe: string;
	}

	let trades: Trade[] = [];
	let analytics: TradeAnalytics | null = null;
	let isLoading = true;
	let showAddModal = false;
	let selectedTrade: Trade | null = null;
	let currentPage = 1;
	let totalPages = 1;
	let selectedTimeframe = '30d';
	let filterStatus = 'all';
	let filterInstrument = '';

	// New trade form
	let newTrade = {
		instrument: '',
		side: 'buy' as 'buy' | 'sell',
		entry_price: 0,
		quantity: 0,
		stop_loss: 0,
		take_profit: 0,
		entry_time: new Date().toISOString().slice(0, 16),
		strategy_tags: [] as string[],
		emotions: [] as string[],
		notes: ''
	};

	const commonInstruments = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP'];
	const strategyTags = ['Breakout', 'Reversal', 'Trend Following', 'Range Trading', 'News Trading', 'Scalping'];
	const emotionTags = ['Confident', 'Nervous', 'FOMO', 'Revenge', 'Disciplined', 'Impatient', 'Calm'];

	onMount(async () => {
		await loadTrades();
		await loadAnalytics();
	});

	async function loadTrades() {
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '20'
			});

			if (filterStatus !== 'all') params.append('status', filterStatus);
			if (filterInstrument) params.append('instrument', filterInstrument);

			const response = await fetch(`/api/trading?${params}`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					trades = data.data;
					totalPages = data.pagination.total_pages;
				}
			}
		} catch (error) {
			console.error('Failed to load trades:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadAnalytics() {
		try {
			const response = await fetch(`/api/trading/analytics/summary?timeframe=${selectedTimeframe}`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					analytics = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load analytics:', error);
		}
	}

	async function addTrade() {
		try {
			const response = await fetch('/api/trading', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(newTrade)
			});

			if (response.ok) {
				showAddModal = false;
				resetNewTrade();
				await loadTrades();
				await loadAnalytics();
			}
		} catch (error) {
			console.error('Failed to add trade:', error);
		}
	}

	async function closeTrade(trade: Trade, exitPrice: number) {
		try {
			const response = await fetch(`/api/trading/${trade.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({
					exit_price: exitPrice,
					exit_time: new Date().toISOString(),
					status: 'closed'
				})
			});

			if (response.ok) {
				await loadTrades();
				await loadAnalytics();
			}
		} catch (error) {
			console.error('Failed to close trade:', error);
		}
	}

	function resetNewTrade() {
		newTrade = {
			instrument: '',
			side: 'buy',
			entry_price: 0,
			quantity: 0,
			stop_loss: 0,
			take_profit: 0,
			entry_time: new Date().toISOString().slice(0, 16),
			strategy_tags: [],
			emotions: [],
			notes: ''
		};
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

	function toggleTag(tagArray: string[], tag: string) {
		const index = tagArray.indexOf(tag);
		if (index > -1) {
			tagArray.splice(index, 1);
		} else {
			tagArray.push(tag);
		}
		newTrade = { ...newTrade }; // Trigger reactivity
	}

	$: if (selectedTimeframe || filterStatus || filterInstrument) {
		currentPage = 1;
		loadTrades();
		loadAnalytics();
	}
</script>

<svelte:head>
	<title>Trading Journal - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Trading Journal</h1>
			<p class="text-muted">Track, analyze, and improve your trading performance</p>
		</div>
		<Button on:click={() => showAddModal = true}>
			Add Trade
		</Button>
	</div>

	<!-- Analytics cards -->
	{#if analytics}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Total Trades</p>
						<p class="text-2xl font-bold text-foreground">{analytics.total_trades}</p>
					</div>
					<div class="text-3xl">📊</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Win Rate</p>
						<p class="text-2xl font-bold text-foreground">{analytics.win_rate.toFixed(1)}%</p>
					</div>
					<div class="text-3xl">🎯</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Total P&L</p>
						<p class="text-2xl font-bold {analytics.total_pnl >= 0 ? 'text-success' : 'text-error'}">
							{formatCurrency(analytics.total_pnl)}
						</p>
					</div>
					<div class="text-3xl">{analytics.total_pnl >= 0 ? '📈' : '📉'}</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Avg P&L</p>
						<p class="text-2xl font-bold {analytics.avg_pnl >= 0 ? 'text-success' : 'text-error'}">
							{formatCurrency(analytics.avg_pnl)}
						</p>
					</div>
					<div class="text-3xl">📊</div>
				</div>
			</Card>
		</div>
	{/if}

	<!-- Filters -->
	<Card padding="md">
		<div class="flex flex-wrap items-center gap-4">
			<div>
				<label class="text-sm text-muted">Timeframe:</label>
				<select bind:value={selectedTimeframe} class="form-input ml-2">
					<option value="7d">7 Days</option>
					<option value="30d">30 Days</option>
					<option value="90d">90 Days</option>
					<option value="1y">1 Year</option>
				</select>
			</div>

			<div>
				<label class="text-sm text-muted">Status:</label>
				<select bind:value={filterStatus} class="form-input ml-2">
					<option value="all">All</option>
					<option value="open">Open</option>
					<option value="closed">Closed</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			<div>
				<label class="text-sm text-muted">Instrument:</label>
				<select bind:value={filterInstrument} class="form-input ml-2">
					<option value="">All</option>
					{#each commonInstruments as instrument}
						<option value={instrument}>{instrument}</option>
					{/each}
				</select>
			</div>
		</div>
	</Card>

	<!-- Trades table -->
	<Card>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-foreground">Trade History</h2>
			<div class="text-sm text-muted">
				Page {currentPage} of {totalPages}
			</div>
		</div>

		{#if isLoading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<div class="h-16 bg-border rounded animate-pulse"></div>
				{/each}
			</div>
		{:else if trades.length === 0}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">📝</div>
				<h3 class="text-lg font-medium text-foreground mb-2">No trades yet</h3>
				<p class="text-muted mb-4">Start logging your trades to track your performance</p>
				<Button on:click={() => showAddModal = true}>
					Add Your First Trade
				</Button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border">
							<th class="text-left py-3 text-foreground font-medium">Instrument</th>
							<th class="text-left py-3 text-foreground font-medium">Side</th>
							<th class="text-left py-3 text-foreground font-medium">Entry</th>
							<th class="text-left py-3 text-foreground font-medium">Exit</th>
							<th class="text-left py-3 text-foreground font-medium">Quantity</th>
							<th class="text-left py-3 text-foreground font-medium">P&L</th>
							<th class="text-left py-3 text-foreground font-medium">Status</th>
							<th class="text-left py-3 text-foreground font-medium">Date</th>
							<th class="text-left py-3 text-foreground font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each trades as trade}
							<tr class="border-b border-border hover:bg-surface">
								<td class="py-3 font-medium text-foreground">{trade.instrument}</td>
								<td class="py-3">
									<Badge variant={trade.side === 'buy' ? 'success' : 'error'} size="sm">
										{trade.side.toUpperCase()}
									</Badge>
								</td>
								<td class="py-3 text-foreground">{trade.entry_price.toFixed(5)}</td>
								<td class="py-3 text-foreground">
									{trade.exit_price ? trade.exit_price.toFixed(5) : '-'}
								</td>
								<td class="py-3 text-foreground">{trade.quantity}</td>
								<td class="py-3">
									{#if trade.pnl !== null && trade.pnl !== undefined}
										<span class="{trade.pnl >= 0 ? 'text-success' : 'text-error'}">
											{formatCurrency(trade.pnl)}
										</span>
									{:else}
										<span class="text-muted">-</span>
									{/if}
								</td>
								<td class="py-3">
									<Badge 
										variant={trade.status === 'closed' ? 'success' : trade.status === 'open' ? 'warning' : 'default'}
										size="sm"
									>
										{trade.status}
									</Badge>
								</td>
								<td class="py-3 text-muted text-sm">{formatDate(trade.entry_time)}</td>
								<td class="py-3">
									{#if trade.status === 'open'}
										<Button 
											size="sm" 
											variant="secondary"
											on:click={() => {
												const exitPrice = prompt('Enter exit price:');
												if (exitPrice) closeTrade(trade, parseFloat(exitPrice));
											}}
										>
											Close
										</Button>
									{:else}
										<Button 
											size="sm" 
											variant="ghost"
											on:click={() => selectedTrade = trade}
										>
											View
										</Button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-center space-x-2 mt-6">
					<Button 
						variant="secondary" 
						size="sm"
						disabled={currentPage === 1}
						on:click={() => { currentPage--; loadTrades(); }}
					>
						Previous
					</Button>
					<span class="text-sm text-muted">
						Page {currentPage} of {totalPages}
					</span>
					<Button 
						variant="secondary" 
						size="sm"
						disabled={currentPage === totalPages}
						on:click={() => { currentPage++; loadTrades(); }}
					>
						Next
					</Button>
				</div>
			{/if}
		{/if}
	</Card>
</div>

<!-- Add Trade Modal -->
<Modal bind:open={showAddModal} title="Add New Trade" size="lg">
	<form on:submit|preventDefault={addTrade} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="form-label">Instrument</label>
				<select bind:value={newTrade.instrument} class="form-input" required>
					<option value="">Select instrument</option>
					{#each commonInstruments as instrument}
						<option value={instrument}>{instrument}</option>
					{/each}
				</select>
			</div>

			<div>
				<label class="form-label">Side</label>
				<select bind:value={newTrade.side} class="form-input" required>
					<option value="buy">Buy</option>
					<option value="sell">Sell</option>
				</select>
			</div>

			<Input
				label="Entry Price"
				type="number"
				step="0.00001"
				bind:value={newTrade.entry_price}
				required
			/>

			<Input
				label="Quantity"
				type="number"
				step="0.01"
				bind:value={newTrade.quantity}
				required
			/>

			<Input
				label="Stop Loss"
				type="number"
				step="0.00001"
				bind:value={newTrade.stop_loss}
			/>

			<Input
				label="Take Profit"
				type="number"
				step="0.00001"
				bind:value={newTrade.take_profit}
			/>
		</div>

		<Input
			label="Entry Time"
			type="datetime-local"
			bind:value={newTrade.entry_time}
			required
		/>

		<!-- Strategy Tags -->
		<div>
			<label class="form-label">Strategy Tags</label>
			<div class="flex flex-wrap gap-2">
				{#each strategyTags as tag}
					<button
						type="button"
						class="px-3 py-1 text-sm rounded-full border transition-colors {
							newTrade.strategy_tags.includes(tag)
								? 'bg-primary text-white border-primary'
								: 'bg-background text-foreground border-border hover:border-primary'
						}"
						on:click={() => toggleTag(newTrade.strategy_tags, tag)}
					>
						{tag}
					</button>
				{/each}
			</div>
		</div>

		<!-- Emotion Tags -->
		<div>
			<label class="form-label">Emotions</label>
			<div class="flex flex-wrap gap-2">
				{#each emotionTags as emotion}
					<button
						type="button"
						class="px-3 py-1 text-sm rounded-full border transition-colors {
							newTrade.emotions.includes(emotion)
								? 'bg-accent text-secondary border-accent'
								: 'bg-background text-foreground border-border hover:border-accent'
						}"
						on:click={() => toggleTag(newTrade.emotions, emotion)}
					>
						{emotion}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<label class="form-label">Notes</label>
			<textarea
				bind:value={newTrade.notes}
				placeholder="Trade rationale, market conditions, etc..."
				class="form-input resize-none"
				rows="3"
			></textarea>
		</div>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => showAddModal = false}>
			Cancel
		</Button>
		<Button on:click={addTrade}>
			Add Trade
		</Button>
	</svelte:fragment>
</Modal>
