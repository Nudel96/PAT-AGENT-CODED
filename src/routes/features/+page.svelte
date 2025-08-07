<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { 
		TrendingUp, BarChart, GraduationCap, BookOpen, Users, Shield,
		Activity, Target, Award, Brain, Lock, Unlock
	} from '$lib/components/icons';

	let activeSection = '';

	onMount(() => {
		// Handle hash navigation
		const hash = window.location.hash.slice(1);
		if (hash) {
			activeSection = hash;
			setTimeout(() => {
				const element = document.getElementById(hash);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			}, 100);
		}

		// Update active section on scroll
		const handleScroll = () => {
			const sections = ['macro-bias', 'heatman', 'learning', 'journal', 'community', 'risk'];
			const scrollPosition = window.scrollY + 100;

			for (const section of sections) {
				const element = document.getElementById(section);
				if (element) {
					const { offsetTop, offsetHeight } = element;
					if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
						activeSection = section;
						break;
					}
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const features = [
		{
			id: 'macro-bias',
			title: 'Macro Bias Analysis',
			subtitle: 'AI-Driven Market Intelligence',
			icon: TrendingUp,
			category: 'Analysis Engine'
		},
		{
			id: 'heatman',
			title: 'Currency Strength Matrix',
			subtitle: 'Real-Time Visualization',
			icon: BarChart,
			category: 'Market Data'
		},
		{
			id: 'learning',
			title: 'Professional Education',
			subtitle: 'Structured Learning System',
			icon: GraduationCap,
			category: 'Education'
		},
		{
			id: 'journal',
			title: 'Advanced Analytics',
			subtitle: 'Performance Intelligence',
			icon: BookOpen,
			category: 'Analytics'
		},
		{
			id: 'community',
			title: 'Professional Network',
			subtitle: 'Collaborative Environment',
			icon: Users,
			category: 'Community'
		},
		{
			id: 'risk',
			title: 'Risk Management',
			subtitle: 'Capital Protection System',
			icon: Shield,
			category: 'Risk Control'
		}
	];
</script>

<svelte:head>
	<title>Professional Features - PriceActionTalk | Institutional Trading Tools</title>
	<meta name="description" content="Discover PriceActionTalk's comprehensive suite of professional trading tools: AI-driven macro analysis, currency strength matrices, structured education, and advanced risk management systems." />
</svelte:head>

<!-- Professional Hero Section -->
<section class="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
	<div class="container">
		<div class="text-center">
			<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
				<Activity size={16} />
				Institutional-Grade Infrastructure
			</div>
			<h1 class="text-5xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
				Professional Trading Tools
			</h1>
			<p class="text-xl leading-8 text-muted max-w-4xl mx-auto mb-10">
				Enterprise-level trading infrastructure with institutional-quality data feeds, advanced analytics, 
				and systematic education designed for serious market participants who demand professional results.
			</p>
			<div class="flex items-center justify-center gap-6">
				<Button href="/register" size="lg" class="px-8 py-4 text-lg font-semibold">
					Start Professional Trial
				</Button>
				<Button href="/pricing" variant="secondary" size="lg" class="px-8 py-4 text-lg font-semibold">
					Enterprise Pricing
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Professional Features Navigation -->
<section class="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
	<div class="container">
		<nav class="flex space-x-8 overflow-x-auto py-4">
			{#each features as feature}
				<a 
					href="#{feature.id}"
					class="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
						{activeSection === feature.id 
							? 'bg-primary text-white shadow-md' 
							: 'text-muted hover:text-foreground hover:bg-surface'}"
				>
					{feature.title}
				</a>
			{/each}
		</nav>
	</div>
</section>

<!-- Professional Feature Sections -->
<div class="container py-20 space-y-32">

	<!-- Macro Bias Analysis -->
	<section id="macro-bias" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<div class="flex items-center gap-4 mb-8">
					<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
						<TrendingUp class="text-primary" size={32} />
					</div>
					<div>
						<div class="text-sm font-bold text-primary uppercase tracking-wider mb-1">Analysis Engine</div>
						<h2 class="text-4xl font-bold text-foreground">Macro Bias Analysis</h2>
						<p class="text-lg text-muted font-medium">AI-Driven Market Intelligence</p>
					</div>
				</div>

				<div class="space-y-8">
					<p class="text-xl text-muted leading-relaxed">
						Eliminate directional uncertainty with our proprietary AI-powered macroeconomic analysis engine.
						Access the same institutional-grade data that hedge funds use for billion-dollar trading decisions.
					</p>

					<div class="bg-surface-elevated rounded-2xl p-8 border border-border">
						<h3 class="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
							<Brain class="text-primary" size={20} />
							Core Problem Resolution
						</h3>
						<p class="text-muted leading-relaxed">
							95% of retail traders fail because they trade against institutional money flow. Our Macro Bias Analysis
							provides the same directional intelligence used by professional trading desks, eliminating the primary
							cause of retail trading failure: fighting institutional positioning.
						</p>
					</div>

					<div class="grid grid-cols-2 gap-6">
						<div class="bg-success/5 rounded-2xl p-6 border border-success/20">
							<div class="text-3xl font-bold text-success">-5 to +5</div>
							<div class="text-sm text-muted font-medium">HeatScore Range</div>
							<div class="text-xs text-success font-semibold mt-1">Precision Scoring</div>
						</div>
						<div class="bg-primary/5 rounded-2xl p-6 border border-primary/20">
							<div class="text-3xl font-bold text-primary">50+</div>
							<div class="text-sm text-muted font-medium">Data Sources</div>
							<div class="text-xs text-primary font-semibold mt-1">Institutional Feeds</div>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-8">
				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
						<Activity class="text-primary" size={24} />
						Technical Capabilities
					</h3>
					<ul class="space-y-4">
						<li class="flex items-start gap-4">
							<div class="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
							<div>
								<div class="font-bold text-foreground mb-1">Real-Time Data Processing</div>
								<div class="text-sm text-muted leading-relaxed">Continuous analysis of 50+ macroeconomic indicators including COT data, central bank communications, and economic calendar events</div>
							</div>
						</li>
						<li class="flex items-start gap-4">
							<div class="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
							<div>
								<div class="font-bold text-foreground mb-1">Proprietary HeatScore Algorithm</div>
								<div class="text-sm text-muted leading-relaxed">Machine learning models trained on 10+ years of market data to generate precise directional bias scores</div>
							</div>
						</li>
						<li class="flex items-start gap-4">
							<div class="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
							<div>
								<div class="font-bold text-foreground mb-1">Institutional Data Integration</div>
								<div class="text-sm text-muted leading-relaxed">Direct feeds from major liquidity providers and institutional positioning data</div>
							</div>
						</li>
					</ul>
				</Card>

				<Card class="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
					<h3 class="text-2xl font-bold text-foreground mb-6">Proven Performance</h3>
					<div class="grid grid-cols-2 gap-6">
						<div class="text-center">
							<div class="text-4xl font-bold text-primary">60%</div>
							<div class="text-sm text-muted font-medium">Reduction in directional errors</div>
						</div>
						<div class="text-center">
							<div class="text-4xl font-bold text-success">85%</div>
							<div class="text-sm text-muted font-medium">Trend identification accuracy</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- Currency Strength Matrix -->
	<section id="heatman" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-8">
				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
						<BarChart class="text-warning" size={24} />
						Multi-Dimensional Analysis
					</h3>
					<div class="space-y-4">
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">COT Positioning Data</span>
							<Badge variant="success">Live Feed</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Retail Sentiment Analysis</span>
							<Badge variant="primary">Real-Time</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Price Momentum Indicators</span>
							<Badge variant="warning">Dynamic</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Correlation Risk Matrix</span>
							<Badge variant="secondary">28 Pairs</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-8 bg-gradient-to-br from-warning/5 to-error/5">
					<h3 class="text-2xl font-bold text-foreground mb-4">Institutional Advantage</h3>
					<p class="text-muted mb-6 leading-relaxed">
						Access the same currency strength relationships that institutional traders use for million-dollar decisions.
						Professional-grade visualization reveals market dynamics invisible to retail platforms.
					</p>
					<div class="grid grid-cols-2 gap-6 text-center">
						<div>
							<div class="text-3xl font-bold text-warning">28</div>
							<div class="text-sm text-muted font-medium">Currency Pairs</div>
						</div>
						<div>
							<div class="text-3xl font-bold text-error">1000+</div>
							<div class="text-sm text-muted font-medium">Daily Updates</div>
						</div>
					</div>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-4 mb-8">
					<div class="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center">
						<BarChart class="text-warning" size={32} />
					</div>
					<div>
						<div class="text-sm font-bold text-warning uppercase tracking-wider mb-1">Market Data</div>
						<h2 class="text-4xl font-bold text-foreground">Currency Strength Matrix</h2>
						<p class="text-lg text-muted font-medium">Real-Time Visualization</p>
					</div>
				</div>

				<div class="space-y-8">
					<p class="text-xl text-muted leading-relaxed">
						Transform complex currency relationships into actionable intelligence. Professional-grade
						multi-dimensional analysis reveals which currencies are strongest and weakest in real-time.
					</p>

					<div class="bg-surface-elevated rounded-2xl p-8 border border-border">
						<h3 class="text-xl font-bold text-foreground mb-4">Currency Selection Challenge</h3>
						<p class="text-muted leading-relaxed">
							Most traders select currency pairs randomly or based on intuition. Professional traders use
							systematic currency strength analysis to identify optimal pairings, maximizing profit potential
							while minimizing correlation risk exposure.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-xl font-bold text-foreground">Professional Benefits</h3>
						<ul class="space-y-3">
							<li class="flex items-center gap-3">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<span class="text-muted">Identify strongest vs. weakest currencies systematically</span>
							</li>
							<li class="flex items-center gap-3">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<span class="text-muted">Detect divergences between retail and institutional positioning</span>
							</li>
							<li class="flex items-center gap-3">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<span class="text-muted">Minimize correlation risk in portfolio management</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Professional Education System -->
	<section id="learning" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<div class="flex items-center gap-4 mb-8">
					<div class="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
						<GraduationCap class="text-secondary" size={32} />
					</div>
					<div>
						<div class="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Education</div>
						<h2 class="text-4xl font-bold text-foreground">Professional Education</h2>
						<p class="text-lg text-muted font-medium">Structured Learning System</p>
					</div>
				</div>

				<div class="space-y-8">
					<p class="text-xl text-muted leading-relaxed">
						Master trading through the world's most comprehensive systematic education platform.
						Follow a proven methodology that transforms novice traders into professional market participants
						with measurable skill progression and competency validation.
					</p>

					<div class="bg-surface-elevated rounded-2xl p-8 border border-border">
						<h3 class="text-xl font-bold text-foreground mb-4">Education Gap Analysis</h3>
						<p class="text-muted leading-relaxed">
							Traditional trading education lacks structure and measurable outcomes. Our Professional Education System
							provides systematic skill development with clear milestones, ensuring comprehensive competency
							rather than fragmented knowledge acquisition.
						</p>
					</div>

					<div class="grid grid-cols-2 gap-6">
						<div class="bg-secondary/5 rounded-2xl p-6 border border-secondary/20">
							<div class="text-3xl font-bold text-secondary">200+</div>
							<div class="text-sm text-muted font-medium">Interactive Modules</div>
							<div class="text-xs text-secondary font-semibold mt-1">Comprehensive Curriculum</div>
						</div>
						<div class="bg-primary/5 rounded-2xl p-6 border border-primary/20">
							<div class="text-3xl font-bold text-primary">12</div>
							<div class="text-sm text-muted font-medium">Core Disciplines</div>
							<div class="text-xs text-primary font-semibold mt-1">Professional Standards</div>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-8">
				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6">Professional Progression System</h3>
					<div class="space-y-4">
						<div class="flex items-center gap-4 p-4 bg-background rounded-xl">
							<Badge variant="error">Novice</Badge>
							<span class="text-muted">Fundamental concepts and market basics</span>
						</div>
						<div class="flex items-center gap-4 p-4 bg-background rounded-xl">
							<Badge variant="warning">Intermediate</Badge>
							<span class="text-muted">Strategy development and risk management</span>
						</div>
						<div class="flex items-center gap-4 p-4 bg-background rounded-xl">
							<Badge variant="default">Advanced</Badge>
							<span class="text-muted">Technical and fundamental analysis mastery</span>
						</div>
						<div class="flex items-center gap-4 p-4 bg-background rounded-xl">
							<Badge variant="primary">Professional</Badge>
							<span class="text-muted">Institutional strategies and psychology</span>
						</div>
						<div class="flex items-center gap-4 p-4 bg-background rounded-xl">
							<Badge variant="success">Expert</Badge>
							<span class="text-muted">Advanced institutional methodologies</span>
						</div>
					</div>
				</Card>

				<Card class="p-8 bg-gradient-to-br from-secondary/5 to-primary/5">
					<h3 class="text-2xl font-bold text-foreground mb-6">Validated Outcomes</h3>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-muted font-medium">Average completion timeline</span>
							<span class="font-bold text-foreground">18 months</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-muted font-medium">Professional satisfaction rate</span>
							<span class="font-bold text-success">94%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-muted font-medium">Measured skill improvement</span>
							<span class="font-bold text-primary">340%</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- Advanced Analytics -->
	<section id="journal" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-8">
				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6">Advanced Analytics Engine</h3>
					<div class="grid grid-cols-2 gap-4">
						<div class="text-center p-4 bg-background rounded-xl border border-border">
							<div class="text-2xl font-bold text-primary">50+</div>
							<div class="text-xs text-muted font-medium">Performance Metrics</div>
						</div>
						<div class="text-center p-4 bg-background rounded-xl border border-border">
							<div class="text-2xl font-bold text-success">100%</div>
							<div class="text-xs text-muted font-medium">Trade Accuracy</div>
						</div>
						<div class="text-center p-4 bg-background rounded-xl border border-border">
							<div class="text-2xl font-bold text-warning">Real-Time</div>
							<div class="text-xs text-muted font-medium">P&L Tracking</div>
						</div>
						<div class="text-center p-4 bg-background rounded-xl border border-border">
							<div class="text-2xl font-bold text-secondary">Automated</div>
							<div class="text-xs text-muted font-medium">Broker Import</div>
						</div>
					</div>
				</Card>

				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
						<Brain class="text-primary" size={24} />
						Psychology Matrix
					</h3>
					<p class="text-muted mb-6 leading-relaxed">
						Track emotional states and decision quality alongside technical performance.
						Identify psychological patterns that impact trading results with professional-grade behavioral analysis.
					</p>
					<div class="space-y-3">
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted font-medium">Emotional State Tracking</span>
							<Badge variant="primary">Active</Badge>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted font-medium">Decision Quality Scoring</span>
							<Badge variant="success">Enabled</Badge>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted font-medium">Pattern Recognition</span>
							<Badge variant="warning">AI-Powered</Badge>
						</div>
					</div>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-4 mb-8">
					<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
						<BookOpen class="text-primary" size={32} />
					</div>
					<div>
						<div class="text-sm font-bold text-primary uppercase tracking-wider mb-1">Analytics</div>
						<h2 class="text-4xl font-bold text-foreground">Advanced Analytics</h2>
						<p class="text-lg text-muted font-medium">Performance Intelligence</p>
					</div>
				</div>

				<div class="space-y-8">
					<p class="text-xl text-muted leading-relaxed">
						Transform trading performance through comprehensive analytics and psychological insights.
						Our institutional-grade journal provides deep performance intelligence far beyond
						simple trade logging capabilities.
					</p>

					<div class="bg-surface-elevated rounded-2xl p-8 border border-border">
						<h3 class="text-xl font-bold text-foreground mb-4">Performance Optimization Challenge</h3>
						<p class="text-muted leading-relaxed">
							Most traders repeat identical mistakes due to lack of systematic performance analysis.
							Our analytics engine identifies patterns in technical execution and psychological state,
							providing actionable intelligence for continuous improvement.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-xl font-bold text-foreground">Core Capabilities</h3>
						<ul class="space-y-4">
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center mt-0.5">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<div class="font-bold text-foreground">Automated Broker Integration</div>
									<div class="text-sm text-muted">Direct import from major brokers with real-time synchronization</div>
								</div>
							</li>
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center mt-0.5">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<div class="font-bold text-foreground">AI Pattern Recognition</div>
									<div class="text-sm text-muted">Automatically identify recurring mistakes and successful patterns</div>
								</div>
							</li>
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center mt-0.5">
									<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<div class="font-bold text-foreground">Institutional Reporting</div>
									<div class="text-sm text-muted">Generate professional-quality performance reports</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Risk Management System -->
	<section id="risk" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-8">
				<Card class="p-8">
					<h3 class="text-2xl font-bold text-foreground mb-6">Intelligent Protection System</h3>
					<div class="space-y-4">
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Drawdown Threshold Monitoring</span>
							<Badge variant="error">5% Daily Limit</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Consecutive Loss Protection</span>
							<Badge variant="warning">3 Trade Limit</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Emotional State Monitoring</span>
							<Badge variant="secondary">AI Analysis</Badge>
						</div>
						<div class="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
							<span class="font-bold text-foreground">Structured Re-enablement</span>
							<Badge variant="primary">Reflection Protocol</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-8 bg-gradient-to-br from-error/5 to-warning/5">
					<h3 class="text-2xl font-bold text-foreground mb-6">Capital Preservation Statistics</h3>
					<div class="grid grid-cols-2 gap-6 text-center">
						<div>
							<div class="text-3xl font-bold text-error">73%</div>
							<div class="text-sm text-muted font-medium">Drawdown Reduction</div>
						</div>
						<div>
							<div class="text-3xl font-bold text-success">92%</div>
							<div class="text-sm text-muted font-medium">User Satisfaction</div>
						</div>
					</div>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-4 mb-8">
					<div class="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center">
						<Shield class="text-error" size={32} />
					</div>
					<div>
						<div class="text-sm font-bold text-error uppercase tracking-wider mb-1">Risk Control</div>
						<h2 class="text-4xl font-bold text-foreground">Risk Management</h2>
						<p class="text-lg text-muted font-medium">Capital Protection System</p>
					</div>
				</div>

				<div class="space-y-8">
					<p class="text-xl text-muted leading-relaxed">
						Protect capital through intelligent automation and behavioral intervention. Our advanced
						risk management system prevents emotional trading that destroys accounts through
						systematic intervention protocols.
					</p>

					<div class="bg-surface-elevated rounded-2xl p-8 border border-border">
						<h3 class="text-xl font-bold text-foreground mb-4">Emotional Trading Prevention</h3>
						<p class="text-muted leading-relaxed">
							80% of trading losses occur during emotional states when traders abandon systematic approaches.
							Our system recognizes dangerous patterns and intervenes automatically, enforcing
							structured cooling-off periods that prevent catastrophic losses.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-xl font-bold text-foreground">Protection Features</h3>
						<ul class="space-y-4">
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-error/10 rounded-lg flex items-center justify-center mt-0.5">
									<Lock class="text-error" size={16} />
								</div>
								<div>
									<div class="font-bold text-foreground">Automatic Trade Blocking</div>
									<div class="text-sm text-muted">Immediate platform lockout when risk thresholds are exceeded</div>
								</div>
							</li>
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-warning/10 rounded-lg flex items-center justify-center mt-0.5">
									<Activity class="text-warning" size={16} />
								</div>
								<div>
									<div class="font-bold text-foreground">Real-Time Portfolio Monitoring</div>
									<div class="text-sm text-muted">Continuous assessment of position sizing and correlation exposure</div>
								</div>
							</li>
							<li class="flex items-start gap-4">
								<div class="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
									<Unlock class="text-primary" size={16} />
								</div>
								<div>
									<div class="font-bold text-foreground">Structured Re-enablement Process</div>
									<div class="text-sm text-muted">Mandatory reflection and planning before trading privileges restoration</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

</div>

<!-- Professional Call to Action Section -->
<section class="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
	<div class="container">
		<div class="text-center">
			<div class="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
				<Target size={16} />
				Enterprise Ready
			</div>
			<h2 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
				Transform Your Trading Performance
			</h2>
			<p class="text-xl leading-8 text-muted max-w-4xl mx-auto mb-10">
				Join thousands of professional traders who rely on PriceActionTalk for institutional-quality 
				market analysis, systematic education, and measurable performance improvement.
			</p>
			<div class="flex items-center justify-center gap-6">
				<Button href="/register" size="lg" class="px-8 py-4 text-lg font-semibold">
					Start Professional Trial
				</Button>
				<Button href="/pricing" variant="secondary" size="lg" class="px-8 py-4 text-lg font-semibold">
					Enterprise Plans
				</Button>
			</div>
		</div>

		<!-- Professional trust indicators -->
		<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="text-4xl font-bold text-primary">10,000+</div>
				<div class="text-muted font-medium">Professional Traders</div>
			</div>
			<div class="text-center">
				<div class="text-4xl font-bold text-success">99.9%</div>
				<div class="text-muted font-medium">Enterprise Uptime</div>
			</div>
			<div class="text-center">
				<div class="text-4xl font-bold text-warning">24/7</div>
				<div class="text-muted font-medium">Professional Support</div>
			</div>
		</div>
	</div>
</section>