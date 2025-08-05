import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme, ThemeColors } from '$types';

// Theme store
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('dark');

	return {
		subscribe,
		toggle: () => update(theme => {
			const newTheme = theme === 'light' ? 'dark' : 'light';
			if (browser) {
				localStorage.setItem('theme', newTheme);
				document.documentElement.setAttribute('data-theme', newTheme);
			}
			return newTheme;
		}),
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
			}
			set(theme);
		},
		init: () => {
			if (browser) {
				const stored = localStorage.getItem('theme') as Theme;
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = stored || (prefersDark ? 'dark' : 'light');
				
				document.documentElement.setAttribute('data-theme', theme);
				set(theme);
			}
		}
	};
}

export const theme = createThemeStore();

// Theme colors configuration
export const lightTheme: ThemeColors = {
	primary: '#1b9aaa',
	secondary: '#0d1b2a',
	accent: '#7cfc00',
	background: '#ffffff',
	surface: '#f8f9fa',
	text: '#2e2e2e',
	textSecondary: '#6c757d',
	border: '#dee2e6',
	success: '#7cfc00',
	warning: '#ffc107',
	error: '#dc3545'
};

export const darkTheme: ThemeColors = {
	primary: '#1b9aaa',
	secondary: '#0d1b2a',
	accent: '#7cfc00',
	background: '#0d1b2a',
	surface: '#1e2a3a',
	text: '#ffffff',
	textSecondary: '#adb5bd',
	border: '#495057',
	success: '#7cfc00',
	warning: '#ffc107',
	error: '#dc3545'
};

// Derived store for current theme colors
export const themeColors = writable<ThemeColors>(darkTheme);
