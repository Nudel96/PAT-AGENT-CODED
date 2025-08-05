import express from 'express';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Post creation schema
const createPostSchema = z.object({
	title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title too long'),
	content: z.string().min(10, 'Content must be at least 10 characters'),
	category: z.string().min(1, 'Category is required'),
	tags: z.array(z.string()).default([])
});

// Reply creation schema
const createReplySchema = z.object({
	content: z.string().min(1, 'Content is required'),
	parent_reply_id: z.string().uuid().optional()
});

// Get forum posts
router.get('/posts', async (req, res) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
		const offset = (page - 1) * limit;
		const category = req.query.category as string;
		const search = req.query.search as string;

		let whereClause = 'WHERE 1=1';
		const params: any[] = [];
		let paramIndex = 1;

		if (category) {
			whereClause += ` AND category = $${paramIndex}`;
			params.push(category);
			paramIndex++;
		}

		if (search) {
			whereClause += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
			params.push(`%${search}%`);
			paramIndex++;
		}

		const result = await query(
			`SELECT fp.*, u.username, u.level
			 FROM forum_posts fp
			 JOIN users u ON fp.user_id = u.id
			 ${whereClause}
			 ORDER BY fp.is_pinned DESC, fp.created_at DESC
			 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
			[...params, limit, offset]
		);

		// Get total count
		const countResult = await query(
			`SELECT COUNT(*) as total FROM forum_posts fp ${whereClause}`,
			params
		);

		const total = parseInt(countResult.rows[0].total);
		const totalPages = Math.ceil(total / limit);

		res.json({
			success: true,
			data: result.rows,
			pagination: {
				page,
				limit,
				total,
				total_pages: totalPages
			}
		});

	} catch (error) {
		console.error('Get posts error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Create forum post
router.post('/posts', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const postData = createPostSchema.parse(req.body);

		const result = await query(
			`INSERT INTO forum_posts (user_id, title, content, category, tags)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING *`,
			[
				userId,
				postData.title,
				postData.content,
				postData.category,
				postData.tags
			]
		);

		res.status(201).json({
			success: true,
			data: result.rows[0],
			message: 'Post created successfully'
		});

	} catch (error) {
		console.error('Create post error:', error);
		
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

// Get single post with replies
router.get('/posts/:id', async (req, res) => {
	try {
		const postId = req.params.id;

		// Get post
		const postResult = await query(
			`SELECT fp.*, u.username, u.level
			 FROM forum_posts fp
			 JOIN users u ON fp.user_id = u.id
			 WHERE fp.id = $1`,
			[postId]
		);

		if (postResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Post not found'
			});
		}

		// Increment view count
		await query(
			'UPDATE forum_posts SET view_count = view_count + 1 WHERE id = $1',
			[postId]
		);

		// Get replies
		const repliesResult = await query(
			`SELECT fr.*, u.username, u.level
			 FROM forum_replies fr
			 JOIN users u ON fr.user_id = u.id
			 WHERE fr.post_id = $1
			 ORDER BY fr.created_at ASC`,
			[postId]
		);

		res.json({
			success: true,
			data: {
				post: postResult.rows[0],
				replies: repliesResult.rows
			}
		});

	} catch (error) {
		console.error('Get post error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Create reply
router.post('/posts/:id/replies', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const postId = req.params.id;
		const replyData = createReplySchema.parse(req.body);

		// Check if post exists
		const postExists = await query(
			'SELECT id FROM forum_posts WHERE id = $1',
			[postId]
		);

		if (postExists.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Post not found'
			});
		}

		// Create reply
		const result = await query(
			`INSERT INTO forum_replies (post_id, user_id, content, parent_reply_id)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
			[postId, userId, replyData.content, replyData.parent_reply_id || null]
		);

		// Update post reply count
		await query(
			'UPDATE forum_posts SET reply_count = reply_count + 1 WHERE id = $1',
			[postId]
		);

		res.status(201).json({
			success: true,
			data: result.rows[0],
			message: 'Reply created successfully'
		});

	} catch (error) {
		console.error('Create reply error:', error);
		
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

// Vote on post
router.post('/posts/:id/vote', async (req, res) => {
	try {
		const postId = req.params.id;
		const { type } = req.body; // 'up' or 'down'

		if (!['up', 'down'].includes(type)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid vote type'
			});
		}

		const field = type === 'up' ? 'upvotes' : 'downvotes';
		
		await query(
			`UPDATE forum_posts SET ${field} = ${field} + 1 WHERE id = $1`,
			[postId]
		);

		res.json({
			success: true,
			message: 'Vote recorded successfully'
		});

	} catch (error) {
		console.error('Vote error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get forum categories
router.get('/categories', async (req, res) => {
	try {
		const result = await query(
			`SELECT category, COUNT(*) as post_count
			 FROM forum_posts
			 GROUP BY category
			 ORDER BY post_count DESC`
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get categories error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
