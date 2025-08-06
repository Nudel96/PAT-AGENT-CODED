<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Badge from '$components/ui/Badge.svelte';

	interface MacroBias {
		id: string;
		currency: string;
		heat_score: number;
		cot_score: number;
		retail_sentiment_score: number;
		price_momentum_score: number;
		macro_surprise_score: number;
		factors: any;
		timestamp: string;
	}

	let macroData: MacroBias[] = [];
	let selectedCurrency = 'USD';
	let historicalData: MacroBias[] = [];
	let isLoading = true;
	let lastUpdate = '';
	let ws: WebSocket | null = null;

	const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

	onMount(async () => {
		await loadMacroData();
		await loadHistoricalData();
		setupWebSocket();
	});

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	async function loadMacroData() {
		try {
			const response = await fetch('/api/macro/bias', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					macroData = data.data;
					lastUpdate = new Date().toLocaleTimeString();
				}
			}
		} catch (error) {
			console.error('Failed to load macro data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadHistoricalData() {
		try {
			const response = await fetch(`/api/macro/bias/history?currency=${selectedCurrency}&timeframe=24h`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					historicalData = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load historical data:', error);
		}
	}

	function setupWebSocket() {
		const wsUrl = `ws://localhost:3002`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('WebSocket connected');
			// Authenticate
			ws?.send(JSON.stringify({
				type: 'auth',
				payload: { token: $auth.token }
			}));
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			
			if (message.type === 'auth_success') {
				// Subscribe to macro updates
				ws?.send(JSON.stringify({
					type: 'subscribe_macro',
					payload: { currencies }
				}));
			} else if (message.type === 'macro_update') {
				// Update real-time data
				const update = message.payload;
				macroData = macroData.map(item => 
					item.currency === update.currency 
						? { ...item, heat_score: update.heat_score, timestamp: update.timestamp }
						: item
				);
				lastUpdate = new Date().toLocaleTimeString();
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('WebSocket disconnected');
			// Attempt to reconnect after 5 seconds
			setTimeout(setupWebSocket, 5000);
		};
	}

	function getHeatScoreColor(score: number): string {
		const normalizedScore = (score + 5) / 10;
		
		if (normalizedScore <= 0.2) return 'bg-red-500';
		if (normalizedScore <= 0.4) return 'bg-orange-500';
		if (normalizedScore <= 0.6) return 'bg-yellow-500';
		if (normalizedScore <= 0.8) return 'bg-green-400';
		return 'bg-green-500';
	}

	function getHeatScoreLabel(score: number): string {
		if (score <= -3) return 'Very Bearish';
		if (score <= -1) return 'Bearish';
		if (score <= 1) return 'Neutral';
		if (score <= 3) return 'Bullish';
		return 'Very Bullish';
	}

	function getBadgeVariant(score: number): 'error' | 'warning' | 'default' | 'success' {
		if (score <= -2) return 'error';
		if (score <= 0) return 'warning';
		if (score <= 2) return 'default';
		return 'success';
	}

	function handleCurrencyKeydown(event: Event, currency: string) {
		const keyEvent = event as KeyboardEvent;
		if (keyEvent.key === 'Enter') {
			selectedCurrency = currency;
		}
	}

	async function generateMockData() {
		try {
			const response = await fetch('/api/macro/bias/mock', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				await loadMacroData();
			}
		} catch (error) {
			console.error('Failed to generate mock data:', error);
		}
	}

	$: if (selectedCurrency) {
		loadHistoricalData();
	}
</script>

<svelte:head>
	<title>Macro Bias - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Macro Bias Tool</h1>
			<p class="text-muted">AI-driven bias scoring from -5 (bearish) to +5 (bullish)</p>
		</div>
		<div class="flex items-center space-x-4">
			{#if lastUpdate}
				<span class="text-sm text-muted">Last update: {lastUpdate}</span>
			{/if}
			<button on:click={generateMockData} class="btn btn-secondary text-sm">
				Generate Mock Data
			</button>
		</div>
	</div>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(8) as _}
				<Card class="animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4 mb-2"></div>
					<div class="h-3 bg-border rounded w-full"></div>
				</Card>
			{/each}
		</div>
	{:else}
		<!-- Currency bias cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each macroData as currency}
				<Card
					hover
					class="cursor-pointer"
					on:click={() => selectedCurrency = currency.currency}
					role="button"
					tabindex="0"
					on:keydown={(e) => handleCurrencyKeydown(e, currency.currency)}
				>
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-lg font-semibold text-foreground">{currency.currency}</h3>
						<div class="w-4 h-4 rounded-full {getHeatScoreColor(currency.heat_score)}"></div>
					</div>
					
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted">Heat Score</span>
							<Badge variant={getBadgeVariant(currency.heat_score)}>
								{currency.heat_score.toFixed(1)}
							</Badge>
						</div>
						
						<div class="text-xs text-muted">
							{getHeatScoreLabel(currency.heat_score)}
						</div>
						
						<!-- Score breakdown -->
						<div class="pt-2 border-t border-border">
							<div class="grid grid-cols-2 gap-1 text-xs">
								<div class="flex justify-between">
									<span class="text-muted">COT:</span>
									<span class="text-foreground">{currency.cot_score.toFixed(0)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted">Retail:</span>
									<span class="text-foreground">{currency.retail_sentiment_score.toFixed(0)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted">Momentum:</span>
									<span class="text-foreground">{currency.price_momentum_score.toFixed(0)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted">Macro:</span>
									<span class="text-foreground">{currency.macro_surprise_score.toFixed(0)}</span>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Detailed analysis -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Currency selector and details -->
			<div class="lg:col-span-2">
				<Card>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-foreground">Detailed Analysis</h2>
						<select 
							bind:value={selectedCurrency} 
							class="form-input w-auto"
						>
							{#each currencies as currency}
								<option value={currency}>{currency}</option>
							{/each}
						</select>
					</div>

					{#if selectedCurrency}
						{@const currencyData = macroData.find(c => c.currency === selectedCurrency)}
						{#if currencyData}
							<div class="space-y-4">
								<!-- Overall bias -->
								<div class="flex items-center justify-between p-4 bg-background rounded-lg">
									<div>
										<h3 class="font-medium text-foreground">{selectedCurrency} Overall Bias</h3>
										<p class="text-sm text-muted">{getHeatScoreLabel(currencyData.heat_score)}</p>
									</div>
									<div class="text-right">
										<div class="text-2xl font-bold text-foreground">{currencyData.heat_score.toFixed(1)}</div>
										<div class="w-6 h-6 rounded-full {getHeatScoreColor(currencyData.heat_score)} mx-auto"></div>
									</div>
								</div>

								<!-- Factor breakdown -->
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div class="p-3 bg-background rounded-lg">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-medium text-foreground">COT Positioning</span>
											<span class="text-sm text-foreground">{currencyData.cot_score.toFixed(1)}</span>
										</div>
										<div class="w-full bg-border rounded-full h-2">
											<div 
												class="bg-primary h-2 rounded-full transition-all duration-300"
												style="width: {currencyData.cot_score}%"
											></div>
										</div>
									</div>

									<div class="p-3 bg-background rounded-lg">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-medium text-foreground">Retail Sentiment</span>
											<span class="text-sm text-foreground">{currencyData.retail_sentiment_score.toFixed(1)}</span>
										</div>
										<div class="w-full bg-border rounded-full h-2">
											<div 
												class="bg-accent h-2 rounded-full transition-all duration-300"
												style="width: {currencyData.retail_sentiment_score}%"
											></div>
										</div>
									</div>

									<div class="p-3 bg-background rounded-lg">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-medium text-foreground">Price Momentum</span>
											<span class="text-sm text-foreground">{currencyData.price_momentum_score.toFixed(1)}</span>
										</div>
										<div class="w-full bg-border rounded-full h-2">
											<div 
												class="bg-success h-2 rounded-full transition-all duration-300"
												style="width: {currencyData.price_momentum_score}%"
											></div>
										</div>
									</div>

									<div class="p-3 bg-background rounded-lg">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-medium text-foreground">Macro Surprise</span>
											<span class="text-sm text-foreground">{currencyData.macro_surprise_score.toFixed(1)}</span>
										</div>
										<div class="w-full bg-border rounded-full h-2">
											<div 
												class="bg-warning h-2 rounded-full transition-all duration-300"
												style="width: {currencyData.macro_surprise_score}%"
											></div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					{/if}
				</Card>
			</div>

			<!-- Historical chart placeholder -->
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">24h History</h2>
				
				{#if historicalData.length > 0}
					<div class="space-y-2">
						{#each historicalData.slice(0, 10) as point}
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted">
									{new Date(point.timestamp).toLocaleTimeString()}
								</span>
								<div class="flex items-center space-x-2">
									<span class="text-foreground">{point.heat_score.toFixed(1)}</span>
									<div class="w-2 h-2 rounded-full {getHeatScoreColor(point.heat_score)}"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<div class="text-4xl mb-2">📊</div>
						<p class="text-muted">No historical data available</p>
					</div>
				{/if}
			</Card>
		</div>

		<!-- Trading signals -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Trading Signals</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each macroData.filter(c => Math.abs(c.heat_score) > 2) as signal}
					<div class="p-4 bg-background rounded-lg border-l-4 {signal.heat_score > 0 ? 'border-success' : 'border-error'}">
						<div class="flex items-center justify-between mb-2">
							<span class="font-medium text-foreground">{signal.currency}</span>
							<Badge variant={getBadgeVariant(signal.heat_score)}>
								{signal.heat_score > 0 ? 'BUY' : 'SELL'}
							</Badge>
						</div>
						<p class="text-sm text-muted">
							{signal.heat_score > 0 ? 'Strong bullish' : 'Strong bearish'} bias detected
						</p>
						<p class="text-xs text-muted mt-1">
							Score: {signal.heat_score.toFixed(1)}
						</p>
					</div>
				{/each}
			</div>

			{#if macroData.filter(c => Math.abs(c.heat_score) > 2).length === 0}
				<div class="text-center py-8">
					<div class="text-4xl mb-2">🎯</div>
					<p class="text-muted">No strong signals detected</p>
					<p class="text-xs text-muted mt-1">Signals appear when bias score > ±2.0</p>
				</div>
			{/if}
		</Card>
	{/if}
</div>
