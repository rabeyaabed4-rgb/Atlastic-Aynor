import React, { useState } from 'react';
import {
  Search,
  X,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../lib/api';
import { formatPrice, toBengaliNumber, formatBengaliDate, getStatusBadgeInfo } from '../../lib/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('অনুগ্রহ করে অর্ডার আইডি প্রদান করুন (যেমন: ORD-123456)।');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await api.trackOrder(orderId.trim(), phone.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'অর্ডারটি ট্র্যাক করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const steps: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'pending', label: 'পেন্ডিং', icon: Clock },
    { key: 'confirmed', label: 'কনফার্মড', icon: CheckCircle },
    { key: 'processing', label: 'প্রসেসিং', icon: Package },
    { key: 'shipped', label: 'শিপড', icon: Truck },
    { key: 'delivered', label: 'ডেলিভার্ড', icon: CheckCircle },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-rose-600" />
            <span>আপনার অর্ডার ট্র্যাক করুন</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            অর্ডারের সময় প্রাপ্ত Order ID দিয়ে সর্বশেষ অবস্থা জানুন
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="অর্ডার আইডি (যেমন: ORD-123456)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>অর্ডারের অবস্থা খুঁজুন</span>
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Tracking Result */}
        {order && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">অর্ডার আইডি</span>
                <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
              </div>
              <div className="text-right">
                {(() => {
                  const b = getStatusBadgeInfo(order.orderStatus);
                  return (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${b.bg} ${b.text} ${b.border}`}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Cancelled Alert or Timeline */}
            {order.orderStatus === 'cancelled' ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
                <XCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">অর্ডারটি বাতিল করা হয়েছে।</p>
                  {order.notes && <p className="text-[11px] text-red-600">{order.notes}</p>}
                </div>
              </div>
            ) : (
              <div className="py-2">
                <div className="grid grid-cols-5 gap-1 text-center">
                  {steps.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 transition-all ${
                            isCurrent
                              ? 'bg-rose-600 text-white ring-4 ring-rose-100 shadow-sm'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            isCurrent
                              ? 'text-rose-600'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Summary */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার তারিখ:</span>
                <span className="font-semibold text-slate-800">{formatBengaliDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহকের নাম:</span>
                <span className="font-semibold text-slate-800">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোট মূল্য:</span>
                <span className="font-bold text-rose-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
