<script lang="ts">
	const features = [
		{
			title: 'Macro Bias Tool',
			description: 'AI-driven bias scoring engine that processes macroeconomic data to provide HeatScore from -5 to +5 with real-time updates.',
			icon: '📊',
			href: '/features#macro-bias'
		},
		{
			title: 'Heatman Widget',
			description: 'Real-time market heatmap with multi-pillar currency strength visualization including COT, retail sentiment, and price momentum.',
			icon: '🔥',
			href: '/features#heatman'
		},
		{
			title: 'XP Learning System',
			description: 'Structured 1-3 year learning roadmap with interactive lessons, quizzes, and level progression from D-tier to A+.',
			icon: '🎓',
			href: '/features#learning'
		},
		{
			title: 'Trading Journal',
			description: 'Comprehensive trade logging with advanced analytics, psychology matrix, and trade replay functionality.',
			icon: '📝',
			href: '/features#journal'
		},
		{
			title: 'Community Hub',
			description: 'Real-time trading challenges with leaderboards, WebSocket-powered chat, and live trading rooms.',
			icon: '👥',
			href: '/features#community'
		},
		{
			title: 'Risk Management',
			description: 'Trade Blocker with automatic disabling after drawdown threshold and mandatory reflection tasks.',
			icon: '🛡️',
			href: '/features#risk'
		}
	];
</script>

<section class="py-24 bg-surface">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="text-center mb-16">
			<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
				Comprehensive Trading Tools
			</h2>
			<p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
				Everything you need to master price action trading in one powerful platform. 
				From macro analysis to community learning.
			</p>
		</div>

		<!-- Features grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature}
				<a 
					href={feature.href}
					class="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
				>
					<div class="text-4xl mb-4">{feature.icon}</div>
					<h3 class="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
						{feature.title}
					</h3>
					<p class="text-muted leading-relaxed">
						{feature.description}
					</p>
					
					<!-- Arrow indicator -->
					<div class="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
						<span class="text-sm font-medium">Learn more</span>
						<svg class="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Bottom CTA -->
		<div class="text-center mt-16">
			<div class="bg-background rounded-xl p-8 border border-border">
				<h3 class="text-2xl font-bold text-foreground mb-4">
					Ready to Transform Your Trading?
				</h3>
				<p class="text-muted mb-6 max-w-2xl mx-auto">
					Join thousands of traders who are already using PriceActionTalk to improve their trading performance 
					and build lasting skills in the markets.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="/register" class="btn btn-primary text-lg px-8 py-3">
						Start Free Trial
					</a>
					<a href="/pricing" class="btn btn-secondary text-lg px-8 py-3">
						View Pricing
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
