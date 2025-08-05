import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
	statusCode?: number;
	code?: string;
}

export const errorHandler = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let error = { ...err };
	error.message = err.message;

	// Log error
	console.error(err);

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const message = 'Resource not found';
		error = { name: 'CastError', message, statusCode: 404 };
	}

	// Mongoose duplicate key
	if (err.code === '11000') {
		const message = 'Duplicate field value entered';
		error = { name: 'DuplicateError', message, statusCode: 400 };
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message = 'Validation Error';
		error = { name: 'ValidationError', message, statusCode: 400 };
	}

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		const message = 'Invalid token';
		error = { name: 'JsonWebTokenError', message, statusCode: 401 };
	}

	if (err.name === 'TokenExpiredError') {
		const message = 'Token expired';
		error = { name: 'TokenExpiredError', message, statusCode: 401 };
	}

	// PostgreSQL errors
	if (err.code === '23505') {
		const message = 'Duplicate entry';
		error = { name: 'DuplicateError', message, statusCode: 400 };
	}

	if (err.code === '23503') {
		const message = 'Foreign key constraint violation';
		error = { name: 'ConstraintError', message, statusCode: 400 };
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};
