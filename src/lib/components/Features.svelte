<script lang="ts">
	import { TrendingUp, BarChart, GraduationCap, BookOpen, Users, Shield } from '$lib/components/icons';

	const features = [
		{
			title: 'Macro Bias Analysis',
			description: 'AI-driven bias scoring engine that processes macroeconomic data to provide HeatScore from -5 to +5 with real-time institutional data feeds.',
			icon: TrendingUp,
			href: '/features#macro-bias',
			category: 'Analysis'
		},
		{
			title: 'Currency Strength Matrix',
			description: 'Real-time market heatmap with multi-pillar currency strength visualization including COT data, retail sentiment, and price momentum analysis.',
			icon: BarChart,
			href: '/features#heatman',
			category: 'Visualization'
		},
		{
			title: 'Structured Learning System',
			description: 'Comprehensive 1-3 year learning roadmap with interactive lessons, assessments, and level progression from novice to expert trader.',
			icon: GraduationCap,
			href: '/features#learning',
			category: 'Education'
		},
		{
			title: 'Advanced Trading Journal',
			description: 'Comprehensive trade logging with advanced analytics, psychology matrix, trade replay functionality, and institutional-grade reporting.',
			icon: BookOpen,
			href: '/features#journal',
			category: 'Analytics'
		},
		{
			title: 'Professional Community',
			description: 'Real-time trading challenges with verified leaderboards, WebSocket-powered chat, and live trading rooms with experienced mentors.',
			icon: Users,
			href: '/features#community',
			category: 'Community'
		},
		{
			title: 'Intelligent Risk Management',
			description: 'Automated trade blocking system with behavioral intervention, mandatory reflection protocols, and real-time portfolio heat monitoring.',
			icon: Shield,
			href: '/features#risk',
			category: 'Risk Control'
		}
	];
</script>

<section class="section bg-surface">
	<div class="container">
		<!-- Section header -->
		<div class="text-center mb-16">
			<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
				<TrendingUp size={16} />
				Professional Trading Tools
			</div>
			<h2 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
				Institutional-Grade Trading Infrastructure
			</h2>
			<p class="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
				Every tool is engineered to professional standards with enterprise-level reliability, 
				sophisticated analytics, and institutional-quality data feeds.
			</p>
		</div>

		<!-- Features grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
			{#each features as feature}
				<a 
					href={feature.href}
					class="group card-elevated hover:border-primary/50 transition-all duration-300"
				>
					<div class="flex items-start gap-4 mb-4">
						<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
							<svelte:component this={feature.icon} class="text-primary" size={24} />
						</div>
						<div class="flex-1">
							<div class="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
								{feature.category}
							</div>
							<h3 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
								{feature.title}
							</h3>
						</div>
					</div>
					
					<p class="text-muted leading-relaxed mb-4">
						{feature.description}
					</p>
					
					<!-- Professional CTA -->
					<div class="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
						<span class="text-sm font-semibold">Explore Feature</span>
						<svg class="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Professional CTA Section -->
		<div class="relative">
			<div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl"></div>
			<div class="relative bg-surface-elevated rounded-2xl p-12 border border-border">
				<div class="text-center">
					<div class="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6">
						<Target size={16} />
						Enterprise Ready
					</div>
					<h3 class="text-3xl font-bold text-foreground mb-4">
						Transform Your Trading Performance
					</h3>
					<p class="text-muted mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
						Join thousands of professional traders who rely on PriceActionTalk for institutional-quality 
						market analysis, structured education, and systematic performance improvement.
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="/register" class="btn btn-primary text-lg px-8 py-4 font-semibold">
							Start Professional Trial
						</a>
						<a href="/pricing" class="btn btn-secondary text-lg px-8 py-4 font-semibold">
							View Enterprise Plans
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>