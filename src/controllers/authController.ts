import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepo } from '../repositories/userRepo.js';
import { sendError, sendSuccess } from '../utils/http.js';

type JwtUserPayload = {
  sub: number;
  email: string;
  main_role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) return secret;

  // Dev fallback: keeps local dev working without additional env setup.
  // For production, set JWT_SECRET.
  return 'dev-insecure-secret';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password, type_name } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    type_name?: unknown;
  };

  if (typeof name !== 'string' || name.trim().length === 0) {
    return sendError(res, 400, 'Name is required.');
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    return sendError(res, 400, 'Valid email is required.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    return sendError(res, 400, 'Password is required and must be at least 8 characters.');
  }
  if (typeof type_name !== 'string' || !['Employer', 'Freelancer'].includes(type_name)) {
    return sendError(res, 400, 'type_name must be one of: Employer, Freelancer.');
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      return sendError(res, 409, 'User with this email already exists.');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUserId = await userRepo.create(name.trim(), normalizedEmail, password_hash, type_name);

    if (!newUserId) {
      return sendError(res, 500, 'Failed to create user.');
    }

    const createdUser = await userRepo.findById(newUserId);
    if (!createdUser) {
      return sendError(res, 500, 'Failed to load created user.');
    }

    const token = signToken({ sub: createdUser.user_id, email: createdUser.email, main_role: createdUser.main_role });
    return sendSuccess(res, { token, user: createdUser }, 201);
  } catch (error) {
    console.error('Auth register error:', error);
    return sendError(res, 500, 'An internal server error occurred during registration.');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return sendError(res, 400, 'Valid email is required.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    return sendError(res, 400, 'Password is required.');
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const publicUser = await userRepo.findById(user.user_id);
    if (!publicUser) {
      return sendError(res, 500, 'Failed to load user.');
    }

    const token = signToken({ sub: publicUser.user_id, email: publicUser.email, main_role: publicUser.main_role });
    return sendSuccess(res, { token, user: publicUser }, 200);
  } catch (error) {
    console.error('Auth login error:', error);
    return sendError(res, 500, 'An internal server error occurred during login.');
  }
};
