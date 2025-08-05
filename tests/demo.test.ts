import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { query } from '../server/database/connection.js';

describe('Demo Trading API', () => {
	let authToken: string;
	let userId: string;
	let demoAccountId: string;

	beforeAll(async () => {
		// Create test user and get auth token
		const userData = {
			username: 'demotest',
			email: 'demotest@example.com',
			password: 'password123'
		};

		const registerResponse = await request(app)
			.post('/api/auth/register')
			.send(userData);

		authToken = registerResponse.body.data.token;
		userId = registerResponse.body.data.user.id;
	});

	afterAll(async () => {
		// Clean up test data
		await query('DELETE FROM demo_trades WHERE user_id = $1', [userId]);
		await query('DELETE FROM demo_accounts WHERE user_id = $1', [userId]);
		await query('DELETE FROM users WHERE id = $1', [userId]);
	});

	beforeEach(async () => {
		// Clean up demo data before each test
		await query('DELETE FROM demo_trades WHERE user_id = $1', [userId]);
		await query('DELETE FROM demo_accounts WHERE user_id = $1', [userId]);
	});

	describe('POST /api/demo/account', () => {
		it('should create demo account successfully', async () => {
			const response = await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 })
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.balance).toBe(10000);
			expect(response.body.data.equity).toBe(10000);
			expect(response.body.data.trade_count).toBe(0);

			demoAccountId = response.body.data.id;
		});

		it('should reject duplicate demo account creation', async () => {
			// Create first account
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });

			// Try to create second account
			const response = await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 })
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('already exists');
		});
	});

	describe('GET /api/demo/account', () => {
		beforeEach(async () => {
			// Create demo account for tests
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });
		});

		it('should return demo account details', async () => {
			const response = await request(app)
				.get('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('balance');
			expect(response.body.data).toHaveProperty('equity');
			expect(response.body.data).toHaveProperty('trade_count');
			expect(response.body.data).toHaveProperty('win_rate');
		});

		it('should return 404 for non-existent account', async () => {
			// Delete the account first
			await query('DELETE FROM demo_accounts WHERE user_id = $1', [userId]);

			const response = await request(app)
				.get('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);

			expect(response.body.success).toBe(false);
		});
	});

	describe('POST /api/demo/trades', () => {
		beforeEach(async () => {
			// Create demo account for tests
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });
		});

		it('should place demo trade successfully', async () => {
			const tradeData = {
				instrument: 'EURUSD',
				side: 'buy',
				volume: 0.1,
				stop_loss: 1.0800,
				take_profit: 1.0950
			};

			const response = await request(app)
				.post('/api/demo/trades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.instrument).toBe(tradeData.instrument);
			expect(response.body.data.side).toBe(tradeData.side);
			expect(response.body.data.status).toBe('open');
		});

		it('should reject trade with invalid data', async () => {
			const invalidTradeData = {
				instrument: 'EURUSD',
				side: 'invalid', // Invalid side
				volume: 0.1
			};

			const response = await request(app)
				.post('/api/demo/trades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(invalidTradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should reject trade with negative volume', async () => {
			const invalidTradeData = {
				instrument: 'EURUSD',
				side: 'buy',
				volume: -0.1 // Invalid: negative volume
			};

			const response = await request(app)
				.post('/api/demo/trades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(invalidTradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('GET /api/demo/trades', () => {
		beforeEach(async () => {
			// Create demo account for tests
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });
		});

		it('should return demo trades with pagination', async () => {
			const response = await request(app)
				.get('/api/demo/trades')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.pagination).toHaveProperty('current_page');
			expect(response.body.pagination).toHaveProperty('total_pages');
		});

		it('should handle pagination parameters', async () => {
			const response = await request(app)
				.get('/api/demo/trades?page=1&limit=5')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.pagination.current_page).toBe(1);
		});
	});

	describe('POST /api/demo/trades/:id/close', () => {
		let tradeId: string;

		beforeEach(async () => {
			// Create demo account and trade for tests
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });

			const tradeResponse = await request(app)
				.post('/api/demo/trades')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					instrument: 'EURUSD',
					side: 'buy',
					volume: 0.1
				});

			tradeId = tradeResponse.body.data.id;
		});

		it('should close demo trade successfully', async () => {
			const response = await request(app)
				.post(`/api/demo/trades/${tradeId}/close`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('closed successfully');
			expect(response.body.data).toHaveProperty('exit_price');
			expect(response.body.data).toHaveProperty('pnl');
		});

		it('should return 404 for non-existent trade', async () => {
			const response = await request(app)
				.post('/api/demo/trades/non-existent-id/close')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);

			expect(response.body.success).toBe(false);
		});
	});

	describe('POST /api/demo/account/reset', () => {
		beforeEach(async () => {
			// Create demo account for tests
			await request(app)
				.post('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ initial_balance: 10000 });
		});

		it('should reset demo account successfully', async () => {
			const response = await request(app)
				.post('/api/demo/account/reset')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('reset successfully');

			// Verify account is reset
			const accountResponse = await request(app)
				.get('/api/demo/account')
				.set('Authorization', `Bearer ${authToken}`);

			expect(accountResponse.body.data.balance).toBe(10000);
		});
	});
});
