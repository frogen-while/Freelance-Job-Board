import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepo } from '../repositories/userRepo.js';
import { rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';
import { validatePassword } from '../utils/passwordValidator.js';
import { MainRole } from '../interfaces/User.js';

type JwtUserPayload = {
  sub: number;
  email: string;
  main_role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) return secret;
  return 'dev-insecure-secret';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, main_role } = req.body as {
    first_name?: unknown;
    last_name?: unknown;
    email?: unknown;
    password?: unknown;
    main_role?: unknown;
  };

  if (typeof first_name !== 'string' || first_name.trim().length === 0) {
    return sendError(res, 400, 'First name is required.');
  }
  if (typeof last_name !== 'string' || last_name.trim().length === 0) {
    return sendError(res, 400, 'Last name is required.');
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    return sendError(res, 400, 'Valid email is required.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    return sendError(res, 400, 'Password is required.');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return sendError(
      res,
      400,
      'Password does not meet security requirements.',
      'WEAK_PASSWORD',
      { requirements: passwordValidation.errors }
    );
  }

  if (typeof main_role !== 'string' || !['Employer', 'Freelancer'].includes(main_role)) {
    return sendError(res, 400, 'main_role must be one of: Employer, Freelancer.');
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      return sendError(res, 409, 'User with this email already exists.');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUserId = await userRepo.create(first_name.trim(), last_name.trim(), normalizedEmail, password_hash, main_role as MainRole);

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
    rethrowHttpError(error, 500, 'An internal server error occurred during registration.');
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

    if (user.is_blocked) {
      return sendError(res, 403, 'Your account has been blocked. Please contact support.');
    }

    // Temporary lockout check for repeated failed attempts
    const now = new Date();
    const lockUntil = user.lock_until ? new Date(user.lock_until) : null;
    if (lockUntil && lockUntil > now) {
      const minutesLeft = Math.max(1, Math.ceil((lockUntil.getTime() - now.getTime()) / 60000));
      return sendError(
        res,
        429,
        `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        'LOCKED',
        { retry_in_minutes: minutesLeft }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const currentFailed = user.failed_attempts ?? 0;
      const nextFailed = currentFailed + 1;

      if (nextFailed >= 3) {
        const lock = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await userRepo.setLoginFailure(user.user_id, 0, lock);
        return sendError(
          res,
          429,
          'Too many failed attempts. Try again in 5 minutes.',
          'LOCKED',
          { retry_in_minutes: 5, attempts_left: 0 }
        );
      }

      await userRepo.setLoginFailure(user.user_id, nextFailed, null);
      const attemptsLeft = Math.max(0, 3 - nextFailed);
      return sendError(
        res,
        401,
        'Invalid email or password.',
        'INVALID_CREDENTIALS',
        { attempts_left: attemptsLeft }
      );
    }

    // Successful login: reset counters/lock
    await userRepo.resetLoginFailures(user.user_id);

    const publicUser = await userRepo.findById(user.user_id);
    if (!publicUser) {
      return sendError(res, 500, 'Failed to load user.');
    }

    const token = signToken({ sub: publicUser.user_id, email: publicUser.email, main_role: publicUser.main_role });
    return sendSuccess(res, { token, user: publicUser }, 200);
  } catch (error) {
    console.error('Auth login error:', error);
    rethrowHttpError(error, 500, 'An internal server error occurred during login.');
  }
};
