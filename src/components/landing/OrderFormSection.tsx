import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  ShieldCheck,
  Truck,
  Loader2,
} from 'lucide-react';
import { Product, SelectedOrderItem, SiteSettings, DeliveryLocation, PaymentMethod } from '../../types';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshLocations';
import { formatPrice, toBengaliNumber } from '../../lib/formatters';

interface OrderFormSectionProps {
  settings: SiteSettings;
  products: Product[];
  selectedItems: SelectedOrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateItemSizeColor: (productId: string, size: string, color: string) => void;
  onSubmitOrder: (formData: any) => Promise<void>;
  isSubmitting: boolean;
}

export const OrderFormSection: React.FC<OrderFormSectionProps> = ({
  settings,
  products,
  selectedItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemSizeColor,
  onSubmitOrder,
  isSubmitting,
}) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ঢাকা');
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Available districts based on division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision);
  const availableDistricts = currentDivisionObj ? currentDivisionObj.districts : [];

  // Available upazilas based on district
  const currentDistrictObj = availableDistricts.find((d) => d.name === selectedDistrict);
  const availableUpazilas = currentDistrictObj ? currentDistrictObj.upazilas : [];

  // Handle Division change
  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === divName);
    if (divObj && divObj.districts.length > 0) {
      const firstDistrict = divObj.districts[0].name;
      setSelectedDistrict(firstDistrict);
      setSelectedUpazila(divObj.districts[0].upazilas[0] || '');
      // Auto toggle delivery location if district is Dhaka
      if (firstDistrict === 'ঢাকা') {
        setDeliveryLocation('inside_dhaka');
      } else {
        setDeliveryLocation('outside_dhaka');
      }
    }
  };

  // Handle District change
  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const distObj = availableDistricts.find((d) => d.name === distName);
    if (distObj && distObj.upazilas.length > 0) {
      setSelectedUpazila(distObj.upazilas[0] || '');
    } else {
      setSelectedUpazila('');
    }

    if (distName === 'ঢাকা') {
      setDeliveryLocation('inside_dhaka');
    } else {
      setDeliveryLocation('outside_dhaka');
    }
  };

  // Calculations
  const itemsSubtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge =
    deliveryLocation === 'inside_dhaka'
      ? Number(settings.insideDhakaDeliveryCharge) || 60
      : Number(settings.outsideDhakaDeliveryCharge) || 135;
  const grandTotal = itemsSubtotal + deliveryCharge;

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।';
    }

    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const bdPhoneRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      errors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।';
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = 'অনুগ্রহ করে আপনার সঠিক ঠিকানা (বাসা/রোড/এলাকা) লিখুন।';
    }

    if (selectedItems.length === 0) {
      errors.items = 'অনুগ্রহ করে অন্তত একটি পণ্য অর্ডার করার জন্য নির্বাচন করুন।';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    await onSubmitOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      address: address.trim(),
      deliveryLocation,
      paymentMethod,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      notes: notes.trim(),
    });
  };

  return (
    <section id="order-section" className="py-12 md:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>সহজ ও দ্রুত অর্ডার</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            আপনার অর্ডারটি সম্পূর্ণ করুন
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            নিচের ফর্মটি পূরণ করে "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করুন। আমাদের প্রতিনিধি কল করে কনফার্ম করবেন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer Information Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-600" />
                  <span>গ্রাহকের প্রয়োজনীয় তথ্য</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন</p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    আপনার নাম <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-name-input"
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formErrors.customerName) setFormErrors({ ...formErrors, customerName: '' });
                      }}
                      placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        formErrors.customerName
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      }`}
                    />
                  </div>
                  {formErrors.customerName && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    মোবাইল নম্বর <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                      }}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                        formErrors.phone
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Division, District, Upazila */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বিভাগ <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="division-select"
                    value={selectedDivision}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  >
                    {BANGLADESH_DIVISIONS.map((div) => (
                      <option key={div.name} value={div.name}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    জেলা <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="district-select"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    থানা/উপজেলা
                  </label>
                  {availableUpazilas.length > 0 ? (
                    <select
                      id="upazila-select"
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                    >
                      {availableUpazilas.map((upz) => (
                        <option key={upz} value={upz}>
                          {upz}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                      placeholder="থানা/উপজেলা লিখুন"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
                    />
                  )}
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="customer-address-input"
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                  }}
                  placeholder="বাড়ি নং, রোড নং, এলাকা বা গ্রামের নাম বিস্তারিত লিখুন"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all resize-none ${
                    formErrors.address
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Delivery Location Selection (Reference image layout) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ডেলিভারি লোকেশন <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryLocation('inside_dhaka')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      deliveryLocation === 'inside_dhaka'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryLocation === 'inside_dhaka'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {deliveryLocation === 'inside_dhaka' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">ঢাকার ভিতরে</p>
                        <p className="text-xs text-slate-500">
                          ডেলিভারি চার্জ: {formatPrice(settings.insideDhakaDeliveryCharge || 60)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryLocation('outside_dhaka')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      deliveryLocation === 'outside_dhaka'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryLocation === 'outside_dhaka'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {deliveryLocation === 'outside_dhaka' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">ঢাকার বাইরে</p>
                        <p className="text-xs text-slate-500">
                          ডেলিভারি চার্জ: {formatPrice(settings.outsideDhakaDeliveryCharge || 135)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  পেমেন্ট মেথড <span className="text-rose-600">*</span>
                </label>
                <div className="space-y-2">
                  {settings.codEnabled !== false && (
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'cod'
                          ? 'border-rose-500 bg-rose-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-rose-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">ক্যাশ অন ডেলিভারি</p>
                          <p className="text-xs text-slate-500">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        কোনো অগ্রিম নেই
                      </span>
                    </div>
                  )}

                  {settings.bkashEnabled && (
                    <div
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'bkash'
                          ? 'border-rose-500 bg-rose-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">বিকাশ পেমেন্ট</p>
                          <p className="text-xs text-slate-500">
                            {settings.bkashNumber ? `বিকাশ নম্বর: ${settings.bkashNumber}` : 'বিকাশের মাধ্যমে পরিশোধ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {settings.nagadEnabled && (
                    <div
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'nagad'
                          ? 'border-rose-500 bg-rose-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">নগদ পেমেন্ট</p>
                          <p className="text-xs text-slate-500">
                            {settings.nagadNumber ? `নগদ নম্বর: ${settings.nagadNumber}` : 'নগদের মাধ্যমে পরিশোধ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্পেশাল নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ডেলিভারিম্যানের জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (Reference Image style) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm sticky top-24">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-600" />
                  <span>অর্ডার সামারি</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {toBengaliNumber(selectedItems.length)}টি পণ্য
                </span>
              </div>

              {/* Error if no items */}
              {formErrors.items && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.items}</span>
                </div>
              )}

              {/* Selected Items List */}
              {selectedItems.length > 0 ? (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {selectedItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const availableSizes = prod?.sizes || [];
                    const availableColors = prod?.colors || [];

                    return (
                      <div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Title & Options */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.productName}
                          </h4>

                          {/* Options if available */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            {item.size && (
                              <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                সাইজ: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                কালার: {item.color}
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-bold text-rose-600 mt-1">
                            {formatPrice(item.price)} × {toBengaliNumber(item.quantity)} ={' '}
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
                              title="পরিমাণ কমান"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-800">
                              {toBengaliNumber(item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
                              title="পরিমাণ বাড়ান"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl my-4">
                  <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-1" />
                  <p className="text-xs text-slate-600 font-bold">কোনো পণ্য নির্বাচন করা হয়নি</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    উপরের কালেকশন থেকে পছন্দের পণ্যের "অর্ডার করুন" বাটনে চাপুন।
                  </p>
                </div>
              )}

              {/* Price Calculations */}
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>পণ্যের মোট মূল্য</span>
                  <span className="font-semibold text-slate-900">{formatPrice(itemsSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ ({deliveryLocation === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'})</span>
                  <span className="font-semibold text-slate-900">{formatPrice(deliveryCharge)}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">সর্বমোট</span>
                  <span className="text-xl font-extrabold text-rose-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <div className="pt-5">
                <button
                  id="confirm-order-submit-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedItems.length === 0}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    isSubmitting || selectedItems.length === 0
                      ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-200 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>অর্ডার নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge at bottom of card */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে চেক করে মূল্য দিন</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
