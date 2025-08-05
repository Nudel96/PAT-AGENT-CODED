<script lang="ts">
	import Logo from './Logo.svelte';

	const navigation = {
		product: [
			{ name: 'Features', href: '/features' },
			{ name: 'Pricing', href: '/pricing' },
			{ name: 'Roadmap', href: '/roadmap' },
			{ name: 'Changelog', href: '/changelog' }
		],
		company: [
			{ name: 'About', href: '/about' },
			{ name: 'Blog', href: '/blog' },
			{ name: 'Careers', href: '/careers' },
			{ name: 'Contact', href: '/contact' }
		],
		resources: [
			{ name: 'Documentation', href: '/docs' },
			{ name: 'Help Center', href: '/help' },
			{ name: 'Community', href: '/community' },
			{ name: 'Status', href: '/status' }
		],
		legal: [
			{ name: 'Privacy Policy', href: '/privacy' },
			{ name: 'Terms of Service', href: '/terms' },
			{ name: 'Cookie Policy', href: '/cookies' },
			{ name: 'Disclaimer', href: '/disclaimer' }
		]
	};

	const socialLinks = [
		{ name: 'Twitter', href: '#', icon: 'twitter' },
		{ name: 'Discord', href: '#', icon: 'discord' },
		{ name: 'YouTube', href: '#', icon: 'youtube' },
		{ name: 'Telegram', href: '#', icon: 'telegram' }
	];
</script>

<footer class="bg-secondary text-white">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Main footer content -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
			<!-- Brand section -->
			<div class="lg:col-span-2">
				<div class="flex items-center space-x-2 mb-4">
					<Logo class="h-8 w-8 text-primary" />
					<span class="text-xl font-bold">PriceActionTalk</span>
				</div>
				<p class="text-gray-300 mb-6 max-w-md">
					The future of trading is here. Master price action trading with comprehensive 
					data-driven tools, education, and community features.
				</p>
				
				<!-- Social links -->
				<div class="flex space-x-4">
					{#each socialLinks as social}
						<a 
							href={social.href}
							class="text-gray-400 hover:text-primary transition-colors duration-200"
							aria-label={social.name}
						>
							{#if social.icon === 'twitter'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							{:else if social.icon === 'discord'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
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

			<!-- Navigation sections -->
			<div>
				<h3 class="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Product</h3>
				<ul class="space-y-3">
					{#each navigation.product as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Company</h3>
				<ul class="space-y-3">
					{#each navigation.company as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Resources</h3>
				<ul class="space-y-3">
					{#each navigation.resources as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Legal</h3>
				<ul class="space-y-3">
					{#each navigation.legal as item}
						<li>
							<a href={item.href} class="text-gray-300 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Bottom section -->
		<div class="mt-12 pt-8 border-t border-gray-700">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="text-gray-400 text-sm">
					© 2024 PriceActionTalk. All rights reserved. Powered by Germany.
				</div>
				
				<div class="mt-4 md:mt-0 text-gray-400 text-sm">
					<span class="inline-flex items-center">
						Trading involves risk. Past performance does not guarantee future results.
					</span>
				</div>
			</div>
		</div>
	</div>
</footer>
