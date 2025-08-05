import express from 'express';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Risk settings schema
const riskSettingsSchema = z.object({
	max_risk_per_trade: z.number().min(0.1).max(10),
	max_daily_loss: z.number().min(1).max(50),
	max_weekly_loss: z.number().min(1).max(50),
	max_monthly_loss: z.number().min(1).max(50),
	max_open_trades: z.number().int().min(1).max(20),
	max_correlation_exposure: z.number().min(5).max(50),
	trading_enabled: z.boolean(),
	auto_close_enabled: z.boolean(),
	emergency_stop_enabled: z.boolean()
});

// Get user's risk settings
router.get('/settings', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			'SELECT * FROM risk_settings WHERE user_id = $1',
			[userId]
		);

		if (result.rows.length === 0) {
			// Return default settings if none exist
			const defaultSettings = {
				max_risk_per_trade: 2.0,
				max_daily_loss: 5.0,
				max_weekly_loss: 10.0,
				max_monthly_loss: 20.0,
				max_open_trades: 5,
				max_correlation_exposure: 15.0,
				trading_enabled: true,
				auto_close_enabled: false,
				emergency_stop_enabled: true
			};

			res.json({
				success: true,
				data: defaultSettings
			});
		} else {
			res.json({
				success: true,
				data: result.rows[0]
			});
		}

	} catch (error) {
		console.error('Get risk settings error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Update risk settings
router.put('/settings', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const validatedData = riskSettingsSchema.parse(req.body);

		// Check if settings exist
		const existingResult = await query(
			'SELECT id FROM risk_settings WHERE user_id = $1',
			[userId]
		);

		if (existingResult.rows.length === 0) {
			// Insert new settings
			await query(
				`INSERT INTO risk_settings (
					user_id, max_risk_per_trade, max_daily_loss, max_weekly_loss,
					max_monthly_loss, max_open_trades, max_correlation_exposure,
					trading_enabled, auto_close_enabled, emergency_stop_enabled
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
				[
					userId,
					validatedData.max_risk_per_trade,
					validatedData.max_daily_loss,
					validatedData.max_weekly_loss,
					validatedData.max_monthly_loss,
					validatedData.max_open_trades,
					validatedData.max_correlation_exposure,
					validatedData.trading_enabled,
					validatedData.auto_close_enabled,
					validatedData.emergency_stop_enabled
				]
			);
		} else {
			// Update existing settings
			await query(
				`UPDATE risk_settings SET
					max_risk_per_trade = $2,
					max_daily_loss = $3,
					max_weekly_loss = $4,
					max_monthly_loss = $5,
					max_open_trades = $6,
					max_correlation_exposure = $7,
					trading_enabled = $8,
					auto_close_enabled = $9,
					emergency_stop_enabled = $10,
					updated_at = CURRENT_TIMESTAMP
				WHERE user_id = $1`,
				[
					userId,
					validatedData.max_risk_per_trade,
					validatedData.max_daily_loss,
					validatedData.max_weekly_loss,
					validatedData.max_monthly_loss,
					validatedData.max_open_trades,
					validatedData.max_correlation_exposure,
					validatedData.trading_enabled,
					validatedData.auto_close_enabled,
					validatedData.emergency_stop_enabled
				]
			);
		}

		res.json({
			success: true,
			message: 'Risk settings updated successfully'
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Invalid request data',
				details: error.errors
			});
		}

		console.error('Update risk settings error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get risk metrics
router.get('/metrics', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		// Calculate current risk metrics
		const tradesResult = await query(
			`SELECT 
				COUNT(*) as total_trades,
				COUNT(*) FILTER (WHERE status = 'open') as open_trades,
				COALESCE(SUM(pnl) FILTER (WHERE status = 'closed' AND DATE(created_at) = CURRENT_DATE), 0) as daily_pnl,
				COALESCE(SUM(pnl) FILTER (WHERE status = 'closed' AND created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as weekly_pnl,
				COALESCE(SUM(pnl) FILTER (WHERE status = 'closed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as monthly_pnl,
				COALESCE(SUM(quantity * entry_price) FILTER (WHERE status = 'open'), 0) as current_exposure
			FROM trades 
			WHERE user_id = $1`,
			[userId]
		);

		const metrics = tradesResult.rows[0];

		// Calculate portfolio heat (percentage of account at risk)
		const accountBalance = 10000; // This should come from user's account balance
		const portfolioHeat = (metrics.current_exposure / accountBalance) * 100;

		// Calculate risk score (0-100)
		const riskScore = Math.min(100, Math.max(0, 
			(portfolioHeat * 0.4) + 
			(Math.abs(metrics.daily_pnl) / accountBalance * 100 * 0.3) +
			(metrics.open_trades * 5 * 0.3)
		));

		// Calculate max drawdown (simplified)
		const maxDrawdown = Math.min(0, metrics.monthly_pnl / accountBalance * 100);

		res.json({
			success: true,
			data: {
				current_risk: portfolioHeat,
				daily_pnl: metrics.daily_pnl / accountBalance * 100,
				weekly_pnl: metrics.weekly_pnl / accountBalance * 100,
				monthly_pnl: metrics.monthly_pnl / accountBalance * 100,
				open_trades_count: parseInt(metrics.open_trades),
				portfolio_heat: portfolioHeat,
				max_drawdown: maxDrawdown,
				risk_score: riskScore
			}
		});

	} catch (error) {
		console.error('Get risk metrics error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get trade blockers
router.get('/blockers', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			`SELECT * FROM trade_blockers 
			 WHERE user_id = $1 
			 ORDER BY triggered_at DESC`,
			[userId]
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get trade blockers error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Resolve trade blocker
router.post('/blockers/:id/resolve', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const blockerId = req.params.id;

		await query(
			`UPDATE trade_blockers SET 
				is_active = false,
				resolved_at = CURRENT_TIMESTAMP,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $1 AND user_id = $2`,
			[blockerId, userId]
		);

		res.json({
			success: true,
			message: 'Trade blocker resolved successfully'
		});

	} catch (error) {
		console.error('Resolve trade blocker error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Emergency stop
router.post('/emergency-stop', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		// Close all open trades (simplified - in real implementation would use broker API)
		await query(
			`UPDATE trades SET 
				status = 'closed',
				exit_time = CURRENT_TIMESTAMP,
				exit_price = entry_price,
				pnl = 0,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1 AND status = 'open'`,
			[userId]
		);

		// Disable trading
		await query(
			`UPDATE risk_settings SET 
				trading_enabled = false,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1`,
			[userId]
		);

		// Create emergency stop blocker
		await query(
			`INSERT INTO trade_blockers (
				user_id, reason, severity, is_active
			) VALUES ($1, $2, $3, $4)`,
			[
				userId,
				'Emergency stop activated - all trades closed and trading disabled',
				'critical',
				true
			]
		);

		res.json({
			success: true,
			message: 'Emergency stop executed successfully'
		});

	} catch (error) {
		console.error('Emergency stop error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
