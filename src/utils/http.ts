import type { NextFunction, Request, Response, RequestHandler } from 'express';

export type ApiErrorPayload = {
  message: string;
  code?: string;
  details?: unknown;
};

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  code?: string,
  details?: unknown
) {
  throw new HttpError(status, message, code, details);
}

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  const httpError = err instanceof HttpError
    ? err
    : new HttpError(500, 'Internal Server Error');

  if (!(err instanceof HttpError)) {
    console.error('Unhandled error:', err);
  }

  const error: ApiErrorPayload = { message: httpError.message };
  if (httpError.code) error.code = httpError.code;
  if (httpError.details !== undefined) error.details = httpError.details;
  return res.status(httpError.status).json({ success: false, error });
}

export function rethrowHttpError(
  err: unknown,
  status: number,
  message: string,
  code?: string,
  details?: unknown
): never {
  if (err instanceof HttpError) {
    throw err;
  }
  throw new HttpError(status, message, code, details);
}

export function asyncHandler(handler: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

export function parseIdParam(
  res: Response,
  value: string,
  label: string
): number | null {
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    sendError(res, 400, `Invalid ${label} ID format.`);
    return null;
  }
  return id;
}
