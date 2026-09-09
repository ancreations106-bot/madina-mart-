import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  X,
  Heart,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProductCard } from '../common/ProductCard';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveTab,
    setIsCheckoutOpen,
    products,
    settings,
    currentUser,
    setIsAuthModalOpen
  } = useStore();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const inWishlist = isInWishlist(selectedProduct.id);
  const isOutOfStock = selectedProduct.status === 'out_of_stock' || selectedProduct.stockQuantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct.id, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct.id, quantity);
    setSelectedProduct(null);
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setActiveTab('cart');
      setIsCheckoutOpen(true);
    }
  };

  const relatedProducts = products
    .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center sm:p-4 overflow-y-auto">
      <div
        id="product-detail-dialog"
        className="bg-white w-full max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {selectedProduct.category.replace('-', ' & ')}
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs font-semibold text-neutral-600 truncate max-w-[180px]">
              {selectedProduct.brand}
            </span>
          </div>
          <button
            id="btn-close-product-detail"
            onClick={() => setSelectedProduct(null)}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Gallery & Title Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                <img
                  src={selectedProduct.images[selectedImgIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-center"
                />

                {selectedProduct.discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    {selectedProduct.discountPercentage}% OFF
                  </div>
                )}

                <button
                  id="btn-detail-wishlist"
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    toggleWishlist(selectedProduct.id);
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
                    inWishlist
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white/90 text-neutral-600 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Thumbnail selector if multiple images */}
              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImgIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-neutral-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {selectedProduct.brand}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    SKU: {selectedProduct.sku}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                  {selectedProduct.name}
                </h1>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-900 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{selectedProduct.rating}</span>
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  {selectedProduct.reviewCount} customer reviews & ratings
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-neutral-950 font-['Outfit',sans-serif]">
                    ₹{selectedProduct.sellingPrice}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.sellingPrice && (
                    <span className="text-sm text-neutral-400 line-through">
                      ₹{selectedProduct.originalPrice}
                    </span>
                  )}
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Save ₹{selectedProduct.originalPrice - selectedProduct.sellingPrice}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Inclusive of all local taxes • Cash on delivery available
                </p>
              </div>

              {/* Stock status indicator */}
              <div>
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-xs bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Currently Out of Stock at your local store</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In Stock ({selectedProduct.stockQuantity} units available locally)</span>
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 hover:bg-neutral-100 disabled:opacity-30 font-bold text-neutral-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold text-neutral-900 min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))}
                      disabled={quantity >= selectedProduct.stockQuantity}
                      className="px-3 py-1.5 hover:bg-neutral-100 disabled:opacity-30 font-bold text-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200/80 text-[11px] text-neutral-600 font-medium">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50">
                  <Truck className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="font-bold text-neutral-800">2-4 Hours</span>
                  <span className="text-[10px] text-neutral-400">Local Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="font-bold text-neutral-800">100% Genuine</span>
                  <span className="text-[10px] text-neutral-400">Store Verified</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-50">
                  <RotateCcw className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="font-bold text-neutral-800">{settings.returnWindowDays} Days</span>
                  <span className="text-[10px] text-neutral-400">Easy Return</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <h3 className="font-bold text-sm text-neutral-900 mb-2">Product Description</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {selectedProduct.description}
            </p>
          </div>

          {/* Specifications Table */}
          {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-neutral-900 mb-2.5">Specifications</h3>
              <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-200 text-xs">
                {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 p-3">
                    <span className="font-semibold text-neutral-500">{key}</span>
                    <span className="col-span-2 text-neutral-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related / Recommended Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h3 className="font-bold text-sm text-neutral-900 mb-3">You May Also Like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-neutral-200 p-3 sm:p-4 flex items-center gap-3">
          <button
            id="btn-detail-add-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Add to Cart</span>
          </button>
          <button
            id="btn-detail-buy-now"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Buy Now (COD)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
