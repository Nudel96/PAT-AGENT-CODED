<script lang="ts">
	import Logo from './Logo.svelte';
	import { ExternalLink } from '$lib/components/icons';

	const navigation = {
		platform: [
			{ name: 'Features', href: '/features' },
			{ name: 'Pricing', href: '/pricing' },
			{ name: 'Roadmap', href: '/roadmap' },
			{ name: 'API Documentation', href: '/docs' }
		],
		company: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Careers', href: '/careers' },
			{ name: 'Press Kit', href: '/press' },
			{ name: 'Contact', href: '/contact' }
		],
		resources: [
			{ name: 'Help Center', href: '/help' },
			{ name: 'Community', href: '/community' },
			{ name: 'Blog', href: '/blog' },
			{ name: 'Status Page', href: '/status' }
		],
		legal: [
			{ name: 'Privacy Policy', href: '/privacy' },
			{ name: 'Terms of Service', href: '/terms' },
			{ name: 'Risk Disclosure', href: '/risk-disclosure' },
			{ name: 'Compliance', href: '/compliance' }
		]
	};

	const socialLinks = [
		{ name: 'LinkedIn', href: '#', icon: 'linkedin' },
		{ name: 'Twitter', href: '#', icon: 'twitter' },
		{ name: 'YouTube', href: '#', icon: 'youtube' },
		{ name: 'Telegram', href: '#', icon: 'telegram' }
	];
</script>

<footer class="bg-secondary text-white">
	<div class="container py-16">
		<!-- Main footer content -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
			<!-- Professional brand section -->
			<div class="lg:col-span-2">
				<div class="flex items-center gap-3 mb-6">
					<Logo class="h-10 w-10 text-primary" />
					<div>
						<div class="text-xl font-bold">PriceActionTalk</div>
						<div class="text-xs text-gray-400 font-medium uppercase tracking-wider">Professional</div>
					</div>
				</div>
				<p class="text-gray-300 mb-6 max-w-md leading-relaxed">
					Institutional-grade trading infrastructure designed for serious retail traders. 
					Professional tools, systematic education, and enterprise-level reliability.
				</p>
				
				<!-- Professional social links -->
				<div class="flex gap-4">
					{#each socialLinks as social}
						<a 
							href={social.href}
							class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-700 transition-all duration-200"
							aria-label={social.name}
						>
							{#if social.icon === 'linkedin'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							{:else if social.icon === 'twitter'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							{:else if social.icon === 'youtube'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
								</svg>
							{:else if social.icon === 'telegram'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
								</svg>
							{/if}
						</a>
					{/each}
				</div>
			</div>

			<!-- Professional navigation sections -->
			<div>
				<h3 class="text-sm font-bold text-gray-200 tracking-wider uppercase mb-4">Platform</h3>
				<ul class="space-y-3">
					{#each navigation.platform as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-bold text-gray-200 tracking-wider uppercase mb-4">Company</h3>
				<ul class="space-y-3">
					{#each navigation.company as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-bold text-gray-200 tracking-wider uppercase mb-4">Resources</h3>
				<ul class="space-y-3">
					{#each navigation.resources as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-bold text-gray-200 tracking-wider uppercase mb-4">Legal</h3>
				<ul class="space-y-3">
					{#each navigation.legal as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Professional bottom section -->
		<div class="pt-8 border-t border-gray-700">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div class="text-gray-400 text-sm">
					© 2024 PriceActionTalk Professional. All rights reserved.
				</div>
				
				<div class="flex items-center gap-6 text-gray-400 text-sm">
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-success rounded-full"></div>
						<span>All systems operational</span>
					</div>
					<div class="text-xs">
						Enterprise-grade infrastructure
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>