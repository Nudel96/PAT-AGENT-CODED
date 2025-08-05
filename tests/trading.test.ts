import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { query } from '../server/database/connection.js';

describe('Trading API', () => {
	let authToken: string;
	let userId: string;
	let tradeId: string;

	beforeAll(async () => {
		// Create test user and get auth token
		const userData = {
			username: 'tradetest',
			email: 'tradetest@example.com',
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
		await query('DELETE FROM trades WHERE user_id = $1', [userId]);
		await query('DELETE FROM users WHERE id = $1', [userId]);
	});

	beforeEach(async () => {
		// Clean up trades before each test
		await query('DELETE FROM trades WHERE user_id = $1', [userId]);
	});

	describe('POST /api/trading', () => {
		it('should create a new trade successfully', async () => {
			const tradeData = {
				instrument: 'EURUSD',
				side: 'buy',
				entry_price: 1.0892,
				quantity: 100000,
				stop_loss: 1.0850,
				take_profit: 1.0950,
				entry_time: new Date().toISOString(),
				strategy_tags: ['breakout', 'trend-following'],
				emotions: ['confident'],
				notes: 'Test trade for breakout strategy'
			};

			const response = await request(app)
				.post('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.instrument).toBe(tradeData.instrument);
			expect(response.body.data.side).toBe(tradeData.side);
			expect(response.body.data.status).toBe('open');

			tradeId = response.body.data.id;
		});

		it('should reject trade with invalid instrument', async () => {
			const tradeData = {
				instrument: 'INVALID',
				side: 'buy',
				entry_price: 1.0892,
				quantity: 100000
			};

			const response = await request(app)
				.post('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should reject trade with invalid side', async () => {
			const tradeData = {
				instrument: 'EURUSD',
				side: 'invalid',
				entry_price: 1.0892,
				quantity: 100000
			};

			const response = await request(app)
				.post('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should reject trade with negative quantity', async () => {
			const tradeData = {
				instrument: 'EURUSD',
				side: 'buy',
				entry_price: 1.0892,
				quantity: -100000
			};

			const response = await request(app)
				.post('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('GET /api/trading', () => {
		beforeEach(async () => {
			// Create test trades
			const trades = [
				{
					instrument: 'EURUSD',
					side: 'buy',
					entry_price: 1.0892,
					quantity: 100000,
					status: 'open'
				},
				{
					instrument: 'GBPUSD',
					side: 'sell',
					entry_price: 1.2734,
					quantity: 50000,
					status: 'closed',
					exit_price: 1.2700,
					pnl: 170
				}
			];

			for (const trade of trades) {
				await request(app)
					.post('/api/trading')
					.set('Authorization', `Bearer ${authToken}`)
					.send(trade);
			}
		});

		it('should return user trades', async () => {
			const response = await request(app)
				.get('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.data.length).toBeGreaterThan(0);
			expect(response.body.pagination).toHaveProperty('total_pages');
		});

		it('should filter trades by status', async () => {
			const response = await request(app)
				.get('/api/trading?status=open')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.every((trade: any) => trade.status === 'open')).toBe(true);
		});

		it('should filter trades by instrument', async () => {
			const response = await request(app)
				.get('/api/trading?instrument=EURUSD')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.every((trade: any) => trade.instrument === 'EURUSD')).toBe(true);
		});

		it('should paginate results', async () => {
			const response = await request(app)
				.get('/api/trading?page=1&limit=1')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.length).toBeLessThanOrEqual(1);
			expect(response.body.pagination.current_page).toBe(1);
		});
	});

	describe('PUT /api/trading/:id', () => {
		beforeEach(async () => {
			// Create a test trade
			const tradeData = {
				instrument: 'EURUSD',
				side: 'buy',
				entry_price: 1.0892,
				quantity: 100000
			};

			const response = await request(app)
				.post('/api/trading')
				.set('Authorization', `Bearer ${authToken}`)
				.send(tradeData);

			tradeId = response.body.data.id;
		});

		it('should update trade successfully', async () => {
			const updateData = {
				exit_price: 1.0950,
				exit_time: new Date().toISOString(),
				status: 'closed',
				notes: 'Updated trade notes'
			};

			const response = await request(app)
				.put(`/api/trading/${tradeId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.exit_price).toBe(updateData.exit_price);
			expect(response.body.data.status).toBe(updateData.status);
		});

		it('should reject update of non-existent trade', async () => {
			const updateData = {
				exit_price: 1.0950,
				status: 'closed'
			};

			const response = await request(app)
				.put('/api/trading/non-existent-id')
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateData)
				.expect(404);

			expect(response.body.success).toBe(false);
		});

		it('should reject update of another user\'s trade', async () => {
			// Create another user
			const otherUserData = {
				username: 'otheruser',
				email: 'other@example.com',
				password: 'password123'
			};

			const otherUserResponse = await request(app)
				.post('/api/auth/register')
				.send(otherUserData);

			const otherToken = otherUserResponse.body.data.token;

			const updateData = {
				exit_price: 1.0950,
				status: 'closed'
			};

			const response = await request(app)
				.put(`/api/trading/${tradeId}`)
				.set('Authorization', `Bearer ${otherToken}`)
				.send(updateData)
				.expect(404);

			expect(response.body.success).toBe(false);

			// Clean up other user
			await query('DELETE FROM users WHERE id = $1', [otherUserResponse.body.data.user.id]);
		});
	});

	describe('GET /api/trading/analytics/summary', () => {
		beforeEach(async () => {
			// Create test trades with known P&L
			const trades = [
				{
					instrument: 'EURUSD',
					side: 'buy',
					entry_price: 1.0800,
					exit_price: 1.0850,
					quantity: 100000,
					status: 'closed',
					pnl: 500
				},
				{
					instrument: 'GBPUSD',
					side: 'sell',
					entry_price: 1.2800,
					exit_price: 1.2750,
					quantity: 100000,
					status: 'closed',
					pnl: 500
				},
				{
					instrument: 'USDJPY',
					side: 'buy',
					entry_price: 150.00,
					exit_price: 149.50,
					quantity: 100000,
					status: 'closed',
					pnl: -500
				}
			];

			for (const trade of trades) {
				await request(app)
					.post('/api/trading')
					.set('Authorization', `Bearer ${authToken}`)
					.send(trade);
			}
		});

		it('should return trading analytics', async () => {
			const response = await request(app)
				.get('/api/trading/analytics/summary')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('total_trades');
			expect(response.body.data).toHaveProperty('winning_trades');
			expect(response.body.data).toHaveProperty('losing_trades');
			expect(response.body.data).toHaveProperty('win_rate');
			expect(response.body.data).toHaveProperty('total_pnl');
			expect(response.body.data).toHaveProperty('avg_pnl');

			expect(response.body.data.total_trades).toBe(3);
			expect(response.body.data.winning_trades).toBe(2);
			expect(response.body.data.losing_trades).toBe(1);
			expect(response.body.data.win_rate).toBeCloseTo(66.67, 1);
			expect(response.body.data.total_pnl).toBe(500);
		});

		it('should filter analytics by timeframe', async () => {
			const response = await request(app)
				.get('/api/trading/analytics/summary?timeframe=7d')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.timeframe).toBe('7d');
		});
	});
});
