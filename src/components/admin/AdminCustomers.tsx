import React, { useState } from 'react';
import { Users, Search, PhoneCall, ShoppingBag, MapPin, Calendar, DollarSign, PackageOpen } from 'lucide-react';
import { Customer } from '../../types';
import { formatPrice, toBengaliNumber, formatBengaliDate } from '../../lib/formatters';

interface AdminCustomersProps {
  customers: Customer[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.district && c.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">গ্রাহক তালিকা</h3>
          <p className="text-xs text-slate-400">
            অর্ডারকারী সকল গ্রাহকের যোগাযোগের তথ্য ও লাইফটাইম ক্রয় ইতিহাস
          </p>
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">গ্রাহকের নাম</th>
                  <th className="py-3.5 px-4">মোবাইল</th>
                  <th className="py-3.5 px-4">ঠিকানা ও জেলা</th>
                  <th className="py-3.5 px-4 text-center">মোট অর্ডার</th>
                  <th className="py-3.5 px-4">মোট কেনাকাটা</th>
                  <th className="py-3.5 px-4">সর্বশেষ অর্ডার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{cust.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700">{toBengaliNumber(cust.phone)}</span>
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                          title="কল করুন"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="text-slate-700 line-clamp-1">{cust.address}</p>
                      <p className="text-[11px] text-slate-400">
                        {cust.upazila ? `${cust.upazila}, ` : ''}{cust.district || ''}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                        {toBengaliNumber(cust.totalOrders)}টি
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      {formatPrice(cust.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {formatBengaliDate(cust.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State - STRICTLY NO FAKE ROWS */
          <div className="p-12 text-center text-slate-500">
            <PackageOpen className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
            <h5 className="font-bold text-slate-700 text-sm mb-1">কোনো গ্রাহকের তথ্য নেই</h5>
            <p className="text-xs text-slate-400">
              কাস্টমাররা অর্ডার করার সাথে সাথে তাদের প্রোফাইল স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
