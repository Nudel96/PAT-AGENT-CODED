import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Simplified User interface for demo purposes
interface DemoUser {
	id: string;
	email: string;
	username: string;
	subscription_tier: 'free' | 'basic' | 'premium';
	xp: number;
	level: number;
	created_at: string;
}

interface AuthState {
	user: DemoUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	token: string | null;
}

// Generate a demo user based on email
function createDemoUser(email: string, username?: string): DemoUser {
	const userId = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	const userUsername = username || email.split('@')[0];

	return {
		id: userId,
		email: email,
		username: userUsername,
		subscription_tier: 'premium', // Give demo users premium access
		xp: Math.floor(Math.random() * 5000) + 1000, // Random XP between 1000-6000
		level: Math.floor(Math.random() * 10) + 1, // Random level between 1-10
		created_at: new Date().toISOString()
	};
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: false, // Start with false for demo
		token: null
	});

	// Define checkAuth function first
	const checkAuth = async () => {
		if (!browser) {
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				token: null
			});
			return;
		}

		console.log('🔍 Checking Demo Auth...');

		const token = localStorage.getItem('auth_token');
		const storedUser = localStorage.getItem('demo_user');
		const userAccess = sessionStorage.getItem('userAccess');
		const adminAccess = sessionStorage.getItem('adminAccess');

		// Check if we have valid demo authentication
		if ((token && storedUser) || userAccess === 'true' || adminAccess === 'true') {
			try {
				let user: DemoUser;

				if (storedUser) {
					// Use stored demo user
					user = JSON.parse(storedUser);
				} else {
					// Create user from session storage
					const email = sessionStorage.getItem('userEmail') || 'demo@example.com';
					const username = sessionStorage.getItem('userName') || 'DemoUser';
					user = createDemoUser(email, username);

					// Store for future use
					localStorage.setItem('demo_user', JSON.stringify(user));
				}

				set({
					user,
					isAuthenticated: true,
					isLoading: false,
					token: token || 'demo_token_restored'
				});

				console.log('✅ Demo Auth Restored:', user);
			} catch (error) {
				console.error('❌ Failed to restore demo auth:', error);

				// Clear corrupted data
				localStorage.removeItem('auth_token');
				localStorage.removeItem('demo_user');
				sessionStorage.removeItem('userAccess');
				sessionStorage.removeItem('userEmail');
				sessionStorage.removeItem('userName');

				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});
			}
		} else {
			console.log('❌ No Demo Auth Found');

			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				token: null
			});
		}
	};

	return {
		subscribe,

		// 100% Local Login - No Network Calls
		login: async (email: string, password: string) => {
			console.log('🔐 Demo Login Started:', { email, password: '***' });

			update(state => ({ ...state, isLoading: true }));

			// Simulate network delay for realistic UX
			await new Promise(resolve => setTimeout(resolve, 800));

			try {
				// Accept any email/password combination
				if (!email || !password) {
					throw new Error('Email and password are required');
				}

				// Create demo user
				const demoUser = createDemoUser(email);
				const demoToken = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

				// Store in localStorage and sessionStorage for compatibility
				if (browser) {
					localStorage.setItem('auth_token', demoToken);
					localStorage.setItem('demo_user', JSON.stringify(demoUser));
					sessionStorage.setItem('userAccess', 'true');
					sessionStorage.setItem('userEmail', email);
					sessionStorage.setItem('userName', demoUser.username);
				}

				// Update auth state
				set({
					user: demoUser,
					isAuthenticated: true,
					isLoading: false,
					token: demoToken
				});

				console.log('✅ Demo Login Successful:', demoUser);
				return { success: true };

			} catch (error) {
				console.error('❌ Demo Login Failed:', error);

				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});

				return {
					success: false,
					error: error instanceof Error ? error.message : 'Login failed'
				};
			}
		},

		// 100% Local Registration - No Network Calls
		register: async (email: string, username: string, password: string) => {
			console.log('📝 Demo Registration Started:', { email, username, password: '***' });

			update(state => ({ ...state, isLoading: true }));

			// Simulate network delay for realistic UX
			await new Promise(resolve => setTimeout(resolve, 1200));

			try {
				// Basic validation
				if (!email || !username || !password) {
					throw new Error('All fields are required');
				}

				if (password.length < 6) {
					throw new Error('Password must be at least 6 characters');
				}

				// Create demo user
				const demoUser = createDemoUser(email, username);
				const demoToken = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

				// Store in localStorage and sessionStorage for compatibility
				if (browser) {
					localStorage.setItem('auth_token', demoToken);
					localStorage.setItem('demo_user', JSON.stringify(demoUser));
					sessionStorage.setItem('userAccess', 'true');
					sessionStorage.setItem('userEmail', email);
					sessionStorage.setItem('userName', username);
				}

				// Update auth state
				set({
					user: demoUser,
					isAuthenticated: true,
					isLoading: false,
					token: demoToken
				});

				console.log('✅ Demo Registration Successful:', demoUser);
				return { success: true };

			} catch (error) {
				console.error('❌ Demo Registration Failed:', error);

				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					token: null
				});

				return {
					success: false,
					error: error instanceof Error ? error.message : 'Registration failed'
				};
			}
		},

		// 100% Local Logout - No Network Calls
		logout: () => {
			console.log('🚪 Demo Logout');

			if (browser) {
				// Clear all stored data
				localStorage.removeItem('auth_token');
				localStorage.removeItem('demo_user');
				sessionStorage.removeItem('userAccess');
				sessionStorage.removeItem('userEmail');
				sessionStorage.removeItem('userName');
				sessionStorage.removeItem('adminAccess');
			}

			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				token: null
			});
		},

		// 100% Local Auth Check - No Network Calls
		checkAuth,

		// Update user data locally
		updateUser: (userData: Partial<DemoUser>) => {
			update(state => {
				if (!state.user) return state;

				const updatedUser = { ...state.user, ...userData };

				// Update localStorage
				if (browser) {
					localStorage.setItem('demo_user', JSON.stringify(updatedUser));
				}

				return {
					...state,
					user: updatedUser
				};
			});
		},

		// Initialize auth on app start
		init: async () => {
			console.log('🚀 Initializing Demo Auth...');
			await checkAuth();
		}
	};
}

export const auth = createAuthStore();

// Initialize auth when the module loads (browser only)
if (browser) {
	auth.init();
}
