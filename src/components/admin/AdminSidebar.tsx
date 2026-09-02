import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  CreditCard,
  Sparkles,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Store,
} from 'lucide-react';
import { SiteSettings } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'customers'
  | 'delivery'
  | 'payment'
  | 'landing'
  | 'reports'
  | 'settings'
  | 'security';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewShop: () => void;
  settings: SiteSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  onViewShop,
  settings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { key: 'orders', label: 'অর্ডারসমূহ', icon: ShoppingBag },
    { key: 'products', label: 'পণ্যসমূহ', icon: Package },
    { key: 'customers', label: 'গ্রাহকসমূহ', icon: Users },
    { key: 'delivery', label: 'ডেলিভারি সেটিংস', icon: Truck },
    { key: 'payment', label: 'পেমেন্ট সেটিংস', icon: CreditCard },
    { key: 'landing', label: 'ল্যান্ডিং পেজ সেটিংস', icon: Sparkles },
    { key: 'reports', label: 'রিপোর্ট', icon: BarChart3 },
    { key: 'settings', label: 'সাইট সেটিংস', icon: Settings },
    { key: 'security', label: 'ব্যবহারকারী ও নিরাপত্তা', icon: ShieldCheck },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#18181B] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Top */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-950">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-tight leading-tight">
                  {settings.shopName || 'পছন্দের শপ'}
                </h1>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`admin-nav-${item.key}`}
                  onClick={() => handleTabClick(item.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={onViewShop}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>ওয়েবসাইট দেখুন</span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>
    </>
  );
};
