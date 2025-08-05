import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		host: true
	},
	build: {
		target: 'es2022',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte'],
					utils: ['zod']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['zod']
	}
});
