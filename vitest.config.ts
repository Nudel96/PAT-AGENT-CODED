import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./tests/setup.ts'],
		testTimeout: 30000,
		hookTimeout: 30000,
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true
			}
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'dist/',
				'build/',
				'coverage/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/index.ts'
			]
		}
	},
	resolve: {
		alias: {
			'$lib': resolve(__dirname, './src/lib'),
			'$components': resolve(__dirname, './src/lib/components'),
			'$stores': resolve(__dirname, './src/lib/stores'),
			'$utils': resolve(__dirname, './src/lib/utils'),
			'$types': resolve(__dirname, './src/lib/types')
		}
	}
});
