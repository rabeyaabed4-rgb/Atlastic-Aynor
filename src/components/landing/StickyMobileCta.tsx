import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice, toBengaliNumber } from '../../lib/formatters';

interface StickyMobileCtaProps {
  selectedCount: number;
  subtotal: number;
  onScrollToOrder: () => void;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({
  selectedCount,
  subtotal,
  onScrollToOrder,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-500 block">
            {selectedCount > 0 ? `${toBengaliNumber(selectedCount)}টি পণ্য নির্বাচিত` : 'অর্ডার করুন'}
          </span>
          <span className="text-base font-extrabold text-rose-600">
            {selectedCount > 0 ? formatPrice(subtotal) : 'ক্যাশ অন ডেলিভারি'}
          </span>
        </div>

        <button
          onClick={onScrollToOrder}
          className="flex-1 max-w-[180px] bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>এখনই কিনুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
