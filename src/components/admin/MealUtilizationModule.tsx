import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  TrendingUp, 
  Check, 
  Calendar, 
  Search, 
  PauseCircle, 
  ChefHat, 
  CheckCircle2, 
  Phone,
  ArrowRight,
  PieChart
} from 'lucide-react';
import { CustomerSubscription, CustomerPauseRecord } from '../../types/index.ts';

interface MealUtilizationModuleProps {
  subscriptions: CustomerSubscription[];
  customerPauses: CustomerPauseRecord[];
  onRecordMealDelivery: (subId: string, count?: number) => void;
  onOpenAddPause: (sub: CustomerSubscription) => void;
}

export const MealUtilizationModule: React.FC<MealUtilizationModuleProps> = ({
  subscriptions,
  customerPauses,
  onRecordMealDelivery,
  onOpenAddPause
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('active');
  const [todayDeliveryFilter, setTodayDeliveryFilter] = useState<'all' | 'delivering_today' | 'paused_today'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const totalContractedMeals = activeSubs.reduce((sum, s) => sum + (s.mealsTotal || 0), 0);
  const totalMealsDelivered = activeSubs.reduce((sum, s) => sum + (s.mealsUsed || 0), 0);
  const pipelineMealsRemaining = Math.max(0, totalContractedMeals - totalMealsDelivered);

  // Active pauses today
  const activePausesToday = customerPauses.filter(p => 
    p.status === 'active' && 
    todayStr >= p.pauseStartDate && 
    todayStr <= p.pauseEndDate
  );

  const activePauseSubIds = new Set(activePausesToday.map(p => p.subscriptionId));

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) {
      return false;
    }

    const isPausedToday = activePauseSubIds.has(sub.id) || sub.currentPauseStatus === 'active';
    if (todayDeliveryFilter === 'delivering_today' && isPausedToday) {
      return false;
    }
    if (todayDeliveryFilter === 'paused_today' && !isPausedToday) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        sub.customerName.toLowerCase().includes(q) ||
        sub.customerPhone.includes(q) ||
        sub.subscriptionNumber.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q) ||
        sub.deliveryAddress?.area?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-600" />
            <h2 className="font-display font-extrabold text-xl text-stone-900">
              Meal Utilization &amp; Kitchen Burn-Down
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time tracking of contracted meals, meals delivered to date, remaining quota pipeline, and single-click meal logging.
          </p>
        </div>

        {/* Quick Kitchen Action Banner */}
        <div className="p-2.5 px-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-950">
          <ChefHat className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold">Today's Kitchen Preparation:</span>
            <span className="text-[11px] text-amber-800 block">
              <strong>{Math.max(0, activeSubs.length - activePausesToday.length)} Meals</strong> to prepare today ({activePausesToday.length} active customer pauses)
            </span>
          </div>
        </div>
      </div>

      {/* Burn-Down Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
            Total Contracted Meals
          </span>
          <div className="text-2xl font-black text-stone-900 font-display mt-1 tabular-nums">
            {totalContractedMeals}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Across {activeSubs.length} active subscriber plans
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
            Meals Delivered to Date
          </span>
          <div className="text-2xl font-black text-emerald-800 font-display mt-1 tabular-nums">
            {totalMealsDelivered}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            {totalContractedMeals > 0 
              ? `${Math.round((totalMealsDelivered / totalContractedMeals) * 100)}% overall fulfilled`
              : '0% fulfilled'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-800 block">
            Pipeline Meals Remaining
          </span>
          <div className="text-2xl font-black text-purple-900 font-display mt-1 tabular-nums">
            {pipelineMealsRemaining}
          </div>
          <span className="text-[11px] text-purple-700 mt-1 block font-medium">
            Remaining kitchen commitments
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 block">
            Active Pauses Today
          </span>
          <div className="text-2xl font-black text-amber-950 font-display mt-1 tabular-nums">
            {activePausesToday.length}
          </div>
          <span className="text-[11px] text-amber-800 mt-1 block font-medium">
            Temporarily paused customers
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, phone, plan, or locality..."
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
            <option value="active">Active Plans Only ({subscriptions.filter(s => s.status === 'active').length})</option>
            <option value="all">All Subscriptions ({subscriptions.length})</option>
            <option value="completed">Completed Plans ({subscriptions.filter(s => s.status === 'completed').length})</option>
            <option value="paused">Manually Paused ({subscriptions.filter(s => s.status === 'paused').length})</option>
          </select>

          <select
            value={todayDeliveryFilter}
            onChange={(e) => setTodayDeliveryFilter(e.target.value as any)}
            className="px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs font-medium"
          >
            <option value="all">All Delivery Schedules</option>
            <option value="delivering_today">🟢 Delivering Today (Cook in Kitchen)</option>
            <option value="paused_today">⏸️ Paused Today (Skip Kitchen Prep)</option>
          </select>
        </div>
      </div>

      {/* Customer Meal Utilization Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Customer &amp; Subscription #</th>
              <th className="p-3">Plan Details</th>
              <th className="p-3">Meals Consumed / Total</th>
              <th className="p-3 min-w-[160px]">Plan Completion %</th>
              <th className="p-3 text-center">Meals Remaining</th>
              <th className="p-3">Today's Status</th>
              <th className="p-3 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filteredSubs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-stone-500">
                  <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">No subscriber meal records match filters</p>
                </td>
              </tr>
            ) : (
              filteredSubs.map((sub) => {
                const mealsUsed = sub.mealsUsed || 0;
                const mealsTotal = sub.mealsTotal || 30;
                const mealsRemaining = Math.max(0, mealsTotal - mealsUsed);
                const completionPct = Math.min(100, Math.round((mealsUsed / mealsTotal) * 1000) / 10);
                const isPausedToday = activePauseSubIds.has(sub.id) || sub.currentPauseStatus === 'active';

                return (
                  <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Customer & Subscription # */}
                    <td className="p-3 align-top font-semibold text-stone-900">
                      <div>{sub.customerName}</div>
                      <div className="text-[11px] text-stone-500 font-normal flex items-center gap-1 mt-0.5">
                        <span>{sub.customerPhone}</span>
                        <a
                          href={`https://wa.me/${sub.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp"
                        >
                          <Phone className="w-3 h-3 inline" />
                        </a>
                      </div>
                      <div className="font-mono text-[10px] text-amber-800 font-bold mt-0.5">
                        #{sub.subscriptionNumber}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        📍 {sub.deliveryAddress?.area || 'Pune'}
                      </div>
                    </td>

                    {/* Plan Details */}
                    <td className="p-3 align-top">
                      <div className="font-semibold text-stone-900">{sub.planName}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          sub.mealType === 'veg'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {sub.mealType === 'veg' ? '🌿 Pure Veg' : sub.mealType}
                        </span>
                        {sub.isLongTerm && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Cashback Plan
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">
                        Slot: {sub.deliverySlot || 'Standard Slot'}
                      </div>
                    </td>

                    {/* Meals Consumed / Total */}
                    <td className="p-3 align-top font-mono">
                      <div className="text-sm font-bold text-stone-900">
                        {mealsUsed} <span className="text-stone-400 font-normal">/ {mealsTotal}</span>
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Formula: Plan − Remaining
                      </div>
                    </td>

                    {/* Plan Completion % with visual progress bar */}
                    <td className="p-3 align-top">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                        <span>{completionPct}%</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          {mealsUsed}/{mealsTotal}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            completionPct >= 95
                              ? 'bg-red-500'
                              : completionPct >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {completionPct >= 100 ? 'Plan fully utilized' : 'Active burn-down'}
                      </div>
                    </td>

                    {/* Meals Remaining */}
                    <td className="p-3 align-top text-center">
                      <div className="font-mono text-base font-black text-amber-900">
                        {mealsRemaining}
                      </div>
                      <span className="text-[10px] text-stone-400 block font-sans">
                        meals left
                      </span>
                    </td>

                    {/* Today's Status */}
                    <td className="p-3 align-top">
                      {isPausedToday ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                            <PauseCircle className="w-3 h-3 text-amber-700" />
                            Paused Today
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            Do not prepare
                          </span>
                        </div>
                      ) : sub.status === 'active' && mealsRemaining > 0 ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 w-fit">
                            <ChefHat className="w-3 h-3 text-emerald-700" />
                            Delivering Today
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold block">
                            Kitchen prep active
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                          {sub.status}
                        </span>
                      )}
                    </td>

                    {/* Quick Actions: +1 Meal Delivered */}
                    <td className="p-3 align-top text-right space-y-1.5">
                      {sub.status === 'active' && mealsRemaining > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => onRecordMealDelivery(sub.id, 1)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Record 1 meal delivered today"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>+1 Delivered</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAddPause(sub)}
                            className="text-[10px] text-stone-500 hover:text-amber-700 font-medium transition-colors cursor-pointer"
                          >
                            Add Pause →
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">
                          No active meals
                        </span>
                      )}
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
