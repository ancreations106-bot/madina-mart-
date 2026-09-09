import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  Truck,
  RotateCcw,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  AlertCircle,
  MapPin
} from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const {
    customerOrders,
    currentUser,
    setIsAuthModalOpen,
    setAuthIntent,
    setActiveTab,
    setTrackingOrderId,
    reorderItems
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  if (!currentUser) {
    return (
      <div id="my-orders-screen-unauth" className="max-w-md mx-auto px-4 py-16 pb-28 text-center">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Customer Login Required
            </h2>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              Your order history is private and protected. Please sign in to your Madina Mart account to view your past and active orders.
            </p>
          </div>
          <button
            id="btn-orders-login-trigger"
            onClick={() => {
              setAuthIntent('orders');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Log In to View Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = customerOrders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return !['Delivered', 'Cancelled'].includes(order.status);
    }
    if (statusFilter === 'delivered') return order.status === 'Delivered';
    if (statusFilter === 'cancelled') return order.status === 'Cancelled';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Out for Delivery':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div id="my-orders-screen" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
            My Orders
          </h1>
          <p className="text-xs text-neutral-500">
            {currentUser?.mobile ? `+91 ${currentUser.mobile} • ` : ''}{customerOrders.length} total orders • Cash On Delivery
          </p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="text-xs text-emerald-700 font-bold hover:underline"
        >
          Shop More
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {[
          { id: 'all', label: `All Orders (${customerOrders.length})` },
          { id: 'active', label: 'Active Delivery' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden transition-all hover:border-emerald-500/40"
            >
              {/* Order Meta Bar */}
              <div className="bg-neutral-50/90 px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Order ID</span>
                    <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                  </div>
                  <div className="hidden sm:block border-l border-neutral-200 pl-3">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Date</span>
                    <span className="text-neutral-700">{order.orderDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0 max-w-[70%]">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-100 shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-neutral-900 truncate text-xs sm:text-sm">
                          {item.productName}
                        </h4>
                        <div className="text-neutral-500 text-[11px]">
                          Qty: {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-950 font-['Outfit',sans-serif] text-xs sm:text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Details & Location */}
              <div className="px-4 py-2.5 bg-neutral-50/70 border-t border-neutral-100 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">
                    {order.fullAddress || `${order.deliveryAddress?.houseFlat}, ${order.deliveryAddress?.streetArea}`}
                  </span>
                  {(order.landmark || order.deliveryAddress?.landmark) && (
                    <span className="text-[11px] text-neutral-400 hidden sm:inline">
                      • Near: {order.landmark || order.deliveryAddress?.landmark}
                    </span>
                  )}
                </div>
                {order.locationShared ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                    📍 Live GPS Shared
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Manual Address
                  </span>
                )}
              </div>

              {/* Order Footer & Actions */}
              <div className="px-4 py-3 bg-neutral-50/50 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Amount</span>
                    <span className="font-black text-sm sm:text-base text-neutral-950 font-['Outfit',sans-serif]">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                  <div className="border-l border-neutral-200 pl-3 hidden sm:block">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Payment</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{order.paymentMethod}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => reorderItems(order)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Reorder</span>
                    </button>
                  )}
                  <button
                    id={`btn-track-order-${order.id}`}
                    onClick={() => setTrackingOrderId(order.id)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-neutral-900 text-base mb-1">No orders found</h3>
          <p className="text-xs text-neutral-500 mb-5">
            {statusFilter === 'all'
              ? "You haven't placed any orders with Madina Mart yet."
              : `No orders found in "${statusFilter}" category.`}
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
          >
            Start Shopping Today
          </button>
        </div>
      )}
    </div>
  );
};
