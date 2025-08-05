<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$stores/auth';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let isLoading = false;
	let error = '';

	onMount(() => {
		// Redirect if already authenticated
		if ($auth.isAuthenticated) {
			goto('/app/dashboard');
		}
	});

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		isLoading = true;
		error = '';

		const result = await auth.login(email, password);

		if (result.success) {
			goto('/app/dashboard');
		} else {
			error = result.error || 'Login failed';
		}

		isLoading = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - PriceActionTalk</title>
	<meta name="description" content="Login to your PriceActionTalk account to access trading tools, education, and community features." />
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<a href="/" class="inline-flex items-center space-x-2 mb-6">
				<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-lg">P</span>
				</div>
				<span class="text-2xl font-bold text-foreground">PriceActionTalk</span>
			</a>
			<h2 class="text-3xl font-bold text-foreground">
				Welcome back
			</h2>
			<p class="mt-2 text-muted">
				Sign in to your account to continue trading
			</p>
		</div>

		<!-- Login Form -->
		<div class="card">
			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				{#if error}
					<div class="bg-error/10 border border-error/20 rounded-md p-3">
						<p class="text-error text-sm">{error}</p>
					</div>
				{/if}

				<div>
					<label for="email" class="form-label">Email address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						on:keypress={handleKeyPress}
						class="form-input"
						placeholder="Enter your email"
						required
						disabled={isLoading}
					/>
				</div>

				<div>
					<label for="password" class="form-label">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						on:keypress={handleKeyPress}
						class="form-input"
						placeholder="Enter your password"
						required
						disabled={isLoading}
					/>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							type="checkbox"
							class="h-4 w-4 text-primary focus:ring-primary border-border rounded"
						/>
						<label for="remember-me" class="ml-2 block text-sm text-muted">
							Remember me
						</label>
					</div>

					<div class="text-sm">
						<a href="/forgot-password" class="text-primary hover:text-primary/80">
							Forgot your password?
						</a>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full btn btn-primary flex items-center justify-center"
				>
					{#if isLoading}
						<div class="spinner mr-2"></div>
						Signing in...
					{:else}
						Sign in
					{/if}
				</button>
			</form>

			<!-- Divider -->
			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-surface text-muted">Don't have an account?</span>
					</div>
				</div>

				<div class="mt-6">
					<a href="/register" class="w-full btn btn-secondary">
						Create new account
					</a>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center">
			<p class="text-xs text-muted">
				By signing in, you agree to our 
				<a href="/terms" class="text-primary hover:text-primary/80">Terms of Service</a>
				and 
				<a href="/privacy" class="text-primary hover:text-primary/80">Privacy Policy</a>
			</p>
		</div>
	</div>
</div>
