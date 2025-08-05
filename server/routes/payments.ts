import express from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from '../database/connection.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
	apiVersion: '2023-10-16'
});

// Validation schemas
const createSubscriptionSchema = z.object({
	plan: z.enum(['basic', 'premium']),
	success_url: z.string().url(),
	cancel_url: z.string().url()
});

const sessionSuccessSchema = z.object({
	session_id: z.string()
});

// Get subscription plans
router.get('/plans', async (req, res) => {
	try {
		const plans = [
			{
				id: 'basic',
				name: 'Basic Plan',
				description: 'Essential tools for serious retail traders',
				price: 29.00,
				currency: 'USD',
				interval: 'month',
				features: [
					'Unlimited trading journal',
					'Real-time macro bias data',
					'Heatman currency strength widget',
					'Advanced learning paths',
					'Trading challenges',
					'Priority email support',
					'Mobile app access'
				]
			},
			{
				id: 'premium',
				name: 'Premium Plan',
				description: 'Complete trading suite for professional traders',
				price: 79.00,
				currency: 'USD',
				interval: 'month',
				features: [
					'Everything in Basic',
					'Unlimited historical data',
					'Advanced analytics & insights',
					'Custom indicators',
					'1-on-1 coaching sessions (2/month)',
					'Private Discord community',
					'API access',
					'Priority chat support',
					'Early access to new features'
				]
			}
		];

		res.json({
			success: true,
			data: plans
		});

	} catch (error) {
		console.error('Get plans error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Get user's subscription status
router.get('/subscription', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			`SELECT s.*, u.subscription_tier, u.subscription_status 
			 FROM subscriptions s
			 JOIN users u ON s.user_id = u.id
			 WHERE s.user_id = $1 AND s.status = 'active'
			 ORDER BY s.created_at DESC
			 LIMIT 1`,
			[userId]
		);

		if (result.rows.length === 0) {
			return res.json({
				success: true,
				data: {
					has_subscription: false,
					plan: 'free',
					status: 'inactive'
				}
			});
		}

		const subscription = result.rows[0];

		res.json({
			success: true,
			data: {
				has_subscription: true,
				plan: subscription.plan_type,
				status: subscription.status,
				current_period_start: subscription.current_period_start,
				current_period_end: subscription.current_period_end,
				cancelled_at: subscription.cancelled_at
			}
		});

	} catch (error) {
		console.error('Get subscription error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Create subscription checkout session
router.post('/create-subscription', async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const validatedData = createSubscriptionSchema.parse(req.body);
		const { plan, success_url, cancel_url } = validatedData;

		// Define subscription plans
		const plans = {
			basic: {
				price_id: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
				name: 'Basic Plan',
				amount: 2900 // $29.00
			},
			premium: {
				price_id: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
				name: 'Premium Plan',
				amount: 7900 // $79.00
			}
		};

		const selectedPlan = plans[plan];

		// Get user email
		const userResult = await query(
			'SELECT email FROM users WHERE id = $1',
			[userId]
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}

		const userEmail = userResult.rows[0].email;

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			customer_email: userEmail,
			payment_method_types: ['card'],
			mode: 'subscription',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: selectedPlan.name,
							description: `PriceActionTalk ${selectedPlan.name} - Monthly Subscription`
						},
						unit_amount: selectedPlan.amount,
						recurring: {
							interval: 'month'
						}
					},
					quantity: 1,
				},
			],
			success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: cancel_url,
			metadata: {
				user_id: userId,
				plan: plan
			},
			subscription_data: {
				metadata: {
					user_id: userId,
					plan: plan
				}
			}
		});

		// Store checkout session
		await query(
			`INSERT INTO payment_sessions (
				user_id, session_id, plan_type, amount, status
			) VALUES ($1, $2, $3, $4, $5)`,
			[userId, session.id, plan, selectedPlan.amount, 'pending']
		);

		res.json({
			success: true,
			data: {
				session_id: session.id,
				checkout_url: session.url
			}
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Invalid request data',
				details: error.errors
			});
		}

		console.error('Create subscription error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Handle successful subscription
router.post('/subscription-success', async (req, res) => {
	try {
		const validatedData = sessionSuccessSchema.parse(req.body);
		const { session_id } = validatedData;

		// Retrieve the session from Stripe
		const session = await stripe.checkout.sessions.retrieve(session_id);

		if (session.payment_status === 'paid') {
			const userId = session.metadata?.user_id;
			const plan = session.metadata?.plan;

			if (userId && plan) {
				// Update user subscription
				await query(
					`UPDATE users SET 
						subscription_tier = $1,
						subscription_status = 'active',
						subscription_start_date = CURRENT_TIMESTAMP,
						updated_at = CURRENT_TIMESTAMP
					WHERE id = $2`,
					[plan, userId]
				);

				// Update payment session
				await query(
					`UPDATE payment_sessions SET 
						status = 'completed',
						stripe_payment_intent_id = $1,
						updated_at = CURRENT_TIMESTAMP
					WHERE session_id = $2`,
					[session.payment_intent, session_id]
				);

				// Create subscription record
				await query(
					`INSERT INTO subscriptions (
						user_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end
					) VALUES ($1, $2, $3, $4, $5, $6)`,
					[
						userId,
						session.subscription,
						plan,
						'active',
						new Date(),
						new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
					]
				);
			}
		}

		res.json({
			success: true,
			data: {
				payment_status: session.payment_status,
				subscription_id: session.subscription
			}
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Invalid request data',
				details: error.errors
			});
		}

		console.error('Subscription success error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
	try {
		const userId = (req as any).user.id;

		// Get user's subscription
		const subResult = await query(
			'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
			[userId, 'active']
		);

		if (subResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'No active subscription found'
			});
		}

		const stripeSubscriptionId = subResult.rows[0].stripe_subscription_id;

		// Cancel subscription in Stripe
		await stripe.subscriptions.update(stripeSubscriptionId, {
			cancel_at_period_end: true
		});

		// Update subscription status
		await query(
			`UPDATE subscriptions SET 
				status = 'cancelled',
				cancelled_at = CURRENT_TIMESTAMP,
				updated_at = CURRENT_TIMESTAMP
			WHERE stripe_subscription_id = $1`,
			[stripeSubscriptionId]
		);

		res.json({
			success: true,
			message: 'Subscription cancelled successfully'
		});

	} catch (error) {
		console.error('Cancel subscription error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
	const sig = req.headers['stripe-signature'] as string;
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
	} catch (err: any) {
		console.error('Webhook signature verification failed:', err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	// Handle the event
	switch (event.type) {
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
			const subscription = event.data.object as Stripe.Subscription;
			
			// Update subscription status in database
			await query(
				`UPDATE subscriptions SET 
					status = $1,
					updated_at = CURRENT_TIMESTAMP
				WHERE stripe_subscription_id = $2`,
				[subscription.status, subscription.id]
			);

			// Update user subscription status
			const userId = subscription.metadata?.user_id;
			if (userId) {
				await query(
					`UPDATE users SET 
						subscription_status = $1,
						updated_at = CURRENT_TIMESTAMP
					WHERE id = $2`,
					[subscription.status, userId]
				);
			}
			break;

		case 'invoice.payment_succeeded':
			const invoice = event.data.object as Stripe.Invoice;
			console.log('Payment succeeded for invoice:', invoice.id);
			break;

		case 'invoice.payment_failed':
			const failedInvoice = event.data.object as Stripe.Invoice;
			console.log('Payment failed for invoice:', failedInvoice.id);
			break;

		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	res.json({ received: true });
});

export default router;
