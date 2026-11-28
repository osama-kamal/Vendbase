import { Router } from 'express';
import { sandboxLimiter } from '../../middleware/rateLimiter';
import { createSandboxHandler, cronCleanupHandler } from './demo.controller';

const router = Router();

// Unauthenticated by design (it mints throwaway demo stores), so it is rate
// limited; the live-sandbox cap in the service is the real backstop.
router.post('/sandbox', sandboxLimiter, createSandboxHandler);

// Daily Vercel cron: delete expired sandboxes. Auth is the CRON_SECRET bearer
// checked in the handler.
router.get('/cron-cleanup', cronCleanupHandler);

export default router;
