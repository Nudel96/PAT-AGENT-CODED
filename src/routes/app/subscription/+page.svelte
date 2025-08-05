<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface SubscriptionPlan {
		id: string;
		name: string;
		description: string;
		price: number;
		currency: string;
		interval: string;
		features: string[];
	}

	interface UserSubscription {
		has_subscription: boolean;
		plan: string;
		status: string;
		current_period_start?: string;
		current_period_end?: string;
		cancelled_at?: string;
	}

	let plans: SubscriptionPlan[] = [];
	let userSubscription: UserSubscription | null = null;
	let isLoading = true;
	let isProcessing = false;
	let showCancelModal = false;

	onMount(async () => {
		await loadPlans();
		await loadUserSubscription();
	});

	async function loadPlans() {
		try {
			const response = await fetch('/api/payments/plans');
			
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					plans = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load plans:', error);
		}
	}

	async function loadUserSubscription() {
		try {
			const response = await fetch('/api/payments/subscription', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					userSubscription = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load subscription:', error);
		} finally {
			isLoading = false;
		}
	}

	async function subscribeToPlan(planId: string) {
		isProcessing = true;
		try {
			const response = await fetch('/api/payments/create-subscription', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({
					plan: planId,
					success_url: `${window.location.origin}/app/subscription/success`,
					cancel_url: `${window.location.origin}/app/subscription`
				})
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success && data.data.checkout_url) {
					// Redirect to Stripe checkout
					window.location.href = data.data.checkout_url;
				}
			}
		} catch (error) {
			console.error('Failed to create subscription:', error);
		} finally {
			isProcessing = false;
		}
	}

	async function cancelSubscription() {
		isProcessing = true;
		try {
			const response = await fetch('/api/payments/cancel-subscription', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				showCancelModal = false;
				await loadUserSubscription();
			}
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
		} finally {
			isProcessing = false;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
		switch (status) {
			case 'active': return 'success';
			case 'trialing': return 'warning';
			case 'cancelled': return 'error';
			default: return 'default';
		}
	}

	$: currentPlan = plans.find(p => p.id === userSubscription?.plan);
</script>

<svelte:head>
	<title>Subscription - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Subscription Management</h1>
		<p class="text-muted">Manage your subscription and billing preferences</p>
	</div>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each Array(2) as _}
				<Card class="animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4 mb-4"></div>
					<div class="h-20 bg-border rounded w-full"></div>
				</Card>
			{/each}
		</div>
	{:else}
		<!-- Current subscription status -->
		{#if userSubscription?.has_subscription}
			<Card>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground">Current Subscription</h2>
					<Badge variant={getStatusBadgeVariant(userSubscription.status)}>
						{userSubscription.status.toUpperCase()}
					</Badge>
				</div>

				{#if currentPlan}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 class="font-semibold text-foreground mb-2">{currentPlan.name}</h3>
							<p class="text-muted mb-4">{currentPlan.description}</p>
							
							<div class="space-y-2 text-sm">
								{#if userSubscription.current_period_start}
									<div class="flex justify-between">
										<span class="text-muted">Started:</span>
										<span class="text-foreground">{formatDate(userSubscription.current_period_start)}</span>
									</div>
								{/if}
								
								{#if userSubscription.current_period_end}
									<div class="flex justify-between">
										<span class="text-muted">Next billing:</span>
										<span class="text-foreground">{formatDate(userSubscription.current_period_end)}</span>
									</div>
								{/if}
								
								<div class="flex justify-between">
									<span class="text-muted">Price:</span>
									<span class="text-foreground font-medium">
										{formatCurrency(currentPlan.price)}/{currentPlan.interval}
									</span>
								</div>
							</div>
						</div>

						<div>
							<h4 class="font-medium text-foreground mb-3">Plan Features</h4>
							<ul class="space-y-1">
								{#each currentPlan.features.slice(0, 6) as feature}
									<li class="flex items-start text-sm">
										<span class="text-success mr-2">✓</span>
										<span class="text-foreground">{feature}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>

					<div class="mt-6 pt-4 border-t border-border">
						{#if userSubscription.status === 'active' && !userSubscription.cancelled_at}
							<Button 
								variant="danger" 
								size="sm"
								on:click={() => showCancelModal = true}
							>
								Cancel Subscription
							</Button>
						{:else if userSubscription.cancelled_at}
							<div class="p-3 bg-warning/10 border border-warning/20 rounded-md">
								<p class="text-warning text-sm">
									Your subscription has been cancelled and will end on {formatDate(userSubscription.current_period_end || '')}.
									You'll continue to have access until then.
								</p>
							</div>
						{/if}
					</div>
				{/if}
			</Card>
		{:else}
			<!-- No subscription - show plans -->
			<Card>
				<div class="text-center py-8">
					<div class="text-4xl mb-4">💳</div>
					<h3 class="text-lg font-medium text-foreground mb-2">No Active Subscription</h3>
					<p class="text-muted mb-6">
						You're currently on the free plan. Upgrade to unlock premium features.
					</p>
				</div>
			</Card>
		{/if}

		<!-- Available plans -->
		<div>
			<h2 class="text-lg font-semibold text-foreground mb-4">
				{userSubscription?.has_subscription ? 'Change Plan' : 'Choose Your Plan'}
			</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each plans as plan}
					<Card class="relative {userSubscription?.plan === plan.id ? 'ring-2 ring-primary' : ''}">
						{#if userSubscription?.plan === plan.id}
							<div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge variant="primary">Current Plan</Badge>
							</div>
						{/if}

						<div class="text-center mb-6">
							<h3 class="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
							<div class="mb-4">
								<span class="text-4xl font-bold text-foreground">{formatCurrency(plan.price)}</span>
								<span class="text-muted">/{plan.interval}</span>
							</div>
							<p class="text-muted">{plan.description}</p>
						</div>

						<div class="space-y-3 mb-6">
							<h4 class="font-medium text-foreground">What's included:</h4>
							<ul class="space-y-2">
								{#each plan.features as feature}
									<li class="flex items-start">
										<span class="text-success mr-2 mt-0.5">✓</span>
										<span class="text-sm text-foreground">{feature}</span>
									</li>
								{/each}
							</ul>
						</div>

						{#if userSubscription?.plan === plan.id}
							<Button variant="secondary" disabled class="w-full">
								Current Plan
							</Button>
						{:else}
							<Button 
								variant="primary" 
								class="w-full"
								loading={isProcessing}
								on:click={() => subscribeToPlan(plan.id)}
							>
								{userSubscription?.has_subscription ? 'Switch to' : 'Subscribe to'} {plan.name}
							</Button>
						{/if}
					</Card>
				{/each}
			</div>
		</div>

		<!-- Free plan features -->
		<Card>
			<h3 class="text-lg font-semibold text-foreground mb-4">Free Plan Features</h3>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h4 class="font-medium text-foreground mb-3">What's included:</h4>
					<ul class="space-y-2">
						<li class="flex items-start">
							<span class="text-success mr-2">✓</span>
							<span class="text-sm text-foreground">Basic trading journal (10 trades/month)</span>
						</li>
						<li class="flex items-start">
							<span class="text-success mr-2">✓</span>
							<span class="text-sm text-foreground">Limited macro bias data</span>
						</li>
						<li class="flex items-start">
							<span class="text-success mr-2">✓</span>
							<span class="text-sm text-foreground">Community forum access</span>
						</li>
						<li class="flex items-start">
							<span class="text-success mr-2">✓</span>
							<span class="text-sm text-foreground">Basic learning modules</span>
						</li>
						<li class="flex items-start">
							<span class="text-success mr-2">✓</span>
							<span class="text-sm text-foreground">Email support</span>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-medium text-foreground mb-3">Limitations:</h4>
					<ul class="space-y-2">
						<li class="flex items-start">
							<span class="text-muted mr-2">✗</span>
							<span class="text-sm text-muted">No real-time data</span>
						</li>
						<li class="flex items-start">
							<span class="text-muted mr-2">✗</span>
							<span class="text-sm text-muted">Limited historical data</span>
						</li>
						<li class="flex items-start">
							<span class="text-muted mr-2">✗</span>
							<span class="text-sm text-muted">No advanced analytics</span>
						</li>
						<li class="flex items-start">
							<span class="text-muted mr-2">✗</span>
							<span class="text-sm text-muted">No priority support</span>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	{/if}
</div>

<!-- Cancel Subscription Modal -->
<Modal bind:open={showCancelModal} title="Cancel Subscription" size="md">
	<div class="text-center space-y-4">
		<div class="text-6xl">😢</div>
		<h3 class="text-lg font-semibold text-foreground">We're sorry to see you go!</h3>
		<p class="text-muted">
			Are you sure you want to cancel your subscription? You'll lose access to all premium features 
			at the end of your current billing period.
		</p>
		
		{#if userSubscription?.current_period_end}
			<div class="bg-warning/10 border border-warning/20 rounded-md p-3">
				<p class="text-warning text-sm">
					Your subscription will remain active until {formatDate(userSubscription.current_period_end)}.
				</p>
			</div>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => showCancelModal = false}>
			Keep Subscription
		</Button>
		<Button 
			variant="danger" 
			loading={isProcessing}
			on:click={cancelSubscription}
		>
			Cancel Subscription
		</Button>
	</svelte:fragment>
</Modal>
