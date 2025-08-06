<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { auth } from '$stores/auth';
	import Card from '$components/ui/Card.svelte';
	import Button from '$components/ui/Button.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import Modal from '$components/ui/Modal.svelte';

	interface Challenge {
		id: string;
		title: string;
		description: string;
		challenge_type: 'daily' | 'weekly' | 'monthly';
		start_date: string;
		end_date: string;
		entry_fee_xp: number;
		reward_xp: number;
		max_participants: number;
		participant_count: number;
		rules: string[];
		status: 'upcoming' | 'active' | 'completed';
		user_joined?: boolean;
	}

	interface Participant {
		id: string;
		user_id: string;
		username: string;
		level: number;
		final_score?: number;
		rank?: number;
		trades_count: number;
		win_rate?: number;
		roi?: number;
		status: 'active' | 'completed' | 'disqualified';
	}

	interface ChatMessage {
		id: string;
		user_id: string;
		username: string;
		level: number;
		content: string;
		timestamp: string;
	}

	let challenges: Challenge[] = [];
	let selectedChallenge: Challenge | null = null;
	let leaderboard: Participant[] = [];
	let chatMessages: ChatMessage[] = [];
	let newMessage = '';
	let selectedRoom = 'general';
	let isLoading = true;
	let showChallengeModal = false;
	let ws: WebSocket | null = null;

	const chatRooms = [
		{ id: 'general', name: 'General Chat', icon: '💬' },
		{ id: 'trading', name: 'Trading Discussion', icon: '📈' },
		{ id: 'analysis', name: 'Market Analysis', icon: '🔍' },
		{ id: 'help', name: 'Help & Support', icon: '❓' }
	];

	onMount(async () => {
		await loadChallenges();
		await loadChatMessages();
		setupWebSocket();
	});

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	async function loadChallenges() {
		try {
			const response = await fetch('/api/community/challenges', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					challenges = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load challenges:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadLeaderboard(challengeId: string) {
		try {
			const response = await fetch(`/api/community/challenges/${challengeId}/leaderboard`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					leaderboard = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load leaderboard:', error);
		}
	}

	async function loadChatMessages() {
		try {
			const response = await fetch(`/api/community/chat/${selectedRoom}?limit=50`, {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					chatMessages = data.data;
				}
			}
		} catch (error) {
			console.error('Failed to load chat messages:', error);
		}
	}

	async function joinChallenge(challengeId: string) {
		try {
			const response = await fetch(`/api/community/challenges/${challengeId}/join`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (response.ok) {
				await loadChallenges();
				if (selectedChallenge?.id === challengeId) {
					await loadLeaderboard(challengeId);
				}
			}
		} catch (error) {
			console.error('Failed to join challenge:', error);
		}
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;

		try {
			const response = await fetch(`/api/community/chat/${selectedRoom}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify({ content: newMessage.trim() })
			});

			if (response.ok) {
				newMessage = '';
				// Message will be added via WebSocket
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	}

	function setupWebSocket() {
		const wsUrl = `ws://localhost:3002`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('Community WebSocket connected');
			ws?.send(JSON.stringify({
				type: 'auth',
				payload: { token: $auth.token }
			}));
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			
			if (message.type === 'auth_success') {
				// Join the current chat room
				ws?.send(JSON.stringify({
					type: 'join_room',
					payload: { room: selectedRoom }
				}));
			} else if (message.type === 'chat_message') {
				// Add new message to chat
				chatMessages = [...chatMessages, message.payload];
				scrollChatToBottom();
			} else if (message.type === 'user_joined') {
				// Handle user joined notification
				console.log(`${message.payload.username} joined ${message.payload.room}`);
			}
		};

		ws.onerror = (error) => {
			console.error('Community WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('Community WebSocket disconnected');
			setTimeout(setupWebSocket, 5000);
		};
	}

	function scrollChatToBottom() {
		setTimeout(() => {
			const chatContainer = document.getElementById('chat-messages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function selectChallenge(challenge: Challenge) {
		selectedChallenge = challenge;
		showChallengeModal = true;
		loadLeaderboard(challenge.id);
	}

	function switchRoom(roomId: string) {
		// Leave current room
		if (ws && selectedRoom) {
			ws.send(JSON.stringify({
				type: 'leave_room',
				payload: { room: selectedRoom }
			}));
		}

		selectedRoom = roomId;
		loadChatMessages();

		// Join new room
		if (ws) {
			ws.send(JSON.stringify({
				type: 'join_room',
				payload: { room: selectedRoom }
			}));
		}
	}

	function getChallengeStatusColor(status: string): string {
		switch (status) {
			case 'active': return 'text-success';
			case 'upcoming': return 'text-warning';
			case 'completed': return 'text-muted';
			default: return 'text-muted';
		}
	}

	function getChallengeTypeIcon(type: string): string {
		switch (type) {
			case 'daily': return '📅';
			case 'weekly': return '📊';
			case 'monthly': return '🏆';
			default: return '🎯';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
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
		return `${diffDays}d ago`;
	}

	$: if (selectedRoom) {
		switchRoom(selectedRoom);
	}
</script>

<svelte:head>
	<title>Community - PriceActionTalk</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Community Hub</h1>
		<p class="text-muted">Connect with traders, join challenges, and share insights</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Challenges -->
		<div class="lg:col-span-2">
			<Card>
				<h2 class="text-lg font-semibold text-foreground mb-4">Active Challenges</h2>
				
				{#if isLoading}
					<div class="space-y-4">
						{#each Array(3) as _}
							<div class="h-24 bg-border rounded animate-pulse"></div>
						{/each}
					</div>
				{:else if challenges.length === 0}
					<div class="text-center py-8">
						<div class="text-4xl mb-2">🏆</div>
						<p class="text-muted">No active challenges</p>
						<p class="text-xs text-muted mt-1">Check back soon for new competitions</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each challenges as challenge}
							<div 
								class="p-4 bg-background rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-200"
								on:click={() => selectChallenge(challenge)}
								on:keydown={(e) => e.key === 'Enter' && selectChallenge(challenge)}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start justify-between mb-2">
									<div class="flex items-center space-x-2">
										<span class="text-2xl">{getChallengeTypeIcon(challenge.challenge_type)}</span>
										<div>
											<h3 class="font-semibold text-foreground">{challenge.title}</h3>
											<p class="text-sm text-muted">{challenge.description}</p>
										</div>
									</div>
									<Badge variant={challenge.status === 'active' ? 'success' : 'default'}>
										{challenge.status}
									</Badge>
								</div>

								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center space-x-4">
										<span class="text-muted">
											{challenge.participant_count}/{challenge.max_participants} participants
										</span>
										<span class="text-accent">
											{challenge.reward_xp} XP reward
										</span>
									</div>
									<div class="text-muted">
										Ends {formatDate(challenge.end_date)}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		</div>

		<!-- Live Chat -->
		<Card padding="none">
			<div class="p-4 border-b border-border">
				<h2 class="text-lg font-semibold text-foreground mb-3">Live Chat</h2>
				
				<!-- Room selector -->
				<div class="flex space-x-1 overflow-x-auto">
					{#each chatRooms as room}
						<button
							class="px-3 py-1 text-sm rounded-md whitespace-nowrap transition-colors {
								selectedRoom === room.id
									? 'bg-primary text-white'
									: 'bg-background text-foreground hover:bg-surface'
							}"
							on:click={() => switchRoom(room.id)}
						>
							{room.icon} {room.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Chat messages -->
			<div id="chat-messages" class="h-64 overflow-y-auto p-4 space-y-3">
				{#each chatMessages as message}
					<div class="flex items-start space-x-2">
						<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
							<span class="text-white text-xs font-medium">
								{message.username.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center space-x-2">
								<span class="font-medium text-foreground text-sm">{message.username}</span>
								<Badge variant="default" size="sm">L{message.level}</Badge>
								<span class="text-xs text-muted">{formatTimeAgo(message.timestamp)}</span>
							</div>
							<p class="text-sm text-foreground mt-1 break-words">{message.content}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Message input -->
			<div class="p-4 border-t border-border">
				<form on:submit|preventDefault={sendMessage} class="flex space-x-2">
					<input
						bind:value={newMessage}
						placeholder="Type a message..."
						class="flex-1 form-input text-sm"
						maxlength="500"
					/>
					<Button type="submit" size="sm" disabled={!newMessage.trim()}>
						Send
					</Button>
				</form>
			</div>
		</Card>
	</div>

	<!-- Community stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<Card padding="md">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted">Active Traders</p>
					<p class="text-2xl font-bold text-foreground">1,247</p>
				</div>
				<div class="text-3xl">👥</div>
			</div>
		</Card>

		<Card padding="md">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted">Total Challenges</p>
					<p class="text-2xl font-bold text-foreground">{challenges.length}</p>
				</div>
				<div class="text-3xl">🏆</div>
			</div>
		</Card>

		<Card padding="md">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted">XP Distributed</p>
					<p class="text-2xl font-bold text-foreground">45,892</p>
				</div>
				<div class="text-3xl">⭐</div>
			</div>
		</Card>
	</div>
</div>

<!-- Challenge Details Modal -->
<Modal bind:open={showChallengeModal} title={selectedChallenge?.title || ''} size="lg">
	{#if selectedChallenge}
		<div class="space-y-6">
			<!-- Challenge info -->
			<div>
				<p class="text-muted mb-4">{selectedChallenge.description}</p>
				
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-muted">Type:</span>
						<span class="text-foreground ml-2 capitalize">{selectedChallenge.challenge_type}</span>
					</div>
					<div>
						<span class="text-muted">Status:</span>
						<span class="ml-2 {getChallengeStatusColor(selectedChallenge.status)} capitalize">
							{selectedChallenge.status}
						</span>
					</div>
					<div>
						<span class="text-muted">Entry Fee:</span>
						<span class="text-foreground ml-2">{selectedChallenge.entry_fee_xp} XP</span>
					</div>
					<div>
						<span class="text-muted">Reward:</span>
						<span class="text-accent ml-2">{selectedChallenge.reward_xp} XP</span>
					</div>
					<div>
						<span class="text-muted">Participants:</span>
						<span class="text-foreground ml-2">
							{selectedChallenge.participant_count}/{selectedChallenge.max_participants}
						</span>
					</div>
					<div>
						<span class="text-muted">Ends:</span>
						<span class="text-foreground ml-2">{formatDate(selectedChallenge.end_date)}</span>
					</div>
				</div>
			</div>

			<!-- Rules -->
			<div>
				<h3 class="font-semibold text-foreground mb-2">Rules</h3>
				<ul class="space-y-1">
					{#each selectedChallenge.rules as rule}
						<li class="text-sm text-muted flex items-start">
							<span class="text-accent mr-2">•</span>
							{rule}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Leaderboard -->
			<div>
				<h3 class="font-semibold text-foreground mb-3">Leaderboard</h3>
				
				{#if leaderboard.length > 0}
					<div class="space-y-2">
						{#each leaderboard.slice(0, 10) as participant, index}
							<div class="flex items-center justify-between p-3 bg-background rounded-lg">
								<div class="flex items-center space-x-3">
									<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
										<span class="text-white text-xs font-bold">
											{participant.rank || index + 1}
										</span>
									</div>
									<div>
										<span class="font-medium text-foreground">{participant.username}</span>
										<Badge variant="default" size="sm" class="ml-2">L{participant.level}</Badge>
									</div>
								</div>
								<div class="text-right">
									<div class="text-sm font-medium text-foreground">
										{participant.final_score?.toFixed(2) || '0.00'}%
									</div>
									<div class="text-xs text-muted">
										{participant.trades_count} trades
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<div class="text-4xl mb-2">🏁</div>
						<p class="text-muted">No participants yet</p>
					</div>
				{/if}
			</div>
		</div>
		{/if}

		<svelte:fragment slot="footer">
			<Button variant="secondary" on:click={() => showChallengeModal = false}>
				Close
			</Button>
			{#if selectedChallenge && selectedChallenge.status === 'active' && !selectedChallenge.user_joined}
				<Button on:click={() => selectedChallenge && joinChallenge(selectedChallenge.id)}>
					Join Challenge ({selectedChallenge.entry_fee_xp} XP)
				</Button>
			{/if}
		</svelte:fragment>
</Modal>
