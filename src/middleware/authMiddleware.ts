import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/http.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    main_role: string;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }

  console.warn('WARNING: Using insecure JWT secret - DO NOT USE IN PRODUCTION');
  return 'dev-insecure-secret';
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Authentication required.');
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as unknown as {
      sub: number;
      email: string;
      main_role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 401, 'Token expired. Please login again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 401, 'Invalid token.');
    }
    return sendError(res, 401, 'Authentication failed.');
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as unknown as {
      sub: number;
      email: string;
      main_role: string;
    };
    req.user = decoded;
  } catch {

  }

  next();
};
