import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: string[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors ? err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`) : [];
  } else if (err.code === 'P2002') {
    statusCode = 409;
    const target = (err.meta?.target as string[]) || [];
    message = `A record with this ${target.join(', ')} already exists`;
    errors = [message];
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errors = [err.message];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    errors = [err.message];
  } else if (err instanceof Error) {
    message = err.message;
  }

  logger.error({
    err: {
      message: err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    url: req.originalUrl,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
  });
};
