import express from 'express';
import Stripe from 'stripe';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16'
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
	try {
		const userId = (req as any).user.id;
		const { priceId, successUrl, cancelUrl } = req.body;

		// Get or create Stripe customer
		let customer;
		const userResult = await query(
			'SELECT stripe_customer_id, email FROM users WHERE id = $1',
			[userId]
		);

		const user = userResult.rows[0];

		if (user.stripe_customer_id) {
			customer = await stripe.customers.retrieve(user.stripe_customer_id);
		} else {
			customer = await stripe.customers.create({
				email: user.email,
				metadata: {
					user_id: userId
				}
			});

			// Update user with Stripe customer ID
			await query(
				'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
				[customer.id, userId]
			);
		}

		// Create checkout session
		const session = await stripe.checkout.sessions.create({
			customer: customer.id,
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: {
				user_id: userId
			}
		});

		res.json({
			success: true,
			data: {
				sessionId: session.id,
				url: session.url
			}
		});

	} catch (error) {
		console.error('Create checkout session error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to create checkout session'
		});
	}
});

// Get subscription status
router.get('/subscription', authenticateToken, async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const result = await query(
			'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
			[userId]
		);

		if (result.rows.length === 0) {
			return res.json({
				success: true,
				data: null
			});
		}

		res.json({
			success: true,
			data: result.rows[0]
		});

	} catch (error) {
		console.error('Get subscription error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error'
		});
	}
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
	try {
		const userId = (req as any).user.id;

		const subscriptionResult = await query(
			'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
			[userId, 'active']
		);

		if (subscriptionResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: 'No active subscription found'
			});
		}

		const stripeSubscriptionId = subscriptionResult.rows[0].stripe_subscription_id;

		// Cancel subscription in Stripe
		await stripe.subscriptions.update(stripeSubscriptionId, {
			cancel_at_period_end: true
		});

		res.json({
			success: true,
			message: 'Subscription will be cancelled at the end of the current period'
		});

	} catch (error) {
		console.error('Cancel subscription error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to cancel subscription'
		});
	}
});

// Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
	const sig = req.headers['stripe-signature'];
	let event;

	try {
		event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
	} catch (err: any) {
		console.error('Webhook signature verification failed:', err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed':
				const session = event.data.object as Stripe.Checkout.Session;
				await handleCheckoutCompleted(session);
				break;

			case 'invoice.payment_succeeded':
				const invoice = event.data.object as Stripe.Invoice;
				await handlePaymentSucceeded(invoice);
				break;

			case 'customer.subscription.updated':
			case 'customer.subscription.deleted':
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionChange(subscription);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		res.json({ received: true });

	} catch (error) {
		console.error('Webhook handler error:', error);
		res.status(500).json({ error: 'Webhook handler failed' });
	}
});

// Helper functions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
	const userId = session.metadata?.user_id;
	if (!userId) return;

	// Get subscription details
	const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
	const priceId = subscription.items.data[0].price.id;

	// Determine plan based on price ID
	let plan = 'basic';
	// You would map your actual price IDs here
	// if (priceId === 'price_premium') plan = 'premium';

	// Create subscription record
	await query(
		`INSERT INTO subscriptions (
			user_id, stripe_subscription_id, plan, status,
			current_period_start, current_period_end
		) VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (stripe_subscription_id) 
		DO UPDATE SET status = $4, current_period_start = $5, current_period_end = $6`,
		[
			userId,
			subscription.id,
			plan,
			subscription.status,
			new Date(subscription.current_period_start * 1000),
			new Date(subscription.current_period_end * 1000)
		]
	);

	// Update user subscription tier
	await query(
		'UPDATE users SET subscription_tier = $1 WHERE id = $2',
		[plan, userId]
	);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
	// Handle successful payment
	console.log('Payment succeeded for invoice:', invoice.id);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
	// Update subscription status
	await query(
		`UPDATE subscriptions 
		 SET status = $1, current_period_start = $2, current_period_end = $3
		 WHERE stripe_subscription_id = $4`,
		[
			subscription.status,
			new Date(subscription.current_period_start * 1000),
			new Date(subscription.current_period_end * 1000),
			subscription.id
		]
	);

	// Update user subscription tier based on status
	const tier = subscription.status === 'active' ? 'basic' : 'free'; // Adjust based on your logic
	
	await query(
		`UPDATE users 
		 SET subscription_tier = $1 
		 WHERE stripe_customer_id = $2`,
		[tier, subscription.customer]
	);
}

export default router;
