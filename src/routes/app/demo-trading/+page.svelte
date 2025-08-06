<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface DemoAccount {
		id: string;
		balance: number;
		equity: number;
		margin_used: number;
		free_margin: number;
		margin_level: number;
		total_pnl: number;
		daily_pnl: number;
		trade_count: number;
		win_rate: number;
		created_at: string;
	}

	interface DemoTrade {
		id: string;
		instrument: string;
		side: 'buy' | 'sell';
		volume: number;
		open_price: number;
		current_price: number;
		stop_loss?: number;
		take_profit?: number;
		swap: number;
		commission: number;
		pnl: number;
		opened_at: string;
		status: 'open' | 'closed';
	}

	interface MarketPrice {
		instrument: string;
		bid: number;
		ask: number;
		spread: number;
		change_24h: number;
		timestamp: string;
	}

	let demoAccount: DemoAccount | null = null;
	let demoTrades: DemoTrade[] = [];
	let marketPrices: MarketPrice[] = [];
	let isLoading = true;
	let showTradeModal = false;
	let ws: WebSocket | null = null;

	// New trade form
	let newTrade = {
		instrument: 'EURUSD',
		side: 'buy' as 'buy' | 'sell',
		volume: 0.01,
		stop_loss: 0,
		take_profit: 0,
		order_type: 'market' as 'market' | 'limit' | 'stop',
		limit_price: 0
	};

	const instruments = [
		'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
		'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY'
	];

	onMount(async () => {
		await loadDemoAccount();
		await loadDemoTrades();
		await loadMarketPrices();
		setupWebSocket();
	});

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	async function loadDemoAccount() {
		try {
			const response = await fetch('/api/demo/account', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					demoAccount = data.data;
				}
			} else if (response.status === 404) {
				// Create demo account if it doesn't exist
				await createDemoAccount();
			}
		} catch (error) {
			console.error('Failed to load demo account:', error);
		}
	}

	async function createDemoAccount() {
		try {
			const response = await fetch('/api/demo/account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({ initial_balance: 10000 })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					demoAccount = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to create demo account:', error);
		}
	}

	async function loadDemoTrades() {
		try {
			const response = await fetch('/api/demo/trades', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					demoTrades = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load demo trades:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadMarketPrices() {
		try {
			// Generate mock market prices
			marketPrices = instruments.map(instrument => ({
				instrument,
				bid: getRandomPrice(instrument),
				ask: 0,
				spread: 0,
				change_24h: (Math.random() - 0.5) * 2,
				timestamp: new Date().toISOString()
			}));

			// Calculate ask and spread
			marketPrices = marketPrices.map(price => ({
				...price,
				ask: price.bid + getSpread(price.instrument),
				spread: getSpread(price.instrument)
			}));

		} catch (error) {
			console.error('Failed to load market prices:', error);
		}
	}

	function getRandomPrice(instrument: string): number {
		const basePrices: { [key: string]: number } = {
			'EURUSD': 1.0892,
			'GBPUSD': 1.2734,
			'USDJPY': 149.85,
			'AUDUSD': 0.6543,
			'USDCAD': 1.3621,
			'USDCHF': 0.8934,
			'NZDUSD': 0.5987,
			'EURGBP': 0.8556,
			'EURJPY': 163.21,
			'GBPJPY': 190.87,
			'AUDJPY': 98.12,
			'CADJPY': 110.03,
			'CHFJPY': 167.78
		};

		const basePrice = basePrices[instrument] || 1.0000;
		const variation = (Math.random() - 0.5) * 0.01;
		return basePrice + variation;
	}

	function getSpread(instrument: string): number {
		const spreads: { [key: string]: number } = {
			'EURUSD': 0.00015,
			'GBPUSD': 0.00020,
			'USDJPY': 0.015,
			'AUDUSD': 0.00018,
			'USDCAD': 0.00022,
			'USDCHF': 0.00025,
			'NZDUSD': 0.00030
		};

		return spreads[instrument] || 0.00020;
	}

	async function placeTrade() {
		try {
			const response = await fetch('/api/demo/trades', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(newTrade)
			});

			if (response.ok) {
				showTradeModal = false;
				resetNewTrade();
				await loadDemoTrades();
				await loadDemoAccount();
			}
		} catch (error) {
			console.error('Failed to place trade:', error);
		}
	}

	async function closeTrade(tradeId: string) {
		try {
			const response = await fetch(`/api/demo/trades/${tradeId}/close`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				await loadDemoTrades();
				await loadDemoAccount();
			}
		} catch (error) {
			console.error('Failed to close trade:', error);
		}
	}

	async function resetDemoAccount() {
		if (confirm('Are you sure you want to reset your demo account? This will close all trades and reset your balance to $10,000.')) {
			try {
				const response = await fetch('/api/demo/account/reset', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${$auth.token}`
					}
				});

				if (response.ok) {
					await loadDemoAccount();
					await loadDemoTrades();
				}
			} catch (error) {
				console.error('Failed to reset demo account:', error);
			}
		}
	}

	function setupWebSocket() {
		const wsUrl = `ws://localhost:3002`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('Demo trading WebSocket connected');
			ws?.send(JSON.stringify({
				type: 'auth',
				payload: { token: $auth.token }
			}));
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			
			if (message.type === 'auth_success') {
				ws?.send(JSON.stringify({
					type: 'subscribe_prices',
					payload: { symbols: instruments }
				}));
			} else if (message.type === 'price_update') {
				// Update market prices
				const update = message.payload;
				marketPrices = marketPrices.map(price => 
					price.instrument === update.symbol 
						? { ...price, bid: update.price, ask: update.price + price.spread }
						: price
				);

				// Update open trades P&L
				demoTrades = demoTrades.map(trade => {
					if (trade.status === 'open' && trade.instrument === update.symbol) {
						const currentPrice = trade.side === 'buy' ? update.price : update.price + getSpread(trade.instrument);
						const pnl = calculatePnL(trade, currentPrice);
						return { ...trade, current_price: currentPrice, pnl };
					}
					return trade;
				});
			}
		};

		ws.onerror = (error) => {
			console.error('Demo trading WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('Demo trading WebSocket disconnected');
			setTimeout(setupWebSocket, 5000);
		};
	}

	function calculatePnL(trade: DemoTrade, currentPrice: number): number {
		const priceDiff = trade.side === 'buy' 
			? currentPrice - trade.open_price 
			: trade.open_price - currentPrice;
		
		const pipValue = trade.instrument.includes('JPY') ? 0.01 : 0.0001;
		const pips = priceDiff / pipValue;
		
		// Simplified P&L calculation (assuming $10 per pip per lot)
		return pips * 10 * trade.volume - trade.commission - trade.swap;
	}

	function resetNewTrade() {
		newTrade = {
			instrument: 'EURUSD',
			side: 'buy',
			volume: 0.01,
			stop_loss: 0,
			take_profit: 0,
			order_type: 'market',
			limit_price: 0
		};
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(value);
	}

	function formatPrice(instrument: string, price: number): string {
		const decimals = instrument.includes('JPY') ? 3 : 5;
		return price.toFixed(decimals);
	}

	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	function getMarketPrice(instrument: string): MarketPrice | undefined {
		return marketPrices.find(p => p.instrument === instrument);
	}

	$: openTrades = demoTrades.filter(t => t.status === 'open');
	$: totalPnL = openTrades.reduce((sum, trade) => sum + trade.pnl, 0);
</script>

<svelte:head>
	<title>Demo Trading - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Demo Trading</h1>
			<p class="text-muted">Practice trading with virtual money in real market conditions</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="secondary" on:click={resetDemoAccount}>
				Reset Account
			</Button>
			<Button on:click={() => showTradeModal = true}>
				New Trade
			</Button>
		</div>
	</div>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(4) as _}
				<Card class="animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4"></div>
				</Card>
			{/each}
		</div>
	{:else if !demoAccount}
		<!-- No demo account -->
		<Card>
			<div class="text-center py-12">
				<div class="text-4xl mb-4">🎯</div>
				<h3 class="text-lg font-medium text-foreground mb-2">Create Demo Account</h3>
				<p class="text-muted mb-4">Start practicing with $10,000 virtual money</p>
				<Button on:click={createDemoAccount}>
					Create Demo Account
				</Button>
			</div>
		</Card>
	{:else}
		<!-- Account overview -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Balance</p>
						<p class="text-2xl font-bold text-foreground">{formatCurrency(demoAccount.balance)}</p>
					</div>
					<div class="text-3xl">💰</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Equity</p>
						<p class="text-2xl font-bold text-foreground">{formatCurrency(demoAccount.equity)}</p>
					</div>
					<div class="text-3xl">📊</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Daily P&L</p>
						<p class="text-2xl font-bold {demoAccount.daily_pnl >= 0 ? 'text-success' : 'text-error'}">
							{formatCurrency(demoAccount.daily_pnl)}
						</p>
					</div>
					<div class="text-3xl">{demoAccount.daily_pnl >= 0 ? '📈' : '📉'}</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Win Rate</p>
						<p class="text-2xl font-bold text-foreground">{demoAccount.win_rate.toFixed(1)}%</p>
					</div>
					<div class="text-3xl">🎯</div>
				</div>
			</Card>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Open trades -->
			<div class="lg:col-span-2">
				<Card>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-foreground">Open Positions</h2>
						<Badge variant="default">
							{openTrades.length} open
						</Badge>
					</div>

					{#if openTrades.length === 0}
						<div class="text-center py-8">
							<div class="text-4xl mb-2">📊</div>
							<p class="text-muted">No open positions</p>
							<Button class="mt-4" on:click={() => showTradeModal = true}>
								Open First Trade
							</Button>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr class="border-b border-border">
										<th class="text-left py-2 text-foreground font-medium">Symbol</th>
										<th class="text-left py-2 text-foreground font-medium">Side</th>
										<th class="text-left py-2 text-foreground font-medium">Volume</th>
										<th class="text-left py-2 text-foreground font-medium">Open Price</th>
										<th class="text-left py-2 text-foreground font-medium">Current</th>
										<th class="text-left py-2 text-foreground font-medium">P&L</th>
										<th class="text-left py-2 text-foreground font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each openTrades as trade}
										<tr class="border-b border-border hover:bg-surface">
											<td class="py-2 font-medium text-foreground">{trade.instrument}</td>
											<td class="py-2">
												<Badge variant={trade.side === 'buy' ? 'success' : 'error'} size="sm">
													{trade.side.toUpperCase()}
												</Badge>
											</td>
											<td class="py-2 text-foreground">{trade.volume}</td>
											<td class="py-2 text-foreground">{formatPrice(trade.instrument, trade.open_price)}</td>
											<td class="py-2 text-foreground">{formatPrice(trade.instrument, trade.current_price)}</td>
											<td class="py-2">
												<span class="{trade.pnl >= 0 ? 'text-success' : 'text-error'}">
													{formatCurrency(trade.pnl)}
												</span>
											</td>
											<td class="py-2">
												<Button 
													size="sm" 
													variant="secondary"
													on:click={() => closeTrade(trade.id)}
												>
													Close
												</Button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<div class="mt-4 p-3 bg-background rounded-lg">
							<div class="flex justify-between items-center">
								<span class="text-muted">Total Floating P&L:</span>
								<span class="font-bold {totalPnL >= 0 ? 'text-success' : 'text-error'}">
									{formatCurrency(totalPnL)}
								</span>
							</div>
						</div>
					{/if}
				</Card>
			</div>

			<!-- Market prices -->
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Market Prices</h2>
				
				<div class="space-y-2">
					{#each marketPrices.slice(0, 8) as price}
						<div class="flex items-center justify-between p-2 bg-background rounded">
							<div>
								<span class="font-medium text-foreground">{price.instrument}</span>
								<div class="text-xs {price.change_24h >= 0 ? 'text-success' : 'text-error'}">
									{formatPercentage(price.change_24h)}
								</div>
							</div>
							<div class="text-right">
								<div class="text-sm">
									<span class="text-error">{formatPrice(price.instrument, price.bid)}</span>
									<span class="text-muted mx-1">/</span>
									<span class="text-success">{formatPrice(price.instrument, price.ask)}</span>
								</div>
								<div class="text-xs text-muted">
									{price.spread.toFixed(1)} spread
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		</div>
	{/if}
</div>

<!-- New Trade Modal -->
<Modal bind:open={showTradeModal} title="New Trade" size="md">
	<form on:submit|preventDefault={placeTrade} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="form-label">Instrument</label>
				<select bind:value={newTrade.instrument} class="form-input" required>
					{#each instruments as instrument}
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
				label="Volume (lots)"
				type="number"
				step="0.01"
				min="0.01"
				max="10"
				bind:value={newTrade.volume}
				required
			/>

			<div>
				<label class="form-label">Order Type</label>
				<select bind:value={newTrade.order_type} class="form-input">
					<option value="market">Market</option>
					<option value="limit">Limit</option>
					<option value="stop">Stop</option>
				</select>
			</div>

			{#if newTrade.order_type !== 'market'}
				<Input
					label="Limit Price"
					type="number"
					step="0.00001"
					bind:value={newTrade.limit_price}
				/>
			{/if}

			<Input
				label="Stop Loss (optional)"
				type="number"
				step="0.00001"
				bind:value={newTrade.stop_loss}
			/>

			<Input
				label="Take Profit (optional)"
				type="number"
				step="0.00001"
				bind:value={newTrade.take_profit}
			/>
		</div>

		<!-- Current market price -->
		{#if newTrade.instrument}
			{@const marketPrice = getMarketPrice(newTrade.instrument)}
			{#if marketPrice}
			<div class="p-3 bg-background rounded-lg">
				<div class="flex justify-between items-center">
					<span class="text-muted">Current Price:</span>
					<div class="text-right">
						<span class="text-error">{formatPrice(newTrade.instrument, marketPrice.bid)}</span>
						<span class="text-muted mx-1">/</span>
						<span class="text-success">{formatPrice(newTrade.instrument, marketPrice.ask)}</span>
					</div>
				</div>
			</div>
		{/if}
	{/if}
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => { showTradeModal = false; resetNewTrade(); }}>
			Cancel
		</Button>
		<Button on:click={placeTrade}>
			Place Trade
		</Button>
	</svelte:fragment>
</Modal>
