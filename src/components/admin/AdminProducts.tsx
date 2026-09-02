import React, { useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  PackageOpen,
  UploadCloud,
  Check,
} from 'lucide-react';
import { Product } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/formatters';
import { api } from '../../lib/api';

interface AdminProductsProps {
  products: Product[];
  onCreateProduct: (productData: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onUpdateStock: (id: string, stock: number) => Promise<void>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [sizes, setSizes] = useState('M, L, XL, XXL');
  const [colors, setColors] = useState('Black, Navy Blue, Maroon');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setMainImage('');
    setPrice('');
    setOldPrice('');
    setStock('50');
    setSizes('M, L, XL, XXL');
    setColors('Black, Navy Blue, Maroon');
    setDescription('');
    setIsActive(true);
    setIsFeatured(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setMainImage(prod.mainImage || (prod.images && prod.images[0]) || '');
    setPrice(prod.price.toString());
    setOldPrice(prod.oldPrice ? prod.oldPrice.toString() : '');
    setStock(prod.stock.toString());
    setSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setColors(prod.colors ? prod.colors.join(', ') : '');
    setDescription(prod.description || '');
    setIsActive(prod.isActive);
    setIsFeatured(prod.isFeatured || false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPEG/PNG/WebP) আপলোড করুন।');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('ছবির সাইজ ৫MB এর বেশি হওয়া যাবে না।');
      return;
    }

    setIsUploadingImage(true);
    setFormError('');
    try {
      const uploadedUrl = await api.uploadProductImage(file);
      setMainImage(uploadedUrl);
    } catch (err: any) {
      setFormError(err.message || 'ছবি আপলোড ব্যর্থ হয়েছে। সরাসরি ইমেজ লিঙ্কও ব্যবহার করতে পারেন।');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setFormError('পণ্যের নাম এবং বর্তমান মূল্য আবশ্যক।');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const parsedSizes = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedColors = colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const productPayload: Partial<Product> = {
      name: name.trim(),
      mainImage: mainImage.trim(),
      images: mainImage.trim() ? [mainImage.trim()] : [],
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      stock: Number(stock) || 0,
      sizes: parsedSizes,
      colors: parsedColors,
      description: description.trim(),
      isActive,
      isFeatured,
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
      } else {
        await onCreateProduct(productPayload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`আপনি কি "${prodName}" পণ্যটি মুছে ফেলতে নিশ্চিত?`)) {
      await onDeleteProduct(id);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Product Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">পণ্য তালিকা</h3>
          <p className="text-xs text-slate-400">সকল পণ্যের তথ্য, ছবি, মূল্য ও স্টক নিয়ন্ত্রণ করুন</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            id="admin-add-product-btn"
            onClick={openCreateModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">ছবি</th>
                  <th className="py-3.5 px-4">পণ্যের নাম</th>
                  <th className="py-3.5 px-4">মূল্য</th>
                  <th className="py-3.5 px-4">স্টক</th>
                  <th className="py-3.5 px-4">ফিচার্ড</th>
                  <th className="py-3.5 px-4">অবস্থা</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {prod.sizes?.length ? `সাইজ: ${prod.sizes.join(', ')}` : ''}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-900">{formatPrice(prod.price)}</span>
                        {prod.oldPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatPrice(prod.oldPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={prod.stock}
                          onBlur={(e) => onUpdateStock(prod.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                        />
                        <span className="text-[11px] text-slate-400">টি</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onUpdateProduct(prod.id, { isFeatured: !prod.isFeatured })}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          prod.isFeatured
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={prod.isFeatured ? 'ফিচার্ড পণ্য থেকে বাদ দিন' : 'ফিচার্ড পণ্য হিসেবে সেট করুন'}
                      >
                        <Star className={`w-4 h-4 ${prod.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleStatus(prod.id, !prod.isActive)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {prod.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <h5 className="font-bold text-slate-700 text-sm mb-1">কোনো পণ্য পাওয়া যায়নি</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              আপনার দোকানে এখনও কোনো পণ্য যোগ করা হয়নি। নতুন পণ্য যোগ করতে নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম পণ্য যোগ করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                <span>{editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">পণ্যের সকল সঠিক বিবরণ প্রদান করুন</p>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের নাম <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম ওভারসাইজ কটন টি-শার্ট"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Product Image: File Upload to Supabase Storage OR URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের ছবি (Supabase Storage-এ আপলোড অথবা সরাসরি লিংক)
                </label>

                <div className="space-y-2">
                  {/* File Upload Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-rose-600" />
                      )}
                      <span>
                        {isUploadingImage ? 'Storage-এ আপলোড হচ্ছে...' : 'ছবি আপলোড করুন (Storage)'}
                      </span>
                    </button>
                    <span className="text-[11px] text-slate-400">অথবা নিচে সরাসরি ইমেজ URL দিন</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... বা স্টোরেজ URL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                    />
                    {mainImage && (
                      <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                        <img
                          src={mainImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Old Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান মূল্য (৳) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="যেমন: 650"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আগের মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="যেমন: 850"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্টক সংখ্যা <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="যেমন: 50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Sizes & Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সাইজসমূহ (কমা দিয়ে লিখুন)
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="M, L, XL, XXL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কালারসমূহ (কমা দিয়ে লিখুন)
                  </label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="Black, White, Navy Blue"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিস্তারিত বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="পণ্যের উপাদান, গুণমান ও ফিচার বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>সক্রিয় পণ্য (Landing Page-এ দেখাবে)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>হিরো ব্যানারে ফিচার্ড পণ্য হিসেবে হাইলাইট করুন</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  <span>{editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
