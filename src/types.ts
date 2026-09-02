export interface Product {
  id: string;
  name: string;
  mainImage: string;
  images: string[];
  description: string;
  details: string[];
  price: number;
  oldPrice?: number | null;
  discountPercent?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  subtotal: number;
}

export type DeliveryLocation = 'inside_dhaka' | 'outside_dhaka';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  deliveryLocation: DeliveryLocation;
  deliveryCharge: number;
  items: SelectedOrderItem[];
  itemsSubtotal: number;
  discountTotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  transactionId?: string;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface SiteSettings {
  shopName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  facebookPageUrl: string;
  insideDhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  bkashNumber: string;
  nagadNumber: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  noticeText: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalSales: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
  salesByDay: { date: string; displayDate: string; sales: number; count: number }[];
  statusDistribution: { name: string; count: number; color: string; key: OrderStatus }[];
}
