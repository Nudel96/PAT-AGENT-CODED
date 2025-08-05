<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Button from '$components/ui/Button.svelte';

	interface LearningPath {
		id: string;
		title: string;
		description: string;
		level_requirement: number;
		estimated_duration: number;
		xp_reward: number;
		module_count: number;
		completed_modules: number;
		progress_percentage: number;
	}

	interface LearningModule {
		id: string;
		title: string;
		content: string;
		module_type: 'lesson' | 'quiz' | 'assignment';
		order_index: number;
		xp_reward: number;
		user_status: 'not_started' | 'in_progress' | 'completed';
		score?: number;
		attempts?: number;
	}

	interface UserProgress {
		path_title: string;
		module_title: string;
		status: string;
		score?: number;
		completed_at?: string;
		xp_reward: number;
	}

	let learningPaths: LearningPath[] = [];
	let selectedPath: LearningPath | null = null;
	let pathModules: LearningModule[] = [];
	let userProgress: UserProgress[] = [];
	let selectedModule: LearningModule | null = null;
	let isLoading = true;
	let isLoadingModules = false;
	let currentLevel = 1;
	let currentXP = 0;
	let xpToNextLevel = 1000;

	// Level system configuration
	const levelTiers = [
		{ tier: 'D', levels: [1, 2, 3, 4, 5], color: 'text-gray-500', bg: 'bg-gray-100' },
		{ tier: 'C', levels: [6, 7, 8, 9, 10], color: 'text-orange-500', bg: 'bg-orange-100' },
		{ tier: 'B', levels: [11, 12, 13, 14, 15], color: 'text-yellow-500', bg: 'bg-yellow-100' },
		{ tier: 'A', levels: [16, 17, 18, 19, 20], color: 'text-green-500', bg: 'bg-green-100' },
		{ tier: 'A+', levels: [21, 22, 23, 24, 25], color: 'text-blue-500', bg: 'bg-blue-100' }
	];

	onMount(async () => {
		await loadLearningData();
	});

	async function loadLearningData() {
		try {
			// Load user info
			if ($auth.user) {
				currentLevel = $auth.user.level;
				currentXP = $auth.user.xp;
				xpToNextLevel = calculateXPToNextLevel(currentLevel, currentXP);
			}

			// Load learning paths
			const pathsResponse = await fetch('/api/learning/paths', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (pathsResponse.ok) {
				const pathsData = await pathsResponse.json();
				if (pathsData.success) {
					learningPaths = pathsData.data.map((path: any) => ({
						...path,
						progress_percentage: path.module_count > 0 
							? (path.completed_modules / path.module_count) * 100 
							: 0
					}));
				}
			}

			// Load user progress
			const progressResponse = await fetch('/api/learning/progress', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (progressResponse.ok) {
				const progressData = await progressResponse.json();
				if (progressData.success) {
					userProgress = progressData.data;
				}
			}

		} catch (error) {
			console.error('Failed to load learning data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadPathModules(pathId: string) {
		isLoadingModules = true;
		try {
			const response = await fetch(`/api/learning/paths/${pathId}/modules`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					pathModules = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load modules:', error);
		} finally {
			isLoadingModules = false;
		}
	}

	async function startModule(moduleId: string) {
		try {
			const response = await fetch(`/api/learning/modules/${moduleId}/progress`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({ status: 'in_progress' })
			});

			if (response.ok) {
				// Refresh modules
				if (selectedPath) {
					await loadPathModules(selectedPath.id);
				}
			}
		} catch (error) {
			console.error('Failed to start module:', error);
		}
	}

	async function completeModule(moduleId: string, score?: number) {
		try {
			const response = await fetch(`/api/learning/modules/${moduleId}/progress`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({ 
					status: 'completed',
					score: score || 100
				})
			});

			if (response.ok) {
				// Refresh data
				await loadLearningData();
				if (selectedPath) {
					await loadPathModules(selectedPath.id);
				}
			}
		} catch (error) {
			console.error('Failed to complete module:', error);
		}
	}

	function calculateXPToNextLevel(level: number, xp: number): number {
		const baseXP = 1000;
		const xpForCurrentLevel = baseXP * level;
		const xpForNextLevel = baseXP * (level + 1);
		return xpForNextLevel - xp;
	}

	function getCurrentTier(level: number): any {
		return levelTiers.find(tier => tier.levels.includes(level)) || levelTiers[0];
	}

	function getModuleIcon(type: string): string {
		switch (type) {
			case 'lesson': return '📚';
			case 'quiz': return '❓';
			case 'assignment': return '📝';
			default: return '📖';
		}
	}

	function getStatusBadgeVariant(status: string): 'default' | 'warning' | 'success' {
		switch (status) {
			case 'completed': return 'success';
			case 'in_progress': return 'warning';
			default: return 'default';
		}
	}

	function selectPath(path: LearningPath) {
		selectedPath = path;
		selectedModule = null;
		loadPathModules(path.id);
	}

	function selectModule(module: LearningModule) {
		selectedModule = module;
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}

	$: currentTier = getCurrentTier(currentLevel);
	$: levelProgress = currentLevel > 1 ? ((currentXP % 1000) / 1000) * 100 : (currentXP / 1000) * 100;
</script>

<svelte:head>
	<title>Learning Levels - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Learning & Progression</h1>
		<p class="text-muted">Master trading through structured learning paths and earn XP</p>
	</div>

	<!-- User level and progress -->
	<Card>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-foreground">Your Progress</h2>
			<div class="flex items-center space-x-2">
				<span class="text-sm text-muted">Tier</span>
				<Badge variant="default" class="{currentTier.color} {currentTier.bg}">
					{currentTier.tier}
				</Badge>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="text-center">
				<div class="text-3xl font-bold text-foreground mb-1">Level {currentLevel}</div>
				<div class="text-sm text-muted">Current Level</div>
				<div class="mt-2">
					<div class="w-full bg-border rounded-full h-2">
						<div 
							class="bg-accent h-2 rounded-full transition-all duration-300"
							style="width: {levelProgress}%"
						></div>
					</div>
					<div class="text-xs text-muted mt-1">{xpToNextLevel} XP to next level</div>
				</div>
			</div>

			<div class="text-center">
				<div class="text-3xl font-bold text-accent mb-1">{currentXP.toLocaleString()}</div>
				<div class="text-sm text-muted">Total XP</div>
			</div>

			<div class="text-center">
				<div class="text-3xl font-bold text-primary mb-1">
					{userProgress.filter(p => p.status === 'completed').length}
				</div>
				<div class="text-sm text-muted">Modules Completed</div>
			</div>
		</div>
	</Card>

	{#if isLoading}
		<!-- Loading state -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each Array(6) as _}
				<Card class="animate-pulse">
					<div class="h-4 bg-border rounded w-1/2 mb-2"></div>
					<div class="h-8 bg-border rounded w-3/4 mb-2"></div>
					<div class="h-3 bg-border rounded w-full"></div>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Learning paths -->
			<div class="lg:col-span-2">
				<Card>
					<h2 class="text-lg font-semibold text-foreground mb-4">Learning Paths</h2>
					
					<div class="space-y-4">
						{#each learningPaths as path}
							<div 
								class="p-4 bg-background rounded-lg border-2 cursor-pointer transition-all duration-200 {
									selectedPath?.id === path.id ? 'border-primary' : 'border-transparent hover:border-border'
								}"
								on:click={() => selectPath(path)}
								on:keydown={(e) => e.key === 'Enter' && selectPath(path)}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start justify-between mb-2">
									<div class="flex-1">
										<h3 class="font-semibold text-foreground">{path.title}</h3>
										<p class="text-sm text-muted mt-1">{path.description}</p>
									</div>
									<div class="ml-4 text-right">
										<Badge variant={path.level_requirement <= currentLevel ? 'success' : 'default'}>
											Level {path.level_requirement}+
										</Badge>
									</div>
								</div>

								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center space-x-4">
										<span class="text-muted">
											{path.module_count} modules
										</span>
										<span class="text-muted">
											~{formatDuration(path.estimated_duration)}
										</span>
										<span class="text-accent">
											{path.xp_reward} XP
										</span>
									</div>
									<div class="text-right">
										<div class="text-xs text-muted mb-1">
											{path.completed_modules}/{path.module_count} completed
										</div>
										<div class="w-20 bg-border rounded-full h-1">
											<div 
												class="bg-primary h-1 rounded-full transition-all duration-300"
												style="width: {path.progress_percentage}%"
											></div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</Card>
			</div>

			<!-- Path modules or recent progress -->
			<div>
				{#if selectedPath}
					<Card>
						<div class="flex items-center justify-between mb-4">
							<h2 class="text-lg font-semibold text-foreground">
								{selectedPath.title}
							</h2>
							<button 
								on:click={() => { selectedPath = null; selectedModule = null; }}
								class="text-muted hover:text-foreground"
							>
								✕
							</button>
						</div>

						{#if isLoadingModules}
							<div class="space-y-3">
								{#each Array(5) as _}
									<div class="h-16 bg-border rounded animate-pulse"></div>
								{/each}
							</div>
						{:else}
							<div class="space-y-3">
								{#each pathModules as module}
									<div 
										class="p-3 bg-background rounded-lg cursor-pointer hover:bg-surface transition-colors {
											selectedModule?.id === module.id ? 'ring-2 ring-primary' : ''
										}"
										on:click={() => selectModule(module)}
										on:keydown={(e) => e.key === 'Enter' && selectModule(module)}
										role="button"
										tabindex="0"
									>
										<div class="flex items-center justify-between mb-2">
											<div class="flex items-center space-x-2">
												<span class="text-lg">{getModuleIcon(module.module_type)}</span>
												<span class="font-medium text-foreground text-sm">{module.title}</span>
											</div>
											<Badge variant={getStatusBadgeVariant(module.user_status)} size="sm">
												{module.user_status.replace('_', ' ')}
											</Badge>
										</div>

										<div class="flex items-center justify-between text-xs">
											<span class="text-muted capitalize">{module.module_type}</span>
											<span class="text-accent">{module.xp_reward} XP</span>
										</div>

										{#if module.user_status === 'not_started'}
											<Button 
												size="sm" 
												variant="secondary" 
												class="w-full mt-2"
												on:click={(e) => { e.stopPropagation(); startModule(module.id); }}
											>
												Start Module
											</Button>
										{:else if module.user_status === 'in_progress'}
											<Button 
												size="sm" 
												variant="primary" 
												class="w-full mt-2"
												on:click={(e) => { e.stopPropagation(); completeModule(module.id); }}
											>
												Complete Module
											</Button>
										{:else}
											<div class="mt-2 text-xs text-success">
												✓ Completed {module.score ? `(${module.score}%)` : ''}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</Card>
				{:else}
					<Card>
						<h2 class="text-lg font-semibold text-foreground mb-4">Recent Progress</h2>
						
						{#if userProgress.length > 0}
							<div class="space-y-3">
								{#each userProgress.slice(0, 10) as progress}
									<div class="p-3 bg-background rounded-lg">
										<div class="font-medium text-foreground text-sm">{progress.module_title}</div>
										<div class="text-xs text-muted">{progress.path_title}</div>
										<div class="flex items-center justify-between mt-2">
											<Badge variant={getStatusBadgeVariant(progress.status)} size="sm">
												{progress.status}
											</Badge>
											<span class="text-xs text-accent">+{progress.xp_reward} XP</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<div class="text-4xl mb-2">🎓</div>
								<p class="text-muted">Start your learning journey</p>
								<p class="text-xs text-muted mt-1">Select a learning path to begin</p>
							</div>
						{/if}
					</Card>
				{/if}
			</div>
		</div>

		<!-- Module content viewer -->
		{#if selectedModule}
			<Card>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground">{selectedModule.title}</h2>
					<Badge variant="default" class="capitalize">
						{selectedModule.module_type}
					</Badge>
				</div>

				<div class="prose prose-sm max-w-none">
					{#if selectedModule.content}
						<div class="text-foreground whitespace-pre-wrap">{selectedModule.content}</div>
					{:else}
						<div class="text-center py-8">
							<div class="text-4xl mb-2">{getModuleIcon(selectedModule.module_type)}</div>
							<p class="text-muted">Module content will be loaded here</p>
							<p class="text-xs text-muted mt-1">Interactive {selectedModule.module_type} experience</p>
						</div>
					{/if}
				</div>

				{#if selectedModule.user_status !== 'completed'}
					<div class="mt-6 pt-4 border-t border-border">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted">Ready to continue?</span>
							<Button 
								variant="primary"
								on:click={() => completeModule(selectedModule.id)}
							>
								{selectedModule.user_status === 'not_started' ? 'Start' : 'Complete'} Module
							</Button>
						</div>
					</div>
				{/if}
			</Card>
		{/if}
	{/if}
</div>
