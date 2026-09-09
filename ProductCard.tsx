import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Star, Plus, Check, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    addToCart,
    cart,
    updateCartQuantity,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
    currentUser,
    setIsAuthModalOpen
  } = useStore();

  const inWishlist = isInWishlist(product.id);
  const cartItem = cart.find(c => c.productId === product.id && !c.savedForLater);
  const isOutOfStock = product.status === 'out_of_stock' || product.stockQuantity === 0;
  const isLowStock = product.status === 'low_stock' || (product.stockQuantity > 0 && product.stockQuantity <= 5);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.id, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    updateCartQuantity(product.id, cartItem.quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    updateCartQuantity(product.id, cartItem.quantity - 1);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
      className={`group relative bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
        compact ? 'p-2.5' : 'p-3 sm:p-3.5'
      }`}
    >
      {/* Image & Badges Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 mb-2.5 flex items-center justify-center">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
        />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-tight">
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-${product.id}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors backdrop-blur-xs ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/85 text-neutral-500 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Out of Stock / Low stock overlay badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
            <span className="bg-rose-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
        {!isOutOfStock && isLowStock && (
          <div className="absolute bottom-2 left-2 bg-amber-500/95 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Only {product.stockQuantity} left</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating Bar */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-neutral-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-800 text-[10px] truncate max-w-[65%]">
              {product.brand || 'Madina Mart'}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 text-amber-900 font-bold text-[10px]">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors mb-1.5">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-2 pt-2 border-t border-neutral-100 flex items-end justify-between gap-2">
          {/* Prices */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-neutral-950 font-['Outfit',sans-serif]">
                ₹{product.sellingPrice}
              </span>
              {product.originalPrice > product.sellingPrice && (
                <span className="text-[11px] text-neutral-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              Save ₹{product.originalPrice - product.sellingPrice}
            </div>
          </div>

          {/* Action: Add to Cart or Stepper */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-2.5 py-1.5 bg-neutral-100 text-neutral-400 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : cartItem ? (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden shadow-xs">
                <button
                  id={`btn-cart-dec-${product.id}`}
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="px-2.5 py-1.5 hover:bg-emerald-800 transition-colors font-bold text-xs"
                >
                  -
                </button>
                <span className="px-1.5 text-xs font-extrabold min-w-[20px] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  id={`btn-cart-inc-${product.id}`}
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="px-2.5 py-1.5 hover:bg-emerald-800 transition-colors font-bold text-xs"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                id={`btn-add-cart-${product.id}`}
                onClick={handleAddToCart}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-600/40 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
