import express from 'express';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Trade creation schema
const createTradeSchema = z.object({
	instrument: z.string().min(1, 'Instrument is required'),
	side: z.enum(['buy', 'sell']),
	entry_price: z.number().positive('Entry price must be positive'),
	quantity: z.number().positive('Quantity must be positive'),
	stop_loss: z.number().positive().optional(),
	take_profit: z.number().positive().optional(),
	entry_time: z.string().datetime(),
	strategy_tags: z.array(z.string()).default([]),
	emotions: z.array(z.string()).default([]),
	notes: z.string().optional()
});

// Trade update schema
const updateTradeSchema = z.object({
	exit_price: z.number().positive().optional(),
	exit_time: z.string().datetime().optional(),
	stop_loss: z.number().positive().optional(),
	take_profit: z.number().positive().optional(),
	strategy_tags: z.array(z.string()).optional(),
	emotions: z.array(z.string()).optional(),
	notes: z.string().optional(),
	status: z.enum(['open', 'closed', 'cancelled']).optional()
});

// Create new trade
router.post('/', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const tradeData = createTradeSchema.parse(req.body);

		const result = await query(
			`INSERT INTO trades (
				user_id, instrument, side, entry_price, quantity, 
				stop_loss, take_profit, entry_time, strategy_tags, emotions, notes
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING *`,
			[
				userId,
				tradeData.instrument,
				tradeData.side,
				tradeData.entry_price,
				tradeData.quantity,
				tradeData.stop_loss,
				tradeData.take_profit,
				tradeData.entry_time,
				tradeData.strategy_tags,
				tradeData.emotions,
				tradeData.notes
			]
		);

		res.status(201).json({
			success: true,
			data: result.rows[0],
			message: 'Trade created successfully'
		});

	} catch (error) {
		console.error('Create trade error:', error);
		
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

// Get user trades
router.get('/', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
		const offset = (page - 1) * limit;
		const status = req.query.status as string;
		const instrument = req.query.instrument as string;

		// Build WHERE clause
		let whereClause = 'WHERE user_id = $1';
		const params = [userId];
		let paramIndex = 2;

		if (status) {
			whereClause += ` AND status = $${paramIndex}`;
			params.push(status);
			paramIndex++;
		}

		if (instrument) {
			whereClause += ` AND instrument = $${paramIndex}`;
			params.push(instrument);
			paramIndex++;
		}

		// Get trades
		const tradesResult = await query(
			`SELECT * FROM trades 
			 ${whereClause}
			 ORDER BY entry_time DESC 
			 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
			[...params, limit, offset]
		);

		// Get total count
		const countResult = await query(
			`SELECT COUNT(*) as total FROM trades ${whereClause}`,
			params
		);

		const total = parseInt(countResult.rows[0].total);
		const totalPages = Math.ceil(total / limit);

		res.json({
			success: true,
			data: tradesResult.rows,
			pagination: {
				page,
				limit,
				total,
				total_pages: totalPages
			}
		});

	} catch (error) {
		console.error('Get trades error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get single trade
router.get('/:id', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const tradeId = req.params.id;

		const result = await query(
			'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
			[tradeId, userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Trade not found'
			});
		}

		res.json({
			success: true,
			data: result.rows[0]
		});

	} catch (error) {
		console.error('Get trade error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Update trade
router.put('/:id', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const tradeId = req.params.id;
		const updates = updateTradeSchema.parse(req.body);

		// Check if trade exists and belongs to user
		const existingTrade = await query(
			'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
			[tradeId, userId]
		);

		if (existingTrade.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Trade not found'
			});
		}

		const trade = existingTrade.rows[0];

		// Calculate P&L if closing trade
		let pnl = null;
		if (updates.exit_price && updates.status === 'closed') {
			const entryPrice = parseFloat(trade.entry_price);
			const exitPrice = updates.exit_price;
			const quantity = parseFloat(trade.quantity);
			
			if (trade.side === 'buy') {
				pnl = (exitPrice - entryPrice) * quantity;
			} else {
				pnl = (entryPrice - exitPrice) * quantity;
			}
		}

		// Build update query
		const updateFields = Object.keys(updates);
		if (pnl !== null) {
			updateFields.push('pnl');
			(updates as any).pnl = pnl;
		}

		const setClause = updateFields.map((field, index) => `${field} = $${index + 3}`).join(', ');
		const values = [tradeId, userId, ...Object.values(updates)];

		const result = await query(
			`UPDATE trades SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
			 WHERE id = $1 AND user_id = $2 
			 RETURNING *`,
			values
		);

		res.json({
			success: true,
			data: result.rows[0],
			message: 'Trade updated successfully'
		});

	} catch (error) {
		console.error('Update trade error:', error);
		
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

// Delete trade
router.delete('/:id', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const tradeId = req.params.id;

		const result = await query(
			'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id',
			[tradeId, userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Trade not found'
			});
		}

		res.json({
			success: true,
			message: 'Trade deleted successfully'
		});

	} catch (error) {
		console.error('Delete trade error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get trading analytics
router.get('/analytics/summary', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const timeframe = req.query.timeframe as string || '30d';

		// Calculate date range
		let dateFilter = '';
		if (timeframe === '7d') {
			dateFilter = "AND entry_time >= NOW() - INTERVAL '7 days'";
		} else if (timeframe === '30d') {
			dateFilter = "AND entry_time >= NOW() - INTERVAL '30 days'";
		} else if (timeframe === '90d') {
			dateFilter = "AND entry_time >= NOW() - INTERVAL '90 days'";
		}

		const result = await query(
			`SELECT 
				COUNT(*) as total_trades,
				COUNT(CASE WHEN status = 'closed' AND pnl > 0 THEN 1 END) as winning_trades,
				COUNT(CASE WHEN status = 'closed' AND pnl < 0 THEN 1 END) as losing_trades,
				COUNT(CASE WHEN status = 'open' THEN 1 END) as open_trades,
				COALESCE(SUM(CASE WHEN status = 'closed' THEN pnl END), 0) as total_pnl,
				COALESCE(AVG(CASE WHEN status = 'closed' THEN pnl END), 0) as avg_pnl,
				COALESCE(MAX(CASE WHEN status = 'closed' THEN pnl END), 0) as best_trade,
				COALESCE(MIN(CASE WHEN status = 'closed' THEN pnl END), 0) as worst_trade
			 FROM trades 
			 WHERE user_id = $1 ${dateFilter}`,
			[userId]
		);

		const stats = result.rows[0];
		const totalClosed = parseInt(stats.winning_trades) + parseInt(stats.losing_trades);
		const winRate = totalClosed > 0 ? (parseInt(stats.winning_trades) / totalClosed) * 100 : 0;

		res.json({
			success: true,
			data: {
				total_trades: parseInt(stats.total_trades),
				winning_trades: parseInt(stats.winning_trades),
				losing_trades: parseInt(stats.losing_trades),
				open_trades: parseInt(stats.open_trades),
				win_rate: Math.round(winRate * 100) / 100,
				total_pnl: parseFloat(stats.total_pnl),
				avg_pnl: parseFloat(stats.avg_pnl),
				best_trade: parseFloat(stats.best_trade),
				worst_trade: parseFloat(stats.worst_trade),
				timeframe
			}
		});

	} catch (error) {
		console.error('Get analytics error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
