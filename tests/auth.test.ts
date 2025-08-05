import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { query } from '../server/database/connection.js';

describe('Authentication API', () => {
	let testUserId: string;
	let authToken: string;

	beforeAll(async () => {
		// Clean up any existing test data
		await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
	});

	afterAll(async () => {
		// Clean up test data
		if (testUserId) {
			await query('DELETE FROM users WHERE id = $1', [testUserId]);
		}
	});

	describe('POST /api/auth/register', () => {
		it('should register a new user successfully', async () => {
			const userData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User'
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data).toHaveProperty('token');
			expect(response.body.data.user.email).toBe(userData.email);
			expect(response.body.data.user.username).toBe(userData.username);

			testUserId = response.body.data.user.id;
			authToken = response.body.data.token;
		});

		it('should reject registration with invalid email', async () => {
			const userData = {
				username: 'testuser2',
				email: 'invalid-email',
				password: 'password123'
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Invalid email format');
		});

		it('should reject registration with weak password', async () => {
			const userData = {
				username: 'testuser3',
				email: 'test3@example.com',
				password: '123'
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Password must be at least 8 characters');
		});

		it('should reject duplicate email registration', async () => {
			const userData = {
				username: 'testuser4',
				email: 'test@example.com', // Same email as first test
				password: 'password123'
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Email already exists');
		});
	});

	describe('POST /api/auth/login', () => {
		it('should login with valid credentials', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'password123'
			};

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data).toHaveProperty('token');
			expect(response.body.data.user.email).toBe(loginData.email);
		});

		it('should reject login with invalid email', async () => {
			const loginData = {
				email: 'nonexistent@example.com',
				password: 'password123'
			};

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData)
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Invalid credentials');
		});

		it('should reject login with invalid password', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'wrongpassword'
			};

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData)
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Invalid credentials');
		});
	});

	describe('GET /api/auth/me', () => {
		it('should return user data with valid token', async () => {
			const response = await request(app)
				.get('/api/auth/me')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data.user.email).toBe('test@example.com');
		});

		it('should reject request without token', async () => {
			const response = await request(app)
				.get('/api/auth/me')
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Access token required');
		});

		it('should reject request with invalid token', async () => {
			const response = await request(app)
				.get('/api/auth/me')
				.set('Authorization', 'Bearer invalid-token')
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Invalid token');
		});
	});

	describe('POST /api/auth/logout', () => {
		it('should logout successfully with valid token', async () => {
			const response = await request(app)
				.post('/api/auth/logout')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('Logged out successfully');
		});

		it('should reject logout without token', async () => {
			const response = await request(app)
				.post('/api/auth/logout')
				.expect(401);

			expect(response.body.success).toBe(false);
		});
	});

	describe('POST /api/auth/forgot-password', () => {
		it('should send password reset email for valid email', async () => {
			const response = await request(app)
				.post('/api/auth/forgot-password')
				.send({ email: 'test@example.com' })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('Password reset email sent');
		});

		it('should handle non-existent email gracefully', async () => {
			const response = await request(app)
				.post('/api/auth/forgot-password')
				.send({ email: 'nonexistent@example.com' })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain('Password reset email sent');
		});

		it('should reject invalid email format', async () => {
			const response = await request(app)
				.post('/api/auth/forgot-password')
				.send({ email: 'invalid-email' })
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});
});
