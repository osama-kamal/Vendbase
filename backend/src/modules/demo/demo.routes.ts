import { Router } from 'express';
import { signupLimiter } from '../../middleware/rateLimiter';
import { createSandboxHandler, cronCleanupHandler } from './demo.controller';

const router = Router();

// Unauthenticated by design (it mints throwaway demo stores), so it gets the
// same rate limit as signup.
router.post('/sandbox', signupLimiter, createSandboxHandler);

// Daily Vercel cron: delete expired sandboxes. Auth is the CRON_SECRET bearer
// checked in the handler.
router.get('/cron-cleanup', cronCleanupHandler);

export default router;
