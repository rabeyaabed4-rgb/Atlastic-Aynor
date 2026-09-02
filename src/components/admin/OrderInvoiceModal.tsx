import React from 'react';
import { X, Printer, PhoneCall, ShoppingBag, MapPin, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { Order, SiteSettings } from '../../types';
import { formatPrice, toBengaliNumber, formatBengaliDate, getPaymentMethodName, getStatusBadgeInfo } from '../../lib/formatters';

interface OrderInvoiceModalProps {
  order: Order | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  if (!order) return null;

  const badge = getStatusBadgeInfo(order.orderStatus);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{settings.shopName || 'পছন্দের শপ'}</h3>
              <p className="text-xs text-slate-400">অর্ডার ইনভয়েস ও ডেলিভারি মেমো</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono text-xs font-bold text-slate-400 block">অর্ডার নম্বর</span>
            <span className="font-mono font-black text-rose-600 text-base">{order.id}</span>
            <div className="mt-1">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-700 block mb-1">গ্রাহকের বিবরণ:</span>
            <p className="text-slate-900 font-bold">{order.customerName}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <span>ফোন: {toBengaliNumber(order.phone)}</span>
              <a href={`tel:${order.phone}`} className="text-emerald-600 hover:underline print:hidden">
                (কল করুন)
              </a>
            </p>
            <p className="text-slate-500">তারিখ: {formatBengaliDate(order.createdAt)}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-700 block mb-1">ডেলিভারি ঠিকানা:</span>
            <p className="text-slate-900 font-medium leading-relaxed">
              {order.address}
              {order.upazila ? `, ${order.upazila}` : ''}
              {order.district ? `, ${order.district}` : ''}
              {order.division ? `, ${order.division}` : ''}
            </p>
            <p className="text-slate-500">
              লোকেশন: {order.deliveryLocation === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}
            </p>
            <p className="text-slate-500">পেমেন্ট: {getPaymentMethodName(order.paymentMethod)}</p>
          </div>
        </div>

        {/* Notes if present */}
        {order.notes && (
          <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <span className="font-bold">স্পেশাল নোট:</span> {order.notes}
          </div>
        )}

        {/* Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">পণ্য</th>
                <th className="py-2.5 px-3">সাইজ / কালার</th>
                <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                <th className="py-2.5 px-3 text-right">মোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.size ? `সাইজ: ${item.size} ` : '-'}
                    {item.color ? `| কালার: ${item.color}` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    {toBengaliNumber(item.quantity)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatPrice(item.price)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bill Breakdown */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>পণ্যের সাবটোটাল:</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>ডেলিভারি চার্জ:</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
            <span>সর্বমোট বিল:</span>
            <span className="text-rose-600 text-base font-extrabold">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Print / Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>ইনভয়েস প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
