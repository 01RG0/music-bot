import { Request, Response, NextFunction } from 'express';

export interface APIError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
}

export function createError(message: string, statusCode: number = 500): APIError {
  const error: APIError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
