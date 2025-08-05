import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		username: string;
		subscription_tier: 'free' | 'basic' | 'premium';
		xp: number;
		level: number;
	};
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

	if (!token) {
		return res.status(401).json({ 
			success: false, 
			error: 'Access token required' 
		});
	}

	jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
		if (err) {
			return res.status(403).json({ 
				success: false, 
				error: 'Invalid or expired token' 
			});
		}

		req.user = user;
		next();
	});
};

export const requireSubscription = (tiers: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ 
				success: false, 
				error: 'Authentication required' 
			});
		}

		if (!tiers.includes(req.user.subscription_tier)) {
			return res.status(403).json({ 
				success: false, 
				error: 'Subscription upgrade required',
				required_tiers: tiers
			});
		}

		next();
	};
};

export const requireLevel = (minLevel: number) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ 
				success: false, 
				error: 'Authentication required' 
			});
		}

		if (req.user.level < minLevel) {
			return res.status(403).json({ 
				success: false, 
				error: 'Insufficient level',
				required_level: minLevel,
				current_level: req.user.level
			});
		}

		next();
	};
};
