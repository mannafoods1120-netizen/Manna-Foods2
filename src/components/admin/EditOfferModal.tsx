import React from 'react';
import { X, Gift, Check, Info } from 'lucide-react';
import { LongTermCashbackPlan } from '../../types/index.ts';

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  offer: LongTermCashbackPlan | null;
  form: {
    basePrice: number;
    cashbackAmount: number;
    maxPauseDays: number;
    maxValidityText: string;
    description: string;
    featuresText: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
}

export const EditOfferModal: React.FC<EditOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offer,
  form,
  setForm,
  submitting
}) => {
  if (!isOpen || !offer) return null;

  const effectiveValue = Math.max(0, Number(form.basePrice) - Number(form.cashbackAmount));
  const perMeal = offer.mealsCount > 0 ? Math.round(effectiveValue / offer.mealsCount) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            <h3 className="font-display font-extrabold text-base text-stone-900">
              Configure Long-Term Cashback Offer: {offer.name}
            </h3>
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
          {/* Base Price & Cashback Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Standard Base Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Guaranteed Cashback (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.cashbackAmount}
                onChange={(e) => setForm({ ...form, cashbackAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          {/* Automatic Effective Price Live Result */}
          <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block">
                Calculated Effective Value:
              </span>
              <span className="text-[11px] text-stone-600">
                Formula: ₹{form.basePrice} − ₹{form.cashbackAmount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-900 font-display tabular-nums">
                ₹{effectiveValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-500 block">
                ~₹{perMeal} per meal ({offer.mealsCount} meals)
              </span>
            </div>
          </div>

          {/* Pause Allowance & Validity Months */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Maximum Allowed Pause Days *
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={form.maxPauseDays}
                onChange={(e) => setForm({ ...form, maxPauseDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Default: {offer.mealsCount >= 360 ? 60 : offer.mealsCount >= 270 ? 45 : offer.mealsCount >= 180 ? 30 : 15} days
              </span>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Maximum Validity Text *
              </label>
              <input
                type="text"
                required
                value={form.maxValidityText}
                onChange={(e) => setForm({ ...form, maxValidityText: e.target.value })}
                placeholder="e.g. Up to 4.5 months"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Offer Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Features */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Inclusions &amp; Features (One per line)
            </label>
            <textarea
              rows={4}
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-[11px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              Syncs with customer storefront instantly
            </span>

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
                {submitting ? 'Updating...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
