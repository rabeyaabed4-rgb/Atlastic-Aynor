import React from 'react';
import { Banknote, Truck, ShieldCheck, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { SiteSettings, Product } from '../../types';
import { formatPrice } from '../../lib/formatters';

interface HeroSectionProps {
  settings: SiteSettings;
  featuredProduct?: Product;
  onScrollToOrder: () => void;
  onSelectProduct: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  featuredProduct,
  onScrollToOrder,
  onSelectProduct,
}) => {
  return (
    <section id="home" className="relative pt-6 pb-12 md:py-16 overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Bengali Text & Trust Badges */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>{settings.heroTitle || 'আসসালামু আলাইকুম'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.25] tracking-tight">
              {settings.tagline || 'আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন ঘরে বসে সহজেই অর্ডার করুন'}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              সেরা কোয়ালিটির পণ্য, নির্ভরযোগ্য সেবা এবং দ্রুত ডেলিভারি নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ। কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন।
            </p>

            {/* 3 Key Trust Elements (from reference image) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">ক্যাশ অন ডেলিভারি</h2>
                  <p className="text-xs text-slate-500">হাতে পেয়ে মূল্য দিন</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">সারা বাংলাদেশে ডেলিভারি</h2>
                  <p className="text-xs text-slate-500">দ্রুততম সময়ে পৌঁছাবে</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">১০০% অরিজিনাল পণ্য</h2>
                  <p className="text-xs text-slate-500">প্রিমিয়াম কোয়ালিটি</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                id="hero-order-now-btn"
                onClick={onScrollToOrder}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>অর্ডার করতে নিচে যান</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base transition-all"
              >
                <span>কালেকশন দেখুন</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual / Featured Product showcase */}
          <div className="lg:col-span-5 flex justify-center">
            {featuredProduct ? (
              <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-xl border border-slate-100 relative group overflow-hidden">
                <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={featuredProduct.mainImage || (featuredProduct.images && featuredProduct.images[0])}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {featuredProduct.discountPercent && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      -{featuredProduct.discountPercent}% ছাড়
                    </span>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ফিচার্ড প্রোডাক্ট
                    </span>
                    <span className="text-xs text-slate-500">
                      স্টক: {featuredProduct.stock > 0 ? `${featuredProduct.stock}টি উপলব্ধ` : 'স্টক শেষ'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{featuredProduct.name}</h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-rose-600">{formatPrice(featuredProduct.price)}</span>
                    {featuredProduct.oldPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(featuredProduct.oldPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectProduct(featuredProduct);
                      onScrollToOrder();
                    }}
                    className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>এখনই কিনুন</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md aspect-4/5 bg-gradient-to-tr from-slate-100 to-slate-200/60 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700 text-base mb-1">পছন্দের শপ</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  অ্যাডমিন প্যানেল থেকে পণ্য যোগ করলে এখানে সরাসরি লাইভ প্রদর্শিত হবে।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
