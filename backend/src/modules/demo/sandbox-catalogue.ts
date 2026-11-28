/**
 * Shared catalogue-copy helpers for the synthetic public demo.
 *
 * Used by two callers:
 *  - src/scripts/seed-demo.ts — one-off seeding of the master demo-store.
 *  - src/modules/demo/demo.service.ts — copying the same catalogue into a
 *    per-visitor sandbox store at runtime.
 *
 * The data itself lives in src/scripts/demo-catalogue.ts (a read-only export
 * of the original store's catalogue).
 */
import { Store } from '../stores/store.model';
import { Category } from '../categories/category.model';
import { Product } from '../products/product.model';
import { ShippingZone, ShippingRate } from '../shipping/shipping.model';
import { CATALOGUE, CATEGORY_TREE, STORE_PUBLIC, SHIPPING_ZONES, SHIPPING_RATES } from '../../scripts/demo-catalogue';

export async function applyStorePublic(storeId: unknown): Promise<void> {
  const set: Record<string, unknown> = { name: STORE_PUBLIC.name };
  if (STORE_PUBLIC.currency) set.currency = STORE_PUBLIC.currency;
  if (STORE_PUBLIC.theme) set.theme = STORE_PUBLIC.theme;
  if (STORE_PUBLIC.logoUrl) set['settings.logoUrl'] = STORE_PUBLIC.logoUrl;
  await Store.updateOne({ _id: storeId } as never, { $set: set });
}

export async function seedCatalogue(storeId: unknown): Promise<number> {
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

export async function seedShipping(storeId: unknown): Promise<void> {
  if (SHIPPING_ZONES.length === 0 || SHIPPING_RATES.length === 0) return;
  // Shipping exactly as configured in the original store. No zones exported
  // means the original store has shipping NOT configured: checkout then
  // charges no shipping, exactly like the original. Nothing is invented.
  const zoneIds: Record<string, unknown> = {};
  for (const z of SHIPPING_ZONES) {
    const doc = await ShippingZone.create({ storeId, name: z.name, countries: z.countries, isActive: z.isActive, sortOrder: z.sortOrder } as never);
    zoneIds[z.key] = (doc as any)._id;
  }
  for (const r of SHIPPING_RATES) {
    await ShippingRate.create({ storeId, zoneId: zoneIds[r.zoneKey], name: r.name, description: r.description || undefined, type: r.type, flatAmount: r.flatAmount, freeOverThreshold: r.freeOverThreshold, tiers: r.tiers, isActive: r.isActive, sortOrder: r.sortOrder } as never);
  }
}
