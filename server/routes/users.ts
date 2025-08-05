import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Update profile schema
const updateProfileSchema = z.object({
	first_name: z.string().max(100).optional(),
	last_name: z.string().max(100).optional(),
	bio: z.string().max(500).optional(),
	timezone: z.string().max(50).optional(),
	theme: z.enum(['light', 'dark']).optional(),
	language: z.string().max(10).optional(),
	notifications_enabled: z.boolean().optional()
});

// Get user profile
router.get('/profile', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			`SELECT u.id, u.email, u.username, u.subscription_tier, u.xp, u.level,
			        p.first_name, p.last_name, p.avatar_url, p.bio, p.timezone, 
			        p.theme, p.language, p.notifications_enabled
			 FROM users u
			 LEFT JOIN user_profiles p ON u.id = p.user_id
			 WHERE u.id = $1`,
			[userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}

		const user = result.rows[0];

		res.json({
			success: true,
			data: {
				id: user.id,
				email: user.email,
				username: user.username,
				subscription_tier: user.subscription_tier,
				xp: user.xp,
				level: user.level,
				profile: {
					first_name: user.first_name,
					last_name: user.last_name,
					avatar_url: user.avatar_url,
					bio: user.bio,
					timezone: user.timezone,
					theme: user.theme,
					language: user.language,
					notifications_enabled: user.notifications_enabled
				}
			}
		});

	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Update user profile
router.put('/profile', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const updates = updateProfileSchema.parse(req.body);

		// Build dynamic update query
		const updateFields = Object.keys(updates);
		if (updateFields.length === 0) {
			return res.status(400).json({
				success: false,
				error: 'No fields to update'
			});
		}

		const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
		const values = [userId, ...Object.values(updates)];

		await query(
			`UPDATE user_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
			values
		);

		res.json({
			success: true,
			message: 'Profile updated successfully'
		});

	} catch (error) {
		console.error('Update profile error:', error);
		
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

// Get user stats
router.get('/stats', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		// Get trading stats
		const tradesResult = await query(
			`SELECT 
				COUNT(*) as total_trades,
				COUNT(CASE WHEN status = 'closed' AND pnl > 0 THEN 1 END) as winning_trades,
				COUNT(CASE WHEN status = 'closed' AND pnl < 0 THEN 1 END) as losing_trades,
				COALESCE(SUM(CASE WHEN status = 'closed' THEN pnl END), 0) as total_pnl,
				COALESCE(AVG(CASE WHEN status = 'closed' THEN pnl END), 0) as avg_pnl
			 FROM trades 
			 WHERE user_id = $1`,
			[userId]
		);

		// Get learning progress
		const progressResult = await query(
			`SELECT 
				COUNT(*) as total_modules,
				COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules
			 FROM user_progress 
			 WHERE user_id = $1`,
			[userId]
		);

		// Get challenge participation
		const challengesResult = await query(
			`SELECT 
				COUNT(*) as total_challenges,
				COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
				AVG(CASE WHEN rank IS NOT NULL THEN rank END) as avg_rank
			 FROM challenge_participants 
			 WHERE user_id = $1`,
			[userId]
		);

		const trades = tradesResult.rows[0];
		const progress = progressResult.rows[0];
		const challenges = challengesResult.rows[0];

		const winRate = trades.total_trades > 0 
			? (parseInt(trades.winning_trades) / parseInt(trades.total_trades)) * 100 
			: 0;

		res.json({
			success: true,
			data: {
				trading: {
					total_trades: parseInt(trades.total_trades),
					winning_trades: parseInt(trades.winning_trades),
					losing_trades: parseInt(trades.losing_trades),
					win_rate: Math.round(winRate * 100) / 100,
					total_pnl: parseFloat(trades.total_pnl),
					avg_pnl: parseFloat(trades.avg_pnl)
				},
				learning: {
					total_modules: parseInt(progress.total_modules),
					completed_modules: parseInt(progress.completed_modules),
					completion_rate: progress.total_modules > 0 
						? Math.round((parseInt(progress.completed_modules) / parseInt(progress.total_modules)) * 100)
						: 0
				},
				challenges: {
					total_challenges: parseInt(challenges.total_challenges),
					completed_challenges: parseInt(challenges.completed_challenges),
					avg_rank: challenges.avg_rank ? Math.round(parseFloat(challenges.avg_rank)) : null
				}
			}
		});

	} catch (error) {
		console.error('Get stats error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Change password
router.post('/change-password', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const { current_password, new_password } = req.body;

		if (!current_password || !new_password) {
			return res.status(400).json({
				success: false,
				error: 'Current password and new password are required'
			});
		}

		if (new_password.length < 8) {
			return res.status(400).json({
				success: false,
				error: 'New password must be at least 8 characters'
			});
		}

		// Get current user
		const userResult = await query(
			'SELECT password_hash FROM users WHERE id = $1',
			[userId]
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}

		// Verify current password
		const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

		if (!isValidPassword) {
			return res.status(400).json({
				success: false,
				error: 'Current password is incorrect'
			});
		}

		// Hash new password
		const saltRounds = 12;
		const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

		// Update password
		await query(
			'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
			[newPasswordHash, userId]
		);

		res.json({
			success: true,
			message: 'Password changed successfully'
		});

	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
