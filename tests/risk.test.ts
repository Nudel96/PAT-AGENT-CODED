import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { query } from '../server/database/connection.js';

describe('Risk Management API', () => {
	let authToken: string;
	let userId: string;

	beforeAll(async () => {
		// Create test user and get auth token
		const userData = {
			username: 'risktest',
			email: 'risktest@example.com',
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
		await query('DELETE FROM trade_blockers WHERE user_id = $1', [userId]);
		await query('DELETE FROM risk_settings WHERE user_id = $1', [userId]);
		await query('DELETE FROM trades WHERE user_id = $1', [userId]);
		await query('DELETE FROM users WHERE id = $1', [userId]);
	});

	describe('GET /api/risk/settings', () => {
		it('should return default risk settings for new user', async () => {
			const response = await request(app)
				.get('/api/risk/settings')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('max_risk_per_trade');
			expect(response.body.data).toHaveProperty('max_daily_loss');
			expect(response.body.data).toHaveProperty('trading_enabled');
			expect(response.body.data.max_risk_per_trade).toBe(2.0);
		});

		it('should reject request without authentication', async () => {
			const response = await request(app)
				.get('/api/risk/settings')
				.expect(401);

			expect(response.body.success).toBe(false);
		});
	});

	describe('PUT /api/risk/settings', () => {
		it('should update risk settings successfully', async () => {
			const riskSettings = {
				max_risk_per_trade: 1.5,
				max_daily_loss: 3.0,
				max_weekly_loss: 8.0,
				max_monthly_loss: 15.0,
				max_open_trades: 3,
				max_correlation_exposure: 10.0,
				trading_enabled: true,
				auto_close_enabled: true,
				emergency_stop_enabled: true
			};

			const response = await request(app)
				.put('/api/risk/settings')
				.set('Authorization', `Bearer ${authToken}`)
				.send(riskSettings)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('updated successfully');
		});

		it('should reject invalid risk settings', async () => {
			const invalidSettings = {
				max_risk_per_trade: -1, // Invalid: negative value
				max_daily_loss: 3.0,
				max_weekly_loss: 8.0,
				max_monthly_loss: 15.0,
				max_open_trades: 3,
				max_correlation_exposure: 10.0,
				trading_enabled: true,
				auto_close_enabled: true,
				emergency_stop_enabled: true
			};

			const response = await request(app)
				.put('/api/risk/settings')
				.set('Authorization', `Bearer ${authToken}`)
				.send(invalidSettings)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should reject settings with values outside allowed range', async () => {
			const invalidSettings = {
				max_risk_per_trade: 15, // Invalid: too high
				max_daily_loss: 3.0,
				max_weekly_loss: 8.0,
				max_monthly_loss: 15.0,
				max_open_trades: 3,
				max_correlation_exposure: 10.0,
				trading_enabled: true,
				auto_close_enabled: true,
				emergency_stop_enabled: true
			};

			const response = await request(app)
				.put('/api/risk/settings')
				.set('Authorization', `Bearer ${authToken}`)
				.send(invalidSettings)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('GET /api/risk/metrics', () => {
		it('should return risk metrics', async () => {
			const response = await request(app)
				.get('/api/risk/metrics')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('current_risk');
			expect(response.body.data).toHaveProperty('daily_pnl');
			expect(response.body.data).toHaveProperty('portfolio_heat');
			expect(response.body.data).toHaveProperty('risk_score');
			expect(response.body.data).toHaveProperty('open_trades_count');
		});
	});

	describe('GET /api/risk/blockers', () => {
		it('should return trade blockers', async () => {
			const response = await request(app)
				.get('/api/risk/blockers')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeInstanceOf(Array);
		});
	});

	describe('POST /api/risk/emergency-stop', () => {
		it('should execute emergency stop successfully', async () => {
			const response = await request(app)
				.post('/api/risk/emergency-stop')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('Emergency stop executed');

			// Verify trading is disabled
			const settingsResponse = await request(app)
				.get('/api/risk/settings')
				.set('Authorization', `Bearer ${authToken}`);

			expect(settingsResponse.body.data.trading_enabled).toBe(false);
		});
	});
});
