import React from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridSectionProps {
  products: Product[];
  selectedProductIds: string[];
  onSelectProduct: (product: Product, size?: string, color?: string) => void;
  onScrollToOrder: () => void;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  products,
  selectedProductIds,
  onSelectProduct,
  onScrollToOrder,
}) => {
  return (
    <section id="products" className="py-12 md:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                পছন্দের কালেকশন
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">সেরা কালেকশন</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-rose-600 border border-rose-200 bg-rose-50 px-3 py-1 rounded-full">
              সবগুলো দেখুন ({products.length})
            </span>
          </div>
        </div>

        {/* Product Grid or Clean Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProductIds.includes(product.id)}
                onSelect={onSelectProduct}
                onScrollToOrder={onScrollToOrder}
              />
            ))}
          </div>
        ) : (
          /* Empty State - STRICTLY NO DEMO PRODUCTS */
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <PackageOpen className="w-8 h-8 stroke-1 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              এখনও কোনো পণ্য তালিকায় যুক্ত করা হয়নি
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              নতুন ও আকর্ষণীয় কালেকশনের প্রিমিয়াম পণ্য খুব শীঘ্রই যুক্ত করা হবে। আমাদের সাথেই থাকুন।
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
