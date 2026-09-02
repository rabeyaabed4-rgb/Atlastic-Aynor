import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SiteSettings, Product, SelectedOrderItem, Order, AdminUser } from './types';
import { api } from './lib/api';
import { LandingHeader } from './components/landing/LandingHeader';
import { HeroSection } from './components/landing/HeroSection';
import { ProductGridSection } from './components/landing/ProductGridSection';
import { OrderFormSection } from './components/landing/OrderFormSection';
import { OrderSuccessModal } from './components/landing/OrderSuccessModal';
import { OrderTrackingModal } from './components/landing/OrderTrackingModal';
import { StickyMobileCta } from './components/landing/StickyMobileCta';
import { LandingFooter } from './components/landing/LandingFooter';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

export default function App() {
  // Navigation / View State
  const [currentView, setCurrentView] = useState<'shop' | 'login' | 'admin'>('shop');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Landing Page Data
  const [settings, setSettings] = useState<SiteSettings>({
    shopName: 'পছন্দের শপ',
    tagline: 'আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন ঘরে বসে সহজেই অর্ডার করুন',
    phone: '01700000000',
    email: 'support@pochendershop.com',
    insideDhakaDeliveryCharge: 60,
    outsideDhakaDeliveryCharge: 135,
    codEnabled: true,
    bkashEnabled: true,
    nagadEnabled: true,
    noticeText: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা! কোনো অগ্রিম পেমেন্ট নেই।',
    heroTitle: 'আসসালামু আলাইকুম',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Order State
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Check URL pathname for /admin or #admin
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith('/admin') || hash === '#admin') {
      checkAdminAuth();
    }
  }, []);

  // Fetch Public Landing Data
  const fetchLandingData = async () => {
    try {
      setLoading(true);
      const data = await api.getLandingData();
      if (data.settings) setSettings(data.settings);
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error('Failed to load landing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check Admin session
  const checkAdminAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCurrentView('login');
      return;
    }
    try {
      const me = await api.getAdminMe();
      setAdminUser(me);
      setCurrentView('admin');
    } catch {
      localStorage.removeItem('admin_token');
      setCurrentView('login');
    }
  };

  useEffect(() => {
    fetchLandingData();
    // Also check if admin token already exists
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.getAdminMe().then((me) => setAdminUser(me)).catch(() => {});
    }
  }, []);

  // Scroll smoothly to the Order Section
  const scrollToOrderSection = () => {
    const orderSection = document.getElementById('order-section');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Select a product from grid or hero
  const handleSelectProduct = (product: Product, size?: string, color?: string) => {
    setSelectedItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      const chosenSize = size || (product.sizes?.[0] || '');
      const chosenColor = color || (product.colors?.[0] || '');

      if (existingIdx > -1) {
        // If already in list, increase quantity
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
          size: chosenSize,
          color: chosenColor,
        };
        return updated;
      }

      // Add as new selected item
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.mainImage || (product.images && product.images[0]) || '',
          price: product.price,
          quantity: 1,
          size: chosenSize,
          color: chosenColor,
        },
      ];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Update item size/color
  const handleUpdateItemSizeColor = (productId: string, size: string, color: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, size, color } : item))
    );
  };

  // Submit Order
  const handleSubmitOrder = async (orderPayload: any) => {
    try {
      setIsSubmittingOrder(true);
      const order = await api.submitOrder(orderPayload);
      setConfirmedOrder(order);
      // Clear selected items
      setSelectedItems([]);
    } catch (err: any) {
      alert(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Reset for new order
  const handleNewOrder = () => {
    setConfirmedOrder(null);
    setSelectedItems([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Admin Login
  const handleOpenAdmin = () => {
    const token = localStorage.getItem('admin_token');
    if (token && adminUser) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  };

  // Logout Admin
  const handleAdminLogout = async () => {
    await api.adminLogout();
    setAdminUser(null);
    setCurrentView('shop');
    // Refresh landing data in case settings/products changed
    fetchLandingData();
  };

  // Calculations
  const selectedProductIds = selectedItems.map((i) => i.productId);
  const totalSelectedCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const featuredProduct = products.find((p) => p.isFeatured && p.isActive) || products[0];

  // Render Admin Login View
  if (currentView === 'login') {
    return (
      <AdminLogin
        onLoginSuccess={(admin) => {
          setAdminUser(admin);
          setCurrentView('admin');
        }}
        onBackToShop={() => {
          setCurrentView('shop');
          fetchLandingData();
        }}
      />
    );
  }

  // Render Admin Dashboard View
  if (currentView === 'admin' && adminUser) {
    return (
      <AdminLayout
        admin={adminUser}
        initialSettings={settings}
        onLogout={handleAdminLogout}
        onViewShop={() => {
          setCurrentView('shop');
          fetchLandingData();
        }}
      />
    );
  }

  // Render Public Customer Landing Page
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800 selection:bg-rose-500 selection:text-white pb-16 md:pb-0">
      {/* Top Header */}
      <LandingHeader
        settings={settings}
        selectedCount={totalSelectedCount}
        onScrollToOrder={scrollToOrderSection}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-2" />
            <p className="text-sm font-semibold">দোকানের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection
              settings={settings}
              featuredProduct={featuredProduct}
              onScrollToOrder={scrollToOrderSection}
              onSelectProduct={(prod) => handleSelectProduct(prod)}
            />

            {/* Product Collection Grid */}
            <ProductGridSection
              products={products}
              selectedProductIds={selectedProductIds}
              onSelectProduct={handleSelectProduct}
              onScrollToOrder={scrollToOrderSection}
            />

            {/* Order Form & Real-time Order Summary */}
            <OrderFormSection
              settings={settings}
              products={products}
              selectedItems={selectedItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onUpdateItemSizeColor={handleUpdateItemSizeColor}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmittingOrder}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <LandingFooter
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Sticky Mobile Floating CTA */}
      <StickyMobileCta
        selectedCount={totalSelectedCount}
        subtotal={selectedSubtotal}
        onScrollToOrder={scrollToOrderSection}
      />

      {/* Order Confirmation Modal with Confetti */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          settings={settings}
          onClose={() => setConfirmedOrder(null)}
          onNewOrder={handleNewOrder}
        />
      )}

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
}
