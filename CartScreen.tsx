import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Trash2,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    cartSubtotal,
    cartTotalDiscount,
    cartPlatformFee,
    cartDeliveryFee,
    cartFinalTotal,
    settings,
    setIsCheckoutOpen,
    setIsAuthModalOpen,
    setAuthIntent,
    setActiveTab,
    currentUser
  } = useStore();

  const activeItems = cart.filter(i => !i.savedForLater);
  const savedItems = cart.filter(i => i.savedForLater);

  const amountNeededForFreeDelivery = Math.max(0, settings.freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, (cartSubtotal / settings.freeDeliveryThreshold) * 100);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setAuthIntent('checkout');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div id="cart-empty-state" className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-700 mx-auto mb-4 border border-emerald-100">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif] mb-1">
          Your cart is empty
        </h2>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-6 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore fresh groceries, electronics, and daily essentials.
        </p>
        <button
          id="btn-start-shopping"
          onClick={() => setActiveTab('home')}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div id="cart-screen" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
            Shopping Cart
          </h1>
          <p className="text-xs text-neutral-500">
            {activeItems.length} items in your basket
          </p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="text-xs text-emerald-700 font-bold hover:underline"
        >
          + Add More Items
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-neutral-200 mb-5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          {amountNeededForFreeDelivery > 0 ? (
            <span className="text-neutral-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Add <strong className="text-emerald-700">₹{amountNeededForFreeDelivery}</strong> more for <strong>FREE Delivery</strong></span>
            </span>
          ) : (
            <span className="text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Congratulations! You have unlocked <strong>FREE Delivery</strong></span>
            </span>
          )}
          <span className="text-[11px] font-bold text-neutral-400">
            Min ₹{settings.freeDeliveryThreshold}
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Active Items List */}
        <div className="md:col-span-2 space-y-3">
          {activeItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;

            return (
              <div
                key={item.productId}
                id={`cart-item-${item.productId}`}
                className="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-2xs flex gap-3.5 items-start transition-all"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-neutral-50 overflow-hidden shrink-0 border border-neutral-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                    {product.brand}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-neutral-950 font-['Outfit',sans-serif]">
                      ₹{product.sellingPrice * item.quantity}
                    </span>
                    {product.originalPrice > product.sellingPrice && (
                      <span className="text-xs text-neutral-400 line-through">
                        ₹{product.originalPrice * item.quantity}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500">
                      (₹{product.sellingPrice} / item)
                    </span>
                  </div>

                  {/* Actions & Quantity */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                      <button
                        id={`btn-cart-minus-${item.productId}`}
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-extrabold min-w-[22px] text-center text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        id={`btn-cart-plus-${item.productId}`}
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveForLater(item.productId)}
                        className="text-[11px] font-semibold text-neutral-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save for Later</span>
                      </button>
                      <span className="text-neutral-200">|</span>
                      <button
                        id={`btn-remove-cart-${item.productId}`}
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="pt-6">
              <h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-neutral-500" />
                <span>Saved for Later ({savedItems.length})</span>
              </h3>
              <div className="space-y-2.5">
                {savedItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={item.productId}
                      className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {product.name}
                          </h4>
                          <div className="text-xs font-extrabold text-neutral-800 font-['Outfit',sans-serif]">
                            ₹{product.sellingPrice}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => moveToCart(item.productId)}
                          className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bill Summary Card */}
        {activeItems.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
              <h3 className="text-sm font-extrabold text-neutral-900 mb-3 pb-2 border-b border-neutral-100 font-['Outfit',sans-serif]">
                Bill Details
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Item Total (MRP)</span>
                  <span>₹{cartSubtotal + cartTotalDiscount}</span>
                </div>

                {cartTotalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Product Discount</span>
                    <span>- ₹{cartTotalDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{cartSubtotal}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-neutral-900">₹{cartPlatformFee}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span>
                    {cartDeliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">
                        FREE
                      </span>
                    ) : (
                      `₹${cartDeliveryFee}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline font-bold text-neutral-900 text-sm sm:text-base">
                  <span>Final Payable Amount</span>
                  <span className="text-lg font-black font-['Outfit',sans-serif] text-emerald-900">
                    ₹{cartFinalTotal}
                  </span>
                </div>
              </div>

              {/* Savings Banner */}
              {cartTotalDiscount > 0 && (
                <div className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center text-xs font-bold text-emerald-800">
                  🎉 You are saving ₹{cartTotalDiscount} on this order!
                </div>
              )}

              {/* Checkout Button */}
              <button
                id="btn-proceed-checkout"
                onClick={handleProceedToCheckout}
                className="w-full mt-4 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* COD Assurance Card */}
            <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200/80 flex items-center gap-3 text-xs text-neutral-600">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <strong className="text-neutral-800">Cash on Delivery Available</strong>
                <p className="text-[11px] text-neutral-500">Pay cash or UPI on your doorstep after checking goods.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
