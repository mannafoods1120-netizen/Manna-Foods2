import React from 'react';
import { CheckCircle2, MessageSquare, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Order, CustomerSubscription } from '../types/index.ts';
import { MannaLogo } from './MannaLogo.tsx';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  subscription?: CustomerSubscription | null;
  whatsAppResult?: { success: boolean; message: string; waLink: string } | null;
  onGoToOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  subscription,
  whatsAppResult,
  onGoToOrders
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-stone-200">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MannaLogo size={32} showText={false} dark={true} />
            <span className="font-display font-extrabold text-base tracking-wide text-emerald-100 uppercase">
              Manna Foods Pune
            </span>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            Order Confirmed &amp; Paid!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Thank you, {order.customerName}. Your meal is scheduled with Manna Foods Pune.
          </p>
          <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide">
            Order #{order.orderNumber}
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5 text-xs text-stone-700">
          {/* Subscription confirmation banner */}
          {subscription && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <div className="text-xl">🌟</div>
              <div>
                <strong className="text-amber-950 font-bold block">
                  Monthly Subscription Activated!
                </strong>
                <span className="text-amber-900">
                  Subscription #{subscription.subscriptionNumber} ({subscription.mealsTotal} Meals total). Starting {subscription.startDate}. You can manage pause dates anytime in your dashboard.
                </span>
              </div>
            </div>
          )}

          {/* Delivery & Time Details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Delivery Date</span>
                <span className="text-stone-600">{order.deliveryDate}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Delivery Window</span>
                <span className="text-stone-600">{order.deliverySlot}</span>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2 pt-2 border-t border-stone-200/60">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Delivering to</span>
                <span className="text-stone-600">
                  {order.deliveryAddress.addressLine}, {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="font-bold text-stone-900 mb-2">Order Summary</h4>
            <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl overflow-hidden">
              {order.items.map((it) => (
                <div key={it.id} className="p-3 flex justify-between items-center bg-white text-xs">
                  <div>
                    <span className="font-semibold text-stone-800">{it.name}</span>
                    <span className="text-stone-500 ml-1.5 font-medium">x {it.quantity}</span>
                  </div>
                  <span className="font-semibold text-stone-900 tabular-nums">₹{it.totalPrice}</span>
                </div>
              ))}
              <div className="p-3 bg-stone-50 flex justify-between font-bold text-stone-900">
                <span>Total Paid (Razorpay Verified):</span>
                <span className="tabular-nums text-amber-900 text-sm">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Notification Block */}
          {whatsAppResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>WhatsApp Order Confirmation Prepared</span>
                </div>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-medium">
                  Triggered
                </span>
              </div>
              <pre className="text-[11px] font-sans bg-white/90 p-3 rounded-lg border border-emerald-200/60 whitespace-pre-wrap text-stone-800 leading-relaxed max-h-32 overflow-y-auto">
                {whatsAppResult.message}
              </pre>
              {whatsAppResult.waLink && (
                <a
                  href={whatsAppResult.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Open Confirmation in WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToOrders();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            View in My Orders →
          </button>
        </div>
      </div>
    </div>
  );
};
