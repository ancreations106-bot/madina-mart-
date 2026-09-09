import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Calendar,
  Sparkles
} from 'lucide-react';

export const OrderConfirmationScreen: React.FC = () => {
  const {
    recentPlacedOrder,
    setRecentPlacedOrder,
    setActiveTab,
    setTrackingOrderId
  } = useStore();

  if (!recentPlacedOrder) return null;

  const handleTrackOrder = () => {
    setTrackingOrderId(recentPlacedOrder.id);
    setActiveTab('orders');
    setRecentPlacedOrder(null);
  };

  const handleContinueShopping = () => {
    setRecentPlacedOrder(null);
    setActiveTab('home');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="order-placed-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200"
      >
        {/* Success Header with confetti aesthetic */}
        <div className="bg-gradient-to-b from-emerald-800 to-emerald-700 text-white p-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-700 mx-auto mb-3 shadow-lg shadow-emerald-950/30">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <span className="inline-flex items-center gap-1 bg-white/20 text-emerald-100 text-[11px] font-bold px-3 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Order Confirmed</span>
          </span>
          <h2 className="text-2xl font-black font-['Outfit',sans-serif]">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            Thank you for shopping locally with Madina Mart. Your items are being prepared for dispatch.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Order ID & Timing Info */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-bold">Order ID</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                {recentPlacedOrder.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase font-bold">Estimated Delivery</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1 justify-end">
                <Truck className="w-3.5 h-3.5" />
                <span>{recentPlacedOrder.estimatedDelivery}</span>
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="font-bold text-neutral-900 block">Payment: Cash on Delivery</span>
                <span className="text-[11px] text-emerald-800">Pay cash or UPI to delivery agent</span>
              </div>
            </div>
            <span className="text-base font-black font-['Outfit',sans-serif] text-neutral-950">
              ₹{recentPlacedOrder.totalAmount}
            </span>
          </div>

          {/* Delivery Address */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-neutral-700">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Delivering To:</span>
              </div>
              {recentPlacedOrder.locationShared ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  📍 Live GPS Attached
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                  Manual Address
                </span>
              )}
            </div>
            <p className="text-neutral-700 font-medium">
              <strong>{recentPlacedOrder.customerName || recentPlacedOrder.deliveryAddress.name}</strong> • 📞 +91 {recentPlacedOrder.contactNumber || recentPlacedOrder.customerMobile || recentPlacedOrder.deliveryAddress.mobile}
            </p>
            <p className="text-neutral-600">
              {recentPlacedOrder.fullAddress || `${recentPlacedOrder.deliveryAddress.houseFlat}, ${recentPlacedOrder.deliveryAddress.streetArea}, ${recentPlacedOrder.deliveryAddress.city} - ${recentPlacedOrder.deliveryAddress.pincode}`}
            </p>
            {(recentPlacedOrder.landmark || recentPlacedOrder.deliveryAddress.landmark) && (
              <p className="text-neutral-500 text-[11px]">
                <strong className="text-neutral-700">Landmark:</strong> {recentPlacedOrder.landmark || recentPlacedOrder.deliveryAddress.landmark}
              </p>
            )}
            {recentPlacedOrder.locationShared && recentPlacedOrder.latitude && recentPlacedOrder.longitude && (
              <p className="text-[10px] font-mono text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                GPS: {recentPlacedOrder.latitude.toFixed(5)}, {recentPlacedOrder.longitude.toFixed(5)} {recentPlacedOrder.locationAccuracy ? `(±${recentPlacedOrder.locationAccuracy}m)` : ''}
              </p>
            )}
          </div>

          {/* Ordered Products list */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Items Ordered ({recentPlacedOrder.items.length})
            </span>
            <div className="space-y-2">
              {recentPlacedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                  <div className="flex items-center gap-2 min-w-0 max-w-[75%]">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-neutral-900 truncate">{item.productName}</div>
                      <div className="text-[11px] text-neutral-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            id="btn-track-order-modal"
            onClick={handleTrackOrder}
            className="w-full sm:flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </button>
          <button
            id="btn-continue-shopping-modal"
            onClick={handleContinueShopping}
            className="w-full sm:flex-1 py-3 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-2xl border border-neutral-300 transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
