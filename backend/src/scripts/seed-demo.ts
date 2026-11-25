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
 * Product images are SVG files shipped in client/public/demo and referenced by
 * same-origin path, so no image host or Cloudinary account is needed.
 */
import crypto from 'crypto';
import mongoose from 'mongoose';
import { config } from '../config';
import { onboardStore } from '../modules/onboarding/onboarding.service';
import { Store } from '../modules/stores/store.model';
import { Category } from '../modules/categories/category.model';
import { Product } from '../modules/products/product.model';
import { ShippingZone, ShippingRate } from '../modules/shipping/shipping.model';

const SLUG = process.env.DEMO_STORE_SLUG ?? 'demo-store';

// Large stock so public test orders do not sell the demo out.
const PRODUCTS: Array<[string, string, number, number, string]> = [
  ['Classic Tee', 'Soft cotton t-shirt. Demo product, not for sale.', 25, 5000, 'tee'],
  ['Denim Shirt', 'Mid-weight denim button shirt. Demo product, not for sale.', 60, 5000, 'denim'],
  ['Linen Shirt', 'Light summer linen shirt. Demo product, not for sale.', 45, 5000, 'linen'],
  ['Zip Hoodie', 'Fleece zip hoodie. Demo product, not for sale.', 70, 5000, 'hoodie'],
  ['Baseball Cap', 'Adjustable cotton cap. Demo product, not for sale.', 18, 5000, 'cap'],
  ['Canvas Tote', 'Everyday canvas tote bag. Demo product, not for sale.', 22, 5000, 'tote'],
];

async function main(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);
  if (await Store.exists({ slug: SLUG })) {
    console.log(`Store "${SLUG}" already exists, nothing to do.`);
    await mongoose.disconnect();
    return;
  }
  const result = await onboardStore({
    fullName: 'Demo Owner',
    email: `demo-owner-${crypto.randomBytes(4).toString('hex')}@example.invalid`,
    password: crypto.randomBytes(24).toString('hex'),
    storeName: 'Demo Store',
    storeCategory: 'fashion',
    storeSlug: SLUG,
  } as never);
  const storeId = (result as { store: { _id: unknown } }).store._id;
  const cat = await Category.create({ storeId, name: 'Apparel', slug: 'apparel', level: 0 });
  for (const [name, description, price, stock, img] of PRODUCTS) {
    await Product.create({ storeId, name, description, price, stock, categoryId: cat._id, images: [`/demo/${img}.svg`] });
  }
  const zone = await ShippingZone.create({ storeId, name: 'Demo countries', countries: ['EG', 'US', 'GB', 'DE', 'SA', 'AE'] });
  await ShippingRate.create({ storeId, zoneId: zone._id, name: 'Standard (demo)', type: 'flat', flatAmount: 5 });
  console.log(`Seeded demo store "${SLUG}" with ${PRODUCTS.length} products.`);
  await mongoose.disconnect();
}

// Exit explicitly: importing the app services opens Redis/email handles that would keep the process alive.
main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
