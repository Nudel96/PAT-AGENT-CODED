<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Badge from '$components/ui/Badge.svelte';

	interface CurrencyStrength {
		currency: string;
		strength: number;
		change_24h: number;
		cot_score: number;
		retail_sentiment: number;
		price_momentum: number;
		volume_score: number;
	}

	interface CurrencyPair {
		pair: string;
		base: string;
		quote: string;
		strength_diff: number;
		signal: string;
		confidence: number;
	}

	let currencyStrengths: CurrencyStrength[] = [];
	let currencyPairs: CurrencyPair[] = [];
	let selectedTimeframe = '1h';
	let isLoading = true;
	let lastUpdate = '';
	let ws: WebSocket | null = null;

	const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
	const timeframes = [
		{ value: '1h', label: '1 Hour' },
		{ value: '4h', label: '4 Hours' },
		{ value: '1d', label: '1 Day' },
		{ value: '1w', label: '1 Week' }
	];

	onMount(async () => {
		await loadHeatmapData();
		setupWebSocket();
	});

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	async function loadHeatmapData() {
		try {
			// Generate mock currency strength data
			currencyStrengths = currencies.map(currency => ({
				currency,
				strength: (Math.random() - 0.5) * 200, // -100 to +100
				change_24h: (Math.random() - 0.5) * 10, // -5% to +5%
				cot_score: Math.random() * 100,
				retail_sentiment: Math.random() * 100,
				price_momentum: Math.random() * 100,
				volume_score: Math.random() * 100
			}));

			// Generate currency pairs analysis
			currencyPairs = [];
			for (let i = 0; i < currencies.length; i++) {
				for (let j = i + 1; j < currencies.length; j++) {
					const base = currencies[i];
					const quote = currencies[j];
					const baseStrength = currencyStrengths.find(c => c.currency === base)?.strength || 0;
					const quoteStrength = currencyStrengths.find(c => c.currency === quote)?.strength || 0;
					const strengthDiff = baseStrength - quoteStrength;
					
					let signal = 'NEUTRAL';
					if (strengthDiff > 50) signal = 'STRONG_BUY';
					else if (strengthDiff > 20) signal = 'BUY';
					else if (strengthDiff < -50) signal = 'STRONG_SELL';
					else if (strengthDiff < -20) signal = 'SELL';

					currencyPairs.push({
						pair: `${base}${quote}`,
						base,
						quote,
						strength_diff: strengthDiff,
						signal,
						confidence: Math.abs(strengthDiff) / 100 * 100
					});
				}
			}

			// Sort by strength difference
			currencyPairs.sort((a, b) => Math.abs(b.strength_diff) - Math.abs(a.strength_diff));
			
			lastUpdate = new Date().toLocaleTimeString();
		} catch (error) {
			console.error('Failed to load heatmap data:', error);
		} finally {
			isLoading = false;
		}
	}

	function setupWebSocket() {
		const wsUrl = `ws://localhost:3002`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('Heatman WebSocket connected');
			ws?.send(JSON.stringify({
				type: 'auth',
				payload: { token: $auth.token }
			}));
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			
			if (message.type === 'auth_success') {
				ws?.send(JSON.stringify({
					type: 'subscribe_heatmap',
					payload: { currencies }
				}));
			} else if (message.type === 'heatmap_update') {
				// Update real-time strength data
				const update = message.payload;
				currencyStrengths = currencyStrengths.map(item => 
					item.currency === update.currency 
						? { ...item, strength: update.strength }
						: item
				);
				lastUpdate = new Date().toLocaleTimeString();
			}
		};

		ws.onerror = (error) => {
			console.error('Heatman WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('Heatman WebSocket disconnected');
			setTimeout(setupWebSocket, 5000);
		};
	}

	function getStrengthColor(strength: number): string {
		const normalized = (strength + 100) / 200; // Normalize -100 to +100 to 0-1
		
		if (normalized <= 0.2) return 'bg-red-500';
		if (normalized <= 0.4) return 'bg-orange-500';
		if (normalized <= 0.6) return 'bg-yellow-500';
		if (normalized <= 0.8) return 'bg-green-400';
		return 'bg-green-500';
	}

	function getStrengthTextColor(strength: number): string {
		const normalized = (strength + 100) / 200;
		
		if (normalized <= 0.2) return 'text-red-500';
		if (normalized <= 0.4) return 'text-orange-500';
		if (normalized <= 0.6) return 'text-yellow-600';
		if (normalized <= 0.8) return 'text-green-500';
		return 'text-green-600';
	}

	function getSignalBadgeVariant(signal: string): 'error' | 'warning' | 'default' | 'success' {
		if (signal.includes('SELL')) return 'error';
		if (signal.includes('BUY')) return 'success';
		return 'default';
	}

	function getSignalColor(signal: string): string {
		if (signal === 'STRONG_BUY') return 'text-green-600';
		if (signal === 'BUY') return 'text-green-500';
		if (signal === 'STRONG_SELL') return 'text-red-600';
		if (signal === 'SELL') return 'text-red-500';
		return 'text-muted';
	}

	$: if (selectedTimeframe) {
		loadHeatmapData();
	}
</script>

<svelte:head>
	<title>Heatman - Currency Strength - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Heatman Widget</h1>
			<p class="text-muted">Real-time currency strength heatmap and pair analysis</p>
		</div>
		<div class="flex items-center space-x-4">
			<select bind:value={selectedTimeframe} class="form-input w-auto">
				{#each timeframes as tf}
					<option value={tf.value}>{tf.label}</option>
				{/each}
			</select>
			{#if lastUpdate}
				<span class="text-sm text-muted">Updated: {lastUpdate}</span>
			{/if}
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
		<!-- Currency strength heatmap -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Currency Strength Matrix</h2>
			
			<div class="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
				{#each currencyStrengths.sort((a, b) => b.strength - a.strength) as currency}
					<div class="text-center p-3 rounded-lg {getStrengthColor(currency.strength)}">
						<div class="text-white font-bold text-lg">{currency.currency}</div>
						<div class="text-white text-sm">{currency.strength.toFixed(0)}</div>
					</div>
				{/each}
			</div>

			<!-- Strength details -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{#each currencyStrengths.sort((a, b) => b.strength - a.strength) as currency}
					<div class="p-4 bg-background rounded-lg">
						<div class="flex items-center justify-between mb-3">
							<h3 class="text-lg font-semibold text-foreground">{currency.currency}</h3>
							<span class="text-sm font-bold {getStrengthTextColor(currency.strength)}">
								{currency.strength.toFixed(1)}
							</span>
						</div>
						
						<div class="space-y-2 text-xs">
							<div class="flex justify-between">
								<span class="text-muted">24h Change:</span>
								<span class="{currency.change_24h >= 0 ? 'text-success' : 'text-error'}">
									{currency.change_24h >= 0 ? '+' : ''}{currency.change_24h.toFixed(2)}%
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted">COT:</span>
								<span class="text-foreground">{currency.cot_score.toFixed(0)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted">Retail:</span>
								<span class="text-foreground">{currency.retail_sentiment.toFixed(0)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted">Momentum:</span>
								<span class="text-foreground">{currency.price_momentum.toFixed(0)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<!-- Top currency pairs -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Strongest Pairs</h2>
				
				<div class="space-y-3">
					{#each currencyPairs.filter(p => p.strength_diff > 0).slice(0, 8) as pair}
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<div class="flex items-center space-x-3">
								<div class="text-sm font-medium text-foreground">{pair.pair}</div>
								<Badge variant={getSignalBadgeVariant(pair.signal)} size="sm">
									{pair.signal}
								</Badge>
							</div>
							<div class="text-right">
								<div class="text-sm font-bold text-success">
									+{pair.strength_diff.toFixed(1)}
								</div>
								<div class="text-xs text-muted">
									{pair.confidence.toFixed(0)}% confidence
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card>

			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Weakest Pairs</h2>
				
				<div class="space-y-3">
					{#each currencyPairs.filter(p => p.strength_diff < 0).slice(0, 8) as pair}
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<div class="flex items-center space-x-3">
								<div class="text-sm font-medium text-foreground">{pair.pair}</div>
								<Badge variant={getSignalBadgeVariant(pair.signal)} size="sm">
									{pair.signal}
								</Badge>
							</div>
							<div class="text-right">
								<div class="text-sm font-bold text-error">
									{pair.strength_diff.toFixed(1)}
								</div>
								<div class="text-xs text-muted">
									{pair.confidence.toFixed(0)}% confidence
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		<!-- Trading opportunities -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Trading Opportunities</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each currencyPairs.filter(p => Math.abs(p.strength_diff) > 30 && p.confidence > 60).slice(0, 6) as opportunity}
					<div class="p-4 bg-background rounded-lg border-l-4 {opportunity.strength_diff > 0 ? 'border-success' : 'border-error'}">
						<div class="flex items-center justify-between mb-2">
							<span class="font-bold text-foreground">{opportunity.pair}</span>
							<Badge variant={getSignalBadgeVariant(opportunity.signal)}>
								{opportunity.signal}
							</Badge>
						</div>
						
						<div class="space-y-1 text-sm">
							<div class="flex justify-between">
								<span class="text-muted">Strength Diff:</span>
								<span class="{opportunity.strength_diff > 0 ? 'text-success' : 'text-error'}">
									{opportunity.strength_diff.toFixed(1)}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted">Confidence:</span>
								<span class="text-foreground">{opportunity.confidence.toFixed(0)}%</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted">Direction:</span>
								<span class="{getSignalColor(opportunity.signal)}">
									{opportunity.strength_diff > 0 ? 'Long' : 'Short'}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if currencyPairs.filter(p => Math.abs(p.strength_diff) > 30 && p.confidence > 60).length === 0}
				<div class="text-center py-8">
					<div class="text-4xl mb-2">🔍</div>
					<p class="text-muted">No high-confidence opportunities detected</p>
					<p class="text-xs text-muted mt-1">Opportunities appear with >30 strength difference and >60% confidence</p>
				</div>
			{/if}
		</Card>

		<!-- Correlation matrix -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Currency Correlation Matrix</h2>
			
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr>
							<th class="text-left p-2 text-foreground font-medium"></th>
							{#each currencies as currency}
								<th class="text-center p-2 text-foreground font-medium">{currency}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each currencies as baseCurrency}
							<tr>
								<td class="p-2 font-medium text-foreground">{baseCurrency}</td>
								{#each currencies as quoteCurrency}
									{@const correlation = baseCurrency === quoteCurrency ? 1.0 : (Math.random() - 0.5) * 2}
									<td class="text-center p-2">
										<span class="text-xs {correlation > 0.5 ? 'text-success' : correlation < -0.5 ? 'text-error' : 'text-muted'}">
											{correlation.toFixed(2)}
										</span>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
</div>
