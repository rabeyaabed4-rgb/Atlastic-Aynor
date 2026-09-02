import React from 'react';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Clock,
  ArrowUpRight,
  Eye,
  Phone,
  PhoneCall,
  CheckCircle2,
  PackageOpen,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardStats, Order, OrderStatus } from '../../types';
import { formatPrice, toBengaliNumber, getStatusBadgeInfo, getPaymentMethodName, formatBengaliDate } from '../../lib/formatters';

interface AdminDashboardProps {
  stats: DashboardStats;
  onViewOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onViewOrder,
  onUpdateOrderStatus,
  onNavigateTab,
}) => {
  const isAllZero = stats.totalOrders === 0;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards (Matching reference image layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">মোট অর্ডার</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {toBengaliNumber(stats.totalOrders)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">সর্বমোট রেকর্ড</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">আজকের অর্ডার</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {toBengaliNumber(stats.todayOrders)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">আজকের নতুন রিকোয়েস্ট</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">মোট বিক্রয়</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
              {formatPrice(stats.totalSales)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">মোট রাজস্ব</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">পেন্ডিং অর্ডার</p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-600">
              {toBengaliNumber(stats.pendingOrders)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">কনফার্মেশন প্রয়োজন</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts (Sales Trend + Status Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart (Left) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                বিক্রয়ের সারসংক্ষেপ (গত ৭ দিন)
              </h4>
              <p className="text-xs text-slate-400">দৈনিক রাজস্বের পরিবর্তন</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value: any) => [`৳ ${toBengaliNumber(value)}`, 'বিক্রয়']}
                  labelFormatter={(label) => `তারিখ: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut (Right) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">অর্ডার স্ট্যাটাস</h4>
          <p className="text-xs text-slate-400 mb-3">স্ট্যাটাস অনুযায়ী বিভাজন</p>

          <div className="h-64 w-full flex items-center justify-center">
            {stats.totalOrders > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution.filter((s) => s.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${toBengaliNumber(value)}টি অর্ডার`, name]} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 p-6">
                <PackageOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">এখনও কোনো অর্ডার পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table (Matching reference image) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h4>
            <p className="text-xs text-slate-400">সর্বশেষ প্রাপ্ত অর্ডার তালিকা</p>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <span>সবগুলো অর্ডার দেখুন</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">অর্ডার আইডি</th>
                  <th className="py-3.5 px-4">গ্রাহকের নাম</th>
                  <th className="py-3.5 px-4">মোবাইল</th>
                  <th className="py-3.5 px-4">মোট মূল্য</th>
                  <th className="py-3.5 px-4">পেমেন্ট মেথড</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.recentOrders.map((ord) => {
                  const badge = getStatusBadgeInfo(ord.orderStatus);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ord.customerName}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>{toBengaliNumber(ord.phone)}</span>
                          <a
                            href={`tel:${ord.phone}`}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="ফোন করুন"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">{getPaymentMethodName(ord.paymentMethod)}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <option value="pending">পেন্ডিং</option>
                          <option value="confirmed">কনফার্মড</option>
                          <option value="processing">প্রসেসিং</option>
                          <option value="shipped">শিপড</option>
                          <option value="delivered">ডেলিভার্ড</option>
                          <option value="cancelled">ক্যানসেলড</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewOrder(ord)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="বিস্তারিত ও রসিদ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State - STRICTLY NO FAKE ROWS */
          <div className="p-12 text-center text-slate-500">
            <PackageOpen className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
            <h5 className="font-bold text-slate-700 text-sm mb-1">এখনও কোনো অর্ডার পাওয়া যায়নি।</h5>
            <p className="text-xs text-slate-400">
              কাস্টমার ল্যান্ডিং পেজে অর্ডার সাবমিট করার সাথে সাথে এখানে রিয়েল-টাইমে তালিকা আপডেট হবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
