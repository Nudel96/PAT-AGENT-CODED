import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
	email: z.string().email('Invalid email format'),
	username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

const loginSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(1, 'Password is required')
});

// Helper function to generate JWT token
const generateToken = (user: any) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
			subscription_tier: user.subscription_tier,
			xp: user.xp,
			level: user.level
		},
		process.env.JWT_SECRET!,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
	);
};

// Register endpoint
router.post('/register', async (req, res) => {
	try {
		// Validate input
		const { email, username, password } = registerSchema.parse(req.body);

		// Check if user already exists
		const existingUser = await query(
			'SELECT id FROM users WHERE email = $1 OR username = $2',
			[email, username]
		);

		if (existingUser.rows.length > 0) {
			return res.status(400).json({
				success: false,
				error: 'User with this email or username already exists'
			});
		}

		// Hash password
		const saltRounds = 12;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// Create user
		const userResult = await query(
			`INSERT INTO users (email, username, password_hash) 
			 VALUES ($1, $2, $3) 
			 RETURNING id, email, username, subscription_tier, xp, level, created_at`,
			[email, username, passwordHash]
		);

		const user = userResult.rows[0];

		// Create user profile
		await query(
			'INSERT INTO user_profiles (user_id) VALUES ($1)',
			[user.id]
		);

		// Generate token
		const token = generateToken(user);

		res.status(201).json({
			success: true,
			data: {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					subscription_tier: user.subscription_tier,
					xp: user.xp,
					level: user.level,
					created_at: user.created_at
				},
				token
			},
			message: 'User registered successfully'
		});

	} catch (error) {
		console.error('Registration error:', error);
		
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				details: error.errors
			});
		}

		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Login endpoint
router.post('/login', async (req, res) => {
	try {
		// Validate input
		const { email, password } = loginSchema.parse(req.body);

		// Find user
		const userResult = await query(
			'SELECT id, email, username, password_hash, subscription_tier, xp, level, is_active FROM users WHERE email = $1',
			[email]
		);

		if (userResult.rows.length === 0) {
			return res.status(401).json({
				success: false,
				error: 'Invalid email or password'
			});
		}

		const user = userResult.rows[0];

		// Check if user is active
		if (!user.is_active) {
			return res.status(401).json({
				success: false,
				error: 'Account is deactivated'
			});
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password_hash);

		if (!isValidPassword) {
			return res.status(401).json({
				success: false,
				error: 'Invalid email or password'
			});
		}

		// Generate token
		const token = generateToken(user);

		res.json({
			success: true,
			data: {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					subscription_tier: user.subscription_tier,
					xp: user.xp,
					level: user.level
				},
				token
			},
			message: 'Login successful'
		});

	} catch (error) {
		console.error('Login error:', error);
		
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				details: error.errors
			});
		}

		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const userResult = await query(
			`SELECT u.id, u.email, u.username, u.subscription_tier, u.xp, u.level, u.created_at,
			        p.first_name, p.last_name, p.avatar_url, p.bio, p.timezone, p.theme, p.language
			 FROM users u
			 LEFT JOIN user_profiles p ON u.id = p.user_id
			 WHERE u.id = $1 AND u.is_active = true`,
			[userId]
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}

		const user = userResult.rows[0];

		res.json({
			success: true,
			data: {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					subscription_tier: user.subscription_tier,
					xp: user.xp,
					level: user.level,
					created_at: user.created_at,
					profile: {
						first_name: user.first_name,
						last_name: user.last_name,
						avatar_url: user.avatar_url,
						bio: user.bio,
						timezone: user.timezone,
						theme: user.theme,
						language: user.language
					}
				}
			}
		});

	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
	res.json({
		success: true,
		message: 'Logout successful'
	});
});

export default router;
