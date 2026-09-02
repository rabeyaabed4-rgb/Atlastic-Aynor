import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/formatters';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product, size?: string, color?: string) => void;
  onScrollToOrder: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onScrollToOrder,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const isOutOfStock = product.stock <= 0;

  const handleOrderClick = () => {
    if (isOutOfStock) return;
    onSelect(product, selectedSize, selectedColor);
    onScrollToOrder();
  };

  const mainImg = product.mainImage || (product.images && product.images[0]) || '';

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group bg-white rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between ${
        isSelected
          ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3.5">
          {mainImg ? (
            <img
              src={mainImg}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1" />
            </div>
          )}

          {/* Discount Tag */}
          {product.discountPercent ? (
            <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              -{product.discountPercent}%
            </span>
          ) : null}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-md shadow-md">
                স্টক শেষ
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price & Old Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Sizes if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">সাইজ:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                      selectedSize === s
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors if available */}
          {product.colors && product.colors.length > 0 && (
            <div className="pt-1.5">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">কালার:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                      selectedColor === c
                        ? 'bg-rose-50 text-rose-700 border-rose-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 mt-2">
        <button
          type="button"
          onClick={handleOrderClick}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : isSelected
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              : 'border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white active:scale-98'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              <span>সিলেক্টেড (অর্ডার করুন)</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'স্টক শেষ' : 'অর্ডার করুন'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
