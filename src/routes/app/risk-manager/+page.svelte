<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface RiskSettings {
		max_risk_per_trade: number;
		max_daily_loss: number;
		max_weekly_loss: number;
		max_monthly_loss: number;
		max_open_trades: number;
		max_correlation_exposure: number;
		trading_enabled: boolean;
		auto_close_enabled: boolean;
		emergency_stop_enabled: boolean;
	}

	interface RiskMetrics {
		current_risk: number;
		daily_pnl: number;
		weekly_pnl: number;
		monthly_pnl: number;
		open_trades_count: number;
		portfolio_heat: number;
		max_drawdown: number;
		risk_score: number;
	}

	interface TradeBlocker {
		id: string;
		reason: string;
		triggered_at: string;
		auto_resolve_at?: string;
		is_active: boolean;
		severity: 'warning' | 'critical';
	}

	let riskSettings: RiskSettings = {
		max_risk_per_trade: 2.0,
		max_daily_loss: 5.0,
		max_weekly_loss: 10.0,
		max_monthly_loss: 20.0,
		max_open_trades: 5,
		max_correlation_exposure: 15.0,
		trading_enabled: true,
		auto_close_enabled: false,
		emergency_stop_enabled: true
	};

	let riskMetrics: RiskMetrics = {
		current_risk: 0,
		daily_pnl: 0,
		weekly_pnl: 0,
		monthly_pnl: 0,
		open_trades_count: 0,
		portfolio_heat: 0,
		max_drawdown: 0,
		risk_score: 0
	};

	let tradeBlockers: TradeBlocker[] = [];
	let isLoading = true;
	let isSaving = false;
	let showCalculatorModal = false;
	let showEmergencyModal = false;

	// Position size calculator
	let calculator = {
		account_balance: 10000,
		risk_percentage: 2.0,
		entry_price: 0,
		stop_loss: 0,
		instrument: 'EURUSD',
		pip_value: 10 // USD per pip for 1 lot
	};

	let calculatedPosition = {
		position_size: 0,
		risk_amount: 0,
		pip_distance: 0,
		lot_size: 0
	};

	onMount(async () => {
		await loadRiskData();
	});

	async function loadRiskData() {
		try {
			// Load risk settings
			const settingsResponse = await fetch('/api/risk/settings', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (settingsResponse.ok) {
				const settingsData = await settingsResponse.json();
				if (settingsData.success && settingsData.data) {
					riskSettings = { ...riskSettings, ...settingsData.data };
				}
			}

			// Load risk metrics
			const metricsResponse = await fetch('/api/risk/metrics', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (metricsResponse.ok) {
				const metricsData = await metricsResponse.json();
				if (metricsData.success) {
					riskMetrics = metricsData.data;
				}
			}

			// Load trade blockers
			const blockersResponse = await fetch('/api/risk/blockers', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (blockersResponse.ok) {
				const blockersData = await blockersResponse.json();
				if (blockersData.success) {
					tradeBlockers = blockersData.data;
				}
			}

		} catch (error) {
			console.error('Failed to load risk data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function saveRiskSettings() {
		isSaving = true;
		try {
			const response = await fetch('/api/risk/settings', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(riskSettings)
			});

			if (response.ok) {
				// Refresh data
				await loadRiskData();
			}
		} catch (error) {
			console.error('Failed to save risk settings:', error);
		} finally {
			isSaving = false;
		}
	}

	async function emergencyStop() {
		try {
			const response = await fetch('/api/risk/emergency-stop', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				showEmergencyModal = false;
				await loadRiskData();
			}
		} catch (error) {
			console.error('Failed to trigger emergency stop:', error);
		}
	}

	async function resolveBlocker(blockerId: string) {
		try {
			const response = await fetch(`/api/risk/blockers/${blockerId}/resolve`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				await loadRiskData();
			}
		} catch (error) {
			console.error('Failed to resolve blocker:', error);
		}
	}

	function calculatePosition() {
		const riskAmount = (calculator.account_balance * calculator.risk_percentage) / 100;
		const pipDistance = Math.abs(calculator.entry_price - calculator.stop_loss);
		
		// Convert pip distance to actual pips (for 5-digit quotes)
		const actualPips = pipDistance * (calculator.instrument.includes('JPY') ? 100 : 10000);
		
		const positionSize = riskAmount / (actualPips * calculator.pip_value);
		const lotSize = positionSize / 100000; // Convert to lots

		calculatedPosition = {
			position_size: positionSize,
			risk_amount: riskAmount,
			pip_distance: actualPips,
			lot_size: lotSize
		};
	}

	function getRiskScoreColor(score: number): string {
		if (score <= 30) return 'text-success';
		if (score <= 60) return 'text-warning';
		return 'text-error';
	}

	function getRiskScoreLabel(score: number): string {
		if (score <= 30) return 'Low Risk';
		if (score <= 60) return 'Medium Risk';
		return 'High Risk';
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(value);
	}

	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	$: if (calculator.entry_price && calculator.stop_loss && calculator.account_balance) {
		calculatePosition();
	}
</script>

<svelte:head>
	<title>Risk Manager - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Risk Manager</h1>
			<p class="text-muted">Monitor and control your trading risk in real-time</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="secondary" on:click={() => showCalculatorModal = true}>
				Position Calculator
			</Button>
			<Button variant="danger" on:click={() => showEmergencyModal = true}>
				Emergency Stop
			</Button>
		</div>
	</div>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(8) as _}
				<Card class="animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4"></div>
				</Card>
			{/each}
		</div>
	{:else}
		<!-- Risk overview cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Risk Score</p>
						<p class="text-2xl font-bold {getRiskScoreColor(riskMetrics.risk_score)}">
							{riskMetrics.risk_score.toFixed(0)}
						</p>
						<p class="text-xs {getRiskScoreColor(riskMetrics.risk_score)}">
							{getRiskScoreLabel(riskMetrics.risk_score)}
						</p>
					</div>
					<div class="text-3xl">⚠️</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Portfolio Heat</p>
						<p class="text-2xl font-bold text-foreground">{riskMetrics.portfolio_heat.toFixed(1)}%</p>
						<p class="text-xs text-muted">of account at risk</p>
					</div>
					<div class="text-3xl">🔥</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Daily P&L</p>
						<p class="text-2xl font-bold {riskMetrics.daily_pnl >= 0 ? 'text-success' : 'text-error'}">
							{formatPercentage(riskMetrics.daily_pnl)}
						</p>
						<p class="text-xs text-muted">today's performance</p>
					</div>
					<div class="text-3xl">{riskMetrics.daily_pnl >= 0 ? '📈' : '📉'}</div>
				</div>
			</Card>

			<Card padding="md">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted">Open Trades</p>
						<p class="text-2xl font-bold text-foreground">
							{riskMetrics.open_trades_count}/{riskSettings.max_open_trades}
						</p>
						<p class="text-xs text-muted">active positions</p>
					</div>
					<div class="text-3xl">📊</div>
				</div>
			</Card>
		</div>

		<!-- Trade blockers -->
		{#if tradeBlockers.length > 0}
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Active Trade Blockers</h2>
				
				<div class="space-y-3">
					{#each tradeBlockers.filter(b => b.is_active) as blocker}
						<div class="p-4 bg-background rounded-lg border-l-4 {blocker.severity === 'critical' ? 'border-error' : 'border-warning'}">
							<div class="flex items-center justify-between">
								<div>
									<div class="flex items-center space-x-2 mb-1">
										<Badge variant={blocker.severity === 'critical' ? 'error' : 'warning'}>
											{blocker.severity.toUpperCase()}
										</Badge>
										<span class="text-sm text-muted">
											{new Date(blocker.triggered_at).toLocaleString()}
										</span>
									</div>
									<p class="font-medium text-foreground">{blocker.reason}</p>
									{#if blocker.auto_resolve_at}
										<p class="text-xs text-muted mt-1">
											Auto-resolves at {new Date(blocker.auto_resolve_at).toLocaleString()}
										</p>
									{/if}
								</div>
								<Button 
									size="sm" 
									variant="secondary"
									on:click={() => resolveBlocker(blocker.id)}
								>
									Resolve
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Risk settings -->
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Risk Settings</h2>
				
				<form on:submit|preventDefault={saveRiskSettings} class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Input
							label="Max Risk Per Trade (%)"
							type="number"
							step="0.1"
							min="0.1"
							max="10"
							bind:value={riskSettings.max_risk_per_trade}
						/>

						<Input
							label="Max Daily Loss (%)"
							type="number"
							step="0.1"
							min="1"
							max="50"
							bind:value={riskSettings.max_daily_loss}
						/>

						<Input
							label="Max Weekly Loss (%)"
							type="number"
							step="0.1"
							min="1"
							max="50"
							bind:value={riskSettings.max_weekly_loss}
						/>

						<Input
							label="Max Monthly Loss (%)"
							type="number"
							step="0.1"
							min="1"
							max="50"
							bind:value={riskSettings.max_monthly_loss}
						/>

						<Input
							label="Max Open Trades"
							type="number"
							min="1"
							max="20"
							bind:value={riskSettings.max_open_trades}
						/>

						<Input
							label="Max Correlation Exposure (%)"
							type="number"
							step="0.1"
							min="5"
							max="50"
							bind:value={riskSettings.max_correlation_exposure}
						/>
					</div>

					<div class="space-y-3">
						<label class="flex items-center">
							<input
								type="checkbox"
								bind:checked={riskSettings.trading_enabled}
								class="mr-2"
							/>
							<span class="text-sm">Enable Trading</span>
						</label>

						<label class="flex items-center">
							<input
								type="checkbox"
								bind:checked={riskSettings.auto_close_enabled}
								class="mr-2"
							/>
							<span class="text-sm">Auto-close trades at risk limits</span>
						</label>

						<label class="flex items-center">
							<input
								type="checkbox"
								bind:checked={riskSettings.emergency_stop_enabled}
								class="mr-2"
							/>
							<span class="text-sm">Enable emergency stop</span>
						</label>
					</div>

					<Button type="submit" loading={isSaving} class="w-full">
						Save Risk Settings
					</Button>
				</form>
			</Card>

			<!-- Risk metrics -->
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Risk Metrics</h2>
				
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-muted">Current Risk:</span>
							<span class="text-foreground ml-2 font-medium">
								{riskMetrics.current_risk.toFixed(2)}%
							</span>
						</div>
						<div>
							<span class="text-muted">Weekly P&L:</span>
							<span class="ml-2 font-medium {riskMetrics.weekly_pnl >= 0 ? 'text-success' : 'text-error'}">
								{formatPercentage(riskMetrics.weekly_pnl)}
							</span>
						</div>
						<div>
							<span class="text-muted">Monthly P&L:</span>
							<span class="ml-2 font-medium {riskMetrics.monthly_pnl >= 0 ? 'text-success' : 'text-error'}">
								{formatPercentage(riskMetrics.monthly_pnl)}
							</span>
						</div>
						<div>
							<span class="text-muted">Max Drawdown:</span>
							<span class="text-error ml-2 font-medium">
								{formatPercentage(riskMetrics.max_drawdown)}
							</span>
						</div>
					</div>

					<!-- Risk limits progress bars -->
					<div class="space-y-3">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span class="text-muted">Daily Loss Limit</span>
								<span class="text-foreground">
									{Math.abs(riskMetrics.daily_pnl).toFixed(2)}% / {riskSettings.max_daily_loss}%
								</span>
							</div>
							<div class="w-full bg-border rounded-full h-2">
								<div 
									class="h-2 rounded-full transition-all duration-300 {
										Math.abs(riskMetrics.daily_pnl) / riskSettings.max_daily_loss > 0.8 
											? 'bg-error' 
											: Math.abs(riskMetrics.daily_pnl) / riskSettings.max_daily_loss > 0.6 
												? 'bg-warning' 
												: 'bg-success'
									}"
									style="width: {Math.min((Math.abs(riskMetrics.daily_pnl) / riskSettings.max_daily_loss) * 100, 100)}%"
								></div>
							</div>
						</div>

						<div>
							<div class="flex justify-between text-sm mb-1">
								<span class="text-muted">Open Trades Limit</span>
								<span class="text-foreground">
									{riskMetrics.open_trades_count} / {riskSettings.max_open_trades}
								</span>
							</div>
							<div class="w-full bg-border rounded-full h-2">
								<div 
									class="h-2 rounded-full transition-all duration-300 {
										riskMetrics.open_trades_count / riskSettings.max_open_trades > 0.8 
											? 'bg-error' 
											: riskMetrics.open_trades_count / riskSettings.max_open_trades > 0.6 
												? 'bg-warning' 
												: 'bg-success'
									}"
									style="width: {(riskMetrics.open_trades_count / riskSettings.max_open_trades) * 100}%"
								></div>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>

<!-- Position Size Calculator Modal -->
<Modal bind:open={showCalculatorModal} title="Position Size Calculator" size="lg">
	<div class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Input
				label="Account Balance"
				type="number"
				step="0.01"
				bind:value={calculator.account_balance}
			/>

			<Input
				label="Risk Percentage"
				type="number"
				step="0.1"
				min="0.1"
				max="10"
				bind:value={calculator.risk_percentage}
			/>

			<div>
				<label class="form-label">Instrument</label>
				<select bind:value={calculator.instrument} class="form-input">
					<option value="EURUSD">EURUSD</option>
					<option value="GBPUSD">GBPUSD</option>
					<option value="USDJPY">USDJPY</option>
					<option value="AUDUSD">AUDUSD</option>
					<option value="USDCAD">USDCAD</option>
					<option value="USDCHF">USDCHF</option>
				</select>
			</div>

			<Input
				label="Pip Value (USD)"
				type="number"
				step="0.01"
				bind:value={calculator.pip_value}
			/>

			<Input
				label="Entry Price"
				type="number"
				step="0.00001"
				bind:value={calculator.entry_price}
			/>

			<Input
				label="Stop Loss"
				type="number"
				step="0.00001"
				bind:value={calculator.stop_loss}
			/>
		</div>

		{#if calculatedPosition.position_size > 0}
			<div class="mt-6 p-4 bg-background rounded-lg">
				<h3 class="font-semibold text-foreground mb-3">Calculated Position</h3>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-muted">Risk Amount:</span>
						<span class="text-foreground ml-2 font-medium">
							{formatCurrency(calculatedPosition.risk_amount)}
						</span>
					</div>
					<div>
						<span class="text-muted">Pip Distance:</span>
						<span class="text-foreground ml-2 font-medium">
							{calculatedPosition.pip_distance.toFixed(1)} pips
						</span>
					</div>
					<div>
						<span class="text-muted">Position Size:</span>
						<span class="text-foreground ml-2 font-medium">
							{calculatedPosition.position_size.toFixed(0)} units
						</span>
					</div>
					<div>
						<span class="text-muted">Lot Size:</span>
						<span class="text-foreground ml-2 font-medium">
							{calculatedPosition.lot_size.toFixed(2)} lots
						</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => showCalculatorModal = false}>
			Close
		</Button>
	</svelte:fragment>
</Modal>

<!-- Emergency Stop Modal -->
<Modal bind:open={showEmergencyModal} title="Emergency Stop" size="md">
	<div class="text-center space-y-4">
		<div class="text-6xl">🛑</div>
		<h3 class="text-lg font-semibold text-foreground">Emergency Stop Trading</h3>
		<p class="text-muted">
			This will immediately close all open positions and disable trading. 
			Use only in emergency situations.
		</p>
		<div class="bg-error/10 border border-error/20 rounded-md p-3">
			<p class="text-error text-sm">
				⚠️ This action cannot be undone. All open trades will be closed at market price.
			</p>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => showEmergencyModal = false}>
			Cancel
		</Button>
		<Button variant="danger" on:click={emergencyStop}>
			Confirm Emergency Stop
		</Button>
	</svelte:fragment>
</Modal>
