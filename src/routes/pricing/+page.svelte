<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let billingCycle: 'monthly' | 'annual' = 'monthly';

	const plans = [
		{
			name: 'Starter',
			monthlyPrice: 0,
			annualPrice: 0,
			description: 'Perfect for beginners starting their trading journey',
			features: [
				'XP Learning System (Full Access)',
				'Community Hub Access',
				'Basic Trading Journal (50 entries/month)',
				'Educational Resources Library',
				'Email Support',
				'Mobile App Access',
				'Trading Challenges Participation'
			],
			limitations: [
				'Limited journal entries per month',
				'Basic analytics only',
				'No advanced risk management',
				'No institutional data feeds'
			],
			cta: 'Start Free',
			popular: false,
			href: '/register?plan=starter'
		},
		{
			name: 'Professional',
			monthlyPrice: 97,
			annualPrice: 970,
			description: 'Comprehensive tools for serious retail traders',
			features: [
				'Everything in Starter (Unlimited)',
				'Heatman Widget (Real-time Currency Strength)',
				'Advanced Trading Journal (Unlimited)',
				'Psychology Matrix Tracking',
				'Trade Replay Technology',
				'Performance Analytics (50+ Metrics)',
				'Broker Integration (Auto-import)',
				'Priority Support',
				'Advanced Community Features',
				'COT Data & Retail Sentiment'
			],
			limitations: [
				'No AI-powered macro analysis',
				'No automated risk management'
			],
			cta: 'Start Professional Trial',
			popular: true,
			href: '/register?plan=professional'
		},
		{
			name: 'Institutional',
			monthlyPrice: 197,
			annualPrice: 1970,
			description: 'Enterprise-grade tools with AI-powered insights',
			features: [
				'Everything in Professional',
				'Macro Bias Tool (AI-Powered HeatScore)',
				'Risk Management System (Auto Trade Blocking)',
				'Institutional Data Feeds (50+ Sources)',
				'Advanced Risk Analytics',
				'Custom Alerts & Notifications',
				'White-Glove Onboarding',
				'Dedicated Account Manager',
				'API Access (Full)',
				'Priority Phone Support',
				'Early Access to New Features'
			],
			limitations: [],
			cta: 'Start Institutional Trial',
			popular: false,
			href: '/register?plan=institutional'
		}
	];

	function getPrice(plan: typeof plans[0]) {
		const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
		return price === 0 ? 'Free' : `$${price}`;
	}

	function getPeriod() {
		return billingCycle === 'monthly' ? '/month' : '/year';
	}

	function getSavings(plan: typeof plans[0]) {
		if (plan.monthlyPrice === 0) return '';
		const monthlyCost = plan.monthlyPrice * 12;
		const savings = monthlyCost - plan.annualPrice;
		const percentage = Math.round((savings / monthlyCost) * 100);
		return `Save ${percentage}%`;
	}

	const faqs = [
		{
			question: 'Can I cancel my subscription anytime?',
			answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
		},
		{
			question: 'Is there a free trial?',
			answer: 'Yes, we offer a 14-day free trial for both Basic and Premium plans. No credit card required to start.'
		},
		{
			question: 'What payment methods do you accept?',
			answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe payment processor.'
		},
		{
			question: 'Can I upgrade or downgrade my plan?',
			answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.'
		},
		{
			question: 'Do you offer refunds?',
			answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.'
		},
		{
			question: 'Is my data secure?',
			answer: 'Absolutely. We use bank-level encryption and security measures to protect your data. We never share your trading information with third parties.'
		}
	];

	let openFaq = -1;

	function toggleFaq(index: number) {
		openFaq = openFaq === index ? -1 : index;
	}
</script>

<svelte:head>
	<title>Pricing - PriceActionTalk | Professional Trading Platform</title>
	<meta name="description" content="Choose the perfect plan for your trading journey. From free starter tools to institutional-grade AI-powered analysis. Transparent pricing with no hidden fees." />
</svelte:head>

<main class="py-24 bg-background">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				Simple, transparent pricing
			</h1>
			<p class="mt-4 text-xl text-muted max-w-2xl mx-auto">
				Choose the plan that fits your trading goals. Start free, upgrade when you're ready.
			</p>
		</div>

		<!-- Pricing cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
			{#each plans as plan, index}
				<div class="card relative {plan.popular ? 'ring-2 ring-primary' : ''}">
					{#if plan.popular}
						<div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
							<span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
								Most Popular
							</span>
						</div>
					{/if}

					<div class="text-center mb-6">
						<h3 class="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
						<div class="mb-4">
							<span class="text-4xl font-bold text-foreground">${plan.price}</span>
							{#if plan.price > 0}
								<span class="text-muted">/{plan.period}</span>
							{/if}
						</div>
						<p class="text-muted">{plan.description}</p>
					</div>

					<div class="space-y-4 mb-8">
						<div>
							<h4 class="font-medium text-foreground mb-3">What's included:</h4>
							<ul class="space-y-2">
								{#each plan.features as feature}
									<li class="flex items-start">
										<svg class="w-5 h-5 text-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
										<span class="text-sm text-foreground">{feature}</span>
									</li>
								{/each}
							</ul>
						</div>

						{#if plan.limitations.length > 0}
							<div>
								<h4 class="font-medium text-foreground mb-3">Limitations:</h4>
								<ul class="space-y-2">
									{#each plan.limitations as limitation}
										<li class="flex items-start">
											<svg class="w-5 h-5 text-muted mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
											</svg>
											<span class="text-sm text-muted">{limitation}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>

					<a 
						href={plan.price === 0 ? '/register' : '/register?plan=' + plan.name.toLowerCase()}
						class="w-full btn {plan.popular ? 'btn-primary' : 'btn-secondary'}"
					>
						{plan.cta}
					</a>
				</div>
			{/each}
		</div>

		<!-- Features comparison -->
		<div class="mb-16">
			<h2 class="text-2xl font-bold text-foreground text-center mb-8">
				Compare all features
			</h2>
			
			<div class="bg-surface rounded-xl p-6 overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border">
							<th class="text-left py-3 text-foreground font-medium">Feature</th>
							<th class="text-center py-3 text-foreground font-medium">Free</th>
							<th class="text-center py-3 text-foreground font-medium">Basic</th>
							<th class="text-center py-3 text-foreground font-medium">Premium</th>
						</tr>
					</thead>
					<tbody class="text-sm">
						<tr class="border-b border-border">
							<td class="py-3 text-foreground">Trading Journal</td>
							<td class="text-center py-3 text-muted">10 trades/month</td>
							<td class="text-center py-3 text-success">✓ Unlimited</td>
							<td class="text-center py-3 text-success">✓ Unlimited</td>
						</tr>
						<tr class="border-b border-border">
							<td class="py-3 text-foreground">Real-time Data</td>
							<td class="text-center py-3 text-error">✗</td>
							<td class="text-center py-3 text-success">✓</td>
							<td class="text-center py-3 text-success">✓</td>
						</tr>
						<tr class="border-b border-border">
							<td class="py-3 text-foreground">Macro Bias Tool</td>
							<td class="text-center py-3 text-muted">Limited</td>
							<td class="text-center py-3 text-success">✓ Full access</td>
							<td class="text-center py-3 text-success">✓ Full access</td>
						</tr>
						<tr class="border-b border-border">
							<td class="py-3 text-foreground">Historical Data</td>
							<td class="text-center py-3 text-muted">1 month</td>
							<td class="text-center py-3 text-muted">6 months</td>
							<td class="text-center py-3 text-success">✓ Unlimited</td>
						</tr>
						<tr class="border-b border-border">
							<td class="py-3 text-foreground">1-on-1 Coaching</td>
							<td class="text-center py-3 text-error">✗</td>
							<td class="text-center py-3 text-error">✗</td>
							<td class="text-center py-3 text-success">✓ 2 sessions/month</td>
						</tr>
						<tr>
							<td class="py-3 text-foreground">API Access</td>
							<td class="text-center py-3 text-error">✗</td>
							<td class="text-center py-3 text-error">✗</td>
							<td class="text-center py-3 text-success">✓</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- FAQ -->
		<div class="max-w-3xl mx-auto">
			<h2 class="text-2xl font-bold text-foreground text-center mb-8">
				Frequently asked questions
			</h2>
			
			<div class="space-y-4">
				{#each faqs as faq, index}
					<div class="card">
						<button
							on:click={() => toggleFaq(index)}
							class="w-full flex items-center justify-between text-left"
						>
							<span class="font-medium text-foreground">{faq.question}</span>
							<svg 
								class="w-5 h-5 text-muted transform transition-transform {openFaq === index ? 'rotate-180' : ''}"
								fill="none" 
								viewBox="0 0 24 24" 
								stroke="currentColor"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						
						{#if openFaq === index}
							<div class="mt-4 text-muted">
								{faq.answer}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center mt-16">
			<div class="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-white">
				<h2 class="text-2xl font-bold mb-4">
					Ready to transform your trading?
				</h2>
				<p class="text-lg opacity-90 mb-6">
					Join thousands of traders who are already using PriceActionTalk to improve their performance.
				</p>
				<a href="/register" class="btn bg-white text-primary hover:bg-gray-100">
					Start your free trial
				</a>
			</div>
		</div>
	</div>
</main>

<Footer />
