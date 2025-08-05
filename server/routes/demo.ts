import express from 'express';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Demo trade schema
const demoTradeSchema = z.object({
	instrument: z.string().min(1),
	side: z.enum(['buy', 'sell']),
	volume: z.number().positive(),
	stop_loss: z.number().optional(),
	take_profit: z.number().optional(),
	order_type: z.enum(['market', 'limit', 'stop']).default('market'),
	limit_price: z.number().optional()
});

// Get demo account
router.get('/account', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			'SELECT * FROM demo_accounts WHERE user_id = $1',
			[userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Demo account not found'
			});
		}

		const account = result.rows[0];

		// Calculate additional metrics
		const tradesResult = await query(
			`SELECT 
				COUNT(*) as trade_count,
				COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
				COALESCE(SUM(pnl) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0) as daily_pnl
			FROM demo_trades 
			WHERE user_id = $1 AND status = 'closed'`,
			[userId]
		);

		const tradeStats = tradesResult.rows[0];
		const winRate = tradeStats.trade_count > 0 
			? (tradeStats.winning_trades / tradeStats.trade_count) * 100 
			: 0;

		res.json({
			success: true,
			data: {
				...account,
				trade_count: parseInt(tradeStats.trade_count),
				win_rate: winRate,
				daily_pnl: parseFloat(tradeStats.daily_pnl)
			}
		});

	} catch (error) {
		console.error('Get demo account error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Create demo account
router.post('/account', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const { initial_balance = 10000 } = req.body;

		// Check if account already exists
		const existingResult = await query(
			'SELECT id FROM demo_accounts WHERE user_id = $1',
			[userId]
		);

		if (existingResult.rows.length > 0) {
			return res.status(400).json({
				success: false,
				error: 'Demo account already exists'
			});
		}

		const result = await query(
			`INSERT INTO demo_accounts (
				user_id, balance, equity, margin_used, free_margin, margin_level, total_pnl
			) VALUES ($1, $2, $2, 0, $2, 0, 0) RETURNING *`,
			[userId, initial_balance]
		);

		res.status(201).json({
			success: true,
			data: {
				...result.rows[0],
				trade_count: 0,
				win_rate: 0,
				daily_pnl: 0
			}
		});

	} catch (error) {
		console.error('Create demo account error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Reset demo account
router.post('/account/reset', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		// Close all open trades
		await query(
			`UPDATE demo_trades SET 
				status = 'closed',
				exit_price = open_price,
				pnl = 0,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1 AND status = 'open'`,
			[userId]
		);

		// Reset account balance
		await query(
			`UPDATE demo_accounts SET 
				balance = 10000,
				equity = 10000,
				margin_used = 0,
				free_margin = 10000,
				margin_level = 0,
				total_pnl = 0,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1`,
			[userId]
		);

		res.json({
			success: true,
			message: 'Demo account reset successfully'
		});

	} catch (error) {
		console.error('Reset demo account error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get demo trades
router.get('/trades', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const offset = (page - 1) * limit;

		const result = await query(
			`SELECT * FROM demo_trades 
			 WHERE user_id = $1 
			 ORDER BY created_at DESC 
			 LIMIT $2 OFFSET $3`,
			[userId, limit, offset]
		);

		const countResult = await query(
			'SELECT COUNT(*) FROM demo_trades WHERE user_id = $1',
			[userId]
		);

		const totalTrades = parseInt(countResult.rows[0].count);
		const totalPages = Math.ceil(totalTrades / limit);

		res.json({
			success: true,
			data: result.rows,
			pagination: {
				current_page: page,
				total_pages: totalPages,
				total_items: totalTrades,
				items_per_page: limit
			}
		});

	} catch (error) {
		console.error('Get demo trades error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Place demo trade
router.post('/trades', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const validatedData = demoTradeSchema.parse(req.body);

		// Get current market price (simplified - in real implementation would use market data API)
		const currentPrice = getMarketPrice(validatedData.instrument);
		const spread = getSpread(validatedData.instrument);

		const openPrice = validatedData.side === 'buy' 
			? currentPrice + spread 
			: currentPrice;

		// Calculate required margin (simplified)
		const leverage = 100; // 1:100 leverage
		const contractSize = 100000; // Standard lot
		const requiredMargin = (validatedData.volume * contractSize * openPrice) / leverage;

		// Check if user has sufficient margin
		const accountResult = await query(
			'SELECT free_margin FROM demo_accounts WHERE user_id = $1',
			[userId]
		);

		if (accountResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Demo account not found'
			});
		}

		const freeMargin = parseFloat(accountResult.rows[0].free_margin);
		if (requiredMargin > freeMargin) {
			return res.status(400).json({
				success: false,
				error: 'Insufficient margin'
			});
		}

		// Create the trade
		const tradeResult = await query(
			`INSERT INTO demo_trades (
				user_id, instrument, side, volume, open_price, current_price,
				stop_loss, take_profit, swap, commission, pnl, status
			) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 0, 0, 0, 'open') RETURNING *`,
			[
				userId,
				validatedData.instrument,
				validatedData.side,
				validatedData.volume,
				openPrice,
				validatedData.stop_loss || null,
				validatedData.take_profit || null
			]
		);

		// Update account margin
		await query(
			`UPDATE demo_accounts SET 
				margin_used = margin_used + $2,
				free_margin = free_margin - $2,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1`,
			[userId, requiredMargin]
		);

		res.status(201).json({
			success: true,
			data: tradeResult.rows[0]
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Invalid request data',
				details: error.errors
			});
		}

		console.error('Place demo trade error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Close demo trade
router.post('/trades/:id/close', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const tradeId = req.params.id;

		// Get the trade
		const tradeResult = await query(
			'SELECT * FROM demo_trades WHERE id = $1 AND user_id = $2 AND status = $3',
			[tradeId, userId, 'open']
		);

		if (tradeResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'Trade not found or already closed'
			});
		}

		const trade = tradeResult.rows[0];

		// Get current market price
		const currentPrice = getMarketPrice(trade.instrument);
		const spread = getSpread(trade.instrument);

		const exitPrice = trade.side === 'buy' 
			? currentPrice 
			: currentPrice + spread;

		// Calculate P&L
		const pnl = calculatePnL(trade, exitPrice);

		// Close the trade
		await query(
			`UPDATE demo_trades SET 
				status = 'closed',
				exit_price = $2,
				current_price = $2,
				pnl = $3,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $1`,
			[tradeId, exitPrice, pnl]
		);

		// Update account balance and margin
		const contractSize = 100000;
		const leverage = 100;
		const releasedMargin = (trade.volume * contractSize * trade.open_price) / leverage;

		await query(
			`UPDATE demo_accounts SET 
				balance = balance + $2,
				equity = equity + $2,
				margin_used = margin_used - $3,
				free_margin = free_margin + $3,
				total_pnl = total_pnl + $2,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1`,
			[userId, pnl, releasedMargin]
		);

		res.json({
			success: true,
			message: 'Trade closed successfully',
			data: {
				exit_price: exitPrice,
				pnl: pnl
			}
		});

	} catch (error) {
		console.error('Close demo trade error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Helper functions
function getMarketPrice(instrument: string): number {
	const basePrices: { [key: string]: number } = {
		'EURUSD': 1.0892,
		'GBPUSD': 1.2734,
		'USDJPY': 149.85,
		'AUDUSD': 0.6543,
		'USDCAD': 1.3621,
		'USDCHF': 0.8934,
		'NZDUSD': 0.5987
	};

	const basePrice = basePrices[instrument] || 1.0000;
	const variation = (Math.random() - 0.5) * 0.01;
	return basePrice + variation;
}

function getSpread(instrument: string): number {
	const spreads: { [key: string]: number } = {
		'EURUSD': 0.00015,
		'GBPUSD': 0.00020,
		'USDJPY': 0.015,
		'AUDUSD': 0.00018,
		'USDCAD': 0.00022,
		'USDCHF': 0.00025,
		'NZDUSD': 0.00030
	};

	return spreads[instrument] || 0.00020;
}

function calculatePnL(trade: any, exitPrice: number): number {
	const priceDiff = trade.side === 'buy' 
		? exitPrice - trade.open_price 
		: trade.open_price - exitPrice;
	
	const pipValue = trade.instrument.includes('JPY') ? 0.01 : 0.0001;
	const pips = priceDiff / pipValue;
	
	// Simplified P&L calculation ($10 per pip per lot)
	return pips * 10 * trade.volume - trade.commission - trade.swap;
}

export default router;
