import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ExternalLink,
  User,
  LogOut,
  RefreshCw,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SiteSettings, Product, Order, Customer, DashboardStats, AdminUser, OrderStatus } from '../../types';
import { api } from '../../lib/api';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminDeliveryPaymentSettings } from './AdminDeliveryPaymentSettings';
import { AdminSiteSettings } from './AdminSiteSettings';
import { AdminSecurity } from './AdminSecurity';
import { AdminReports } from './AdminReports';
import { OrderInvoiceModal } from './OrderInvoiceModal';

interface AdminLayoutProps {
  admin: AdminUser;
  onLogout: () => void;
  onViewShop: () => void;
  initialSettings: SiteSettings;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  onLogout,
  onViewShop,
  initialSettings,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Load all admin data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [fetchedStats, fetchedProducts, fetchedOrders, fetchedCustomers, fetchedSettings] =
        await Promise.all([
          api.getDashboardStats(),
          api.getAdminProducts(),
          api.getAdminOrders(),
          api.getAdminCustomers(),
          api.getAdminSettings(),
        ]);

      setStats(fetchedStats);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setCustomers(fetchedCustomers);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Product CRUD
  const handleCreateProduct = async (productData: Partial<Product>) => {
    await api.createProduct(productData);
    await loadData(true);
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    await api.updateProduct(id, updates);
    await loadData(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    await loadData(true);
  };

  const handleToggleProductStatus = async (id: string, isActive: boolean) => {
    await api.toggleProductStatus(id, isActive);
    await loadData(true);
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    await api.updateProductStock(id, stock);
    await loadData(true);
  };

  // Order CRUD
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status);
    await loadData(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await api.deleteOrder(orderId);
    await loadData(true);
  };

  // Settings Save
  const handleSaveSettings = async (updated: Partial<SiteSettings>) => {
    const res = await api.updateAdminSettings(updated);
    setSettings(res);
  };

  const getPageTitle = (tab: AdminTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'ড্যাশবোর্ড';
      case 'orders':
        return 'অর্ডারসমূহ';
      case 'products':
        return 'পণ্যসমূহ';
      case 'customers':
        return 'গ্রাহকসমূহ';
      case 'delivery':
        return 'ডেলিভারি সেটিংস';
      case 'payment':
        return 'পেমেন্ট সেটিংস';
      case 'landing':
        return 'ল্যান্ডিং পেজ সেটিংস';
      case 'reports':
        return 'রিপোর্ট ও বিশ্লেষণ';
      case 'settings':
        return 'সাইট সেটিংস';
      case 'security':
        return 'ব্যবহারকারী ও নিরাপত্তা';
      default:
        return 'অ্যাডমিন প্যানেল';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={onLogout}
        onViewShop={onViewShop}
        settings={settings}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {getPageTitle(activeTab)}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {settings.shopName || 'পছন্দের শপ'} কন্ট্রোল প্যানেল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className={`p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer ${
                refreshing ? 'animate-spin text-rose-600' : ''
              }`}
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onViewShop}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {admin.name || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block">{admin.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-2" />
              <p className="text-xs font-semibold">তথ্য লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <AdminDashboard
                  stats={stats}
                  onViewOrder={setViewingOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'products' && (
                <AdminProducts
                  products={products}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onToggleStatus={handleToggleProductStatus}
                  onUpdateStock={handleUpdateStock}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrders
                  orders={orders}
                  settings={settings}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleDeleteOrder}
                />
              )}

              {activeTab === 'customers' && <AdminCustomers customers={customers} />}

              {activeTab === 'delivery' && (
                <AdminDeliveryPaymentSettings
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}

              {activeTab === 'payment' && (
                <AdminDeliveryPaymentSettings
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}

              {activeTab === 'landing' && (
                <AdminSiteSettings settings={settings} onSaveSettings={handleSaveSettings} />
              )}

              {activeTab === 'reports' && stats && <AdminReports stats={stats} orders={orders} />}

              {activeTab === 'settings' && (
                <AdminSiteSettings settings={settings} onSaveSettings={handleSaveSettings} />
              )}

              {activeTab === 'security' && <AdminSecurity />}
            </>
          )}
        </main>
      </div>

      {/* Full Order Invoice Modal */}
      {viewingOrder && (
        <OrderInvoiceModal
          order={viewingOrder}
          settings={settings}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
};
