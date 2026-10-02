import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  RotateCcw,
  Info,
  Calendar,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { CustomerSubscription, SubscriptionCancellationRecord } from '../../types/index.ts';

interface EarlyCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: CustomerSubscription | null;
  onConfirmCancellation: (
    subscriptionId: string, 
    mealsConsumed: number, 
    reason: string, 
    notes?: string
  ) => Promise<void>;
}

export const EarlyCancellationModal: React.FC<EarlyCancellationModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onConfirmCancellation
}) => {
  const [mealsConsumed, setMealsConsumed] = useState<number>(0);
  const [reason, setReason] = useState('Customer relocated / requested early exit');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Policy Constants
  const STANDARD_MEAL_RATE = 123.08;
  const ADMIN_FEE = 500.00;

  useEffect(() => {
    if (subscription) {
      setMealsConsumed(subscription.mealsUsed || 0);
      setReason('Customer relocated / requested early exit');
      setNotes('');
      setError(null);
    }
  }, [subscription, isOpen]);

  if (!isOpen || !subscription) return null;

  const upfrontPaid = Number(subscription.finalPaid) || Number(subscription.basePrice) || (subscription.mealsTotal * STANDARD_MEAL_RATE);
  const cashbackDisbursed = Number(subscription.cashbackAmount) || 0;

  // Formula Calculations:
  // Consumed Meal Charges: =Meals Consumed * ₹123.08
  const consumedCharges = Math.round(mealsConsumed * STANDARD_MEAL_RATE * 100) / 100;
  // Total Deductions: =Consumed Charges + Cashback Disbursed + Admin Fee
  const totalDeductions = Math.round((consumedCharges + cashbackDisbursed + ADMIN_FEE) * 100) / 100;
  // Net Refund Payable: =MAX(0, Upfront Paid - Total Deductions)
  const netRefundPayable = Math.max(0, Math.round((upfrontPaid - totalDeductions) * 100) / 100);
  // Status Flag: Automatically indicates "Refund Due" or "No Refund / Deficit Absorbed"
  const statusFlag = netRefundPayable > 0 ? 'Refund Due' : 'No Refund / Deficit Absorbed';
  const deficitAbsorbed = totalDeductions > upfrontPaid ? Math.round((totalDeductions - upfrontPaid) * 100) / 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mealsConsumed < 0 || mealsConsumed > subscription.mealsTotal) {
      setError(`Meals consumed must be between 0 and total contracted meals (${subscription.mealsTotal}).`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirmCancellation(subscription.id, mealsConsumed, reason, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process cancellation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Early Cancellation &amp; Refund Engine
              </span>
              <h3 className="font-display font-bold text-lg text-stone-900 mt-1">
                Process Subscription Early Cancellation
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
          
          {/* Subscription & Customer Reference Bar */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Customer</span>
              <strong className="text-stone-900 font-bold text-xs">{subscription.customerName}</strong>
              <span className="text-[10px] text-stone-500 block">{subscription.customerPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Subscription #</span>
              <strong className="text-stone-900 font-mono font-bold text-xs">{subscription.subscriptionNumber}</strong>
              <span className="text-[10px] text-stone-500 block">{subscription.planName}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Contracted Meals</span>
              <strong className="text-stone-900 font-bold text-xs">{subscription.mealsTotal} Meals</strong>
              <span className="text-[10px] text-emerald-700 font-semibold block">{subscription.mealsUsed} Delivered so far</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Upfront Paid</span>
              <strong className="text-amber-900 font-mono font-bold text-sm">₹{upfrontPaid.toLocaleString('en-IN')}</strong>
              {cashbackDisbursed > 0 && (
                <span className="text-[10px] text-emerald-700 font-semibold block">₹{cashbackDisbursed} Cashback disbursed</span>
              )}
            </div>
          </div>

          {/* Policy Parameters Notice */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] block">
                Standard Cancellation Policy Parameters:
              </span>
              <div className="text-[11px] text-amber-900 flex flex-wrap gap-x-4 gap-y-1">
                <span>• Standard Non-Discounted Meal Rate: <strong>₹{STANDARD_MEAL_RATE.toFixed(2)}</strong></span>
                <span>• Flat Administrative Processing Fee: <strong>₹{ADMIN_FEE.toFixed(2)}</strong></span>
                <span>• Zero Negative Balance: <strong>100% Protected (Customer never owes deficit)</strong></span>
              </div>
            </div>
          </div>

          {/* Meals Consumed Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-900 flex items-center justify-between">
              <span>Actual Meals Consumed by Customer:</span>
              <span className="text-[11px] text-stone-500 font-normal">
                Allowed: 0 to {subscription.mealsTotal} meals
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={subscription.mealsTotal}
                step={1}
                value={mealsConsumed}
                onChange={(e) => setMealsConsumed(Math.max(0, Math.min(subscription.mealsTotal, Number(e.target.value) || 0)))}
                className="w-32 px-3 py-2 border border-stone-300 rounded-lg text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                required
              />
              <span className="text-xs text-stone-500">
                out of <strong>{subscription.mealsTotal}</strong> total meals contracted.
              </span>
            </div>
          </div>

          {/* Automated Refund Calculation Table */}
          <div className="rounded-xl border border-stone-300 overflow-hidden shadow-xs">
            <div className="bg-stone-800 text-white px-4 py-2.5 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Automated Refund Calculation Table</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                statusFlag === 'Refund Due' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-amber-400 text-stone-900'
              }`}>
                {statusFlag}
              </span>
            </div>

            <div className="divide-y divide-stone-200 bg-white">
              {/* Upfront Paid */}
              <div className="px-4 py-2 flex items-center justify-between bg-stone-50/50">
                <span className="text-stone-600 font-medium">Upfront Amount Paid (A):</span>
                <span className="font-mono font-bold text-stone-900">
                  ₹{upfrontPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Consumed Meal Charges */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-700 font-semibold block">
                    Consumed Meal Charges (B):
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    = {mealsConsumed} meals × ₹{STANDARD_MEAL_RATE.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  ₹{consumedCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Cashback Disbursed */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-700 font-semibold block">
                    Cashback Disbursed (C):
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Guaranteed upfront cashback benefit reversal
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  ₹{cashbackDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Administrative Processing Fee */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-700 font-semibold block">
                    Flat Administrative Fee (D):
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Packaging, onboarding &amp; account reconciliation
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  ₹{ADMIN_FEE.toFixed(2)}
                </span>
              </div>

              {/* Total Deductions */}
              <div className="px-4 py-2.5 flex items-center justify-between bg-rose-50/60 text-rose-950 font-bold">
                <div>
                  <span>Total Deductions (E = B + C + D):</span>
                  <span className="text-[10px] text-rose-700 font-normal block font-mono">
                    = ₹{consumedCharges.toFixed(2)} + ₹{cashbackDisbursed.toFixed(2)} + ₹{ADMIN_FEE.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono text-rose-800 text-sm">
                  ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Net Refund Payable */}
              <div className={`px-4 py-3.5 flex items-center justify-between ${
                statusFlag === 'Refund Due' ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'
              }`}>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Net Refund Payable:
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    = MAX(0, Upfront Paid − Total Deductions)
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-display font-extrabold text-2xl tabular-nums ${
                    statusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-stone-900'
                  }`}>
                    ₹{netRefundPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`block text-[10px] font-bold uppercase mt-0.5 ${
                    statusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    Status: {statusFlag}
                  </span>
                </div>
              </div>
            </div>

            {/* Deficit Absorbed Callout if deductions exceed upfront paid */}
            {deficitAbsorbed > 0 && (
              <div className="p-3 bg-stone-900 text-stone-200 text-xs flex items-start gap-2 border-t border-stone-700">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block">Zero Negative Balance Guarantee:</strong>
                  <span>
                    Total deductions (₹{totalDeductions.toFixed(2)}) exceed the upfront balance by <strong>₹{deficitAbsorbed.toFixed(2)}</strong>. 
                    This deficit is 100% absorbed by Manna Foods. The subscriber owes ₹0.00.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cancellation Reason & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Cancellation Reason:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800"
              >
                <option value="Customer relocated / requested early exit">Customer relocated / requested early exit</option>
                <option value="Medical / dietary advice">Medical / dietary advice</option>
                <option value="Travel / prolonged absence from Pune">Travel / prolonged absence from Pune</option>
                <option value="Switched to office canteen">Switched to office canteen</option>
                <option value="Dissatisfaction with delivery slot / timing">Dissatisfaction with delivery slot / timing</option>
                <option value="Mutual administrative agreement">Mutual administrative agreement</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Admin Audit Notes (Optional):
              </label>
              <input
                type="text"
                placeholder="Bank refund reference # or customer confirmation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-800"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Immutable calculation audit trail generated upon confirmation</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Early Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
