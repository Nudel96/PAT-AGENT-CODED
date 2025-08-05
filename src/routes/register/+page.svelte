<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$stores/auth';
	import { onMount } from 'svelte';

	let email = '';
	let username = '';
	let password = '';
	let confirmPassword = '';
	let isLoading = false;
	let error = '';
	let acceptTerms = false;

	onMount(() => {
		// Redirect if already authenticated
		if ($auth.isAuthenticated) {
			goto('/app/dashboard');
		}
	});

	async function handleRegister() {
		// Validation
		if (!email || !username || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		if (!acceptTerms) {
			error = 'Please accept the Terms of Service and Privacy Policy';
			return;
		}

		isLoading = true;
		error = '';

		const result = await auth.register(email, username, password);

		if (result.success) {
			goto('/app/dashboard');
		} else {
			error = result.error || 'Registration failed';
		}

		isLoading = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleRegister();
		}
	}

	// Password strength indicator
	$: passwordStrength = getPasswordStrength(password);

	function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
		if (!pwd) return { score: 0, label: '', color: '' };
		
		let score = 0;
		if (pwd.length >= 8) score++;
		if (/[a-z]/.test(pwd)) score++;
		if (/[A-Z]/.test(pwd)) score++;
		if (/[0-9]/.test(pwd)) score++;
		if (/[^A-Za-z0-9]/.test(pwd)) score++;

		const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
		const colors = ['#dc2626', '#ea580c', '#facc15', '#65a30d', '#16a34a'];

		return {
			score,
			label: labels[score - 1] || '',
			color: colors[score - 1] || '#dc2626'
		};
	}
</script>

<svelte:head>
	<title>Register - PriceActionTalk</title>
	<meta name="description" content="Create your PriceActionTalk account to access comprehensive trading tools, education, and community features." />
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
				Create your account
			</h2>
			<p class="mt-2 text-muted">
				Join thousands of traders mastering price action
			</p>
		</div>

		<!-- Registration Form -->
		<div class="card">
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
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
					<label for="username" class="form-label">Username</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						on:keypress={handleKeyPress}
						class="form-input"
						placeholder="Choose a username"
						required
						disabled={isLoading}
						minlength="3"
						maxlength="50"
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
						placeholder="Create a strong password"
						required
						disabled={isLoading}
						minlength="8"
					/>
					
					{#if password && passwordStrength.label}
						<div class="mt-2">
							<div class="flex items-center justify-between text-xs">
								<span class="text-muted">Password strength:</span>
								<span style="color: {passwordStrength.color}">{passwordStrength.label}</span>
							</div>
							<div class="w-full bg-border rounded-full h-1 mt-1">
								<div 
									class="h-1 rounded-full transition-all duration-300"
									style="width: {(passwordStrength.score / 5) * 100}%; background-color: {passwordStrength.color}"
								></div>
							</div>
						</div>
					{/if}
				</div>

				<div>
					<label for="confirmPassword" class="form-label">Confirm password</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						on:keypress={handleKeyPress}
						class="form-input"
						placeholder="Confirm your password"
						required
						disabled={isLoading}
					/>
				</div>

				<div class="flex items-start">
					<div class="flex items-center h-5">
						<input
							id="accept-terms"
							type="checkbox"
							bind:checked={acceptTerms}
							class="h-4 w-4 text-primary focus:ring-primary border-border rounded"
							required
						/>
					</div>
					<div class="ml-3 text-sm">
						<label for="accept-terms" class="text-muted">
							I agree to the 
							<a href="/terms" class="text-primary hover:text-primary/80" target="_blank">Terms of Service</a>
							and 
							<a href="/privacy" class="text-primary hover:text-primary/80" target="_blank">Privacy Policy</a>
						</label>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading || !acceptTerms}
					class="w-full btn btn-primary flex items-center justify-center"
				>
					{#if isLoading}
						<div class="spinner mr-2"></div>
						Creating account...
					{:else}
						Create account
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
						<span class="px-2 bg-surface text-muted">Already have an account?</span>
					</div>
				</div>

				<div class="mt-6">
					<a href="/login" class="w-full btn btn-secondary">
						Sign in instead
					</a>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center">
			<p class="text-xs text-muted">
				By creating an account, you're joining a community of traders committed to 
				<span class="text-accent font-medium">discipline over dreams</span>
			</p>
		</div>
	</div>
</div>
