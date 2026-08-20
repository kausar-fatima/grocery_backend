/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AppModule } from './app.module';
import { User } from './users/users.entity';
import { Store } from './stores/stores.entity';
import { Category } from './categories/categories.entity';
import { Product } from './products/products.entity';
import { Address } from './addresses/address.entity';
import { Promotion } from './promotions/promotion.entity';
import { UserRole } from './common/enums/user_role.enum';

/**
 * Idempotent seeder: one known account per role (password "password123"),
 * plus several LA-area stores (with geo-coordinates) each stocked with
 * products, so the customer app's "nearby stores / items near you" works.
 *
 * Run with:  npm run seed
 */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const ds = app.get(DataSource);

  const users = ds.getRepository(User);
  const stores = ds.getRepository(Store);
  const categories = ds.getRepository(Category);
  const products = ds.getRepository(Product);
  const addresses = ds.getRepository(Address);
  const promotions = ds.getRepository(Promotion);

  const password = await bcrypt.hash('password123', 10);

  async function upsertUser(
    email: string,
    username: string,
    phone: string,
    role: UserRole,
  ): Promise<User> {
    let user = await users.findOne({ where: { email } });
    if (!user) user = users.create({ email, username, phone, role });
    user.username = username;
    user.phone = phone;
    user.role = role;
    user.password = password;
    user.isApproved = true;
    return users.save(user);
  }

  const admin = await upsertUser('admin@grocery.com', 'Platform Admin', '0300-0000001', UserRole.ADMIN);
  const owner = await upsertUser('store@grocery.com', 'Store Owner', '0300-0000002', UserRole.STORE_OWNER);
  const rider = await upsertUser('rider@grocery.com', 'John Rider', '0300-0000003', UserRole.RIDER);
  const customer = await upsertUser('customer@grocery.com', 'Jane Customer', '0300-0000004', UserRole.CUSTOMER);

  type Cat = { name: string; image: string };
  type Prod = {
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    description: string;
  };

  async function seedStore(
    info: {
      name: string;
      address: string;
      phone: string;
      lat: number;
      lng: number;
      opensAt?: string;
      closesAt?: string;
    },
    categorySeed: Cat[],
    productSeed: Prod[],
  ): Promise<Store> {
    let store = await stores.findOne({ where: { name: info.name } });
    if (!store) store = stores.create({ name: info.name });
    store.address = info.address;
    store.phone = info.phone;
    store.latitude = info.lat;
    store.longitude = info.lng;
    store.opensAt = info.opensAt ?? '08:00';
    store.closesAt = info.closesAt ?? '23:00';
    store.owner = owner;
    store.isActive = true;
    store = await stores.save(store);

    const catByName: Record<string, Category> = {};
    for (const c of categorySeed) {
      let cat = await categories.findOne({
        where: { name: c.name, store: { id: store.id } },
        relations: ['store'],
      });
      if (!cat) cat = categories.create({ name: c.name, store });
      cat.image = c.image;
      cat.isActive = true;
      catByName[c.name] = await categories.save(cat);
    }

    for (const p of productSeed) {
      let product = await products.findOne({
        where: { name: p.name, store: { id: store.id } },
        relations: ['store'],
      });
      if (!product) product = products.create({ name: p.name, store });
      product.description = p.description;
      product.price = p.price;
      product.stock = p.stock;
      product.image = p.image;
      product.category = catByName[p.category];
      product.isAvailable = true;
      await products.save(product);
    }
    return store;
  }

  // --- Store 1: Healthy Mart (Gulberg, Lahore) — open late ---
  await seedStore(
    { name: 'Healthy Mart', address: 'Main Blvd, Gulberg III, Lahore', phone: '0300-1234567', lat: 31.5204, lng: 74.3587, opensAt: '08:00', closesAt: '23:59' },
    [
      { name: 'Vegetables', image: '🥦' },
      { name: 'Fruits', image: '🍎' },
      { name: 'Bakery', image: '🍞' },
      { name: 'Dairy', image: '🧀' },
      { name: 'Meat', image: '🥩' },
      { name: 'Beverages', image: '🧃' },
    ],
    [
      { name: 'Broccoli', category: 'Vegetables', price: 3.5, stock: 60, image: '🥦', description: 'Fresh green broccoli, rich in vitamins and fibre.' },
      { name: 'Carrots', category: 'Vegetables', price: 2.2, stock: 80, image: '🥕', description: 'Crunchy sweet carrots, perfect for salads and cooking.' },
      { name: 'Tomatoes', category: 'Vegetables', price: 2.8, stock: 70, image: '🍅', description: 'Ripe juicy tomatoes sourced from local farms.' },
      { name: 'Bell Pepper', category: 'Vegetables', price: 3.1, stock: 40, image: '🫑', description: 'Colourful crisp bell peppers.' },
      { name: 'Red Apple', category: 'Fruits', price: 4.0, stock: 90, image: '🍎', description: 'Sweet and crisp red apples, great for snacking.' },
      { name: 'Banana', category: 'Fruits', price: 1.9, stock: 120, image: '🍌', description: 'Ripe bananas packed with potassium.' },
      { name: 'Strawberry', category: 'Fruits', price: 5.5, stock: 35, image: '🍓', description: 'Fragrant strawberries full of antioxidants.' },
      { name: 'Orange', category: 'Fruits', price: 2.6, stock: 75, image: '🍊', description: 'Juicy oranges rich in vitamin C.' },
      { name: 'Whole Bread', category: 'Bakery', price: 2.4, stock: 50, image: '🍞', description: 'Freshly baked whole wheat bread.' },
      { name: 'Croissant', category: 'Bakery', price: 1.8, stock: 45, image: '🥐', description: 'Buttery, flaky croissants baked daily.' },
      { name: 'Cheddar Cheese', category: 'Dairy', price: 6.2, stock: 30, image: '🧀', description: 'Aged cheddar cheese, sharp and creamy.' },
      { name: 'Fresh Milk', category: 'Dairy', price: 1.5, stock: 100, image: '🥛', description: 'Farm-fresh whole milk, 1 litre.' },
      { name: 'Beef Steak', category: 'Meat', price: 12.5, stock: 25, image: '🥩', description: 'Premium cut beef steak.' },
      { name: 'Chicken Breast', category: 'Meat', price: 8.0, stock: 40, image: '🍗', description: 'Boneless skinless chicken breast.' },
      { name: 'Orange Juice', category: 'Beverages', price: 3.3, stock: 60, image: '🧃', description: 'Freshly squeezed orange juice, no added sugar.' },
    ],
  );

  // --- Store 2: Green Basket (DHA Phase 5, Lahore) — daytime hours ---
  await seedStore(
    { name: 'Green Basket', address: 'Sector C, DHA Phase 5, Lahore', phone: '0300-2223333', lat: 31.4710, lng: 74.4090, opensAt: '09:00', closesAt: '21:00' },
    [
      { name: 'Vegetables', image: '🥦' },
      { name: 'Fruits', image: '🍎' },
      { name: 'Dairy', image: '🧀' },
    ],
    [
      { name: 'Organic Spinach', category: 'Vegetables', price: 3.0, stock: 50, image: '🥬', description: 'Tender organic spinach leaves.' },
      { name: 'Avocado', category: 'Vegetables', price: 2.5, stock: 65, image: '🥑', description: 'Creamy ripe avocados.' },
      { name: 'Cucumber', category: 'Vegetables', price: 1.6, stock: 70, image: '🥒', description: 'Cool crisp cucumbers.' },
      { name: 'Green Grapes', category: 'Fruits', price: 4.4, stock: 40, image: '🍇', description: 'Seedless sweet green grapes.' },
      { name: 'Watermelon', category: 'Fruits', price: 6.0, stock: 20, image: '🍉', description: 'Juicy summer watermelon.' },
      { name: 'Greek Yogurt', category: 'Dairy', price: 3.9, stock: 45, image: '🥛', description: 'Thick, protein-rich Greek yogurt.' },
    ],
  );

  // --- Store 3: Daily Fresh Market (Johar Town, Lahore) — 24 hours ---
  await seedStore(
    { name: 'Daily Fresh Market', address: 'Khayaban-e-Firdousi, Johar Town, Lahore', phone: '0300-4445555', lat: 31.4690, lng: 74.2730, opensAt: '00:00', closesAt: '23:59' },
    [
      { name: 'Bakery', image: '🍞' },
      { name: 'Meat', image: '🥩' },
      { name: 'Beverages', image: '🧃' },
      { name: 'Fruits', image: '🍎' },
    ],
    [
      { name: 'Baguette', category: 'Bakery', price: 2.0, stock: 40, image: '🥖', description: 'Crusty French baguette.' },
      { name: 'Bagel', category: 'Bakery', price: 1.5, stock: 55, image: '🥯', description: 'Chewy fresh-baked bagels.' },
      { name: 'Lamb Chops', category: 'Meat', price: 14.0, stock: 18, image: '🍖', description: 'Tender premium lamb chops.' },
      { name: 'Bacon', category: 'Meat', price: 7.5, stock: 30, image: '🥓', description: 'Smoked streaky bacon.' },
      { name: 'Apple Juice', category: 'Beverages', price: 3.1, stock: 50, image: '🧃', description: 'Pure pressed apple juice.' },
      { name: 'Pineapple', category: 'Fruits', price: 4.8, stock: 25, image: '🍍', description: 'Sweet tropical pineapple.' },
    ],
  );

  // --- Seed a couple of Lahore delivery addresses for the demo customer ---
  const existingAddr = await addresses.count({ where: { userId: customer.id } });
  if (existingAddr === 0) {
    await addresses.save(
      addresses.create({
        userId: customer.id,
        label: 'Home',
        street: '12-C, Block D, Model Town',
        city: 'Lahore',
        state: 'Punjab',
        zip: '54700',
        phone: '0301-1234567',
        latitude: 31.4835,
        longitude: 74.322,
        isDefault: true,
      }),
    );
    await addresses.save(
      addresses.create({
        userId: customer.id,
        label: 'Work',
        street: 'Arfa Software Technology Park, Ferozepur Rd',
        city: 'Lahore',
        state: 'Punjab',
        zip: '54600',
        phone: '0302-7654321',
        latitude: 31.493,
        longitude: 74.33,
        isDefault: false,
      }),
    );
  }

  // --- Remove leftover/junk stores not created by this seed (and their
  //     products/categories/order data), e.g. manually-created test stores. ---
  const keepNames = ['Healthy Mart', 'Green Basket', 'Daily Fresh Market'];
  const allStores = await stores.find();
  for (const js of allStores.filter((s) => !keepNames.includes(s.name))) {
    await ds.query(
      'DELETE FROM order_items WHERE "productId" IN (SELECT id FROM products WHERE "storeId" = $1)',
      [js.id],
    );
    await ds.query(
      'DELETE FROM cart_items WHERE "productId" IN (SELECT id FROM products WHERE "storeId" = $1)',
      [js.id],
    );
    await ds.query(
      'DELETE FROM reviews WHERE "productId" IN (SELECT id FROM products WHERE "storeId" = $1)',
      [js.id],
    );
    await ds.query('DELETE FROM products WHERE "storeId" = $1', [js.id]);
    await ds.query('DELETE FROM categories WHERE "storeId" = $1', [js.id]);
    await ds.query('DELETE FROM stores WHERE id = $1', [js.id]);
    console.log(`   Removed junk store "${js.name}" (id ${js.id}).`);
  }

  // --- Seed the launch promotion (drives the 30% home banner) ---
  const promoCount = await promotions.count();
  if (promoCount === 0) {
    await promotions.save(
      promotions.create({
        title: '30% OFF your order',
        description: 'Launch offer — 30% off your entire cart. Limited time!',
        discountPercent: 30,
        active: true,
        firstOrderOnly: false,
        minSubtotal: 0,
      }),
    );
  }

  const storeCount = await stores.count();
  const productCount = await products.count();
  console.log('\n✅ Seed complete. Accounts (password: password123):');
  console.log(`   ADMIN        → admin@grocery.com    (id ${admin.id})`);
  console.log(`   STORE_OWNER  → store@grocery.com    (id ${owner.id})`);
  console.log(`   RIDER        → rider@grocery.com    (id ${rider.id})`);
  console.log(`   CUSTOMER     → customer@grocery.com (id ${customer.id})`);
  console.log(`   ${storeCount} stores, ${productCount} products total.\n`);

  await app.close();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
