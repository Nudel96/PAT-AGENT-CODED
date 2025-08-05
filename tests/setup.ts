import { beforeAll, afterAll } from 'vitest';
import { query } from '../server/database/connection.js';

// Global test setup
beforeAll(async () => {
	console.log('Setting up test environment...');
	
	// Ensure test database is clean
	await cleanupTestData();
	
	// Set test environment variables
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'test-jwt-secret';
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost/priceactiontalk_test';
});

// Global test cleanup
afterAll(async () => {
	console.log('Cleaning up test environment...');
	await cleanupTestData();
});

async function cleanupTestData() {
	try {
		// Clean up test data in reverse dependency order
		await query('DELETE FROM payment_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM trades WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM user_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM challenge_participants WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM chat_messages WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM forum_replies WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM forum_posts WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM demo_trades WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM demo_accounts WHERE user_id IN (SELECT id FROM users WHERE email LIKE %test%)', []);
		await query('DELETE FROM users WHERE email LIKE %test%', []);
		
		console.log('Test data cleanup completed');
	} catch (error) {
		console.error('Error during test cleanup:', error);
	}
}
