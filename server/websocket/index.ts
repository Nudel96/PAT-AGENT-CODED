import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';

interface AuthenticatedWebSocket extends WebSocket {
	userId?: string;
	username?: string;
	rooms?: Set<string>;
}

interface WSMessage {
	type: string;
	payload: any;
	room?: string;
}

export function setupWebSocket(wss: WebSocketServer) {
	console.log('🔌 WebSocket server initialized');

	wss.on('connection', async (ws: AuthenticatedWebSocket, request) => {
		console.log('New WebSocket connection');
		ws.rooms = new Set();

		// Handle authentication
		ws.on('message', async (data) => {
			try {
				const message: WSMessage = JSON.parse(data.toString());

				switch (message.type) {
					case 'auth':
						await handleAuth(ws, message.payload);
						break;

					case 'join_room':
						await handleJoinRoom(ws, message.payload);
						break;

					case 'leave_room':
						await handleLeaveRoom(ws, message.payload);
						break;

					case 'chat_message':
						await handleChatMessage(ws, message);
						break;

					case 'subscribe_prices':
						await handleSubscribePrices(ws, message.payload);
						break;

					case 'subscribe_macro':
						await handleSubscribeMacro(ws, message.payload);
						break;

					default:
						ws.send(JSON.stringify({
							type: 'error',
							payload: { message: 'Unknown message type' }
						}));
				}
			} catch (error) {
				console.error('WebSocket message error:', error);
				ws.send(JSON.stringify({
					type: 'error',
					payload: { message: 'Invalid message format' }
				}));
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket disconnected: ${ws.username || 'unknown'}`);
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});

		// Send welcome message
		ws.send(JSON.stringify({
			type: 'welcome',
			payload: { message: 'Connected to PriceActionTalk WebSocket' }
		}));
	});

	// Broadcast functions
	const broadcast = (room: string, message: any, excludeWs?: AuthenticatedWebSocket) => {
		wss.clients.forEach((client: AuthenticatedWebSocket) => {
			if (client !== excludeWs && 
				client.readyState === WebSocket.OPEN && 
				client.rooms?.has(room)) {
				client.send(JSON.stringify(message));
			}
		});
	};

	const broadcastToAll = (message: any, excludeWs?: AuthenticatedWebSocket) => {
		wss.clients.forEach((client: AuthenticatedWebSocket) => {
			if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	};

	// Authentication handler
	async function handleAuth(ws: AuthenticatedWebSocket, payload: { token: string }) {
		try {
			const decoded = jwt.verify(payload.token, process.env.JWT_SECRET!) as any;
			
			// Verify user exists and is active
			const userResult = await query(
				'SELECT id, username, level, is_active FROM users WHERE id = $1',
				[decoded.id]
			);

			if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
				ws.send(JSON.stringify({
					type: 'auth_error',
					payload: { message: 'Invalid user' }
				}));
				return;
			}

			const user = userResult.rows[0];
			ws.userId = user.id;
			ws.username = user.username;

			ws.send(JSON.stringify({
				type: 'auth_success',
				payload: { 
					userId: user.id,
					username: user.username,
					level: user.level
				}
			}));

			console.log(`WebSocket authenticated: ${user.username}`);

		} catch (error) {
			ws.send(JSON.stringify({
				type: 'auth_error',
				payload: { message: 'Invalid token' }
			}));
		}
	}

	// Room management
	async function handleJoinRoom(ws: AuthenticatedWebSocket, payload: { room: string }) {
		if (!ws.userId) {
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Authentication required' }
			}));
			return;
		}

		const { room } = payload;
		ws.rooms?.add(room);

		ws.send(JSON.stringify({
			type: 'room_joined',
			payload: { room }
		}));

		// Notify others in the room
		broadcast(room, {
			type: 'user_joined',
			payload: { 
				username: ws.username,
				room 
			}
		}, ws);

		console.log(`${ws.username} joined room: ${room}`);
	}

	async function handleLeaveRoom(ws: AuthenticatedWebSocket, payload: { room: string }) {
		const { room } = payload;
		ws.rooms?.delete(room);

		ws.send(JSON.stringify({
			type: 'room_left',
			payload: { room }
		}));

		// Notify others in the room
		broadcast(room, {
			type: 'user_left',
			payload: { 
				username: ws.username,
				room 
			}
		}, ws);

		console.log(`${ws.username} left room: ${room}`);
	}

	// Chat message handler
	async function handleChatMessage(ws: AuthenticatedWebSocket, message: WSMessage) {
		if (!ws.userId || !message.room) {
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Authentication and room required' }
			}));
			return;
		}

		const { content } = message.payload;

		if (!content || content.trim().length === 0) {
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Message content required' }
			}));
			return;
		}

		try {
			// Save message to database
			const result = await query(
				`INSERT INTO chat_messages (user_id, room, content)
				 VALUES ($1, $2, $3)
				 RETURNING *`,
				[ws.userId, message.room, content.trim()]
			);

			const chatMessage = {
				...result.rows[0],
				username: ws.username
			};

			// Broadcast to room
			broadcast(message.room, {
				type: 'chat_message',
				payload: chatMessage
			});

		} catch (error) {
			console.error('Chat message error:', error);
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Failed to send message' }
			}));
		}
	}

	// Price subscription handler
	async function handleSubscribePrices(ws: AuthenticatedWebSocket, payload: { symbols: string[] }) {
		if (!ws.userId) {
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Authentication required' }
			}));
			return;
		}

		// Join price update room
		ws.rooms?.add('prices');

		ws.send(JSON.stringify({
			type: 'price_subscription_active',
			payload: { symbols: payload.symbols }
		}));
	}

	// Macro data subscription handler
	async function handleSubscribeMacro(ws: AuthenticatedWebSocket, payload: { currencies: string[] }) {
		if (!ws.userId) {
			ws.send(JSON.stringify({
				type: 'error',
				payload: { message: 'Authentication required' }
			}));
			return;
		}

		// Join macro update room
		ws.rooms?.add('macro');

		ws.send(JSON.stringify({
			type: 'macro_subscription_active',
			payload: { currencies: payload.currencies }
		}));
	}

	// Periodic data updates (mock implementation)
	setInterval(() => {
		// Mock price updates
		const mockPriceUpdate = {
			type: 'price_update',
			payload: {
				symbol: 'EURUSD',
				price: 1.0892 + (Math.random() - 0.5) * 0.01,
				change: (Math.random() - 0.5) * 0.002,
				timestamp: new Date().toISOString()
			}
		};

		broadcast('prices', mockPriceUpdate);

		// Mock macro updates (less frequent)
		if (Math.random() < 0.1) { // 10% chance every interval
			const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
			const currency = currencies[Math.floor(Math.random() * currencies.length)];
			
			const mockMacroUpdate = {
				type: 'macro_update',
				payload: {
					currency,
					heat_score: (Math.random() - 0.5) * 10,
					timestamp: new Date().toISOString()
				}
			};

			broadcast('macro', mockMacroUpdate);
		}
	}, 5000); // Every 5 seconds

	return { broadcast, broadcastToAll };
}
