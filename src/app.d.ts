// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				username: string;
				subscription_tier: 'free' | 'basic' | 'premium';
				xp: number;
				level: number;
			};
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
