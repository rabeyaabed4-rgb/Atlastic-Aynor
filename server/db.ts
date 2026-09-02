import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Product, Order, Customer, SiteSettings, AdminUser } from '../src/types';

export interface AdminRecord extends AdminUser {
  passwordHash: string;
}

export interface DatabaseSchema {
  admins: AdminRecord[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: SiteSettings = {
  shopName: 'পছন্দের শপ',
  tagline: 'আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন ঘরে বসে সহজেই অর্ডার করুন',
  logoUrl: '',
  phone: '01700000000',
  email: 'contact@pochendershop.com',
  facebookPageUrl: 'https://facebook.com',
  insideDhakaDeliveryCharge: 60,
  outsideDhakaDeliveryCharge: 135,
  codEnabled: true,
  bkashEnabled: false,
  nagadEnabled: false,
  bkashNumber: '',
  nagadNumber: '',
  heroTitle: 'আসসালামু আলাইকুম',
  heroSubtitle: 'আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন ঘরে বসে সহজেই অর্ডার করুন',
  heroImage: '',
  noticeText: '🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি | ১০০% ক্যাশ অন ডেলিভারি',
};

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        admins: data.admins || [],
        products: data.products || [],
        orders: data.orders || [],
        customers: data.customers || [],
        settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      };
    } catch (err) {
      console.error('Failed to parse existing DB file, reinitializing', err);
    }
  }

  // Initial clean database state - NO DEMO PRODUCTS, ORDERS OR HARDCODED ADMINS!
  const initialData: DatabaseSchema = {
    admins: [],   // Strictly empty by default - configured during first setup
    products: [], // Strictly empty
    orders: [],   // Strictly empty
    customers: [],// Strictly empty
    settings: DEFAULT_SETTINGS,
  };

  saveDb(initialData);
  return initialData;
}

let cachedDb: DatabaseSchema = initDb();

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    cachedDb = data;
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

export const db = {
  getRawData(): DatabaseSchema {
    return cachedDb;
  },

  // Admin
  hasAnyAdmin(): boolean {
    return Array.isArray(cachedDb.admins) && cachedDb.admins.length > 0;
  },
  createAdmin(admin: AdminRecord): AdminRecord {
    cachedDb.admins.push(admin);
    saveDb(cachedDb);
    return admin;
  },
  getAdminByEmail(email: string): AdminRecord | undefined {
    return cachedDb.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  },
  getAdminById(id: string): AdminRecord | undefined {
    return cachedDb.admins.find((a) => a.id === id);
  },
  updateAdminPassword(id: string, newPasswordHash: string): boolean {
    const admin = cachedDb.admins.find((a) => a.id === id);
    if (!admin) return false;
    admin.passwordHash = newPasswordHash;
    saveDb(cachedDb);
    return true;
  },

  // Products
  getProducts(onlyActive = false): Product[] {
    if (onlyActive) {
      return cachedDb.products.filter((p) => p.isActive);
    }
    return cachedDb.products;
  },
  getProductById(id: string): Product | undefined {
    return cachedDb.products.find((p) => p.id === id);
  },
  createProduct(product: Product): Product {
    cachedDb.products.unshift(product);
    saveDb(cachedDb);
    return product;
  },
  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = cachedDb.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    cachedDb.products[idx] = {
      ...cachedDb.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb(cachedDb);
    return cachedDb.products[idx];
  },
  deleteProduct(id: string): boolean {
    const initialLen = cachedDb.products.length;
    cachedDb.products = cachedDb.products.filter((p) => p.id !== id);
    if (cachedDb.products.length !== initialLen) {
      saveDb(cachedDb);
      return true;
    }
    return false;
  },
  decrementStock(items: { productId: string; quantity: number }[]): void {
    for (const item of items) {
      const prod = cachedDb.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    }
    saveDb(cachedDb);
  },
  restoreStock(items: { productId: string; quantity: number }[]): void {
    for (const item of items) {
      const prod = cachedDb.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        prod.updatedAt = new Date().toISOString();
      }
    }
    saveDb(cachedDb);
  },

  // Orders
  getOrders(): Order[] {
    return cachedDb.orders;
  },
  getOrderById(id: string): Order | undefined {
    return cachedDb.orders.find((o) => o.id === id);
  },
  createOrder(order: Order): Order {
    cachedDb.orders.unshift(order);
    
    // Automatically update customer record
    this.upsertCustomerFromOrder(order);

    saveDb(cachedDb);
    return order;
  },
  updateOrderStatus(id: string, status: Order['orderStatus'], notes?: string): Order | null {
    const order = cachedDb.orders.find((o) => o.id === id);
    if (!order) return null;
    
    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    if (notes !== undefined) order.notes = notes;
    order.updatedAt = new Date().toISOString();

    // If order was cancelled and previous wasn't cancelled, restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      this.restoreStock(
        order.items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
      );
    } else if (previousStatus === 'cancelled' && status !== 'cancelled') {
      // Re-deduct stock if un-cancelled
      this.decrementStock(
        order.items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
      );
    }

    saveDb(cachedDb);
    return order;
  },
  deleteOrder(id: string): boolean {
    const initialLen = cachedDb.orders.length;
    cachedDb.orders = cachedDb.orders.filter((o) => o.id !== id);
    if (cachedDb.orders.length !== initialLen) {
      saveDb(cachedDb);
      return true;
    }
    return false;
  },

  // Customers
  getCustomers(): Customer[] {
    return cachedDb.customers;
  },
  upsertCustomerFromOrder(order: Order): void {
    const phone = order.phone.trim();
    const existing = cachedDb.customers.find((c) => c.phone === phone);
    if (existing) {
      existing.name = order.customerName;
      existing.address = order.address;
      existing.district = order.district;
      existing.division = order.division;
      existing.totalOrders += 1;
      existing.totalSpent += order.totalAmount;
      existing.lastOrderDate = order.createdAt;
    } else {
      cachedDb.customers.unshift({
        id: `CUST-${Date.now().toString().slice(-6)}`,
        name: order.customerName,
        phone,
        address: order.address,
        district: order.district,
        division: order.division,
        totalOrders: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: order.createdAt,
      });
    }
  },

  // Settings
  getSettings(): SiteSettings {
    return cachedDb.settings;
  },
  updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    cachedDb.settings = {
      ...cachedDb.settings,
      ...newSettings,
    };
    saveDb(cachedDb);
    return cachedDb.settings;
  },
};
