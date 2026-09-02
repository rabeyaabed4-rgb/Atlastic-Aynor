import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  PhoneCall,
  Share2,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Order, SiteSettings } from '../../types';
import { formatPrice, toBengaliNumber, formatBengaliDate, getPaymentMethodName } from '../../lib/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  settings: SiteSettings;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  settings,
  onClose,
  onNewOrder,
}) => {
  useEffect(() => {
    if (order) {
      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }
    }
  }, [order]);

  if (!order) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    alert('অর্ডার আইডি কপি করা হয়েছে!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Success Banner */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            আমাদের প্রতিনিধি শীঘ্রই আপনার দেওয়া মোবাইল নম্বরে কল করে অর্ডারটি কনফার্ম করবেন।
          </p>

          {/* Order ID Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800">
            <span>অর্ডার আইডি:</span>
            <span className="text-rose-600 font-mono tracking-wider font-extrabold">{order.id}</span>
            <button
              onClick={copyOrderId}
              className="p-1 hover:text-rose-600 text-slate-400 transition cursor-pointer"
              title="আইডি কপি করুন"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="py-5 space-y-4 text-xs sm:text-sm">
          {/* Customer Info Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">গ্রাহকের নাম:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>
              <span className="font-bold text-slate-900">{toBengaliNumber(order.phone)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">ডেলিভারি ঠিকানা:</span>
              <span className="font-bold text-slate-900 text-right max-w-[220px]">
                {order.address}, {order.upazila ? `${order.upazila}, ` : ''}{order.district}, {order.division}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">পেমেন্ট মেথড:</span>
              <span className="font-bold text-slate-900">{getPaymentMethodName(order.paymentMethod)}</span>
            </div>
          </div>

          {/* Ordered Products Itemized */}
          <div>
            <span className="font-bold text-slate-800 block mb-2">অর্ডারকৃত পণ্যসমূহ:</span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.size ? `সাইজ: ${item.size} ` : ''}
                        {item.color ? `| কালার: ${item.color} ` : ''}
                        (পরিমাণ: {toBengaliNumber(item.quantity)})
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>পণ্যের মোট মূল্য:</span>
              <span>{formatPrice(order.itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>
                ডেলিভারি চার্জ ({order.deliveryLocation === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}):
              </span>
              <span>{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>সর্বমোট পরিশোধযোগ্য:</span>
              <span className="text-rose-600 text-lg font-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Support & Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3">
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>হেল্পলাইনে কল করুন</span>
              </a>
            )}

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>রসিদ প্রিন্ট</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNewOrder();
            }}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>নতুন অর্ডার করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
