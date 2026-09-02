import React from 'react';
import { ShoppingBag, PhoneCall, Search, ShieldCheck, Truck } from 'lucide-react';
import { SiteSettings } from '../../types';
import { toBengaliNumber } from '../../lib/formatters';

interface LandingHeaderProps {
  settings: SiteSettings;
  selectedCount: number;
  onScrollToOrder: () => void;
  onOpenTracker: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  settings,
  selectedCount,
  onScrollToOrder,
  onOpenTracker,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Notice */}
      {settings.noticeText && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs md:text-sm py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 animate-pulse" />
          <span>{settings.noticeText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.shopName}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShoppingBag className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight block">
                {settings.shopName || 'পছন্দের শপ'}
              </span>
              <span className="text-[11px] md:text-xs text-rose-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" /> প্রিমিয়াম অনলাইন শপ
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#home" className="text-rose-600 hover:text-rose-700 transition">
              হোম
            </a>
            <a href="#products" className="hover:text-rose-600 transition">
              সকল পণ্য
            </a>
            <button
              onClick={onOpenTracker}
              className="hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-4 h-4" /> অর্ডার ট্র্যাক
            </button>
            <a href="#delivery-info" className="hover:text-rose-600 transition">
              ডেলিভারি তথ্য
            </a>
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="hover:text-rose-600 transition flex items-center gap-1 text-slate-600"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" /> {toBengaliNumber(settings.phone)}
              </a>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-track-order-btn"
              onClick={onOpenTracker}
              className="lg:hidden p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              title="অর্ডার ট্র্যাক করুন"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              id="header-order-now-btn"
              onClick={onScrollToOrder}
              className="relative bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-sm md:text-base px-4 md:px-6 py-2 md:py-2.5 rounded-xl shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              <span>অর্ডার করুন</span>
              {selectedCount > 0 && (
                <span className="bg-white text-rose-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {toBengaliNumber(selectedCount)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
