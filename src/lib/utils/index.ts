import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(value: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

// Format percentage values
export function formatPercentage(value: number, decimals = 2): string {
	return `${(value * 100).toFixed(decimals)}%`;
}

// Format large numbers with K, M, B suffixes
export function formatNumber(value: number): string {
	if (value >= 1e9) {
		return `${(value / 1e9).toFixed(1)}B`;
	}
	if (value >= 1e6) {
		return `${(value / 1e6).toFixed(1)}M`;
	}
	if (value >= 1e3) {
		return `${(value / 1e3).toFixed(1)}K`;
	}
	return value.toString();
}

// Format dates
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		...options
	});
}

export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// Time ago helper
export function timeAgo(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'just now';
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays}d ago`;
	}

	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks}w ago`;
	}

	return formatDate(d);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Generate random ID
export function generateId(length = 8): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// Validate email
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Calculate XP for level
export function calculateXPForLevel(level: number): number {
	return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from XP
export function calculateLevelFromXP(xp: number): number {
	let level = 1;
	let totalXP = 0;
	
	while (totalXP <= xp) {
		totalXP += calculateXPForLevel(level);
		if (totalXP > xp) break;
		level++;
	}
	
	return level;
}

// Calculate progress to next level
export function calculateLevelProgress(xp: number): { level: number; progress: number; nextLevelXP: number } {
	const level = calculateLevelFromXP(xp);
	const currentLevelXP = level === 1 ? 0 : Array.from({ length: level - 1 }, (_, i) => calculateXPForLevel(i + 1)).reduce((a, b) => a + b, 0);
	const nextLevelXP = calculateXPForLevel(level);
	const progress = ((xp - currentLevelXP) / nextLevelXP) * 100;
	
	return {
		level,
		progress: Math.min(progress, 100),
		nextLevelXP: nextLevelXP - (xp - currentLevelXP)
	};
}

// Color helpers for heat scores
export function getHeatScoreColor(score: number): string {
	// Score ranges from -5 to +5
	const normalizedScore = (score + 5) / 10; // Normalize to 0-1
	
	if (normalizedScore <= 0.2) return '#dc2626'; // Red
	if (normalizedScore <= 0.4) return '#ea580c'; // Orange
	if (normalizedScore <= 0.6) return '#facc15'; // Yellow
	if (normalizedScore <= 0.8) return '#65a30d'; // Light green
	return '#16a34a'; // Green
}

// Trading calculation helpers
export function calculatePnL(entryPrice: number, exitPrice: number, quantity: number, side: 'buy' | 'sell'): number {
	if (side === 'buy') {
		return (exitPrice - entryPrice) * quantity;
	} else {
		return (entryPrice - exitPrice) * quantity;
	}
}

export function calculateRiskReward(entryPrice: number, stopLoss: number, takeProfit: number, side: 'buy' | 'sell'): number {
	const risk = Math.abs(entryPrice - stopLoss);
	const reward = Math.abs(takeProfit - entryPrice);
	return reward / risk;
}

// WebSocket connection helper
export function createWebSocketConnection(url: string, onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
	const ws = new WebSocket(url);
	
	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			onMessage(data);
		} catch (error) {
			console.error('Failed to parse WebSocket message:', error);
		}
	};
	
	ws.onerror = (error) => {
		console.error('WebSocket error:', error);
		if (onError) onError(error);
	};
	
	return ws;
}
