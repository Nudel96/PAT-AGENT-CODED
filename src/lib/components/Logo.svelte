<script lang="ts">
	let className = '';
	export { className as class };
</script>

<svg
	class="text-primary {className}"
	viewBox="0 0 100 100" 
	fill="currentColor" 
	xmlns="http://www.w3.org/2000/svg"
>
	<!-- Stylized triangular mountain peaks representing price action -->
	<path d="M10 80 L25 40 L40 60 L55 20 L70 50 L85 30 L90 80 Z" 
		  fill="currentColor" 
		  opacity="0.8" />
	
	<!-- Accent line representing trend -->
	<path d="M10 70 L90 30" 
		  stroke="currentColor" 
		  stroke-width="3" 
		  fill="none" 
		  opacity="0.6" />
	
	<!-- Central focal point -->
	<circle cx="50" cy="50" r="4" fill="currentColor" />
	
	<!-- Additional geometric elements for modern look -->
	<path d="M20 85 L30 75 L40 85 Z" fill="currentColor" opacity="0.4" />
	<path d="M60 85 L70 75 L80 85 Z" fill="currentColor" opacity="0.4" />
</svg>
