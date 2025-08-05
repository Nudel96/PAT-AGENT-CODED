// Core user types
export interface User {
	id: string;
	email: string;
	username: string;
	password_hash: string;
	subscription_tier: 'free' | 'basic' | 'premium';
	xp: number;
	level: number;
	created_at: Date;
	updated_at: Date;
	stripe_customer_id?: string;
	is_active: boolean;
}

export interface UserProfile {
	id: string;
	user_id: string;
	first_name?: string;
	last_name?: string;
	avatar_url?: string;
	bio?: string;
	timezone: string;
	theme: 'light' | 'dark';
	language: string;
	notifications_enabled: boolean;
	created_at: Date;
	updated_at: Date;
}

// Trading related types
export interface Trade {
	id: string;
	user_id: string;
	instrument: string;
	side: 'buy' | 'sell';
	entry_price: number;
	exit_price?: number;
	quantity: number;
	stop_loss?: number;
	take_profit?: number;
	entry_time: Date;
	exit_time?: Date;
	strategy_tags: string[];
	emotions: string[];
	notes?: string;
	pnl?: number;
	status: 'open' | 'closed' | 'cancelled';
	created_at: Date;
	updated_at: Date;
}

// Macro bias types
export interface MacroBias {
	id: string;
	currency: string;
	heat_score: number; // -5 to +5
	cot_score: number;
	retail_sentiment_score: number;
	price_momentum_score: number;
	macro_surprise_score: number;
	timestamp: Date;
	factors: MacroFactor[];
}

export interface MacroFactor {
	name: string;
	value: number;
	weight: number;
	impact: number;
	description: string;
}

// Learning system types
export interface LearningPath {
	id: string;
	title: string;
	description: string;
	level_requirement: number;
	estimated_duration: number; // in minutes
	xp_reward: number;
	modules: LearningModule[];
	created_at: Date;
	updated_at: Date;
}

export interface LearningModule {
	id: string;
	path_id: string;
	title: string;
	content: string;
	module_type: 'lesson' | 'quiz' | 'assignment';
	order_index: number;
	xp_reward: number;
	requirements: string[];
	created_at: Date;
	updated_at: Date;
}

export interface UserProgress {
	id: string;
	user_id: string;
	module_id: string;
	status: 'not_started' | 'in_progress' | 'completed';
	score?: number;
	attempts: number;
	completed_at?: Date;
	created_at: Date;
	updated_at: Date;
}

// Community types
export interface Challenge {
	id: string;
	title: string;
	description: string;
	challenge_type: 'daily' | 'weekly' | 'monthly';
	start_date: Date;
	end_date: Date;
	entry_fee_xp: number;
	reward_xp: number;
	max_participants?: number;
	rules: string[];
	status: 'upcoming' | 'active' | 'completed';
	created_at: Date;
	updated_at: Date;
}

export interface ChallengeParticipant {
	id: string;
	challenge_id: string;
	user_id: string;
	entry_time: Date;
	final_score?: number;
	rank?: number;
	trades_count: number;
	win_rate: number;
	roi: number;
	status: 'active' | 'completed' | 'disqualified';
}

// Forum types
export interface ForumPost {
	id: string;
	user_id: string;
	title: string;
	content: string;
	category: string;
	tags: string[];
	upvotes: number;
	downvotes: number;
	reply_count: number;
	view_count: number;
	is_pinned: boolean;
	is_locked: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface ForumReply {
	id: string;
	post_id: string;
	user_id: string;
	content: string;
	parent_reply_id?: string;
	upvotes: number;
	downvotes: number;
	created_at: Date;
	updated_at: Date;
}

// WebSocket message types
export interface WSMessage {
	type: string;
	payload: any;
	timestamp: Date;
}

export interface PriceUpdate {
	symbol: string;
	price: number;
	change: number;
	change_percent: number;
	timestamp: Date;
}

export interface ChatMessage {
	id: string;
	user_id: string;
	username: string;
	content: string;
	room: string;
	timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

// Theme and UI types
export type Theme = 'light' | 'dark';

export interface ThemeColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	surface: string;
	text: string;
	textSecondary: string;
	border: string;
	success: string;
	warning: string;
	error: string;
}

// Subscription types
export interface Subscription {
	id: string;
	user_id: string;
	stripe_subscription_id: string;
	plan: 'basic' | 'premium';
	status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
	current_period_start: Date;
	current_period_end: Date;
	created_at: Date;
	updated_at: Date;
}
