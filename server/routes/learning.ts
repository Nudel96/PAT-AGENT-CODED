import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// Get learning paths
router.get('/paths', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const userLevel = (req as any).user.level;

		const result = await query(
			`SELECT lp.*, 
			        COUNT(lm.id) as module_count,
			        COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_modules
			 FROM learning_paths lp
			 LEFT JOIN learning_modules lm ON lp.id = lm.path_id
			 LEFT JOIN user_progress up ON lm.id = up.module_id AND up.user_id = $1
			 WHERE lp.level_requirement <= $2
			 GROUP BY lp.id
			 ORDER BY lp.level_requirement, lp.created_at`,
			[userId, userLevel]
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get learning paths error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get modules for a specific path
router.get('/paths/:pathId/modules', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const pathId = req.params.pathId;

		const result = await query(
			`SELECT lm.*, up.status as user_status, up.score, up.attempts, up.completed_at
			 FROM learning_modules lm
			 LEFT JOIN user_progress up ON lm.id = up.module_id AND up.user_id = $1
			 WHERE lm.path_id = $2
			 ORDER BY lm.order_index`,
			[userId, pathId]
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get modules error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get user progress
router.get('/progress', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			`SELECT lp.title as path_title, lm.title as module_title,
			        up.status, up.score, up.completed_at,
			        lm.xp_reward
			 FROM user_progress up
			 JOIN learning_modules lm ON up.module_id = lm.id
			 JOIN learning_paths lp ON lm.path_id = lp.id
			 WHERE up.user_id = $1
			 ORDER BY up.updated_at DESC`,
			[userId]
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get progress error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Start/update module progress
router.post('/modules/:moduleId/progress', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const moduleId = req.params.moduleId;
		const { status, score } = req.body;

		// Check if progress exists
		const existingProgress = await query(
			'SELECT * FROM user_progress WHERE user_id = $1 AND module_id = $2',
			[userId, moduleId]
		);

		if (existingProgress.rows.length > 0) {
			// Update existing progress
			const updateData: any = { status };
			if (score !== undefined) updateData.score = score;
			if (status === 'completed') updateData.completed_at = new Date();

			const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 3}`).join(', ');
			
			await query(
				`UPDATE user_progress 
				 SET ${setClause}, updated_at = CURRENT_TIMESTAMP
				 WHERE user_id = $1 AND module_id = $2`,
				[userId, moduleId, ...Object.values(updateData)]
			);
		} else {
			// Create new progress
			await query(
				`INSERT INTO user_progress (user_id, module_id, status, score, completed_at)
				 VALUES ($1, $2, $3, $4, $5)`,
				[
					userId, 
					moduleId, 
					status, 
					score || null, 
					status === 'completed' ? new Date() : null
				]
			);
		}

		// If completed, award XP
		if (status === 'completed') {
			const moduleResult = await query(
				'SELECT xp_reward FROM learning_modules WHERE id = $1',
				[moduleId]
			);

			if (moduleResult.rows.length > 0) {
				const xpReward = moduleResult.rows[0].xp_reward;
				
				await query(
					'UPDATE users SET xp = xp + $1 WHERE id = $2',
					[xpReward, userId]
				);
			}
		}

		res.json({
			success: true,
			message: 'Progress updated successfully'
		});

	} catch (error) {
		console.error('Update progress error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
