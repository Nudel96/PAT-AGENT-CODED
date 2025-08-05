import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
	host: process.env.DATABASE_HOST || 'localhost',
	port: parseInt(process.env.DATABASE_PORT || '5432'),
	database: process.env.DATABASE_NAME || 'priceactiontalk',
	user: process.env.DATABASE_USER || 'postgres',
	password: process.env.DATABASE_PASSWORD || 'password',
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
	max: 20, // Maximum number of clients in the pool
	idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
	connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
	console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
	console.error('❌ Unexpected error on idle client', err);
	process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
	const start = Date.now();
	try {
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		console.log('Executed query', { text, duration, rows: res.rowCount });
		return res;
	} catch (error) {
		console.error('Database query error:', error);
		throw error;
	}
};

// Helper function to get a client from the pool
export const getClient = async () => {
	return await pool.connect();
};

// Graceful shutdown
export const closePool = async () => {
	await pool.end();
	console.log('📊 Database connection pool closed');
};
