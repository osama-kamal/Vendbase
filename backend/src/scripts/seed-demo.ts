/**
 * Seeds a SYNTHETIC public demo store. Safe to re-run: it does nothing if the
 * demo store already exists.
 *
 *   MONGODB_URI=... npx ts-node src/scripts/seed-demo.ts
 *
 * The owner account gets a random password that is NOT printed or stored, so the
 * demo store's admin cannot be signed into by anyone. Reset it deliberately with
 * src/scripts/reset-password.ts if the owner ever needs access.
 *
 * Products come from the repository's own catalogue (demo-catalogue.ts); images
 * are the Unsplash URLs the project already uses.
 */
import crypto from 'crypto';
import mongoose from 'mongoose';
import { config } from '../config';
import { onboardStore } from '../modules/onboarding/onboarding.service';
import { Store } from '../modules/stores/store.model';
import { Category } from '../modules/categories/category.model';
import { Product } from '../modules/products/product.model';
import { ShippingZone, ShippingRate } from '../modules/shipping/shipping.model';
import { CATALOGUE, CATEGORY_TREE, STORE_PUBLIC, SHIPPING_ZONES, SHIPPING_RATES } from './demo-catalogue';

const SLUG = process.env.DEMO_STORE_SLUG ?? 'demo-store';

// Stock is exactly as exported from the original store.
const MARKER = CATALOGUE[CATALOGUE.length - 1].name;

async function seedCatalogue(storeId: unknown): Promise<number> {
  await Product.deleteMany({ storeId } as never);
  await Category.deleteMany({ storeId } as never);
  const ids: Record<string, unknown> = {};
  for (const c of CATEGORY_TREE) {
    const doc = await Category.create({
      storeId,
      name: c.name,
      slug: c.slug,
      parentId: c.parent ? ids[c.parent] : null,
      level: c.parent ? 1 : 0,
    } as never);
    ids[c.slug] = (doc as any)._id;
  }
  for (const item of CATALOGUE) {
    await Product.create({
      storeId,
      name: item.name,
      description: item.description,
      price: item.price,
      discount: item.discount,
      stock: item.stock,
      categoryId: ids[item.category],
      images: item.images,
      sizes: item.sizes,
      averageRating: item.averageRating,
      reviewCount: item.reviewCount,
    } as never);
  }
  return CATALOGUE.length;
}

async function applyStorePublic(storeId: unknown): Promise<void> {
  const set: Record<string, unknown> = { name: STORE_PUBLIC.name };
  if (STORE_PUBLIC.currency) set.currency = STORE_PUBLIC.currency;
  if (STORE_PUBLIC.theme) set.theme = STORE_PUBLIC.theme;
  if (STORE_PUBLIC.logoUrl) set['settings.logoUrl'] = STORE_PUBLIC.logoUrl;
  await Store.updateOne({ _id: storeId } as never, { $set: set });
}

async function main(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);
  const existing = await Store.findOne({ slug: SLUG }).lean();
  if (existing) {
    // Already seeded with the real catalogue: nothing to do. Otherwise replace
    // the older placeholder products of this synthetic demo store.
    await applyStorePublic(existing._id);
    if (SHIPPING_ZONES.length === 0) {
      // Remove ONLY the placeholder shipping created by the first demo seed
      // (exact name, countries and flat rate); the original store has none.
      const legacy = await ShippingZone.find({ storeId: existing._id, name: 'Demo countries', countries: { $all: ['EG', 'US', 'GB', 'DE', 'SA', 'AE'], $size: 6 } } as never).lean();
      for (const z of legacy) {
        const r = await ShippingRate.deleteMany({ storeId: existing._id, zoneId: z._id, name: 'Standard (demo)', type: 'flat', flatAmount: 5 } as never);
        const left = await ShippingRate.countDocuments({ zoneId: z._id } as never);
        if (left === 0) await ShippingZone.deleteOne({ _id: z._id } as never);
        console.log(`Removed legacy placeholder shipping: ${r.deletedCount} rate(s), zone ${left === 0 ? 'removed' : 'kept'}.`);
      }
    }
    if (await Product.exists({ storeId: existing._id, name: MARKER } as never)) {
      console.log(`Store "${SLUG}" already has the catalogue, nothing to do.`);
    } else {
      const n = await seedCatalogue(existing._id);
      console.log(`Replaced placeholder products in "${SLUG}" with ${n} catalogue products.`);
    }
    await mongoose.disconnect();
    return;
  }
  const result = await onboardStore({
    fullName: 'Demo Owner',
    email: `demo-owner-${crypto.randomBytes(4).toString('hex')}@example.invalid`,
    password: crypto.randomBytes(24).toString('hex'),
    storeName: STORE_PUBLIC.name,
    storeCategory: 'fashion',
    storeSlug: SLUG,
  } as never);
  const storeId = (result as { store: { _id: unknown } }).store._id;
  await applyStorePublic(storeId);
  const n = await seedCatalogue(storeId);
  if (SHIPPING_ZONES.length > 0 && SHIPPING_RATES.length > 0) {
    // Shipping exactly as configured in the original store.
    const zoneIds: Record<string, unknown> = {};
    for (const z of SHIPPING_ZONES) {
      const doc = await ShippingZone.create({ storeId, name: z.name, countries: z.countries, isActive: z.isActive, sortOrder: z.sortOrder } as never);
      zoneIds[z.key] = (doc as any)._id;
    }
    for (const r of SHIPPING_RATES) {
      await ShippingRate.create({ storeId, zoneId: zoneIds[r.zoneKey], name: r.name, description: r.description || undefined, type: r.type, flatAmount: r.flatAmount, freeOverThreshold: r.freeOverThreshold, tiers: r.tiers, isActive: r.isActive, sortOrder: r.sortOrder } as never);
    }
  }
  // No zones exported means the original store has shipping NOT configured:
  // checkout then charges no shipping, exactly like the original. Nothing is invented.
  console.log(`Seeded demo store "${SLUG}" with ${n} products.`);
  await mongoose.disconnect();
}

// Exit explicitly: importing the app services opens Redis/email handles that would keep the process alive.
main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
