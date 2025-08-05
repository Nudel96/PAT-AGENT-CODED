import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { query } from '../server/database/connection.js';

describe('Payments API', () => {
	let authToken: string;
	let userId: string;

	beforeAll(async () => {
		// Create test user and get auth token
		const userData = {
			username: 'paymenttest',
			email: 'paymenttest@example.com',
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
		await query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
		await query('DELETE FROM payment_sessions WHERE user_id = $1', [userId]);
		await query('DELETE FROM users WHERE id = $1', [userId]);
	});

	describe('GET /api/payments/plans', () => {
		it('should return available subscription plans', async () => {
			const response = await request(app)
				.get('/api/payments/plans')
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.data.length).toBeGreaterThan(0);

			const plan = response.body.data[0];
			expect(plan).toHaveProperty('id');
			expect(plan).toHaveProperty('name');
			expect(plan).toHaveProperty('price');
			expect(plan).toHaveProperty('features');
		});
	});

	describe('GET /api/payments/subscription', () => {
		it('should return user subscription status', async () => {
			const response = await request(app)
				.get('/api/payments/subscription')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('has_subscription');
			expect(response.body.data).toHaveProperty('plan');
			expect(response.body.data).toHaveProperty('status');
		});

		it('should reject request without authentication', async () => {
			const response = await request(app)
				.get('/api/payments/subscription')
				.expect(401);

			expect(response.body.success).toBe(false);
		});
	});

	describe('POST /api/payments/create-subscription', () => {
		it('should create subscription checkout session', async () => {
			const subscriptionData = {
				plan: 'basic',
				success_url: 'https://example.com/success',
				cancel_url: 'https://example.com/cancel'
			};

			const response = await request(app)
				.post('/api/payments/create-subscription')
				.set('Authorization', `Bearer ${authToken}`)
				.send(subscriptionData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('session_id');
			expect(response.body.data).toHaveProperty('checkout_url');
		});

		it('should reject invalid plan', async () => {
			const subscriptionData = {
				plan: 'invalid',
				success_url: 'https://example.com/success',
				cancel_url: 'https://example.com/cancel'
			};

			const response = await request(app)
				.post('/api/payments/create-subscription')
				.set('Authorization', `Bearer ${authToken}`)
				.send(subscriptionData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should reject invalid URLs', async () => {
			const subscriptionData = {
				plan: 'basic',
				success_url: 'invalid-url',
				cancel_url: 'invalid-url'
			};

			const response = await request(app)
				.post('/api/payments/create-subscription')
				.set('Authorization', `Bearer ${authToken}`)
				.send(subscriptionData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('POST /api/payments/cancel-subscription', () => {
		it('should handle cancellation of non-existent subscription', async () => {
			const response = await request(app)
				.post('/api/payments/cancel-subscription')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('No active subscription found');
		});
	});
});
