import type { Response } from 'express';

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
  const error: ApiErrorPayload = { message };
  if (code) error.code = code;
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}
