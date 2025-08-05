import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tradingRoutes from './routes/trading.js';
import macroRoutes from './routes/macro.js';
import learningRoutes from './routes/learning.js';
import communityRoutes from './routes/community.js';
import forumRoutes from './routes/forum.js';
import stripeRoutes from './routes/stripe.js';
import paymentsRoutes from './routes/payments.js';
import riskRoutes from './routes/risk.js';
import demoRoutes from './routes/demo.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import WebSocket handler
import { setupWebSocket } from './websocket/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Security middleware
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
			imgSrc: ["'self'", "data:", "https:"],
			scriptSrc: ["'self'"],
			connectSrc: ["'self'", "ws:", "wss:"]
		}
	}
}));

// CORS configuration
app.use(cors({
	origin: process.env.NODE_ENV === 'production' 
		? ['https://priceactiontalk.com', 'https://www.priceactiontalk.com']
		: ['http://localhost:5173', 'http://127.0.0.1:5173'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ 
		status: 'OK', 
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/trading', authenticateToken, tradingRoutes);
app.use('/api/macro', authenticateToken, macroRoutes);
app.use('/api/learning', authenticateToken, learningRoutes);
app.use('/api/community', authenticateToken, communityRoutes);
app.use('/api/forum', authenticateToken, forumRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/payments', authenticateToken, paymentsRoutes);
app.use('/api/risk', authenticateToken, riskRoutes);
app.use('/api/demo', authenticateToken, demoRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({ 
		success: false, 
		error: 'Route not found' 
	});
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
setupWebSocket(wss);

// Start server
server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📡 WebSocket server running on port ${WS_PORT}`);
	console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received, shutting down gracefully');
	server.close(() => {
		console.log('Process terminated');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('SIGINT received, shutting down gracefully');
	server.close(() => {
		console.log('Process terminated');
		process.exit(0);
	});
});

export default app;
