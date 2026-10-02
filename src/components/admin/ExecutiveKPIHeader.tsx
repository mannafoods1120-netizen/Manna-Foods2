import React from 'react';
import { 
  Users, 
  CalendarRange, 
  UtensilsCrossed, 
  TrendingUp, 
  PauseCircle, 
  ChefHat, 
  AlertTriangle,
  Gift,
  ArrowRight
} from 'lucide-react';
import { CustomerSubscription, CustomerPauseRecord, SubscriptionOperationsSummary } from '../../types/index.ts';

interface ExecutiveKPIHeaderProps {
  subscriptions: CustomerSubscription[];
  customerPauses: CustomerPauseRecord[];
  operationsSummary: SubscriptionOperationsSummary | null;
  onNavigateSection?: (section: any) => void;
}

export const ExecutiveKPIHeader: React.FC<ExecutiveKPIHeaderProps> = ({
  subscriptions,
  customerPauses,
  operationsSummary,
  onNavigateSection
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations from single source of truth
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const totalActiveSubscriptions = activeSubs.length;

  // 1. Total Contracted Meals = Sum of meals included in all active subscriptions
  const totalContractedMeals = activeSubs.reduce((sum, s) => sum + (s.mealsTotal || 0), 0);

  // 2. Meals Delivered / Consumed = Total meals already delivered/consumed across active subscriptions
  const totalMealsDelivered = activeSubs.reduce((sum, s) => sum + (s.mealsUsed || 0), 0);

  // 3. Pipeline Meals Remaining = Total Contracted Meals - Meals Delivered / Consumed
  const pipelineMealsRemaining = Math.max(0, totalContractedMeals - totalMealsDelivered);

  // 4. Active Pauses Today = Number of active customer pause records covering today's date
  const activePausesToday = customerPauses.filter(p => 
    p.status === 'active' && 
    todayStr >= p.pauseStartDate && 
    todayStr <= p.pauseEndDate
  ).length;

  // 5. Adjusted Daily Kitchen Prep = Total Active Subscriptions - Active Pauses Today
  const adjustedDailyKitchenPrep = Math.max(0, totalActiveSubscriptions - activePausesToday);

  // Exceeded Limit count for alerts
  const exceededLimitCount = customerPauses.filter(p => p.status === 'exceeded_limit').length;

  // Long-Term Subscribers Count
  const longTermSubsCount = activeSubs.filter(s => s.isLongTerm).length;
  const totalCashbackCommitted = activeSubs.reduce((sum, s) => sum + (s.cashbackAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Alert banner if any customer exceeds pause limit */}
      {exceededLimitCount > 0 && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center justify-between text-xs text-red-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">Pause Limit Alert:</span>{' '}
              <span>
                {exceededLimitCount} customer pause request(s) exceed their remaining allowance and need review.
              </span>
            </div>
          </div>
          {onNavigateSection && (
            <button
              onClick={() => onNavigateSection('pause_tracker')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-[11px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Review Alerts</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Primary 5 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Active Subscriptions */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Total Active Subscriptions
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display mt-2 tabular-nums">
            {totalActiveSubscriptions}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1 font-medium">
            <span className="font-semibold text-blue-700">{longTermSubsCount} long-term</span>
            <span>· {Math.max(0, totalActiveSubscriptions - longTermSubsCount)} regular</span>
          </div>
          <div className="text-[9px] text-stone-400 mt-0.5">
            Active customer contracts
          </div>
        </div>

        {/* KPI 2: Total Contracted Meals */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Total Contracted Meals
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarRange className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display mt-2 tabular-nums">
            {totalContractedMeals}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">
            Sum of plan meals in active subscriptions
          </div>
          <div className="text-[9px] text-stone-400 mt-0.5">
            ∑(plan meals purchased)
          </div>
        </div>

        {/* KPI 3: Meals Delivered / Consumed */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Meals Delivered / Consumed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display mt-2 tabular-nums">
            {totalMealsDelivered}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">
            {totalContractedMeals > 0 
              ? `${Math.round((totalMealsDelivered / totalContractedMeals) * 100)}% overall completion`
              : 'Delivered to date'}
          </div>
          <div className="text-[9px] text-stone-400 mt-0.5">
            ∑(meals used to date)
          </div>
        </div>

        {/* KPI 4: Pipeline Meals Remaining */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Pipeline Meals Remaining
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-800 font-display mt-2 tabular-nums">
            {pipelineMealsRemaining}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">
            Contracted Meals − Meals Delivered
          </div>
          <div className="text-[9px] text-stone-400 mt-0.5">
            {totalContractedMeals} − {totalMealsDelivered} = {pipelineMealsRemaining}
          </div>
        </div>

        {/* KPI 5: Active Pauses Today (Kitchen prep adjustment!) */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-2xs hover:shadow-xs transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
              Active Pauses Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center">
              <PauseCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 font-display mt-2 tabular-nums">
            {activePausesToday}
          </div>
          <div className="text-[10px] text-amber-900 font-medium mt-1 flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>Cook <strong>{adjustedDailyKitchenPrep}</strong> meals today</span>
          </div>
          <div className="text-[9px] text-amber-800/80 mt-0.5">
            Active pauses on {todayStr}
          </div>
        </div>
      </div>

      {/* Secondary Operational Quick-Banner */}
      <div className="p-3 bg-stone-900 text-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <ChefHat className="w-4 h-4" />
            <span>Today's Kitchen Action:</span>
          </div>
          <span className="text-stone-300">
            <strong>{adjustedDailyKitchenPrep} tiffins</strong> to prepare for lunch &amp; dinner ({totalActiveSubscriptions} active − {activePausesToday} paused today)
          </span>
          {totalCashbackCommitted > 0 && (
            <span className="bg-stone-800 px-2 py-0.5 rounded text-[11px] text-amber-300 font-medium flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>₹{totalCashbackCommitted.toLocaleString('en-IN')} cashback committed</span>
            </span>
          )}
        </div>

        {onNavigateSection && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateSection('meal_utilization')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Meal Burn-Down →
            </button>
            <button
              onClick={() => onNavigateSection('pause_tracker')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Pause Tracker →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
