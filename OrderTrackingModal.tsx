import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  AlertCircle,
  Phone,
  Banknote,
  RotateCcw
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const {
    trackingOrderId,
    setTrackingOrderId,
    customerOrders,
    cancelOrder,
    reorderItems,
    settings,
    showToast
  } = useStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');

  if (!trackingOrderId) return null;

  const order = customerOrders.find(o => o.id === trackingOrderId);
  if (!order) return null;

  const STATUS_STEPS: OrderStatus[] = [
    'Order Placed',
    'Order Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const isCancelled = order.status === 'Cancelled';
  const currentStepIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status);
  const canCancel = order.status === 'Order Placed' || order.status === 'Order Confirmed';

  const handleConfirmCancel = () => {
    cancelOrder(order.id, cancelReason);
    setShowCancelDialog(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="order-tracking-dialog"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block font-bold">
              Live Order Tracker
            </span>
            <h3 className="text-base font-bold font-['Outfit',sans-serif]">
              Order #{order.id}
            </h3>
          </div>
          <button
            onClick={() => setTrackingOrderId(null)}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Header Badge */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Current Status</span>
              <span
                className={`text-sm font-extrabold ${
                  order.status === 'Delivered'
                    ? 'text-emerald-700'
                    : order.status === 'Cancelled'
                    ? 'text-rose-600'
                    : 'text-amber-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Delivery Promise</span>
              <span className="font-bold text-neutral-800 flex items-center gap-1 justify-end">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{order.estimatedDelivery}</span>
              </span>
            </div>
          </div>

          {/* If Cancelled */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>This Order was Cancelled</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Reason: {order.cancelReason || 'Customer requested cancellation before dispatch.'}
              </p>
            </div>
          ) : (
            /* Visual Progress Stepper */
            <div className="space-y-4">
              <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                Shipment Milestones
              </h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  // Find matching timeline event if exists
                  const event = order.timeline.find(t => t.status === step);

                  return (
                    <div key={step} className="relative">
                      {/* Marker */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-neutral-300 text-transparent'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              isCurrent
                                ? 'text-emerald-800 text-sm'
                                : isDone
                                ? 'text-neutral-800'
                                : 'text-neutral-400'
                            }`}
                          >
                            {step}
                          </span>
                          {event && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {event.timestamp}
                            </span>
                          )}
                        </div>
                        {event?.note && (
                          <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Address & Contact */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Delivery Location</span>
            <div className="font-bold text-neutral-900">{order.deliveryAddress.name}</div>
            <p className="text-neutral-600 font-medium">
              {order.deliveryAddress.houseFlat}, {order.deliveryAddress.streetArea}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
            <p className="text-neutral-500">Contact: +91 {order.deliveryAddress.mobile}</p>
          </div>

          {/* Ordered Products summary */}
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-2">
              Items in this Package ({order.items.length})
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <div className="flex items-center gap-2 truncate max-w-[75%]">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-9 h-9 rounded-lg object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-neutral-900 truncate">{item.productName}</div>
                      <div className="text-[10px] text-neutral-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Total */}
          <div className="p-3 bg-neutral-100/70 rounded-2xl flex items-center justify-between font-bold">
            <span className="text-neutral-600">Total Paid / Due (Cash On Delivery):</span>
            <span className="text-sm font-extrabold text-neutral-950 font-['Outfit',sans-serif]">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center gap-2.5">
          {canCancel && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex-1 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
            >
              Cancel Order
            </button>
          )}

          {order.status === 'Delivered' && (
            <button
              onClick={() => {
                reorderItems(order);
                setTrackingOrderId(null);
              }}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reorder All Items</span>
            </button>
          )}

          <button
            onClick={() => setTrackingOrderId(null)}
            className="flex-1 py-2.5 bg-white text-neutral-700 hover:bg-neutral-100 font-bold text-xs rounded-xl border border-neutral-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Prompt */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h4 className="font-bold text-neutral-900 text-sm mb-2">Cancel Order #{order.id}?</h4>
            <p className="text-xs text-neutral-500 mb-3">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none"
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Changed delivery address">Changed delivery address</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
