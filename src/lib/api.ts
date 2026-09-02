import { Product, Order, SiteSettings, AdminUser, DashboardStats, Customer, OrderStatus } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  supabaseDb,
  signInAdminWithSupabase,
  signOutAdminWithSupabase,
  getCurrentAdminUser,
  uploadProductImageToSupabase,
} from './supabase';

const API_BASE = '/api';

// Helper for handling fetch responses (server fallback)
async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data: any;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: `সার্ভার রেসপন্স ত্রুটি (${res.status})` };
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'অনুরোধটি ব্যর্থ হয়েছে।');
  }

  return data;
}

export const api = {
  // Public Landing Data
  async getLandingData(): Promise<{ settings: SiteSettings; products: Product[] }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const [products, settings] = await Promise.all([
          supabaseDb.getPublicProducts(),
          supabaseDb.getSettings(),
        ]);
        return { products, settings };
      } catch (err) {
        console.warn('Supabase getLandingData failed, falling back to API:', err);
      }
    }

    const res = await fetchJson<{ success: boolean; data: { settings: SiteSettings; products: Product[] } }>(
      `${API_BASE}/public/landing`
    );
    return res.data;
  },

  // Submit Order
  async submitOrder(orderData: any): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        return await supabaseDb.createOrder(orderData);
      } catch (err) {
        console.warn('Supabase submitOrder failed, trying API fallback:', err);
      }
    }

    const res = await fetchJson<{ success: boolean; message: string; data: Order }>(
      `${API_BASE}/public/orders`,
      {
        method: 'POST',
        body: JSON.stringify(orderData),
      }
    );
    return res.data;
  },

  // Track Order
  async trackOrder(orderId: string, phone?: string): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('orders').select('*').eq('id', orderId.trim());
        if (phone) {
          query = query.eq('phone', phone.trim());
        }
        const { data: orderRow, error } = await query.single();
        if (error || !orderRow) {
          throw new Error('অর্ডারটি পাওয়া যায়নি।');
        }

        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId.trim());

        return {
          id: orderRow.id,
          customerName: orderRow.customer_name,
          phone: orderRow.phone,
          division: orderRow.division,
          district: orderRow.district,
          upazila: orderRow.upazila,
          address: orderRow.address,
          deliveryLocation: orderRow.delivery_location,
          deliveryCharge: Number(orderRow.delivery_charge),
          itemsSubtotal: Number(orderRow.items_subtotal),
          discountTotal: Number(orderRow.discount_total),
          totalAmount: Number(orderRow.total_amount),
          paymentMethod: orderRow.payment_method,
          paymentStatus: orderRow.payment_status,
          transactionId: orderRow.transaction_id,
          orderStatus: orderRow.order_status,
          notes: orderRow.notes,
          createdAt: orderRow.created_at,
          updatedAt: orderRow.updated_at,
          items: (items || []).map((it) => ({
            productId: it.product_id,
            productName: it.product_name,
            productImage: it.product_image || '',
            price: Number(it.price),
            quantity: Number(it.quantity),
            size: it.size || '',
            color: it.color || '',
            subtotal: Number(it.subtotal),
          })),
        };
      } catch (err) {
        console.warn('Supabase trackOrder fallback to API:', err);
      }
    }

    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const res = await fetchJson<{ success: boolean; data: Order }>(
      `${API_BASE}/public/orders/track/${encodeURIComponent(orderId)}${query}`
    );
    return res.data;
  },

  // Supabase Storage Image Upload
  async uploadProductImage(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      return await uploadProductImageToSupabase(file);
    }
    // Fallback: convert to base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Admin Auth (Supabase Auth)
  async checkHasAdmin(): Promise<{ hasAdmin: boolean; isSupabase: boolean }> {
    if (isSupabaseConfigured && supabase) {
      return { hasAdmin: true, isSupabase: true };
    }
    const res = await fetchJson<{ success: boolean; hasAdmin: boolean }>(`${API_BASE}/admin/auth/has-admin`);
    return { hasAdmin: res.hasAdmin, isSupabase: false };
  },

  async setupAdmin(data: { name: string; email: string; password: string }): Promise<{ token: string; admin: AdminUser }> {
    if (isSupabaseConfigured && supabase) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            role: 'superadmin',
          },
        },
      });
      if (signUpErr) {
        throw new Error(signUpErr.message || 'Supabase অ্যাডমিন সাইনআপ ব্যর্থ হয়েছে।');
      }
      const token = signUpData.session?.access_token || 'supabase_token';
      localStorage.setItem('admin_token', token);
      const adminUser: AdminUser = {
        id: signUpData.user?.id || 'admin',
        name: data.name.trim(),
        email: data.email.trim(),
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      };
      return { token, admin: adminUser };
    }

    const res = await fetchJson<{ success: boolean; token: string; admin: AdminUser }>(
      `${API_BASE}/admin/auth/setup`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (res.token) {
      localStorage.setItem('admin_token', res.token);
    }
    return res;
  },

  async adminLogin(credentials: { email: string; password: string }): Promise<{ token: string; admin: AdminUser }> {
    if (isSupabaseConfigured && supabase) {
      const admin = await signInAdminWithSupabase(credentials.email, credentials.password);
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token || 'supabase_session_active';
      localStorage.setItem('admin_token', token);
      return { token, admin };
    }

    const res = await fetchJson<{ success: boolean; token: string; admin: AdminUser }>(
      `${API_BASE}/admin/login`,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    if (res.token) {
      localStorage.setItem('admin_token', res.token);
    }
    return res;
  },

  async adminLogout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await signOutAdminWithSupabase();
    }
    try {
      await fetchJson(`${API_BASE}/admin/logout`, { method: 'POST' });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('admin_token');
    }
  },

  async getAdminMe(): Promise<AdminUser> {
    if (isSupabaseConfigured && supabase) {
      const user = await getCurrentAdminUser();
      if (user) return user;
    }
    const res = await fetchJson<{ success: boolean; admin: AdminUser }>(`${API_BASE}/admin/me`);
    return res.admin;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      return;
    }
    await fetchJson(`${API_BASE}/admin/change-password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Admin Dashboard (Real Data only)
  async getDashboardStats(): Promise<DashboardStats> {
    if (isSupabaseConfigured && supabase) {
      try {
        const orders = await supabaseDb.getAllOrdersAdmin();

        const totalOrders = orders.length;
        const totalSales = orders
          .filter((o) => o.orderStatus !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const todayStr = new Date().toISOString().slice(0, 10);
        const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;

        const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
        const confirmedOrders = orders.filter((o) => o.orderStatus === 'confirmed').length;
        const processingOrders = orders.filter((o) => o.orderStatus === 'processing').length;
        const shippedOrders = orders.filter((o) => o.orderStatus === 'shipped').length;
        const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
        const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;

        // Last 7 days real sales
        const daysMap: Record<string, { sales: number; count: number; displayDate: string }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const displayDate = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
          daysMap[key] = { sales: 0, count: 0, displayDate };
        }

        orders.forEach((o) => {
          const dayKey = o.createdAt.slice(0, 10);
          if (daysMap[dayKey] && o.orderStatus !== 'cancelled') {
            daysMap[dayKey].sales += o.totalAmount;
            daysMap[dayKey].count += 1;
          }
        });

        const salesByDay = Object.entries(daysMap).map(([date, val]) => ({
          date,
          displayDate: val.displayDate,
          sales: val.sales,
          count: val.count,
        }));

        const statusDistribution = [
          { name: 'পেন্ডিং', count: pendingOrders, color: '#f59e0b', key: 'pending' as OrderStatus },
          { name: 'কনফার্মড', count: confirmedOrders, color: '#3b82f6', key: 'confirmed' as OrderStatus },
          { name: 'প্রসেসিং', count: processingOrders, color: '#8b5cf6', key: 'processing' as OrderStatus },
          { name: 'শিপড', count: shippedOrders, color: '#06b6d4', key: 'shipped' as OrderStatus },
          { name: 'ডেলিভার্ড', count: deliveredOrders, color: '#10b981', key: 'delivered' as OrderStatus },
          { name: 'ক্যানসেলড', count: cancelledOrders, color: '#ef4444', key: 'cancelled' as OrderStatus },
        ];

        return {
          totalOrders,
          todayOrders,
          totalSales,
          pendingOrders,
          confirmedOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          recentOrders: orders.slice(0, 10),
          salesByDay,
          statusDistribution,
        };
      } catch (err) {
        console.warn('Supabase dashboard stats error:', err);
      }
    }

    const res = await fetchJson<{ success: boolean; data: DashboardStats }>(`${API_BASE}/admin/dashboard`);
    return res.data;
  },

  // Admin Products
  async getAdminProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.getAllProductsAdmin();
    }
    const res = await fetchJson<{ success: boolean; data: Product[] }>(`${API_BASE}/admin/products`);
    return res.data;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.createProduct(productData);
    }
    const res = await fetchJson<{ success: boolean; data: Product }>(`${API_BASE}/admin/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.updateProduct(id, updates);
    }
    const res = await fetchJson<{ success: boolean; data: Product }>(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.deleteProduct(id);
    }
    await fetchJson(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.updateProduct(id, { isActive });
    }
    const res = await fetchJson<{ success: boolean; data: Product }>(`${API_BASE}/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    return res.data;
  },

  async updateProductStock(id: string, stock: number): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.updateProduct(id, { stock });
    }
    const res = await fetchJson<{ success: boolean; data: Product }>(`${API_BASE}/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
    return res.data;
  },

  // Admin Orders
  async getAdminOrders(status?: string, search?: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      let orders = await supabaseDb.getAllOrdersAdmin();
      if (status && status !== 'all') {
        orders = orders.filter((o) => o.orderStatus === status);
      }
      if (search) {
        const q = search.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.address.toLowerCase().includes(q)
        );
      }
      return orders;
    }

    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchJson<{ success: boolean; data: Order[] }>(`${API_BASE}/admin/orders${qs}`);
    return res.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.updateOrderStatus(id, status);
    }
    const res = await fetchJson<{ success: boolean; data: Order }>(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return res.data;
  },

  async deleteOrder(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    await fetchJson(`${API_BASE}/admin/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Customers
  async getAdminCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.getCustomers();
    }
    const res = await fetchJson<{ success: boolean; data: Customer[] }>(`${API_BASE}/admin/customers`);
    return res.data;
  },

  // Admin Settings
  async getAdminSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.getSettings();
    }
    const res = await fetchJson<{ success: boolean; data: SiteSettings }>(`${API_BASE}/admin/settings`);
    return res.data;
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      return await supabaseDb.updateSettings(settings);
    }
    const res = await fetchJson<{ success: boolean; data: SiteSettings }>(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res.data;
  },
};
