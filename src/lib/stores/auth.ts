import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$types';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	token: string | null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
		token: null
	});

	return {
		subscribe,
		login: async (email: string, password: string) => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const response = await fetch('/api/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email, password })
				});

				const data = await response.json();

				if (data.success) {
					const { user, token } = data.data;
					
					if (browser) {
						localStorage.setItem('auth_token', token);
					}

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						token
					});

					return { success: true };
				} else {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						token: null
					});
					return { success: false, error: data.error };
				}
			} catch (error) {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});
				return { success: false, error: 'Network error' };
			}
		},

		register: async (email: string, username: string, password: string) => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email, username, password })
				});

				const data = await response.json();

				if (data.success) {
					const { user, token } = data.data;
					
					if (browser) {
						localStorage.setItem('auth_token', token);
					}

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						token
					});

					return { success: true };
				} else {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						token: null
					});
					return { success: false, error: data.error };
				}
			} catch (error) {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});
				return { success: false, error: 'Network error' };
			}
		},

		logout: () => {
			if (browser) {
				localStorage.removeItem('auth_token');
			}
			
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				token: null
			});
		},

		checkAuth: async () => {
			if (!browser) return;

			const token = localStorage.getItem('auth_token');
			if (!token) {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});
				return;
			}

			try {
				const response = await fetch('/api/auth/me', {
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				const data = await response.json();

				if (data.success) {
					set({
						user: data.data.user,
						isAuthenticated: true,
						isLoading: false,
						token
					});
				} else {
					localStorage.removeItem('auth_token');
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						token: null
					});
				}
			} catch (error) {
				localStorage.removeItem('auth_token');
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});
			}
		},

		updateUser: (userData: Partial<User>) => {
			update(state => ({
				...state,
				user: state.user ? { ...state.user, ...userData } : null
			}));
		}
	};
}

export const auth = createAuthStore();
