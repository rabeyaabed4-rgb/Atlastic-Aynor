import React from 'react';
import {
  Banknote,
  Truck,
  RotateCcw,
  ShieldCheck,
  Phone,
  Mail,
  ShoppingBag,
  Facebook,
  Heart,
  Lock,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { toBengaliNumber } from '../../lib/formatters';

interface LandingFooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onOpenTracker: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  settings,
  onOpenAdmin,
  onOpenTracker,
}) => {
  return (
    <footer className="bg-slate-900 text-white">
      {/* 4 Trust Highlights (Directly from bottom bar of reference image) */}
      <div className="border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 bg-slate-950/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">ক্যাশ অন ডেলিভারি</p>
              <p className="text-[11px] text-slate-400">পণ্য হাতে পেয়ে পেমেন্ট</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">সারা বাংলাদেশে ডেলিভারি</p>
              <p className="text-[11px] text-slate-400">দ্রুত ও নির্ভরযোগ্য হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">সহজ রিটার্ন পলিসি</p>
              <p className="text-[11px] text-slate-400">পণ্য চেক করার নিশ্চয়তা</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">নিরাপদ পেমেন্ট</p>
              <p className="text-[11px] text-slate-400">১০০% সুরক্ষিত অর্ডার ব্যবস্থা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {settings.shopName || 'পছন্দের শপ'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              {settings.tagline ||
                'বাংলাদেশের অন্যতম বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম। সেরা মানের প্রিমিয়াম পণ্য পৌঁছে দিচ্ছি আপনার দরজায়।'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.facebookPageUrl && (
                <a
                  href={settings.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">গুরুত্বপূর্ণ লিংক</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#home" className="hover:text-rose-400 transition">
                  হোম পেজ
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-rose-400 transition">
                  পণ্য কালেকশন
                </a>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-rose-400 transition cursor-pointer">
                  অর্ডার ট্র্যাক করুন
                </button>
              </li>
              <li>
                <a href="#order-section" className="hover:text-rose-400 transition">
                  সরাসরি অর্ডার ফর্ম
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery & Contact info */}
          <div id="delivery-info" className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগ ও ডেলিভারি</h4>
            <div className="space-y-2 text-xs text-slate-400">
              {settings.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>হটলাইন: {toBengaliNumber(settings.phone)}</span>
                </p>
              )}
              {settings.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{settings.email}</span>
                </p>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                ঢাকার ভিতরে ডেলিভারি চার্জ: ৳ {toBengaliNumber(settings.insideDhakaDeliveryCharge || 60)} | ঢাকার বাইরে: ৳ {toBengaliNumber(settings.outsideDhakaDeliveryCharge || 135)}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Discreet Admin Trigger */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.shopName || 'পছন্দের শপ'}। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4">
            <span>প্রফেশনাল বাংলা ই-কমার্স সিস্টেম</span>
            <button
              onClick={onOpenAdmin}
              className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition cursor-pointer"
              title="অ্যাডমিন প্যানেল"
            >
              <Lock className="w-3 h-3" />
              <span>অ্যাডমিন</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
