import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Trash2,
  PhoneCall,
  Calendar,
  Filter,
  PackageOpen,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus, SiteSettings } from '../../types';
import {
  formatPrice,
  toBengaliNumber,
  formatBengaliDate,
  getStatusBadgeInfo,
  getPaymentMethodName,
} from '../../lib/formatters';
import { OrderInvoiceModal } from './OrderInvoiceModal';

interface AdminOrdersProps {
  orders: Order[];
  settings: SiteSettings;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  settings,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const statusFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'সবগুলো' },
    { key: 'pending', label: 'পেন্ডিং' },
    { key: 'confirmed', label: 'কনফার্মড' },
    { key: 'processing', label: 'প্রসেসিং' },
    { key: 'shipped', label: 'শিপড' },
    { key: 'delivered', label: 'ডেলিভার্ড' },
    { key: 'cancelled', label: 'ক্যানসেলড' },
  ];

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = selectedStatus === 'all' || ord.orderStatus === selectedStatus;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.phone.includes(searchQuery) ||
      (ord.address && ord.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string, customerName: string) => {
    if (confirm(`আপনি কি "${customerName}"-এর ${id} অর্ডারটি মুছে ফেলতে নিশ্চিত?`)) {
      await onDeleteOrder(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">অর্ডার ব্যবস্থাপনা</h3>
            <p className="text-xs text-slate-400">সকল গ্রাহকের অর্ডারের স্ট্যাটাস ট্র্যাক ও আপডেট করুন</p>
          </div>

          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অর্ডার আইডি, নাম বা ফোন দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((tab) => {
            const count =
              tab.key === 'all'
                ? orders.length
                : orders.filter((o) => o.orderStatus === tab.key).length;
            const isSelected = selectedStatus === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {toBengaliNumber(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">অর্ডার আইডি</th>
                  <th className="py-3.5 px-4">তারিখ</th>
                  <th className="py-3.5 px-4">গ্রাহক ও মোবাইল</th>
                  <th className="py-3.5 px-4">ঠিকানা</th>
                  <th className="py-3.5 px-4">পণ্যসমূহ</th>
                  <th className="py-3.5 px-4">মোট বিল</th>
                  <th className="py-3.5 px-4">পেমেন্ট</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস পরিবর্তন</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => {
                  const badge = getStatusBadgeInfo(ord.orderStatus);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.id}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatBengaliDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{ord.customerName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-slate-600 font-mono text-[11px]">
                            {toBengaliNumber(ord.phone)}
                          </span>
                          <a
                            href={`tel:${ord.phone}`}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="কল করুন"
                          >
                            <PhoneCall className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[160px]">
                        <p className="text-[11px] text-slate-700 line-clamp-2">
                          {ord.address}, {ord.district}
                        </p>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="space-y-0.5">
                          {ord.items.map((item, i) => (
                            <p key={i} className="text-[11px] text-slate-800 line-clamp-1">
                              • {item.productName} ({toBengaliNumber(item.quantity)}টি)
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600 whitespace-nowrap">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                        {getPaymentMethodName(ord.paymentMethod)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => onUpdateStatus(ord.id, e.target.value as OrderStatus)}
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
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="ইনভয়েস দেখুন ও প্রিন্ট করুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ord.id, ord.customerName)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
            <h5 className="font-bold text-slate-700 text-sm mb-1">কোনো অর্ডার পাওয়া যায়নি</h5>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedStatus !== 'all'
                ? 'আপনার সার্চ ফিল্টারের সাথে কোনো অর্ডার মেলেনি।'
                : 'এখনও কোনো কাস্টমার অর্ডার করেনি। অর্ডার আসার সাথে সাথে এখানে তালিকাভুক্ত হবে।'}
            </p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {viewingOrder && (
        <OrderInvoiceModal
          order={viewingOrder}
          settings={settings}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
};
