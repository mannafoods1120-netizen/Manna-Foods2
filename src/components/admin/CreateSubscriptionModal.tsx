import React, { useState } from 'react';
import { X, Gift, Check, ShieldCheck, Sparkles, AlertCircle, Info } from 'lucide-react';
import { MealDietType, LongTermCashbackPlan } from '../../types/index.ts';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    planTypeChoice: 'lt-90' | 'lt-180' | 'lt-270' | 'lt-360' | 'regular-30' | 'regular-6';
    planName: string;
    mealsTotal: number;
    mealType: MealDietType | 'both';
    startDate: string;
    deliverySlot: string;
    deliveryFrequency: string;
    addressLine: string;
    area: string;
    city: string;
    pincode: string;
    isLongTerm: boolean;
    basePrice: number;
    cashbackAmount: number;
    totalAllowedPauseDays: number;
  };
  onChangePlanChoice: (choice: 'lt-90' | 'lt-180' | 'lt-270' | 'lt-360' | 'regular-30' | 'regular-6') => void;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onChangePlanChoice,
  setForm,
  submitting
}) => {
  if (!isOpen) return null;

  const effectiveValue = Math.max(0, form.basePrice - form.cashbackAmount);
  const perMeal = form.mealsTotal > 0 ? Math.round(effectiveValue / form.mealsTotal) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div>
            <h3 className="font-display font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-600" />
              <span>Onboard New Customer Subscription</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Create a long-term cashback or regular subscription with automatic pause allowance linking
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
          {/* Plan Choice Selector */}
          <div>
            <label className="font-bold text-stone-800 block mb-1.5 uppercase text-[10px] tracking-wider">
              Select Subscription Plan &amp; Offer Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* 90 Meals */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('lt-90')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'lt-90'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">90 Meals</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">₹1.4k CB</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹10,500 base</div>
                <div className="text-[10px] text-amber-800 font-bold mt-0.5">Eff: ₹9,100 (15d pause)</div>
              </button>

              {/* 180 Meals */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('lt-180')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'lt-180'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">180 Meals</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">₹3.0k CB</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹21,000 base</div>
                <div className="text-[10px] text-amber-800 font-bold mt-0.5">Eff: ₹18,000 (30d pause)</div>
              </button>

              {/* 270 Meals */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('lt-270')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'lt-270'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">270 Meals</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">₹4.5k CB</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹31,500 base</div>
                <div className="text-[10px] text-amber-800 font-bold mt-0.5">Eff: ₹27,000 (45d pause)</div>
              </button>

              {/* 360 Meals */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('lt-360')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'lt-360'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">360 Meals</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">₹6.0k CB</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹42,000 base</div>
                <div className="text-[10px] text-amber-800 font-bold mt-0.5">Eff: ₹36,000 (60d pause)</div>
              </button>

              {/* 30 Meals Regular */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('regular-30')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'regular-30'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">30 Monthly</span>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-200 px-1 rounded">Regular</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹4,200 base</div>
                <div className="text-[10px] text-blue-800 font-bold mt-0.5">7d pause · 1 Month</div>
              </button>

              {/* 6 Meals Weekly */}
              <button
                type="button"
                onClick={() => onChangePlanChoice('regular-6')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.planTypeChoice === 'regular-6'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-400/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 text-xs">6 Weekly</span>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-200 px-1 rounded">Trial</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 font-mono">₹870 base</div>
                <div className="text-[10px] text-blue-800 font-bold mt-0.5">2d pause · 1 Week</div>
              </button>
            </div>
          </div>

          {/* Linked Cashback & Value Summary Banner */}
          <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-900 block">{form.planName}</span>
              <span className="text-[11px] text-stone-600">
                Base: ₹{form.basePrice.toLocaleString('en-IN')} {form.cashbackAmount > 0 && `− Cashback: ₹${form.cashbackAmount.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-amber-900 font-display block">
                Effective: ₹{effectiveValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                ~₹{perMeal}/meal · {form.totalAllowedPauseDays} Days Allowed Pause
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Customer Mobile Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="e.g. +91 9890123456"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Subscription Start Date & Delivery Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Subscription Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Delivery Slot
              </label>
              <select
                value={form.deliverySlot}
                onChange={(e) => setForm({ ...form, deliverySlot: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
              >
                <option value="12:30 PM - 02:00 PM">Lunch (12:30 PM - 02:00 PM)</option>
                <option value="07:30 PM - 09:00 PM">Dinner (07:30 PM - 09:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Delivery Address & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">
                Address Line / Landmark
              </label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                placeholder="Flat / Building / Landmark"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Delivery Locality
              </label>
              <select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
              >
                <option value="Kondhwa">Kondhwa</option>
                <option value="NIBM">NIBM</option>
                <option value="Undri">Undri</option>
                <option value="Pisoli">Pisoli</option>
                <option value="Tilekar Nagar">Tilekar Nagar</option>
                <option value="Salunke Vihar">Salunke Vihar</option>
                <option value="Mohammad Wadi Road">Mohammad Wadi Road</option>
                <option value="Wakad">Wakad</option>
                <option value="Hinjawadi">Hinjawadi</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full audit history logged</span>
            </div>

            <div className="flex items-center gap-2">
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
                {submitting ? 'Creating Subscription...' : 'Confirm & Activate Subscription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
