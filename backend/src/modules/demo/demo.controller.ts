import { Request, Response, NextFunction } from 'express';
import { createSandbox, cleanupExpiredSandboxes } from './demo.service';
import { sendSuccess } from '../../utils/response';
import { createError } from '../../middleware/errorHandler';
import { NODE_ENV } from '../../config';

// Same refresh-cookie contract as auth.controller.ts (httpOnly, scoped to the
// auth endpoints). Duplicated because that helper is module-private there.
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string): void {
  const isProd = NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/v1/auth',
  });
}

/**
 * POST /api/v1/demo/sandbox — mint a private per-visitor sandbox store and
 * return a ready-made admin session for it. DEMO_MODE only (the router is not
 * mounted otherwise).
 */
export async function createSandboxHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await createSandbox();
    setRefreshCookie(res, result.refreshToken);
    // refreshToken stays out of the JSON body, same as login.
    sendSuccess(res, {
      store: result.store,
      user: result.user,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      ttlHours: 24,
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/demo/cron-cleanup — Vercel cron entry. Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; refuse anything else.
 */
export async function cronCleanupHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const removed = await cleanupExpiredSandboxes();
    sendSuccess(res, { removed });
  } catch (err) {
    next(err);
  }
}
