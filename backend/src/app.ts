import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

import { isRedisAvailable } from './config/redis';

/** mongoose.connection.readyState -> human-readable label. */
const MONGO_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

import { CORS_ORIGINS } from './config/index';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { resolveStore } from './middleware/resolveStore';
import { enforceSubscription } from './middleware/enforceSubscription';
// authLimiter lives in its own file to avoid circular imports with auth.routes.ts
export { authLimiter } from './middleware/rateLimiter';

import authRoutes from './modules/auth/auth.routes';
import authTenantRoutes from './modules/auth/auth.tenant.routes';
import categoryRoutes from './modules/categories/category.routes';
import productRoutes from './modules/products/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/orders/order.routes';
import paymentRoutes from './modules/payments/payment.routes';
import reviewRoutes from './modules/reviews/review.routes';
import wishlistRoutes from './modules/users/wishlist.routes';
import adminRoutes from './modules/admin/admin.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import reportsRoutes from './modules/reports/reports.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import couponRoutes from './modules/coupons/coupon.routes';
import shippingRoutes from './modules/shipping/shipping.routes';
import taxRoutes from './modules/tax/tax.routes';
import storeRoutes from './modules/stores/store.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import supportRoutes from './modules/support/support.routes';
import planRoutes from './modules/plans/plan.routes';
import demoRoutes from './modules/demo/demo.routes';

const app = express();

// ── Trust Railway / reverse-proxy forwarded headers ───────────────────────────
// Required to prevent ERR_ERL_UNEXPECTED_X_FORWARDED_FOR from express-rate-limit
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://js.stripe.com', 'https://*.paymob.com', 'https://accept.paymob.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.stripe.com', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://accept.paymob.com', 'https://*.paymob.com', 'https://res.cloudinary.com'],
        frameSrc: ["'self'", 'https://js.stripe.com', 'https://accept.paymob.com', 'https://*.paymob.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Store-ID', 'X-Store-Slug'],
  })
);

// ── Cookie parser (required for httpOnly refresh-token cookies) ───────────────
app.use(cookieParser());

// ── Global rate limiting ──────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // storefront pages fire multiple concurrent requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ── Strict auth rate limiter ───────────────────────────────────────────────────
// Defined in middleware/rateLimiter.ts and re-exported above.
// Applied per-route in auth.routes.ts to avoid circular import issues.

// ── Webhook routes — raw body MUST be registered before express.json() ────────
// express.json() consumes the request stream. Any webhook route that needs the
// raw Buffer for HMAC verification (Stripe, Paymob) must be mounted here, BEFORE
// the global JSON parser runs, so express.raw() on those routes gets first access
// to the unconsumed stream.
// Public demo: no payment gateway is ever contacted. Every payment route
// (intents, Paymob init, webhooks) is refused before it reaches a provider.
if (process.env.DEMO_MODE === 'true') {
  app.use('/api/v1/payments', (_req, res) => {
    res.status(403).json({ success: false, code: 'DEMO_MODE', message: 'Online payments are disabled in the public demo. Use Cash on Delivery.' });
  });
}
app.use('/api/v1/payments', paymentRoutes);

// ── Body parsing (applies to all routes registered after this point) ──────────
app.use(express.json({ limit: process.env.DEMO_MODE === 'true' ? '20kb' : '100kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.DEMO_MODE === 'true' ? '20kb' : '100kb', parameterLimit: process.env.DEMO_MODE === 'true' ? 200 : 1000 }));

// ── NoSQL injection sanitization ──────────────────────────────────────────────
// MUST come AFTER the body parsers. express-mongo-sanitize walks req.body,
// req.query, req.params and req.headers and strips keys containing `$` or `.`.
// Registered before express.json() it saw req.body === undefined and silently
// skipped it, so every request body reached the route handlers unsanitized.
//
// Payment routes are mounted above (they need the raw Buffer for HMAC
// verification), so they are NOT covered here — the two non-webhook payment
// routes apply this middleware themselves after their own express.json().
app.use(mongoSanitize());

// ── Health check ──────────────────────────────────────────────────────────────
// ── Liveness ──────────────────────────────────────────────────────────────────
// "Is the process up?" — always 200. Deliberately does NOT check dependencies:
// server.ts binds the port before connecting to MongoDB so the platform health
// check passes during startup, and render.yaml points healthCheckPath here.
// Failing this on a slow DB connect would make the platform kill the container
// mid-boot. Use /health/ready for dependency state.
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Readiness ─────────────────────────────────────────────────────────────────
// "Can this instance actually serve traffic?" — 503 when MongoDB is unreachable.
// Point uptime monitoring and load-balancer readiness probes here; the previous
// single endpoint reported healthy with a completely dead database.
app.get('/api/v1/health/ready', (_req: Request, res: Response) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  const dbReady = dbState === 1;

  // Redis is optional — the app degrades gracefully without it, so it is
  // reported but never fails the probe.
  let redisReady = false;
  try {
    redisReady = isRedisAvailable();
  } catch {
    redisReady = false;
  }

  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ready' : 'not_ready',
    version: '2.0.0',
    checks: {
      mongodb: { ready: dbReady, state: MONGO_STATES[dbState] ?? 'unknown', required: true },
      redis: { ready: redisReady, required: false },
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Public demo guard ─────────────────────────────────────────────────────────
// When DEMO_MODE=true the deployment is a public portfolio demo with synthetic
// data. Block the endpoints that let strangers mint new stores and admin
// accounts, so the demo database cannot be abused as free tenant hosting.
if (process.env.DEMO_MODE === 'true') {
  app.use(['/api/v1/onboarding', '/api/v1/support'], (req, res, next) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') return next();
    res.status(403).json({ success: false, code: 'DEMO_MODE', message: 'Disabled in the public demo.' });
  });
  // No file uploads in the public demo (image processing is the heaviest path).
  app.use('/api/v1', (req, res, next) => {
    if ((req.headers['content-type'] || '').toLowerCase().startsWith('multipart/')) {
      res.status(403).json({ success: false, code: 'DEMO_MODE', message: 'Uploads are disabled in the public demo.' });
      return;
    }
    next();
  });
  // Orders in the demo can only be Cash on Delivery (the API default is online).
  app.post('/api/v1/orders', (req, res, next) => {
    if (req.body && req.body.paymentMethod === 'cod') return next();
    res.status(403).json({ success: false, code: 'DEMO_MODE', message: 'Only Cash on Delivery orders are allowed in the public demo.' });
  });
  app.post('/api/v1/stores', (_req, res) => {
    res.status(403).json({ success: false, code: 'DEMO_MODE', message: 'Disabled in the public demo.' });
  });
  // Per-visitor sandbox stores: the ONLY way a new store can be created in
  // the public demo. Sandboxes are capped, rate-limited and auto-expire.
  app.use('/api/v1/demo', demoRoutes);
}

// ── Store management routes (no store context needed) ─────────────────────────
app.use('/api/v1/stores', storeRoutes);

// ── Onboarding — public, no store context needed ──────────────────────────────
app.use('/api/v1/onboarding', onboardingRoutes);

// ── Auth routes — work without store context ──────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ── Support / lead-capture routes — public, no store context needed ───────────
app.use('/api/v1/support', supportRoutes);

// ── Plan display config — public GET, super-admin PUT ─────────────────────────
app.use('/api/v1/plans', planRoutes);

// ── Admin plan management — no store context needed (super-admin acts globally) ─
// Only the plan-specific endpoints are registered here without resolveStore.
// All other admin routes (dashboard, users, orders, etc.) need store context
// and are registered in the tenant router below.
import { Router as ExpressRouter } from 'express';
const globalAdminRouter = ExpressRouter();
import { authenticateJWT, requireSuperAdmin } from './middleware/authenticate';
import { updateStorePlan, listAllStoresAdmin, listPendingUpgrades } from './modules/admin/admin.controller';

// These three act ACROSS tenants, so they are restricted to 'super-admin'.
// Guards are attached PER ROUTE, never via globalAdminRouter.use(...): a
// router-level `use` would also run for every /api/v1/admin/* path that this
// router does not handle (e.g. /admin/dashboard) and would lock store admins
// out of their own tenant dashboards before the request reaches tenantRouter.
globalAdminRouter.patch('/stores/:id/plan', authenticateJWT, requireSuperAdmin, updateStorePlan);
globalAdminRouter.get('/stores', authenticateJWT, requireSuperAdmin, listAllStoresAdmin);
globalAdminRouter.get('/stores/pending-upgrades', authenticateJWT, requireSuperAdmin, listPendingUpgrades);
app.use('/api/v1/admin', globalAdminRouter);

// ── Store-scoped API routes ───────────────────────────────────────────────────
// All routes below require a store context resolved from X-Store-ID / X-Store-Slug / subdomain.
//
// ⚠️  ROUTE PLACEMENT IS A BILLING CONTROL.
// Everything mounted on this router is subject to `enforceSubscription` below.
// The routes that let a merchant PAY — /stores/:id/upgrade-request, /plans,
// /stores/mine, /stores/current — are deliberately mounted ABOVE, outside this
// router, so a suspended store can always reach the checkout that restores it.
// Moving any of them down here would lock non-paying merchants out of paying.
// `subscription-enforcement.integration.test.ts` pins this.
const tenantRouter = express.Router();
tenantRouter.use(resolveStore);
// Reads stay open on a restricted store; writes and new orders get HTTP 402.
// Mounted here rather than per-route so no future endpoint can forget the gate.
tenantRouter.use(enforceSubscription);

// Store-scoped auth (customer register/login/forgot-password). The
// store-INDEPENDENT auth routes are mounted above at the same public prefix;
// the two route sets are disjoint so a request for /auth/login falls through
// that mount and arrives here with `req.store` resolved. See the header of
// auth.tenant.routes.ts for what went wrong when they overlapped.
tenantRouter.use('/auth', authTenantRoutes);
tenantRouter.use('/categories', categoryRoutes);
tenantRouter.use('/products', productRoutes);
tenantRouter.use('/cart', cartRoutes);
tenantRouter.use('/orders', orderRoutes);
tenantRouter.use('/reviews', reviewRoutes);
tenantRouter.use('/wishlist', wishlistRoutes);
tenantRouter.use('/admin', adminRoutes);
tenantRouter.use('/admin/analytics', analyticsRoutes);
tenantRouter.use('/admin/reports', reportsRoutes);
tenantRouter.use('/newsletter', newsletterRoutes);
tenantRouter.use('/recommendations', recommendationsRoutes);
tenantRouter.use('/chatbot', chatbotRoutes);
tenantRouter.use('/coupons', couponRoutes);
tenantRouter.use('/shipping', shippingRoutes);
tenantRouter.use('/tax', taxRoutes);

app.use('/api/v1', tenantRouter);

// ── Demo: serve the built client from this process ────────────────────────────
// Only when DEMO_MODE=true and a ./public build exists (the root Dockerfile
// puts it there). Non-API GETs fall back to index.html for client-side routing.
if (process.env.DEMO_MODE === 'true') {
  const publicDir = path.resolve(__dirname, '..', 'public');
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    app.use(express.static(publicDir, { index: false, maxAge: '1h' }));
    app.get(/^\/(?!api\/).*/, (_req: Request, res: Response) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
