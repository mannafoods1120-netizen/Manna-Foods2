import React from 'react';
import { X, Edit3, Check } from 'lucide-react';
import { CustomerSubscription } from '../../types/index.ts';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  subscription: CustomerSubscription | null;
  form: {
    customerName: string;
    customerPhone: string;
    mealsTotal: number;
    mealsUsed: number;
    status: any;
    deliverySlot: string;
    deliveryFrequency: string;
    endDate: string;
    addressLine: string;
    area: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
}

export const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subscription,
  form,
  setForm,
  submitting
}) => {
  if (!isOpen || !subscription) return null;

  const mealsRemaining = Math.max(0, form.mealsTotal - form.mealsUsed);
  const completionPct = form.mealsTotal > 0 ? Math.round((form.mealsUsed / form.mealsTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-stone-900">
              Edit Subscription #{subscription.subscriptionNumber}
            </h3>
            <p className="text-[11px] text-stone-500">
              Update subscriber details, quota consumption, and delivery schedule
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Mobile Phone *</label>
              <input
                type="text"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Meals quota adjustment */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Total Contracted Meals *</label>
              <input
                type="number"
                required
                min="1"
                value={form.mealsTotal}
                onChange={(e) => setForm({ ...form, mealsTotal: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Meals Delivered / Consumed *</label>
              <input
                type="number"
                required
                min="0"
                max={form.mealsTotal}
                value={form.mealsUsed}
                onChange={(e) => setForm({ ...form, mealsUsed: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold text-emerald-700"
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
              <span className="text-stone-600">Calculated Remaining: <strong>{mealsRemaining} meals</strong></span>
              <span className="text-stone-600">Completion: <strong>{completionPct}%</strong></span>
            </div>
          </div>

          {/* Subscription Status & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Subscription Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Validity / End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Delivery Slot & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Delivery Slot</label>
              <select
                value={form.deliverySlot}
                onChange={(e) => setForm({ ...form, deliverySlot: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
              >
                <option value="12:30 PM - 02:00 PM">Lunch (12:30 PM - 02:00 PM)</option>
                <option value="07:30 PM - 09:00 PM">Dinner (07:30 PM - 09:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Area / Locality</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Address Line */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Delivery Address</label>
            <input
              type="text"
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {submitting ? 'Saving...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
