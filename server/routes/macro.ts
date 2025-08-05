import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// Get current macro bias data
router.get('/bias', async (req, res) => {
	try {
		const result = await query(
			`SELECT * FROM macro_bias 
			 WHERE timestamp >= NOW() - INTERVAL '1 hour'
			 ORDER BY timestamp DESC`
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get macro bias error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get historical macro bias data
router.get('/bias/history', async (req, res) => {
	try {
		const currency = req.query.currency as string;
		const timeframe = req.query.timeframe as string || '24h';

		let dateFilter = "timestamp >= NOW() - INTERVAL '24 hours'";
		if (timeframe === '7d') {
			dateFilter = "timestamp >= NOW() - INTERVAL '7 days'";
		} else if (timeframe === '30d') {
			dateFilter = "timestamp >= NOW() - INTERVAL '30 days'";
		}

		let whereClause = `WHERE ${dateFilter}`;
		const params: any[] = [];

		if (currency) {
			whereClause += ' AND currency = $1';
			params.push(currency);
		}

		const result = await query(
			`SELECT * FROM macro_bias 
			 ${whereClause}
			 ORDER BY timestamp DESC`,
			params
		);

		res.json({
			success: true,
			data: result.rows
		});

	} catch (error) {
		console.error('Get macro bias history error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Calculate macro bias score using weighted factors
function calculateMacroBias(factors: any): number {
	const weights = {
		cot: 0.25,
		retail_sentiment: 0.15,
		price_momentum: 0.30,
		macro_surprise: 0.30
	};

	// Normalize scores to -5 to +5 range
	const normalizedCot = ((factors.cot_positioning - 50) / 50) * 5;
	const normalizedRetail = ((factors.retail_sentiment - 50) / 50) * 5;
	const normalizedMomentum = ((factors.price_momentum - 50) / 50) * 5;
	const normalizedMacro = ((factors.macro_surprise - 50) / 50) * 5;

	// Calculate weighted average
	const heatScore = (
		normalizedCot * weights.cot +
		normalizedRetail * weights.retail_sentiment +
		normalizedMomentum * weights.price_momentum +
		normalizedMacro * weights.macro_surprise
	);

	// Clamp to -5 to +5 range
	return Math.max(-5, Math.min(5, heatScore));
}

// Mock endpoint to simulate macro bias updates (for development)
router.post('/bias/mock', async (req, res) => {
	try {
		const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

		for (const currency of currencies) {
			// Generate realistic factor scores
			const cotScore = 30 + Math.random() * 40; // 30-70 range
			const retailSentimentScore = 20 + Math.random() * 60; // 20-80 range
			const priceMomentumScore = 25 + Math.random() * 50; // 25-75 range
			const macroSurpriseScore = 35 + Math.random() * 30; // 35-65 range

			const factors = {
				cot_positioning: cotScore,
				retail_sentiment: retailSentimentScore,
				price_momentum: priceMomentumScore,
				macro_surprise: macroSurpriseScore,
				weights: {
					cot: 0.25,
					retail_sentiment: 0.15,
					price_momentum: 0.30,
					macro_surprise: 0.30
				}
			};

			// Calculate heat score using weighted algorithm
			const heatScore = calculateMacroBias(factors);

			await query(
				`INSERT INTO macro_bias (
					currency, heat_score, cot_score, retail_sentiment_score,
					price_momentum_score, macro_surprise_score, factors
				) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				[
					currency,
					heatScore,
					cotScore,
					retailSentimentScore,
					priceMomentumScore,
					macroSurpriseScore,
					JSON.stringify(factors)
				]
			);
		}

		res.json({
			success: true,
			message: 'Mock macro bias data generated with AI scoring'
		});

	} catch (error) {
		console.error('Generate mock data error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get bias analysis for specific currency pair
router.get('/bias/analysis/:pair', async (req, res) => {
	try {
		const pair = req.params.pair.toUpperCase();

		// Extract base and quote currencies (e.g., EURUSD -> EUR, USD)
		const baseCurrency = pair.substring(0, 3);
		const quoteCurrency = pair.substring(3, 6);

		// Get bias data for both currencies
		const result = await query(
			`SELECT * FROM macro_bias
			 WHERE currency IN ($1, $2)
			 AND timestamp >= NOW() - INTERVAL '1 hour'
			 ORDER BY timestamp DESC
			 LIMIT 2`,
			[baseCurrency, quoteCurrency]
		);

		if (result.rows.length < 2) {
			return res.status(404).json({
				success: false,
				error: 'Insufficient data for currency pair analysis'
			});
		}

		const baseData = result.rows.find(r => r.currency === baseCurrency);
		const quoteData = result.rows.find(r => r.currency === quoteCurrency);

		// Calculate pair bias (base strength - quote strength)
		const pairBias = baseData.heat_score - quoteData.heat_score;

		let signal = 'NEUTRAL';
		if (pairBias > 2) signal = 'STRONG_BUY';
		else if (pairBias > 0.5) signal = 'BUY';
		else if (pairBias < -2) signal = 'STRONG_SELL';
		else if (pairBias < -0.5) signal = 'SELL';

		res.json({
			success: true,
			data: {
				pair,
				base_currency: baseCurrency,
				quote_currency: quoteCurrency,
				base_bias: baseData.heat_score,
				quote_bias: quoteData.heat_score,
				pair_bias: pairBias,
				signal,
				confidence: Math.abs(pairBias) / 10 * 100, // Convert to percentage
				analysis: {
					base: baseData,
					quote: quoteData
				}
			}
		});

	} catch (error) {
		console.error('Get pair analysis error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

export default router;
