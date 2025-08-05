<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$stores/theme';
	import Hero from '$components/Hero.svelte';
	import Features from '$components/Features.svelte';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';

	onMount(() => {
		// Any initialization logic for the home page
	});
</script>

<svelte:head>
	<title>PriceActionTalk - The Future of Trading is Here</title>
	<meta name="description" content="Master price action trading with comprehensive data-driven tools, education, and community features. All-in-one trading hub powered by Germany." />
</svelte:head>

<Header />

<main>
	<Hero />
	<Features />
</main>

<Footer />
