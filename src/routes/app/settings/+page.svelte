<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import { theme } from '$stores/theme';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';

	let profile = {
		first_name: '',
		last_name: '',
		bio: '',
		timezone: 'UTC',
		theme: 'dark' as 'light' | 'dark',
		language: 'en',
		notifications_enabled: true
	};

	let passwordForm = {
		current_password: '',
		new_password: '',
		confirm_password: ''
	};

	let isLoading = false;
	let isSaving = false;
	let message = '';
	let error = '';

	const timezones = [
		'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
		'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
		'Asia/Kolkata', 'Australia/Sydney'
	];

	const languages = [
		{ code: 'en', name: 'English' },
		{ code: 'es', name: 'Español' },
		{ code: 'fr', name: 'Français' },
		{ code: 'de', name: 'Deutsch' },
		{ code: 'pt', name: 'Português' },
		{ code: 'zh', name: '中文' },
		{ code: 'ja', name: '日本語' }
	];

	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		isLoading = true;
		try {
			const response = await fetch('/api/users/profile', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success && data.data.profile) {
					profile = { ...profile, ...data.data.profile };
				}
			}
		} catch (err) {
			console.error('Failed to load profile:', err);
		} finally {
			isLoading = false;
		}
	}

	async function saveProfile() {
		isSaving = true;
		error = '';
		message = '';

		try {
			const response = await fetch('/api/users/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(profile)
			});

			const data = await response.json();

			if (data.success) {
				message = 'Profile updated successfully';
				// Update theme if changed
				if (profile.theme !== $theme) {
					theme.set(profile.theme as 'light' | 'dark');
				}
			} else {
				error = data.error || 'Failed to update profile';
			}
		} catch (err) {
			error = 'Network error occurred';
		} finally {
			isSaving = false;
		}
	}

	async function changePassword() {
		if (passwordForm.new_password !== passwordForm.confirm_password) {
			error = 'New passwords do not match';
			return;
		}

		if (passwordForm.new_password.length < 8) {
			error = 'New password must be at least 8 characters';
			return;
		}

		isSaving = true;
		error = '';
		message = '';

		try {
			const response = await fetch('/api/users/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(passwordForm)
			});

			const data = await response.json();

			if (data.success) {
				message = 'Password changed successfully';
				passwordForm = {
					current_password: '',
					new_password: '',
					confirm_password: ''
				};
			} else {
				error = data.error || 'Failed to change password';
			}
		} catch (err) {
			error = 'Network error occurred';
		} finally {
			isSaving = false;
		}
	}

	function clearMessages() {
		message = '';
		error = '';
	}
</script>

<svelte:head>
	<title>Settings - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Settings</h1>
		<p class="text-muted">Manage your account settings and preferences</p>
	</div>

	{#if message}
		<div class="bg-success/10 border border-success/20 rounded-md p-3">
			<p class="text-success text-sm">{message}</p>
		</div>
	{/if}

	{#if error}
		<div class="bg-error/10 border border-error/20 rounded-md p-3">
			<p class="text-error text-sm">{error}</p>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Profile Information -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
			
			{#if isLoading}
				<div class="space-y-4">
					{#each Array(4) as _}
						<div class="h-10 bg-border rounded animate-pulse"></div>
					{/each}
				</div>
			{:else}
				<form on:submit|preventDefault={saveProfile} class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Input
							label="First Name"
							bind:value={profile.first_name}
							placeholder="Enter your first name"
							on:input={clearMessages}
						/>
						<Input
							label="Last Name"
							bind:value={profile.last_name}
							placeholder="Enter your last name"
							on:input={clearMessages}
						/>
					</div>

					<div>
						<label for="bio" class="form-label">Bio</label>
						<textarea
							id="bio"
							bind:value={profile.bio}
							placeholder="Tell us about yourself..."
							class="form-input resize-none"
							rows="3"
							maxlength="500"
							on:input={clearMessages}
						></textarea>
						<p class="text-xs text-muted mt-1">{profile.bio.length}/500 characters</p>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="timezone" class="form-label">Timezone</label>
							<select id="timezone" bind:value={profile.timezone} class="form-input" on:change={clearMessages}>
								{#each timezones as tz}
									<option value={tz}>{tz}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="language" class="form-label">Language</label>
							<select id="language" bind:value={profile.language} class="form-input" on:change={clearMessages}>
								{#each languages as lang}
									<option value={lang.code}>{lang.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<Button type="submit" loading={isSaving} class="w-full sm:w-auto">
						Save Profile
					</Button>
				</form>
			{/if}
		</Card>

		<!-- Account Settings -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Account Settings</h2>
			
			<div class="space-y-6">
				<!-- Theme Selection -->
				<div>
					<fieldset>
						<legend class="form-label">Theme</legend>
						<div class="flex space-x-4">
						<label class="flex items-center">
							<input
								type="radio"
								bind:group={profile.theme}
								value="light"
								class="mr-2"
								on:change={clearMessages}
							/>
							<span class="text-sm">Light</span>
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								bind:group={profile.theme}
								value="dark"
								class="mr-2"
								on:change={clearMessages}
							/>
							<span class="text-sm">Dark</span>
						</label>
						</div>
					</fieldset>
				</div>

				<!-- Notifications -->
				<div>
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={profile.notifications_enabled}
							class="mr-2"
							on:change={clearMessages}
						/>
						<span class="text-sm">Enable email notifications</span>
					</label>
				</div>

				<!-- Account Info -->
				<div class="pt-4 border-t border-border">
					<h3 class="font-medium text-foreground mb-2">Account Information</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted">Email:</span>
							<span class="text-foreground">{$auth.user?.email}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted">Username:</span>
							<span class="text-foreground">{$auth.user?.username}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted">Plan:</span>
							<span class="text-accent capitalize">{$auth.user?.subscription_tier}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted">Level:</span>
							<span class="text-foreground">{$auth.user?.level}</span>
						</div>
					</div>
				</div>
			</div>
		</Card>

		<!-- Change Password -->
		<Card>
			<h2 class="text-lg font-semibold text-foreground mb-4">Change Password</h2>
			
			<form on:submit|preventDefault={changePassword} class="space-y-4">
				<Input
					type="password"
					label="Current Password"
					bind:value={passwordForm.current_password}
					placeholder="Enter current password"
					required
					on:input={clearMessages}
				/>

				<Input
					type="password"
					label="New Password"
					bind:value={passwordForm.new_password}
					placeholder="Enter new password"
					required
					minlength="8"
					on:input={clearMessages}
				/>

				<Input
					type="password"
					label="Confirm New Password"
					bind:value={passwordForm.confirm_password}
					placeholder="Confirm new password"
					required
					on:input={clearMessages}
				/>

				<Button type="submit" loading={isSaving} variant="secondary" class="w-full sm:w-auto">
					Change Password
				</Button>
			</form>
		</Card>

		<!-- Danger Zone -->
		<Card>
			<h2 class="text-lg font-semibold text-error mb-4">Danger Zone</h2>
			
			<div class="space-y-4">
				<div class="p-4 border border-error/20 rounded-md bg-error/5">
					<h3 class="font-medium text-foreground mb-2">Delete Account</h3>
					<p class="text-sm text-muted mb-4">
						Once you delete your account, there is no going back. Please be certain.
					</p>
					<Button variant="danger" size="sm">
						Delete Account
					</Button>
				</div>
			</div>
		</Card>
	</div>
</div>
