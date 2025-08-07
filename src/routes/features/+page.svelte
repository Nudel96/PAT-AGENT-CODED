<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

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
			title: 'Macro Bias Tool',
			subtitle: 'AI-Driven Market Intelligence',
			icon: 'trending-up',
			price: 'Included in Premium',
			description: 'Professional-grade macroeconomic analysis engine that processes institutional data to provide directional bias scoring.'
		},
		{
			id: 'heatman',
			title: 'Heatman Widget',
			subtitle: 'Currency Strength Visualization',
			icon: 'bar-chart',
			price: 'Included in Basic+',
			description: 'Real-time multi-pillar currency strength heatmap with institutional positioning data and retail sentiment analysis.'
		},
		{
			id: 'learning',
			title: 'XP Learning System',
			subtitle: 'Structured Trading Education',
			icon: 'graduation-cap',
			price: 'Included in All Plans',
			description: 'Comprehensive 1-3 year learning roadmap with gamified progression from novice to expert trader.'
		},
		{
			id: 'journal',
			title: 'Trading Journal',
			subtitle: 'Advanced Performance Analytics',
			icon: 'book-open',
			price: 'Included in Basic+',
			description: 'Comprehensive trade logging with psychology matrix, replay functionality, and institutional-grade analytics.'
		},
		{
			id: 'community',
			title: 'Community Hub',
			subtitle: 'Collaborative Trading Environment',
			icon: 'users',
			price: 'Included in All Plans',
			description: 'Real-time challenges, leaderboards, and live trading rooms with verified performance tracking.'
		},
		{
			id: 'risk',
			title: 'Risk Management',
			subtitle: 'Intelligent Capital Protection',
			icon: 'shield',
			price: 'Included in Premium',
			description: 'Automated trade blocking system with behavioral intervention and mandatory reflection protocols.'
		}
	];
</script>

<svelte:head>
	<title>Features - PriceActionTalk | Professional Trading Tools</title>
	<meta name="description" content="Discover PriceActionTalk's comprehensive suite of professional trading tools: AI-driven macro analysis, currency strength heatmaps, structured learning, and advanced risk management." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
				Professional Trading Tools
			</h1>
			<p class="mt-6 text-xl leading-8 text-muted max-w-3xl mx-auto">
				Institutional-quality trading infrastructure designed for serious retail traders. 
				Every tool is built to professional standards with enterprise-level reliability and sophistication.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<Button href="/register" size="lg" class="px-8 py-4 text-lg">
					Start Free Trial
				</Button>
				<Button href="/pricing" variant="secondary" size="lg" class="px-8 py-4 text-lg">
					View Pricing
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Features Navigation -->
<section class="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<nav class="flex space-x-8 overflow-x-auto py-4">
			{#each features as feature}
				<a 
					href="#{feature.id}"
					class="flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors
						{activeSection === feature.id 
							? 'bg-primary text-primary-foreground' 
							: 'text-muted hover:text-foreground hover:bg-background'}"
				>
					{feature.title}
				</a>
			{/each}
		</nav>
	</div>
</section>

<!-- Feature Sections -->
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-32">

	<!-- Macro Bias Tool -->
	<section id="macro-bias" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">Macro Bias Tool</h2>
						<p class="text-lg text-primary font-medium">AI-Driven Market Intelligence</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Eliminate directional guesswork with our proprietary AI-powered macroeconomic analysis engine.
						Process the same institutional-grade data that hedge funds use to make billion-dollar decisions.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">Core Problem Solved</h3>
						<p class="text-muted">
							95% of retail traders fail because they trade against institutional money flow. Our Macro Bias Tool
							gives you the same directional intelligence that professional traders use, eliminating the #1 cause
							of retail trading failure: fighting the institutional trend.
						</p>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="bg-success/5 rounded-lg p-4 border border-success/20">
							<div class="text-2xl font-bold text-success">-5 to +5</div>
							<div class="text-sm text-muted">HeatScore Range</div>
						</div>
						<div class="bg-primary/5 rounded-lg p-4 border border-primary/20">
							<div class="text-2xl font-bold text-primary">50+</div>
							<div class="text-sm text-muted">Data Sources</div>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Technical Capabilities</h3>
					<ul class="space-y-3">
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Real-Time Data Processing</div>
								<div class="text-sm text-muted">Continuous analysis of 50+ macroeconomic indicators including COT data, central bank communications, and economic calendars</div>
							</div>
						</li>
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Proprietary HeatScore Algorithm</div>
								<div class="text-sm text-muted">Machine learning models trained on 10+ years of market data to generate precise directional bias scores</div>
							</div>
						</li>
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Institutional Data Integration</div>
								<div class="text-sm text-muted">Direct feeds from major liquidity providers and institutional positioning data previously available only to hedge funds</div>
							</div>
						</li>
					</ul>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Proven Results</h3>
					<div class="grid grid-cols-2 gap-4">
						<div class="text-center">
							<div class="text-3xl font-bold text-primary">60%</div>
							<div class="text-sm text-muted">Reduction in directional bias errors</div>
						</div>
						<div class="text-center">
							<div class="text-3xl font-bold text-success">85%</div>
							<div class="text-sm text-muted">Accuracy in trend identification</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- Heatman Widget -->
	<section id="heatman" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Multi-Pillar Analysis</h3>
					<div class="space-y-4">
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">COT Positioning</span>
							<Badge variant="success">Live Data</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Retail Sentiment</span>
							<Badge variant="primary">Real-Time</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Price Momentum</span>
							<Badge variant="warning">Dynamic</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Correlation Matrix</span>
							<Badge variant="secondary">28 Pairs</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-warning/5 to-error/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Institutional Advantage</h3>
					<p class="text-muted mb-4">
						See what the big money sees. Our heatmap reveals the same currency strength relationships
						that institutional traders use to make million-dollar decisions.
					</p>
					<div class="grid grid-cols-2 gap-4 text-center">
						<div>
							<div class="text-2xl font-bold text-warning">28</div>
							<div class="text-sm text-muted">Currency Pairs</div>
						</div>
						<div>
							<div class="text-2xl font-bold text-error">1000+</div>
							<div class="text-sm text-muted">Updates/Day</div>
						</div>
					</div>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">Heatman Widget</h2>
						<p class="text-lg text-warning font-medium">Currency Strength Visualization</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Transform complex currency relationships into instant visual intelligence. See which currencies
						are strongest and weakest in real-time, with the same multi-dimensional analysis used by
						professional trading desks.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">The Currency Selection Problem</h3>
						<p class="text-muted">
							Most traders pick currency pairs randomly or based on gut feeling. Professional traders use
							systematic currency strength analysis to identify the strongest vs. weakest currencies,
							maximizing profit potential while minimizing correlation risk.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-foreground">Key Benefits</h3>
						<ul class="space-y-2">
							<li class="flex items-center gap-3">
								<svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-muted">Identify strongest vs. weakest currencies instantly</span>
							</li>
							<li class="flex items-center gap-3">
								<svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-muted">Spot divergences between retail and institutional positioning</span>
							</li>
							<li class="flex items-center gap-3">
								<svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-muted">Reduce correlation risk in portfolio management</span>
							</li>
							<li class="flex items-center gap-3">
								<svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-muted">Time entries with optimal currency pair selection</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- XP Learning System -->
	<section id="learning" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">XP Learning System</h2>
						<p class="text-lg text-secondary font-medium">Structured Trading Education</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Master trading through the world's most comprehensive gamified education platform.
						Follow a proven 1-3 year roadmap that takes you from complete beginner to expert trader
						with measurable skill progression.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">The Education Gap Problem</h3>
						<p class="text-muted">
							Most trading education is fragmented, theoretical, and lacks clear progression. Our XP Learning System
							provides structured, practical education with measurable milestones, ensuring you build real skills
							systematically rather than jumping randomly between concepts.
						</p>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
							<div class="text-2xl font-bold text-secondary">200+</div>
							<div class="text-sm text-muted">Interactive Lessons</div>
						</div>
						<div class="bg-primary/5 rounded-lg p-4 border border-primary/20">
							<div class="text-2xl font-bold text-primary">12</div>
							<div class="text-sm text-muted">Core Disciplines</div>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-foreground">Learning Progression</h3>
						<div class="space-y-3">
							<div class="flex items-center gap-3 p-3 bg-background rounded-lg">
								<Badge variant="error">D-Tier</Badge>
								<span class="text-muted">Beginner fundamentals and basic concepts</span>
							</div>
							<div class="flex items-center gap-3 p-3 bg-background rounded-lg">
								<Badge variant="warning">C-Tier</Badge>
								<span class="text-muted">Intermediate strategy development</span>
							</div>
							<div class="flex items-center gap-3 p-3 bg-background rounded-lg">
								<Badge variant="default">B-Tier</Badge>
								<span class="text-muted">Advanced technical and fundamental analysis</span>
							</div>
							<div class="flex items-center gap-3 p-3 bg-background rounded-lg">
								<Badge variant="primary">A-Tier</Badge>
								<span class="text-muted">Professional risk management and psychology</span>
							</div>
							<div class="flex items-center gap-3 p-3 bg-background rounded-lg">
								<Badge variant="success">A+</Badge>
								<span class="text-muted">Expert-level institutional strategies</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Adaptive Learning Technology</h3>
					<ul class="space-y-3">
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Personalized Learning Paths</div>
								<div class="text-sm text-muted">AI-driven curriculum that adapts to your learning speed and identifies knowledge gaps</div>
							</div>
						</li>
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Real-Time Assessment</div>
								<div class="text-sm text-muted">Immediate feedback on quizzes and practical exercises with detailed explanations</div>
							</div>
						</li>
						<li class="flex items-start gap-3">
							<div class="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<div class="font-medium text-foreground">Progress Analytics</div>
								<div class="text-sm text-muted">Detailed competency mapping showing strengths, weaknesses, and recommended focus areas</div>
							</div>
						</li>
					</ul>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-secondary/5 to-primary/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Proven Learning Outcomes</h3>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-muted">Average completion time</span>
							<span class="font-bold text-foreground">18 months</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-muted">Student satisfaction rate</span>
							<span class="font-bold text-success">94%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-muted">Skill improvement (measured)</span>
							<span class="font-bold text-primary">340%</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- Trading Journal -->
	<section id="journal" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Advanced Analytics Engine</h3>
					<div class="grid grid-cols-2 gap-4">
						<div class="text-center p-3 bg-background rounded-lg">
							<div class="text-2xl font-bold text-primary">50+</div>
							<div class="text-xs text-muted">Performance Metrics</div>
						</div>
						<div class="text-center p-3 bg-background rounded-lg">
							<div class="text-2xl font-bold text-success">100%</div>
							<div class="text-xs text-muted">Trade Accuracy</div>
						</div>
						<div class="text-center p-3 bg-background rounded-lg">
							<div class="text-2xl font-bold text-warning">Real-Time</div>
							<div class="text-xs text-muted">P&L Tracking</div>
						</div>
						<div class="text-center p-3 bg-background rounded-lg">
							<div class="text-2xl font-bold text-secondary">Auto</div>
							<div class="text-xs text-muted">Broker Import</div>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Psychology Matrix</h3>
					<p class="text-muted mb-4">
						Track emotional states and decision quality alongside technical performance.
						Identify psychological patterns that impact your trading results.
					</p>
					<div class="space-y-2">
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted">Emotional State Tracking</span>
							<Badge variant="primary">Active</Badge>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted">Decision Quality Scoring</span>
							<Badge variant="success">Enabled</Badge>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-muted">Pattern Recognition</span>
							<Badge variant="warning">AI-Powered</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-primary/5 to-success/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Trade Replay Technology</h3>
					<p class="text-muted">
						Reconstruct any trade with full market context. See exactly what the market looked like
						when you made your decision, enabling deep learning from both wins and losses.
					</p>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">Trading Journal</h2>
						<p class="text-lg text-primary font-medium">Advanced Performance Analytics</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Transform your trading performance through comprehensive analytics and psychological insights.
						Our institutional-grade journal goes far beyond simple trade logging to provide deep
						performance intelligence.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">The Performance Improvement Challenge</h3>
						<p class="text-muted">
							Most traders repeat the same mistakes because they lack systematic performance analysis.
							Our journal identifies patterns in both your technical execution and psychological state,
							providing actionable insights for continuous improvement.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-foreground">Key Capabilities</h3>
						<ul class="space-y-3">
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Automatic Broker Integration</div>
									<div class="text-sm text-muted">Direct import from major brokers with real-time synchronization</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Pattern Recognition AI</div>
									<div class="text-sm text-muted">Identify recurring mistakes and successful patterns automatically</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Professional Reporting</div>
									<div class="text-sm text-muted">Generate institutional-quality performance reports for accountability</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Community Hub -->
	<section id="community" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">Community Hub</h2>
						<p class="text-lg text-success font-medium">Collaborative Trading Environment</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Accelerate your learning through competitive challenges and peer interaction. Connect with
						like-minded traders globally in a verified, professional environment designed for serious
						market participants.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">The Isolation Problem</h3>
						<p class="text-muted">
							Trading is inherently lonely, leading to poor decision-making and lack of accountability.
							Our community provides structured interaction with verified traders, creating motivation,
							learning opportunities, and professional networking that accelerates skill development.
						</p>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="bg-success/5 rounded-lg p-4 border border-success/20">
							<div class="text-2xl font-bold text-success">5000+</div>
							<div class="text-sm text-muted">Active Members</div>
						</div>
						<div class="bg-primary/5 rounded-lg p-4 border border-primary/20">
							<div class="text-2xl font-bold text-primary">24/7</div>
							<div class="text-sm text-muted">Live Chat</div>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-foreground">Community Features</h3>
						<ul class="space-y-3">
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Monthly Trading Challenges</div>
									<div class="text-sm text-muted">Compete in verified performance challenges with transparent, audited results</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Live Trading Rooms</div>
									<div class="text-sm text-muted">Real-time market analysis sessions with experienced traders</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-success mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Mentorship Matching</div>
									<div class="text-sm text-muted">Connect with experienced traders for personalized guidance</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Real-Time Leaderboards</h3>
					<div class="space-y-3">
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-warning rounded-full flex items-center justify-center text-sm font-bold">1</div>
								<span class="font-medium text-foreground">TraderPro_2024</span>
							</div>
							<span class="text-success font-bold">+24.7%</span>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">2</div>
								<span class="font-medium text-foreground">MarketMaster</span>
							</div>
							<span class="text-success font-bold">+18.3%</span>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-warning/50 rounded-full flex items-center justify-center text-sm font-bold">3</div>
								<span class="font-medium text-foreground">FXNinja</span>
							</div>
							<span class="text-success font-bold">+15.9%</span>
						</div>
					</div>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-success/5 to-primary/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Verified Performance</h3>
					<p class="text-muted mb-4">
						All community challenges use verified, audited performance data. No fake results,
						no manipulation - just transparent competition that drives real improvement.
					</p>
					<div class="grid grid-cols-2 gap-4 text-center">
						<div>
							<div class="text-2xl font-bold text-success">100%</div>
							<div class="text-sm text-muted">Verified Results</div>
						</div>
						<div>
							<div class="text-2xl font-bold text-primary">Zero</div>
							<div class="text-sm text-muted">Fake Accounts</div>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">WebSocket Technology</h3>
					<p class="text-muted">
						Experience real-time chat and live market discussions with enterprise-grade WebSocket
						infrastructure supporting 1000+ concurrent users without lag or disconnections.
					</p>
				</Card>
			</div>
		</div>
	</section>

	<!-- Risk Management -->
	<section id="risk" class="scroll-mt-20">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 space-y-6">
				<Card class="p-6">
					<h3 class="text-xl font-semibold text-foreground mb-4">Intelligent Trade Blocking</h3>
					<div class="space-y-4">
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Drawdown Threshold</span>
							<Badge variant="error">5% Daily</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Consecutive Losses</span>
							<Badge variant="warning">3 Trades</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Emotional State</span>
							<Badge variant="secondary">AI Monitored</Badge>
						</div>
						<div class="flex items-center justify-between p-3 bg-background rounded-lg">
							<span class="font-medium text-foreground">Re-enable Process</span>
							<Badge variant="primary">Reflection Required</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-6 bg-gradient-to-br from-error/5 to-warning/5">
					<h3 class="text-xl font-semibold text-foreground mb-4">Behavioral Intervention</h3>
					<p class="text-muted mb-4">
						When risk thresholds are breached, our system doesn't just block trades - it guides you
						through a structured reflection process to understand what went wrong and how to prevent it.
					</p>
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<svg class="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<span class="text-sm text-muted">Mandatory cooling-off period</span>
						</div>
						<div class="flex items-center gap-2">
							<svg class="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<span class="text-sm text-muted">Guided self-assessment questionnaire</span>
						</div>
						<div class="flex items-center gap-2">
							<svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
							<span class="text-sm text-muted">Action plan development</span>
						</div>
					</div>
				</Card>
			</div>

			<div class="order-1 lg:order-2">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div>
						<h2 class="text-3xl font-bold text-foreground">Risk Management</h2>
						<p class="text-lg text-error font-medium">Intelligent Capital Protection</p>
					</div>
				</div>

				<div class="space-y-6">
					<p class="text-xl text-muted leading-relaxed">
						Protect your capital through intelligent automation and behavioral intervention. Our advanced
						risk management system doesn't just set limits - it actively prevents the emotional trading
						that destroys accounts.
					</p>

					<div class="bg-background rounded-xl p-6 border border-border">
						<h3 class="text-lg font-semibold text-foreground mb-4">The Emotional Trading Problem</h3>
						<p class="text-muted">
							80% of trading losses occur during emotional states when traders abandon their rules.
							Our system recognizes these dangerous patterns and intervenes automatically, forcing
							a structured cooling-off period that prevents catastrophic losses.
						</p>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-foreground">Protection Features</h3>
						<ul class="space-y-3">
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-error mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Automatic Trade Blocking</div>
									<div class="text-sm text-muted">Immediate platform lockout when risk thresholds are exceeded</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-warning mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Real-Time Portfolio Heat</div>
									<div class="text-sm text-muted">Continuous monitoring of position sizing and correlation exposure</div>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<svg class="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								<div>
									<div class="font-medium text-foreground">Structured Re-enablement</div>
									<div class="text-sm text-muted">Mandatory reflection and planning before trading privileges are restored</div>
								</div>
							</li>
						</ul>
					</div>

					<div class="bg-gradient-to-r from-error/10 to-warning/10 rounded-xl p-6 border border-error/20">
						<h3 class="text-lg font-semibold text-foreground mb-2">Capital Preservation Statistics</h3>
						<div class="grid grid-cols-2 gap-4 text-center">
							<div>
								<div class="text-2xl font-bold text-error">73%</div>
								<div class="text-sm text-muted">Drawdown Reduction</div>
							</div>
							<div>
								<div class="text-2xl font-bold text-success">92%</div>
								<div class="text-sm text-muted">User Satisfaction</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

</div>

<!-- Call to Action Section -->
<section class="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
				Ready to Transform Your Trading?
			</h2>
			<p class="mt-6 text-xl leading-8 text-muted max-w-3xl mx-auto">
				Join thousands of serious traders who have chosen PriceActionTalk as their professional trading platform.
				Start with our comprehensive free trial and experience institutional-quality tools designed for retail success.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<Button href="/register" size="lg" class="px-8 py-4 text-lg">
					Start Free Trial
				</Button>
				<Button href="/pricing" variant="secondary" size="lg" class="px-8 py-4 text-lg">
					View Pricing Plans
				</Button>
			</div>
		</div>

		<!-- Trust Indicators -->
		<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="text-3xl font-bold text-primary">10,000+</div>
				<div class="text-muted">Active Traders</div>
			</div>
			<div class="text-center">
				<div class="text-3xl font-bold text-success">99.9%</div>
				<div class="text-muted">Uptime Guarantee</div>
			</div>
			<div class="text-center">
				<div class="text-3xl font-bold text-warning">24/7</div>
				<div class="text-muted">Professional Support</div>
			</div>
		</div>
	</div>
</section>
