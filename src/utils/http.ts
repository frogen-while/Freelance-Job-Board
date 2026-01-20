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
