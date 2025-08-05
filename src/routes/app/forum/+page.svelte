<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface ForumPost {
		id: string;
		title: string;
		content: string;
		category: string;
		tags: string[];
		username: string;
		level: number;
		view_count: number;
		reply_count: number;
		upvotes: number;
		downvotes: number;
		is_pinned: boolean;
		created_at: string;
		updated_at: string;
	}

	interface Category {
		category: string;
		post_count: number;
	}

	let posts: ForumPost[] = [];
	let categories: Category[] = [];
	let isLoading = true;
	let showCreateModal = false;
	let searchQuery = '';
	let selectedCategory = '';
	let currentPage = 1;
	let totalPages = 1;

	// New post form
	let newPost = {
		title: '',
		content: '',
		category: '',
		tags: [] as string[]
	};

	const popularCategories = [
		'Trading Strategies',
		'Market Analysis',
		'Risk Management',
		'Psychology',
		'Technical Analysis',
		'Fundamental Analysis',
		'Beginner Questions',
		'Platform Discussion',
		'General Discussion'
	];

	const commonTags = [
		'forex', 'price-action', 'support-resistance', 'breakout', 'reversal',
		'trend-following', 'scalping', 'swing-trading', 'day-trading', 'risk-management',
		'psychology', 'backtesting', 'strategy', 'analysis', 'beginner'
	];

	onMount(async () => {
		await loadPosts();
		await loadCategories();
	});

	async function loadPosts() {
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '20'
			});

			if (searchQuery) params.append('search', searchQuery);
			if (selectedCategory) params.append('category', selectedCategory);

			const response = await fetch(`/api/forum/posts?${params}`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					posts = data.data;
					totalPages = data.pagination.total_pages;
				}
			}
		} catch (error) {
			console.error('Failed to load posts:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadCategories() {
		try {
			const response = await fetch('/api/forum/categories', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					categories = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load categories:', error);
		}
	}

	async function createPost() {
		try {
			const response = await fetch('/api/forum/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(newPost)
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					showCreateModal = false;
					resetNewPost();
					await loadPosts();
					// Navigate to the new post
					goto(`/app/forum/posts/${data.data.id}`);
				}
			}
		} catch (error) {
			console.error('Failed to create post:', error);
		}
	}

	async function votePost(postId: string, voteType: 'up' | 'down') {
		try {
			const response = await fetch(`/api/forum/posts/${postId}/vote`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({ type: voteType })
			});

			if (response.ok) {
				// Refresh posts to show updated vote counts
				await loadPosts();
			}
		} catch (error) {
			console.error('Failed to vote:', error);
		}
	}

	function resetNewPost() {
		newPost = {
			title: '',
			content: '',
			category: '',
			tags: []
		};
	}

	function toggleTag(tag: string) {
		const index = newPost.tags.indexOf(tag);
		if (index > -1) {
			newPost.tags.splice(index, 1);
		} else {
			newPost.tags.push(tag);
		}
		newPost = { ...newPost }; // Trigger reactivity
	}

	function formatTimeAgo(dateString: string): string {
		const now = new Date();
		const date = new Date(dateString);
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		
		const diffWeeks = Math.floor(diffDays / 7);
		return `${diffWeeks}w ago`;
	}

	function getPostScore(post: ForumPost): number {
		return post.upvotes - post.downvotes;
	}

	function handleSearch() {
		currentPage = 1;
		loadPosts();
	}

	$: if (selectedCategory) {
		currentPage = 1;
		loadPosts();
	}
</script>

<svelte:head>
	<title>Forum - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Trading Forum</h1>
			<p class="text-muted">Share knowledge, ask questions, and connect with the community</p>
		</div>
		<Button on:click={() => showCreateModal = true}>
			Create Post
		</Button>
	</div>

	<!-- Search and filters -->
	<Card padding="md">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<form on:submit|preventDefault={handleSearch} class="flex space-x-2">
					<Input
						bind:value={searchQuery}
						placeholder="Search posts..."
						class="flex-1"
					/>
					<Button type="submit" variant="secondary">
						Search
					</Button>
				</form>
			</div>
			
			<div class="flex items-center space-x-4">
				<select bind:value={selectedCategory} class="form-input">
					<option value="">All Categories</option>
					{#each categories as category}
						<option value={category.category}>{category.category} ({category.post_count})</option>
					{/each}
				</select>
			</div>
		</div>
	</Card>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Posts list -->
		<div class="lg:col-span-3">
			<Card>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground">Recent Posts</h2>
					<div class="text-sm text-muted">
						Page {currentPage} of {totalPages}
					</div>
				</div>

				{#if isLoading}
					<div class="space-y-4">
						{#each Array(5) as _}
							<div class="h-24 bg-border rounded animate-pulse"></div>
						{/each}
					</div>
				{:else if posts.length === 0}
					<div class="text-center py-12">
						<div class="text-4xl mb-4">💬</div>
						<h3 class="text-lg font-medium text-foreground mb-2">No posts found</h3>
						<p class="text-muted mb-4">
							{searchQuery || selectedCategory 
								? 'Try adjusting your search or filters' 
								: 'Be the first to start a discussion'}
						</p>
						<Button on:click={() => showCreateModal = true}>
							Create First Post
						</Button>
					</div>
				{:else}
					<div class="space-y-4">
						{#each posts as post}
							<div class="p-4 bg-background rounded-lg hover:bg-surface transition-colors">
								<!-- Post header -->
								<div class="flex items-start justify-between mb-2">
									<div class="flex-1">
										<div class="flex items-center space-x-2 mb-1">
											{#if post.is_pinned}
												<Badge variant="warning" size="sm">📌 Pinned</Badge>
											{/if}
											<Badge variant="default" size="sm">{post.category}</Badge>
										</div>
										
										<a 
											href="/app/forum/posts/{post.id}"
											class="text-lg font-semibold text-foreground hover:text-primary transition-colors"
										>
											{post.title}
										</a>
										
										<div class="flex items-center space-x-4 mt-2 text-sm text-muted">
											<span>by {post.username}</span>
											<Badge variant="default" size="sm">L{post.level}</Badge>
											<span>{formatTimeAgo(post.created_at)}</span>
											<span>{post.view_count} views</span>
											<span>{post.reply_count} replies</span>
										</div>
									</div>

									<!-- Vote buttons -->
									<div class="flex flex-col items-center space-y-1 ml-4">
										<button
											on:click={() => votePost(post.id, 'up')}
											class="p-1 rounded hover:bg-surface text-muted hover:text-success transition-colors"
										>
											▲
										</button>
										<span class="text-sm font-medium {getPostScore(post) > 0 ? 'text-success' : getPostScore(post) < 0 ? 'text-error' : 'text-muted'}">
											{getPostScore(post)}
										</span>
										<button
											on:click={() => votePost(post.id, 'down')}
											class="p-1 rounded hover:bg-surface text-muted hover:text-error transition-colors"
										>
											▼
										</button>
									</div>
								</div>

								<!-- Post preview -->
								<p class="text-muted text-sm mb-3 line-clamp-2">
									{post.content.substring(0, 200)}...
								</p>

								<!-- Tags -->
								{#if post.tags.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each post.tags as tag}
											<Badge variant="default" size="sm" class="text-xs">
												#{tag}
											</Badge>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="flex items-center justify-center space-x-2 mt-6">
							<Button 
								variant="secondary" 
								size="sm"
								disabled={currentPage === 1}
								on:click={() => { currentPage--; loadPosts(); }}
							>
								Previous
							</Button>
							<span class="text-sm text-muted">
								Page {currentPage} of {totalPages}
							</span>
							<Button 
								variant="secondary" 
								size="sm"
								disabled={currentPage === totalPages}
								on:click={() => { currentPage++; loadPosts(); }}
							>
								Next
							</Button>
						</div>
					{/if}
				{/if}
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Categories -->
			<Card>
				<h3 class="font-semibold text-foreground mb-3">Categories</h3>
				<div class="space-y-2">
					<button
						class="w-full text-left p-2 rounded hover:bg-surface transition-colors {selectedCategory === '' ? 'bg-primary text-white' : ''}"
						on:click={() => selectedCategory = ''}
					>
						All Posts
					</button>
					{#each categories as category}
						<button
							class="w-full text-left p-2 rounded hover:bg-surface transition-colors {selectedCategory === category.category ? 'bg-primary text-white' : ''}"
							on:click={() => selectedCategory = category.category}
						>
							<div class="flex items-center justify-between">
								<span class="text-sm">{category.category}</span>
								<Badge variant="default" size="sm">{category.post_count}</Badge>
							</div>
						</button>
					{/each}
				</div>
			</Card>

			<!-- Forum stats -->
			<Card>
				<h3 class="font-semibold text-foreground mb-3">Forum Stats</h3>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted">Total Posts:</span>
						<span class="text-foreground font-medium">
							{categories.reduce((sum, cat) => sum + cat.post_count, 0)}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted">Categories:</span>
						<span class="text-foreground font-medium">{categories.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted">Active Users:</span>
						<span class="text-foreground font-medium">1,247</span>
					</div>
				</div>
			</Card>

			<!-- Popular tags -->
			<Card>
				<h3 class="font-semibold text-foreground mb-3">Popular Tags</h3>
				<div class="flex flex-wrap gap-1">
					{#each commonTags.slice(0, 10) as tag}
						<Badge variant="default" size="sm" class="text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors">
							#{tag}
						</Badge>
					{/each}
				</div>
			</Card>
		</div>
	</div>
</div>

<!-- Create Post Modal -->
<Modal bind:open={showCreateModal} title="Create New Post" size="lg">
	<form on:submit|preventDefault={createPost} class="space-y-4">
		<Input
			label="Title"
			bind:value={newPost.title}
			placeholder="Enter a descriptive title..."
			required
		/>

		<div>
			<label class="form-label">Category</label>
			<select bind:value={newPost.category} class="form-input" required>
				<option value="">Select a category</option>
				{#each popularCategories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="form-label">Content</label>
			<textarea
				bind:value={newPost.content}
				placeholder="Share your thoughts, ask questions, or start a discussion..."
				class="form-input resize-none"
				rows="8"
				required
			></textarea>
		</div>

		<div>
			<label class="form-label">Tags (optional)</label>
			<div class="flex flex-wrap gap-2 mb-2">
				{#each commonTags as tag}
					<button
						type="button"
						class="px-2 py-1 text-xs rounded border transition-colors {
							newPost.tags.includes(tag)
								? 'bg-primary text-white border-primary'
								: 'bg-background text-foreground border-border hover:border-primary'
						}"
						on:click={() => toggleTag(tag)}
					>
						#{tag}
					</button>
				{/each}
			</div>
			<p class="text-xs text-muted">Select relevant tags to help others find your post</p>
		</div>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => { showCreateModal = false; resetNewPost(); }}>
			Cancel
		</Button>
		<Button on:click={createPost} disabled={!newPost.title || !newPost.content || !newPost.category}>
			Create Post
		</Button>
	</svelte:fragment>
</Modal>
