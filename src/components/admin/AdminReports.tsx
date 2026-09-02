import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardStats, Order } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/formatters';

interface AdminReportsProps {
  stats: DashboardStats;
  orders: Order[];
}

export const AdminReports: React.FC<AdminReportsProps> = ({ stats, orders }) => {
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled');
  const totalDeliveredRevenue = deliveredOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const dhakaOrders = orders.filter((o) => o.deliveryLocation === 'inside_dhaka');
  const outsideDhakaOrders = orders.filter((o) => o.deliveryLocation === 'outside_dhaka');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900">ব্যবসার সামগ্রিক রিপোর্ট ও বিশ্লেষণ</h3>
        <p className="text-xs text-slate-400">বিক্রয়, ডেলিভারি সাফল্য এবং লোকেশন ভিত্তিক তথ্য</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">মোট বিক্রয় (সকল অর্ডার)</span>
          <h4 className="text-2xl font-black text-slate-900">{formatPrice(stats.totalSales)}</h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">সফল ডেলিভারি রাজস্ব</span>
          <h4 className="text-2xl font-black text-emerald-600">{formatPrice(totalDeliveredRevenue)}</h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">সফল ডেলিভারি সংখ্যা</span>
          <h4 className="text-2xl font-black text-blue-600">{toBengaliNumber(deliveredOrders.length)}টি</h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">বাতিল অর্ডার</span>
          <h4 className="text-2xl font-black text-rose-600">{toBengaliNumber(cancelledOrders.length)}টি</h4>
        </div>
      </div>

      {/* Location Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-rose-600" />
            <span>লোকেশন ভিত্তিক অর্ডার বিভাজন</span>
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>ঢাকার ভিতরে ({toBengaliNumber(dhakaOrders.length)}টি)</span>
                <span>
                  {orders.length > 0
                    ? `${toBengaliNumber(Math.round((dhakaOrders.length / orders.length) * 100))}%`
                    : '০%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${orders.length > 0 ? (dhakaOrders.length / orders.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>ঢাকার বাইরে ({toBengaliNumber(outsideDhakaOrders.length)}টি)</span>
                <span>
                  {orders.length > 0
                    ? `${toBengaliNumber(Math.round((outsideDhakaOrders.length / orders.length) * 100))}%`
                    : '০%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${orders.length > 0 ? (outsideDhakaOrders.length / orders.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
            <span>ডেলিভারি সাকসেস রেট</span>
          </h4>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">মোট অর্ডার রিকোয়েস্ট:</span>
              <span className="font-bold text-slate-900">{toBengaliNumber(orders.length)}টি</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">সফল ডেলিভারি রেট:</span>
              <span className="font-bold text-emerald-600">
                {orders.length > 0
                  ? `${toBengaliNumber(Math.round((deliveredOrders.length / orders.length) * 100))}%`
                  : '০%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">বাতিল বা রিটার্ন রেট:</span>
              <span className="font-bold text-rose-600">
                {orders.length > 0
                  ? `${toBengaliNumber(Math.round((cancelledOrders.length / orders.length) * 100))}%`
                  : '০%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
