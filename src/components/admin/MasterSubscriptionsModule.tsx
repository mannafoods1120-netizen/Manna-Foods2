import React, { useState } from 'react';
import { 
  CalendarRange, 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Check, 
  Phone, 
  PauseCircle, 
  Sparkles, 
  Gift,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  RotateCcw
} from 'lucide-react';
import { CustomerSubscription, CustomerPauseRecord } from '../../types/index.ts';

interface MasterSubscriptionsModuleProps {
  subscriptions: CustomerSubscription[];
  customerPauses: CustomerPauseRecord[];
  onOpenCreateSubscription: () => void;
  onOpenEditSubscription: (sub: CustomerSubscription) => void;
  onOpenAddPause: (sub: CustomerSubscription) => void;
  onOpenEarlyCancellation?: (sub: CustomerSubscription) => void;
  onRecordMealDelivery: (subId: string, count?: number) => void;
  onToggleStatus: (sub: CustomerSubscription) => void;
}

export const MasterSubscriptionsModule: React.FC<MasterSubscriptionsModuleProps> = ({
  subscriptions,
  customerPauses,
  onOpenCreateSubscription,
  onOpenEditSubscription,
  onOpenAddPause,
  onOpenEarlyCancellation,
  onRecordMealDelivery,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'cancelled'>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'long_term' | 'regular'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Map active pauses today
  const activePauseSubIds = new Set(
    customerPauses
      .filter(p => p.status === 'active' && todayStr >= p.pauseStartDate && todayStr <= p.pauseEndDate)
      .map(p => p.subscriptionId)
  );

  // Filter subscriptions
  const filtered = subscriptions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) {
      return false;
    }
    if (planTypeFilter === 'long_term' && !s.isLongTerm) {
      return false;
    }
    if (planTypeFilter === 'regular' && s.isLongTerm) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.includes(q) ||
        s.subscriptionNumber.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q) ||
        s.deliveryAddress?.area?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-amber-600" />
            <h2 className="font-display font-extrabold text-xl text-stone-900">
              Master Customer Subscriptions &amp; Operations
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Central repository linking customer subscriptions, meal quota utilization, travel pause allowances, and validity extensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateSubscription}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, subscription #, plan, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs font-medium"
          >
            <option value="all">All Statuses ({subscriptions.length})</option>
            <option value="active">Active Only ({subscriptions.filter(s => s.status === 'active').length})</option>
            <option value="paused">Paused ({subscriptions.filter(s => s.status === 'paused').length})</option>
            <option value="completed">Completed ({subscriptions.filter(s => s.status === 'completed').length})</option>
            <option value="cancelled">Cancelled ({subscriptions.filter(s => s.status === 'cancelled').length})</option>
          </select>

          <select
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs font-medium"
          >
            <option value="all">All Plans ({subscriptions.length})</option>
            <option value="long_term">🌟 Long-Term Cashback Offers ({subscriptions.filter(s => s.isLongTerm).length})</option>
            <option value="regular">Standard Monthly / Weekly ({subscriptions.filter(s => !s.isLongTerm).length})</option>
          </select>
        </div>
      </div>

      {/* Master Subscriptions Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs min-w-[1150px]">
          <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Customer Details</th>
              <th className="p-3">Subscription Plan</th>
              <th className="p-3">Start &amp; Validity Date</th>
              <th className="p-3 min-w-[150px]">Meal Utilization</th>
              <th className="p-3 min-w-[170px]">Pause Tracking Integration</th>
              <th className="p-3">Plan Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-stone-500">
                  <CalendarRange className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">No subscriptions found</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Try adjusting your search criteria or create a new subscription above.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const mealsUsed = sub.mealsUsed || 0;
                const mealsTotal = sub.mealsTotal || 30;
                const mealsRemaining = Math.max(0, mealsTotal - mealsUsed);
                const completionPct = Math.min(100, Math.round((mealsUsed / mealsTotal) * 1000) / 10);
                
                const totalAllowedPause = sub.totalAllowedPauseDays || (sub.isLongTerm ? (mealsTotal >= 360 ? 60 : mealsTotal >= 270 ? 45 : mealsTotal >= 180 ? 30 : 15) : 7);
                const pauseUsed = sub.totalPauseDaysUsed || 0;
                const pauseRemaining = Math.max(0, totalAllowedPause - pauseUsed);
                
                const isPausedToday = activePauseSubIds.has(sub.id) || sub.currentPauseStatus === 'active';
                const hasExceeded = sub.currentPauseStatus === 'exceeded_limit';

                return (
                  <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Customer Details */}
                    <td className="p-3 align-top font-semibold text-stone-900">
                      <div>{sub.customerName}</div>
                      <div className="text-[11px] text-stone-500 font-normal flex items-center gap-1.5 mt-0.5">
                        <span>{sub.customerPhone}</span>
                        <a
                          href={`https://wa.me/${sub.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp Customer"
                        >
                          <Phone className="w-3 h-3 inline" />
                        </a>
                      </div>
                      <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                        #{sub.subscriptionNumber}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        📍 {sub.deliveryAddress?.area || 'Pune'}
                      </div>
                    </td>

                    {/* Subscription Plan */}
                    <td className="p-3 align-top">
                      <div className="font-semibold text-stone-900">{sub.planName}</div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {sub.mealType === 'veg' ? '🌿 Pure Veg' : sub.mealType}
                        </span>
                        {sub.isLongTerm && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Cashback ₹{sub.cashbackAmount || 0}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-stone-600 mt-1">
                        Effective: <strong>₹{sub.effectiveValue || sub.finalPaid}</strong>
                      </div>
                    </td>

                    {/* Start & Validity Date */}
                    <td className="p-3 align-top font-mono text-xs">
                      <div className="text-stone-800 font-medium">
                        {sub.startDate} <span className="text-stone-400">→</span>
                      </div>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {sub.extendedEndDate || sub.endDate}
                      </div>
                      {sub.extendedEndDate && sub.originalEndDate && sub.extendedEndDate !== sub.originalEndDate && (
                        <div className="text-[10px] text-emerald-700 font-sans mt-0.5">
                          ✓ Extended for pauses
                        </div>
                      )}
                      <div className="text-[10px] text-stone-400 font-sans mt-0.5">
                        ⏰ {sub.deliverySlot || 'Standard Slot'}
                      </div>
                    </td>

                    {/* Meal Utilization: Delivered, Remaining, Progress Bar */}
                    <td className="p-3 align-top">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-800 mb-1">
                        <span>{mealsUsed} / {mealsTotal} Used</span>
                        <span className="font-bold">{completionPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            completionPct >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-stone-800 mt-1">
                        <strong className="text-amber-900">{mealsRemaining}</strong> meals remaining
                      </div>
                    </td>

                    {/* Pause Tracking Integration */}
                    <td className="p-3 align-top bg-stone-50/50">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Allowed:</span>
                          <strong className="font-bold text-stone-800">{totalAllowedPause} days</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Used:</span>
                          <span className="font-bold text-stone-700">{pauseUsed} days</span>
                        </div>
                        <div className="flex items-center justify-between pb-1 border-b border-stone-200/60">
                          <span className="text-stone-500">Available:</span>
                          <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            hasExceeded ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {pauseRemaining} days
                          </span>
                        </div>

                        {/* Current Pause Status */}
                        <div className="pt-0.5">
                          {hasExceeded ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Exceeded Limit
                            </span>
                          ) : isPausedToday ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 w-fit">
                              <PauseCircle className="w-3 h-3" />
                              Active Pause
                            </span>
                          ) : pauseUsed > 0 ? (
                            <span className="text-[10px] text-stone-500 font-medium">
                              Past pause completed
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">
                              No pauses used
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan Status */}
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sub.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : sub.status === 'paused'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : sub.status === 'completed'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {sub.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 align-top text-right space-y-1">
                      {sub.status === 'active' && mealsRemaining > 0 && (
                        <button
                          type="button"
                          onClick={() => onRecordMealDelivery(sub.id, 1)}
                          className="w-full px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Record that today's meal was delivered"
                        >
                          <Check className="w-3 h-3" />
                          <span>+1 Delivered</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenAddPause(sub)}
                        className="w-full px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PauseCircle className="w-3 h-3 text-amber-700" />
                        <span>Add Pause</span>
                      </button>

                      {onOpenEarlyCancellation && (sub.status === 'active' || sub.status === 'paused') && (
                        <button
                          type="button"
                          onClick={() => onOpenEarlyCancellation(sub)}
                          className="w-full px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Process early cancellation and refund"
                        >
                          <RotateCcw className="w-3 h-3 text-rose-600" />
                          <span>Early Cancel</span>
                        </button>
                      )}

                      {sub.status === 'cancelled' && sub.cancellationDetails && (
                        <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-left space-y-0.5 mt-1">
                          <div className="font-bold text-rose-900 flex justify-between">
                            <span>Refund:</span>
                            <span className="font-mono">₹{sub.cancellationDetails.netRefundPayable?.toFixed(2)}</span>
                          </div>
                          <div className="text-stone-500 flex justify-between">
                            <span>Deductions:</span>
                            <span className="font-mono">₹{sub.cancellationDetails.totalDeductions?.toFixed(2)}</span>
                          </div>
                          <span className={`inline-block px-1 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            sub.cancellationDetails.statusFlag === 'Refund Due'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {sub.cancellationDetails.statusFlag}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditSubscription(sub)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                          title="Edit Subscription Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {sub.status !== 'completed' && sub.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(sub)}
                            className="text-[10px] text-stone-500 hover:text-stone-800 font-semibold"
                          >
                            {sub.status === 'active' ? 'Hold' : 'Resume'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
