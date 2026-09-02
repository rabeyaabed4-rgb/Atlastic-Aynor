import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  Product,
  Order,
  Customer,
  SiteSettings,
  AdminUser,
  DashboardStats,
  SelectedOrderItem,
  OrderStatus,
} from '../types';

// Environment variables for Supabase
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const isValidKey = (key?: string) =>
  Boolean(
    key &&
      !key.includes('...') &&
      !key.includes('your-') &&
      !key.includes('placeholder') &&
      key.trim().length > 20
  );

const isValidUrl = (url?: string) =>
  Boolean(
    url &&
      !url.includes('your-project-ref') &&
      !url.includes('...') &&
      url.trim().startsWith('https://')
  );

const rawUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL;
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://pcselgjrqixwwededlfm.supabase.co';

const rawKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.SUPABASE_ANON_KEY;
const supabaseAnonKey = isValidKey(rawKey)
  ? rawKey!
  : 'sb_publishable_NgEn6XDMLhCXikU6MuvABA_hy1GNbXO';

export const isSupabaseConfigured = Boolean(
  isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)
);

// Initialize Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (...args: [RequestInfo | URL, RequestInit?]) => fetch(...args),
      },
    })
  : null;

// ==============================================================================
// TYPE MAPPERS (Snake Case DB to Camel Case React Types)
// ==============================================================================

export const mapProductFromDb = (row: any): Product => {
  if (!row) return {} as Product;

  const isActive =
    row.active !== undefined
      ? Boolean(row.active)
      : row.is_active !== undefined
      ? Boolean(row.is_active)
      : row.status !== undefined
      ? row.status === 'active' || row.status === true
      : true;

  const isFeatured =
    row.featured !== undefined
      ? Boolean(row.featured)
      : row.is_featured !== undefined
      ? Boolean(row.is_featured)
      : false;

  const mainImage =
    row.main_image ||
    row.image ||
    row.image_url ||
    row.photo ||
    row.thumbnail ||
    (Array.isArray(row.images) && row.images[0]) ||
    '';

  const images = Array.isArray(row.images)
    ? row.images
    : mainImage
    ? [mainImage]
    : [];

  const oldPrice =
    row.old_price != null
      ? Number(row.old_price)
      : row.regular_price != null
      ? Number(row.regular_price)
      : row.original_price != null
      ? Number(row.original_price)
      : null;

  const discountPercent =
    row.discount_percent != null
      ? Number(row.discount_percent)
      : row.discount != null
      ? Number(row.discount)
      : oldPrice && row.price && oldPrice > Number(row.price)
      ? Math.round(((oldPrice - Number(row.price)) / oldPrice) * 100)
      : 0;

  const sizes = Array.isArray(row.sizes)
    ? row.sizes
    : typeof row.sizes === 'string'
    ? row.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const colors = Array.isArray(row.colors)
    ? row.colors
    : typeof row.colors === 'string'
    ? row.colors.split(',').map((c: string) => c.trim()).filter(Boolean)
    : [];

  const details = Array.isArray(row.details)
    ? row.details
    : typeof row.details === 'string'
    ? [row.details]
    : [];

  return {
    id: String(row.id || ''),
    name: row.name || row.title || '',
    mainImage,
    images,
    description: row.description || row.desc || '',
    details,
    price: Number(row.price || 0),
    oldPrice,
    discountPercent,
    sizes,
    colors,
    stock: Number(row.stock ?? row.quantity ?? row.stock_quantity ?? 50),
    isActive,
    isFeatured,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

export const mapOrderFromDb = (row: any, items: any[] = []): Order => ({
  id: row.id,
  customerName: row.customer_name || '',
  phone: row.phone || '',
  division: row.division || '',
  district: row.district || '',
  upazila: row.upazila || '',
  address: row.address || '',
  deliveryLocation: row.delivery_location || 'inside_dhaka',
  deliveryCharge: Number(row.delivery_charge || 60),
  itemsSubtotal: Number(row.items_subtotal || 0),
  discountTotal: Number(row.discount_total || 0),
  totalAmount: Number(row.total_amount || 0),
  paymentMethod: row.payment_method || 'cod',
  paymentStatus: row.payment_status || 'pending',
  transactionId: row.transaction_id || undefined,
  orderStatus: row.order_status || 'pending',
  notes: row.notes || undefined,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
  items: items.map((item) => ({
    productId: item.product_id,
    productName: item.product_name,
    productImage: item.product_image || '',
    price: Number(item.price),
    quantity: Number(item.quantity),
    size: item.size || '',
    color: item.color || '',
    subtotal: Number(item.subtotal),
  })),
});

export const mapSettingsFromDb = (row: any): SiteSettings => ({
  shopName: row?.shop_name || 'পছন্দের শপ',
  tagline: row?.tagline || 'প্রিমিয়াম কোয়ালিটি ও বিশ্বস্ত ডেলিভারি',
  logoUrl: row?.logo_url || '',
  phone: row?.phone || '01700-000000',
  email: row?.email || 'info@pochendershop.com',
  facebookPageUrl: row?.facebook_page_url || '',
  insideDhakaDeliveryCharge: Number(row?.inside_dhaka_delivery_charge ?? 60),
  outsideDhakaDeliveryCharge: Number(row?.outside_dhaka_delivery_charge ?? 135),
  codEnabled: Boolean(row?.cod_enabled ?? true),
  bkashEnabled: Boolean(row?.bkash_enabled ?? true),
  nagadEnabled: Boolean(row?.nagad_enabled ?? true),
  bkashNumber: row?.bkash_number || '',
  nagadNumber: row?.nagad_number || '',
  heroTitle: row?.hero_title || 'সেরা কালেকশনের প্রিমিয়াম পণ্য কিনুন ঘরে বসেই',
  heroSubtitle:
    row?.hero_subtitle || '১০০% অরিজিনাল কোয়ালিটি, সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি ও সহজে রিটার্ন সুবিধা',
  heroImage: row?.hero_image || '',
  noticeText:
    row?.notice_text || 'সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধা! প্রোডাক্ট দেখে মূল্য পরিশোধ করুন।',
});

// ==============================================================================
// SUPABASE STORAGE (Image Upload)
// ==============================================================================

export async function uploadProductImageToSupabase(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase কনফিগারেশন পাওয়া যায়নি।');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`ছবি আপলোড ব্যর্থ হয়েছে: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
}

// ==============================================================================
// SUPABASE AUTHENTICATION
// ==============================================================================

export async function signInAdminWithSupabase(email: string, password: string): Promise<AdminUser> {
  if (!supabase) {
    throw new Error(
      'Supabase কনফিগার করা হয়নি। অনুগ্রহ করে .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সেট করুন।'
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  if (error) {
    throw new Error(`লগইন ব্যর্থ হয়েছে: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('ব্যবহারকারীর তথ্য পাওয়া যায়নি।');
  }

  // Fetch admin profile or fallback to user metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    name: profile?.name || data.user.user_metadata?.name || 'Admin',
    email: data.user.email || email,
    role: (profile?.role as any) || 'admin',
    createdAt: data.user.created_at,
  };
}

export async function signOutAdminWithSupabase(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  if (!supabase) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return null;

    const user = sessionData.session.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: profile?.name || user.user_metadata?.name || 'Admin',
      email: user.email || '',
      role: (profile?.role as any) || 'admin',
      createdAt: user.created_at,
    };
  } catch (err) {
    console.error('Get current admin error:', err);
    return null;
  }
}

// ==============================================================================
// DATABASE OPERATIONS
// ==============================================================================

export const supabaseDb = {
  // 1. PRODUCTS
  async getPublicProducts(): Promise<Product[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public products:', error);
        return [];
      }
      const mapped = (data || []).map(mapProductFromDb);
      return mapped.filter((p) => p.isActive !== false);
    } catch (err) {
      console.error('Error fetching public products:', err);
      return [];
    }
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin products:', error);
        throw new Error(error.message);
      }
      return (data || []).map(mapProductFromDb);
    } catch (err: any) {
      console.error('Error fetching admin products:', err);
      throw new Error(err.message || 'পণ্য লোড করা সম্ভব হয়নি।');
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const discount =
      productData.oldPrice && productData.price && productData.oldPrice > productData.price
        ? Math.round(((productData.oldPrice - productData.price) / productData.oldPrice) * 100)
        : 0;

    const row: any = {
      name: productData.name,
      main_image: productData.mainImage || '',
      images: productData.images || [],
      description: productData.description || '',
      details: productData.details || [],
      price: productData.price,
      old_price: productData.oldPrice || null,
      discount_percent: discount,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      stock: productData.stock ?? 50,
      is_active: productData.isActive ?? true,
      is_featured: productData.isFeatured ?? false,
    };

    let { data, error } = await supabase.from('products').insert(row).select().single();

    if (error && error.message && error.message.includes('does not exist')) {
      // Fallback: adapt column names for custom schema (active/featured/image)
      const adaptedRow: any = {
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        stock: productData.stock ?? 50,
        active: productData.isActive ?? true,
        featured: productData.isFeatured ?? false,
      };
      if (productData.mainImage) {
        adaptedRow.main_image = productData.mainImage;
        adaptedRow.image = productData.mainImage;
      }
      if (productData.oldPrice) adaptedRow.old_price = productData.oldPrice;
      if (productData.sizes) adaptedRow.sizes = productData.sizes;
      if (productData.colors) adaptedRow.colors = productData.colors;

      const retryRes = await supabase.from('products').insert(adaptedRow).select().single();
      if (!retryRes.error) {
        return mapProductFromDb(retryRes.data);
      }
      error = retryRes.error;
    }

    if (error) {
      throw new Error(`পণ্য তৈরিতে সমস্যা: ${error.message}`);
    }
    return mapProductFromDb(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.mainImage !== undefined) {
      payload.main_image = updates.mainImage;
      payload.image = updates.mainImage;
    }
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.details !== undefined) payload.details = updates.details;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.oldPrice !== undefined) payload.old_price = updates.oldPrice;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.isActive !== undefined) {
      payload.is_active = updates.isActive;
      payload.active = updates.isActive;
    }
    if (updates.isFeatured !== undefined) {
      payload.is_featured = updates.isFeatured;
      payload.featured = updates.isFeatured;
    }

    if (payload.price && payload.old_price) {
      payload.discount_percent =
        payload.old_price > payload.price
          ? Math.round(((payload.old_price - payload.price) / payload.old_price) * 100)
          : 0;
    }

    let { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error && error.message && error.message.includes('does not exist')) {
      const cleaned = { ...payload };
      if (error.message.includes('is_active')) delete cleaned.is_active;
      if (error.message.includes('is_featured')) delete cleaned.is_featured;
      if (error.message.includes('active')) delete cleaned.active;
      if (error.message.includes('featured')) delete cleaned.featured;
      if (error.message.includes('main_image')) delete cleaned.main_image;
      if (error.message.includes('image')) delete cleaned.image;

      const retryRes = await supabase
        .from('products')
        .update(cleaned)
        .eq('id', id)
        .select()
        .single();

      if (!retryRes.error) {
        return mapProductFromDb(retryRes.data);
      }
      error = retryRes.error;
    }

    if (error) {
      throw new Error(`পণ্য আপডেট ব্যর্থ হয়েছে: ${error.message}`);
    }
    return mapProductFromDb(data);
  },

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw new Error(`পণ্য মুছে ফেলা ব্যর্থ হয়েছে: ${error.message}`);
    }
  },

  // 2. ORDERS
  async createOrder(orderData: any): Promise<Order> {
    if (!supabase) throw new Error('Supabase client is not configured.');

    // Generate unique Bangladeshi Order ID
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `BD-${dateStr}-${randSuffix}`;

    const orderRow = {
      id: orderId,
      customer_name: orderData.customerName,
      phone: orderData.phone,
      division: orderData.division || '',
      district: orderData.district || '',
      upazila: orderData.upazila || '',
      address: orderData.address,
      delivery_location: orderData.deliveryLocation || 'inside_dhaka',
      delivery_charge: orderData.deliveryCharge || 60,
      items_subtotal: orderData.itemsSubtotal || 0,
      discount_total: orderData.discountTotal || 0,
      total_amount: orderData.totalAmount || 0,
      payment_method: orderData.paymentMethod || 'cod',
      payment_status: 'pending',
      transaction_id: orderData.transactionId || null,
      order_status: 'pending',
      notes: orderData.notes || null,
    };

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderRow)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`অর্ডার তৈরি ব্যর্থ হয়েছে: ${orderError.message}`);
    }

    // Insert Order Items Snapshot
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      const itemsRows = orderData.items.map((it: SelectedOrderItem) => ({
        order_id: orderId,
        product_id: it.productId,
        product_name: it.productName,
        product_image: it.productImage || '',
        price: it.price,
        quantity: it.quantity,
        size: it.size || '',
        color: it.color || '',
        subtotal: it.subtotal || it.price * it.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsRows);
      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
      }
    }

    // Update Customer Aggregation
    try {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', orderData.phone)
        .maybeSingle();

      if (existingCustomer) {
        await supabase
          .from('customers')
          .update({
            total_orders: (existingCustomer.total_orders || 1) + 1,
            total_spent: Number(existingCustomer.total_spent || 0) + Number(orderData.totalAmount || 0),
            last_order_date: new Date().toISOString(),
            address: orderData.address,
            district: orderData.district || existingCustomer.district,
            division: orderData.division || existingCustomer.division,
          })
          .eq('id', existingCustomer.id);
      } else {
        await supabase.from('customers').insert({
          name: orderData.customerName,
          phone: orderData.phone,
          address: orderData.address,
          district: orderData.district || '',
          division: orderData.division || '',
          total_orders: 1,
          total_spent: orderData.totalAmount || 0,
          last_order_date: new Date().toISOString(),
        });
      }
    } catch (custErr) {
      console.warn('Customer aggregation non-critical error:', custErr);
    }

    return mapOrderFromDb(createdOrder, orderData.items);
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    if (!supabase) return [];

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`অর্ডার লোড করা যায়নি: ${ordersError.message}`);
    }

    if (!ordersData || ordersData.length === 0) {
      return [];
    }

    const orderIds = ordersData.map((o) => o.id);
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    const itemsByOrderId: Record<string, any[]> = {};
    (itemsData || []).forEach((item) => {
      if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
      itemsByOrderId[item.order_id].push(item);
    });

    return ordersData.map((ord) => mapOrderFromDb(ord, itemsByOrderId[ord.id] || []));
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`অর্ডার স্ট্যাটাস আপডেট ব্যর্থ: ${error.message}`);
    }

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    return mapOrderFromDb(data, items || []);
  },

  // 3. CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('total_spent', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      district: c.district || '',
      division: c.division || '',
      totalOrders: Number(c.total_orders || 0),
      totalSpent: Number(c.total_spent || 0),
      lastOrderDate: c.last_order_date || c.created_at,
    }));
  },

  // 4. SITE SETTINGS
  async getSettings(): Promise<SiteSettings> {
    if (!supabase) return mapSettingsFromDb({});
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'primary_settings')
      .maybeSingle();

    if (error || !data) {
      return mapSettingsFromDb({});
    }
    return mapSettingsFromDb(data);
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const row: any = { updated_at: new Date().toISOString() };
    if (settings.shopName !== undefined) row.shop_name = settings.shopName;
    if (settings.tagline !== undefined) row.tagline = settings.tagline;
    if (settings.logoUrl !== undefined) row.logo_url = settings.logoUrl;
    if (settings.phone !== undefined) row.phone = settings.phone;
    if (settings.email !== undefined) row.email = settings.email;
    if (settings.facebookPageUrl !== undefined) row.facebook_page_url = settings.facebookPageUrl;
    if (settings.insideDhakaDeliveryCharge !== undefined)
      row.inside_dhaka_delivery_charge = settings.insideDhakaDeliveryCharge;
    if (settings.outsideDhakaDeliveryCharge !== undefined)
      row.outside_dhaka_delivery_charge = settings.outsideDhakaDeliveryCharge;
    if (settings.codEnabled !== undefined) row.cod_enabled = settings.codEnabled;
    if (settings.bkashEnabled !== undefined) row.bkash_enabled = settings.bkashEnabled;
    if (settings.nagadEnabled !== undefined) row.nagad_enabled = settings.nagadEnabled;
    if (settings.bkashNumber !== undefined) row.bkash_number = settings.bkashNumber;
    if (settings.nagadNumber !== undefined) row.nagad_number = settings.nagadNumber;
    if (settings.heroTitle !== undefined) row.hero_title = settings.heroTitle;
    if (settings.heroSubtitle !== undefined) row.hero_subtitle = settings.heroSubtitle;
    if (settings.heroImage !== undefined) row.hero_image = settings.heroImage;
    if (settings.noticeText !== undefined) row.notice_text = settings.noticeText;

    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: 'primary_settings', ...row })
      .select()
      .single();

    if (error) {
      throw new Error(`সেটিংস আপডেট ব্যর্থ: ${error.message}`);
    }
    return mapSettingsFromDb(data);
  },
};
