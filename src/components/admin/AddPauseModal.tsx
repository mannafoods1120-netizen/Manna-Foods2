import React, { useMemo } from 'react';
import { X, PauseCircle, AlertTriangle, CheckCircle2, Clock, Calendar, Info } from 'lucide-react';
import { CustomerSubscription, NoticeCompliance } from '../../types/index.ts';

interface AddPauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  subscriptions: CustomerSubscription[];
  selectedSub: CustomerSubscription | null;
  form: {
    subscriptionId: string;
    pauseStartDate: string;
    pauseEndDate: string;
    noticeCompliance: NoticeCompliance;
    notes: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
}

export const AddPauseModal: React.FC<AddPauseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subscriptions,
  selectedSub,
  form,
  setForm,
  submitting
}) => {
  if (!isOpen) return null;

  // Active target subscription
  const currentSub = subscriptions.find(s => s.id === form.subscriptionId) || selectedSub || subscriptions[0];

  // Dynamic calculations
  const { daysPaused, remainingPauseDays, isExceeded, autoCompliance } = useMemo(() => {
    if (!form.pauseStartDate || !form.pauseEndDate) {
      return { daysPaused: 0, remainingPauseDays: 0, isExceeded: false, autoCompliance: 'on_time' as NoticeCompliance };
    }

    const start = new Date(form.pauseStartDate + 'T00:00:00');
    const end = new Date(form.pauseEndDate + 'T00:00:00');
    
    // Days Paused = End Date - Start Date + 1
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const calculatedDays = diff >= 0 ? diff + 1 : 0;

    const totalAllowed = currentSub?.totalAllowedPauseDays || (currentSub?.isLongTerm ? 15 : 7);
    const totalUsed = currentSub?.totalPauseDaysUsed || 0;
    const availableBeforeThis = Math.max(0, totalAllowed - totalUsed);

    const exceeded = calculatedDays > availableBeforeThis;
    const remainingAfter = Math.max(0, availableBeforeThis - calculatedDays);

    // Notice compliance: before 8:00 PM previous day
    const now = new Date();
    const prevDay = new Date(start);
    prevDay.setDate(prevDay.getDate() - 1);
    const cutoff = new Date(prevDay.toISOString().split('T')[0] + 'T20:00:00');
    const compliance: NoticeCompliance = now <= cutoff ? 'on_time' : 'late';

    return {
      daysPaused: calculatedDays,
      remainingPauseDays: remainingAfter,
      isExceeded: exceeded,
      autoCompliance: compliance
    };
  }, [form.pauseStartDate, form.pauseEndDate, currentSub]);

  const totalAllowed = currentSub?.totalAllowedPauseDays || (currentSub?.isLongTerm ? 15 : 7);
  const totalUsed = currentSub?.totalPauseDaysUsed || 0;
  const currentAvailable = Math.max(0, totalAllowed - totalUsed);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-display font-extrabold text-base text-stone-900">
              Register Customer Meal Pause
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Subscription Selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Select Customer Subscription *
            </label>
            <select
              value={form.subscriptionId}
              onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold"
            >
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.subscriptionNumber} — {s.customerName} ({s.planName}, {s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Current Allowance Overview Box */}
          {currentSub && (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600">Customer Plan:</span>
                <span className="font-bold text-stone-900">{currentSub.planName} ({currentSub.mealsTotal} Meals)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-stone-200 text-center">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Total Allowed</span>
                  <span className="text-xs font-bold text-stone-800">{totalAllowed} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Used So Far</span>
                  <span className="text-xs font-bold text-stone-800">{totalUsed} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Current Balance</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {currentAvailable} Days Left
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pause Dates: Start and End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Pause Start Date *
              </label>
              <input
                type="date"
                required
                value={form.pauseStartDate}
                onChange={(e) => setForm({ ...form, pauseStartDate: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Pause End Date *
              </label>
              <input
                type="date"
                required
                value={form.pauseEndDate}
                onChange={(e) => setForm({ ...form, pauseEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Live Dynamic Calculations & Warning Banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-700">Days Paused:</span>
              <strong className="font-mono font-bold text-amber-950 text-sm">
                {daysPaused} Day(s)
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs pb-1 border-b border-amber-200/60">
              <span className="font-medium text-stone-700">Allowance Balance After:</span>
              <strong className={`font-mono font-bold ${isExceeded ? 'text-red-700' : 'text-emerald-700'}`}>
                {remainingPauseDays} Day(s) remaining
              </strong>
            </div>
            <p className="text-[10px] text-stone-500 font-mono">
              Formula: Days Paused = End Date − Start Date + 1
            </p>
          </div>

          {/* Over-Limit Alert if Exceeded */}
          {isExceeded && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">⚠️ Warning: Exceeds Available Allowance!</strong>
                <span className="text-[11px] text-red-800 leading-relaxed block mt-0.5">
                  Requested {daysPaused} days, but customer has only {currentAvailable} day(s) remaining. 
                  This record will be registered with <strong>Exceeded Limit</strong> status and flagged in the tracker.
                </span>
              </div>
            </div>
          )}

          {/* Notice Compliance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700 block">
                Notice Compliance Status
              </label>
              <span className="text-[10px] text-stone-400">
                Deadline: Before 8:00 PM previous day
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                form.noticeCompliance === 'on_time'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}>
                <input
                  type="radio"
                  name="compliance"
                  checked={form.noticeCompliance === 'on_time'}
                  onChange={() => setForm({ ...form, noticeCompliance: 'on_time' })}
                  className="hidden"
                />
                <span>✓ On Time</span>
              </label>

              <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                form.noticeCompliance === 'late'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}>
                <input
                  type="radio"
                  name="compliance"
                  checked={form.noticeCompliance === 'late'}
                  onChange={() => setForm({ ...form, noticeCompliance: 'late' })}
                  className="hidden"
                />
                <span>⏰ Late Notice</span>
              </label>

              <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                form.noticeCompliance === 'not_provided'
                  ? 'border-stone-500 bg-stone-100 text-stone-900 font-bold'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}>
                <input
                  type="radio"
                  name="compliance"
                  checked={form.noticeCompliance === 'not_provided'}
                  onChange={() => setForm({ ...form, noticeCompliance: 'not_provided' })}
                  className="hidden"
                />
                <span>✕ Not Provided</span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Admin Notes &amp; Circumstances
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Travelling to Bangalore for conference. Special emergency approval granted."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              Validity extension will update automatically
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
                disabled={submitting || daysPaused <= 0}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                {submitting ? 'Registering...' : 'Approve & Save Pause'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
