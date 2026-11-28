/**
 * Per-visitor sandbox stores for the public demo (DEMO_MODE only).
 *
 * One click on the demo banner mints a private copy of the demo store —
 * catalogue, categories, settings — with its own admin account, so a visitor
 * can try every dashboard workflow (add, edit, delete) without touching the
 * master demo-store or anyone else's sandbox. Sandboxes expire after
 * SANDBOX_TTL_HOURS and are removed by the daily cron cleanup (and
 * opportunistically at creation time, so a failed cron never lets them pile
 * up past MAX_ACTIVE_SANDBOXES).
 *
 * Tenant isolation does the heavy lifting: a sandbox admin's token is scoped
 * to their own storeId, exactly like any real merchant's. The only demo data
 * at risk is synthetic.
 */
import crypto from 'crypto';
import { Store } from '../stores/store.model';
import { User } from '../auth/user.model';
import { Product } from '../products/product.model';
import { Category } from '../categories/category.model';
import { Order } from '../orders/order.model';
import { Review } from '../reviews/review.model';
import { Coupon } from '../coupons/coupon.model';
import { Cart } from '../cart/cart.model';
import { NewsletterSubscriber } from '../newsletter/newsletter.model';
import { Wishlist } from '../users/wishlist.model';
import { TaxRate } from '../tax/tax.model';
import { ShippingZone, ShippingRate } from '../shipping/shipping.model';
import { onboardStore } from '../onboarding/onboarding.service';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { applyStorePublic, seedCatalogue, seedShipping } from './sandbox-catalogue';

export const SANDBOX_TTL_HOURS = 24;
export const MAX_ACTIVE_SANDBOXES = 25;

export interface SandboxResult {
  store: { _id: string; name: string; slug: string };
  user: { _id: string; email: string; fullName: string; role: string };
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function cleanupExpiredSandboxes(now = new Date()): Promise<number> {
  const expired = await Store.find({ isSandbox: true, sandboxExpiresAt: { $lt: now } }).select('_id slug').lean();
  for (const s of expired) {
    const storeId = s._id;
    // Delete every tenant-scoped collection before the store itself.
    await Promise.all([
      Product.deleteMany({ storeId }),
      Category.deleteMany({ storeId }),
      Order.deleteMany({ storeId }),
      Review.deleteMany({ storeId }),
      Coupon.deleteMany({ storeId }),
      Cart.deleteMany({ storeId }),
      NewsletterSubscriber.deleteMany({ storeId }),
      Wishlist.deleteMany({ storeId }),
      TaxRate.deleteMany({ storeId }),
      ShippingZone.deleteMany({ storeId }),
      ShippingRate.deleteMany({ storeId }),
      User.deleteMany({ storeId }),
    ]);
    await Store.deleteOne({ _id: storeId });
    logger.info(`Demo sandbox expired and deleted: ${(s as { slug?: string }).slug ?? storeId}`);
  }
  return expired.length;
}

export async function createSandbox(): Promise<SandboxResult> {
  // Opportunistic cleanup keeps the cap honest even if the daily cron misses.
  await cleanupExpiredSandboxes();

  const active = await Store.countDocuments({ isSandbox: true, isActive: true, sandboxExpiresAt: { $gt: new Date() } });
  if (active >= MAX_ACTIVE_SANDBOXES) {
    throw createError('All demo sandboxes are in use right now. Please try again later - sandboxes expire after 24 hours.', 429, 'SANDBOX_CAP');
  }

  const rand = crypto.randomBytes(4).toString('hex');
  const result = await onboardStore({
    fullName: 'Sandbox Admin',
    email: `sandbox-${rand}@example.invalid`,
    password: crypto.randomBytes(24).toString('hex'),
    storeName: `Sandbox Store ${rand}`,
    storeCategory: 'fashion',
    storeSlug: `sandbox-${rand}`,
  } as never);

  const storeId = (result.store as { _id: unknown })._id;
  const expiresAt = new Date(Date.now() + SANDBOX_TTL_HOURS * 60 * 60 * 1000);
  await Store.updateOne({ _id: storeId } as never, { $set: { isSandbox: true, sandboxExpiresAt: expiresAt } });

  await applyStorePublic(storeId);
  const productCount = await seedCatalogue(storeId);
  await seedShipping(storeId);

  logger.info(`Demo sandbox created: ${result.store.slug} (${productCount} products, expires ${expiresAt.toISOString()})`);

  return {
    store: result.store,
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt,
  };
}
