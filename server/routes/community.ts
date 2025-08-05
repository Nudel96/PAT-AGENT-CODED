import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// Get active challenges
router.get('/challenges', async (req, res) => {
	try {
		const result = await query(
			`SELECT c.*, COUNT(cp.id) as participant_count
			 FROM challenges c
			 LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
			 WHERE c.status IN ('upcoming', 'active')
			 GROUP BY c.id
			 ORDER BY c.start_date DESC`
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get challenges error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Join challenge
router.post('/challenges/:challengeId/join', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const challengeId = req.params.challengeId;

		// Check if already joined
		const existing = await query(
			'SELECT id FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2',
			[challengeId, userId]
		);

		if (existing.rows.length > 0) {
			return res.status(400).json({
				success: false,
				error: 'Already joined this challenge'
			});
		}

		// Check challenge capacity
		const challengeResult = await query(
			`SELECT c.max_participants, COUNT(cp.id) as current_participants
			 FROM challenges c
			 LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
			 WHERE c.id = $1 AND c.status = 'active'
			 GROUP BY c.id, c.max_participants`,
			[challengeId]
		);

		if (challengeResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Challenge not found or not active'
			});
		}

		const challenge = challengeResult.rows[0];
		if (challenge.max_participants && parseInt(challenge.current_participants) >= challenge.max_participants) {
			return res.status(400).json({
				success: false,
				error: 'Challenge is full'
			});
		}

		// Join challenge
		await query(
			'INSERT INTO challenge_participants (challenge_id, user_id) VALUES ($1, $2)',
			[challengeId, userId]
		);

		res.json({
			success: true,
			message: 'Successfully joined challenge'
		});

	} catch (error) {
		console.error('Join challenge error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get challenge leaderboard
router.get('/challenges/:challengeId/leaderboard', async (req, res) => {
	try {
		const challengeId = req.params.challengeId;

		const result = await query(
			`SELECT cp.*, u.username, u.level
			 FROM challenge_participants cp
			 JOIN users u ON cp.user_id = u.id
			 WHERE cp.challenge_id = $1
			 ORDER BY cp.rank ASC NULLS LAST, cp.final_score DESC NULLS LAST`,
			[challengeId]
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get leaderboard error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get chat messages
router.get('/chat/:room', async (req, res) => {
	try {
		const room = req.params.room;
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

		const result = await query(
			`SELECT cm.*, u.username, u.level
			 FROM chat_messages cm
			 JOIN users u ON cm.user_id = u.id
			 WHERE cm.room = $1
			 ORDER BY cm.timestamp DESC
			 LIMIT $2`,
			[room, limit]
		);

		res.json({
			success: true,
			data: result.rows.reverse() // Return in chronological order
		});

	} catch (error) {
		console.error('Get chat messages error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Send chat message
router.post('/chat/:room', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const room = req.params.room;
		const { content } = req.body;

		if (!content || content.trim().length === 0) {
			return res.status(400).json({
				success: false,
				error: 'Message content is required'
			});
		}

		if (content.length > 500) {
			return res.status(400).json({
				success: false,
				error: 'Message too long (max 500 characters)'
			});
		}

		const result = await query(
			`INSERT INTO chat_messages (user_id, room, content)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[userId, room, content.trim()]
		);

		// Get user info for the response
		const userResult = await query(
			'SELECT username, level FROM users WHERE id = $1',
			[userId]
		);

		const message = {
			...result.rows[0],
			username: userResult.rows[0].username,
			level: userResult.rows[0].level
		};

		res.json({
			success: true,
			data: message,
			message: 'Message sent successfully'
		});

	} catch (error) {
		console.error('Send message error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
