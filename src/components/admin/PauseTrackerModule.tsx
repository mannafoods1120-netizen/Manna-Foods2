import React, { useState } from 'react';
import { 
  PauseCircle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  User, 
  Phone,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CustomerPauseRecord, CustomerSubscription } from '../../types/index.ts';

interface PauseTrackerModuleProps {
  pauses: CustomerPauseRecord[];
  subscriptions: CustomerSubscription[];
  onOpenAddPause: (sub?: CustomerSubscription) => void;
  onDeletePause: (pauseId: string) => void;
}

export const PauseTrackerModule: React.FC<PauseTrackerModuleProps> = ({
  pauses,
  subscriptions,
  onOpenAddPause,
  onDeletePause
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'exceeded_limit'>('all');
  const [todayFilterOnly, setTodayFilterOnly] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic filter
  const filteredPauses = pauses.filter((p) => {
    // Status filter
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }

    // Today's active pauses filter
    if (todayFilterOnly) {
      const isTodayActive = p.status === 'active' && todayStr >= p.pauseStartDate && todayStr <= p.pauseEndDate;
      if (!isTodayActive) return false;
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        p.customerName.toLowerCase().includes(q) ||
        p.customerPhone.includes(q) ||
        p.subscriptionNumber.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // KPI counters
  const totalPausesCount = pauses.length;
  const activeTodayCount = pauses.filter(p => p.status === 'active' && todayStr >= p.pauseStartDate && todayStr <= p.pauseEndDate).length;
  const exceededCount = pauses.filter(p => p.status === 'exceeded_limit').length;
  const completedCount = pauses.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PauseCircle className="w-6 h-6 text-amber-600" />
            <h2 className="font-display font-extrabold text-xl text-stone-900">
              Customer Pause Tracker &amp; Travel Log
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track temporary meal delivery suspensions, calculate notice compliance, prevent limit overages, and maintain full pause audit history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddPause()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Pause</span>
          </button>
        </div>
      </div>

      {/* Alert Banner if any customer has exceeded allowance */}
      {exceededCount > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl text-xs text-red-900 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-red-950">
              Validation Alert: {exceededCount} Customer(s) Have Exceeded Allowed Pause Allowance
            </strong>
            <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
              Customers highlighted in red attempted to book pauses exceeding their total plan entitlement (e.g. Scenario C: requested 14 days when only 5 remained). 
              These requests require manual admin sanction or extra subscription extension fee.
            </p>
          </div>
          <button
            onClick={() => {
              setStatusFilter('exceeded_limit');
              setTodayFilterOnly(false);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer"
          >
            Filter Exceeded
          </button>
        </div>
      )}

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => { setStatusFilter('all'); setTodayFilterOnly(false); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all' && !todayFilterOnly ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Total Pauses</span>
          <div className="text-xl font-bold font-display mt-1 tabular-nums">{totalPausesCount}</div>
          <span className="text-[10px] opacity-70 mt-0.5 block">Logged history</span>
        </div>

        <div 
          onClick={() => { setTodayFilterOnly(!todayFilterOnly); setStatusFilter('all'); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            todayFilterOnly ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${todayFilterOnly ? 'text-white' : 'text-amber-900'}`}>
            Active Today
          </span>
          <div className={`text-xl font-bold font-display mt-1 tabular-nums ${todayFilterOnly ? 'text-white' : 'text-amber-950'}`}>
            {activeTodayCount}
          </div>
          <span className={`text-[10px] mt-0.5 block ${todayFilterOnly ? 'text-amber-100' : 'text-amber-800'}`}>
            Kitchen paused today
          </span>
        </div>

        <div 
          onClick={() => { setStatusFilter('exceeded_limit'); setTodayFilterOnly(false); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'exceeded_limit' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50/70 border-red-200 hover:bg-red-100/50'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${statusFilter === 'exceeded_limit' ? 'text-white' : 'text-red-900'}`}>
            Exceeded Limit
          </span>
          <div className={`text-xl font-bold font-display mt-1 tabular-nums ${statusFilter === 'exceeded_limit' ? 'text-white' : 'text-red-700'}`}>
            {exceededCount}
          </div>
          <span className={`text-[10px] mt-0.5 block ${statusFilter === 'exceeded_limit' ? 'text-red-100' : 'text-red-800'}`}>
            Flagged allowance alerts
          </span>
        </div>

        <div 
          onClick={() => { setStatusFilter('completed'); setTodayFilterOnly(false); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'completed' && !todayFilterOnly ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Completed</span>
          <div className="text-xl font-bold font-display mt-1 tabular-nums text-stone-800">{completedCount}</div>
          <span className="text-[10px] opacity-70 mt-0.5 block">Resumed deliveries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, subscription #, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => { setStatusFilter('all'); setTodayFilterOnly(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all' && !todayFilterOnly ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Logs ({totalPausesCount})
          </button>

          <button
            onClick={() => setTodayFilterOnly(!todayFilterOnly)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              todayFilterOnly ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>📅 Active Today ({activeTodayCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('exceeded_limit'); setTodayFilterOnly(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'exceeded_limit' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span>⚠️ Exceeded Limit ({exceededCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('completed'); setTodayFilterOnly(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'completed' && !todayFilterOnly ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* 12-Column Required Pause Tracker Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs min-w-[1100px]">
          <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">1. Customer Name</th>
              <th className="p-3">2. Subscription Plan</th>
              <th className="p-3">3. Sub Start Date</th>
              <th className="p-3 text-center">4. Total Allowed</th>
              <th className="p-3">5. Pause Start</th>
              <th className="p-3">6. Pause End</th>
              <th className="p-3 text-center">7. Days Paused</th>
              <th className="p-3 text-center">8. Total Used</th>
              <th className="p-3 text-center">9. Remaining Available</th>
              <th className="p-3">10. Pause Status</th>
              <th className="p-3">11. Notice Compliance</th>
              <th className="p-3">12. Notes &amp; Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filteredPauses.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-stone-500">
                  <PauseCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">No pause records match filter criteria</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Try clearing your search query or reset filter pills.
                  </p>
                </td>
              </tr>
            ) : (
              filteredPauses.map((p) => {
                const isExceeded = p.status === 'exceeded_limit';
                const isActive = p.status === 'active';
                const isCompleted = p.status === 'completed';

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isExceeded
                        ? 'bg-red-50/60 hover:bg-red-50'
                        : isActive
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-stone-50/80'
                    }`}
                  >
                    {/* 1. Customer Name */}
                    <td className="p-3 align-top font-semibold text-stone-900">
                      <div>{p.customerName}</div>
                      <div className="text-[11px] text-stone-500 font-normal flex items-center gap-1 mt-0.5">
                        <span>{p.customerPhone}</span>
                        <a
                          href={`https://wa.me/${p.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp"
                        >
                          <Phone className="w-3 h-3 inline" />
                        </a>
                      </div>
                      <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                        #{p.subscriptionNumber}
                      </div>
                    </td>

                    {/* 2. Subscription Plan */}
                    <td className="p-3 align-top font-medium">
                      <div className="text-stone-900 font-semibold">{p.planName}</div>
                      <div className="text-[10px] text-stone-500">
                        {p.mealsCount} Meals Quota
                      </div>
                    </td>

                    {/* 3. Subscription Start Date */}
                    <td className="p-3 align-top font-mono text-[11px] text-stone-600">
                      {p.subscriptionStartDate}
                    </td>

                    {/* 4. Total Allowed Pause Days */}
                    <td className="p-3 align-top text-center font-bold text-stone-800">
                      {p.totalAllowedPauseDays}d
                    </td>

                    {/* 5. Pause Start Date */}
                    <td className="p-3 align-top font-mono text-[11px] font-semibold text-stone-900">
                      {p.pauseStartDate}
                    </td>

                    {/* 6. Pause End Date */}
                    <td className="p-3 align-top font-mono text-[11px] font-semibold text-stone-900">
                      {p.pauseEndDate}
                    </td>

                    {/* 7. Days Paused (= End Date - Start Date + 1) */}
                    <td className="p-3 align-top text-center font-mono font-bold text-amber-800 bg-amber-50/50">
                      {p.daysPaused}d
                    </td>

                    {/* 8. Total Pause Days Used */}
                    <td className="p-3 align-top text-center font-mono font-bold text-stone-700">
                      {p.totalPauseDaysUsed}d
                    </td>

                    {/* 9. Remaining Pause Days Available */}
                    <td className="p-3 align-top text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isExceeded 
                          ? 'bg-red-200 text-red-950 font-black' 
                          : p.remainingPauseDays <= 3 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {p.remainingPauseDays}d
                      </span>
                    </td>

                    {/* 10. Pause Status */}
                    <td className="p-3 align-top">
                      {isExceeded ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-600 text-white flex items-center gap-1 w-fit shadow-2xs">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeded Limit
                        </span>
                      ) : isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white flex items-center gap-1 w-fit shadow-2xs">
                          <PauseCircle className="w-3 h-3" />
                          Active Pause
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-200 text-stone-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Completed
                        </span>
                      )}
                    </td>

                    {/* 11. Notice Compliance */}
                    <td className="p-3 align-top">
                      {p.noticeCompliance === 'on_time' ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          On Time
                        </span>
                      ) : p.noticeCompliance === 'late' ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Late Notice
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded w-fit">
                          Not Provided
                        </span>
                      )}
                      <div className="text-[10px] text-stone-400 mt-1">
                        Deadline: 8:00 PM prev day
                      </div>
                    </td>

                    {/* 12. Notes & Action */}
                    <td className="p-3 align-top max-w-xs">
                      <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                        {p.notes || 'Standard travel pause registered.'}
                      </p>
                      {p.extendedEndDate && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-1">
                          Valid till: <strong className="font-mono">{p.extendedEndDate}</strong>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDeletePause(p.id)}
                          className="text-[10px] text-stone-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove this pause record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel Pause</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rules & Realistic Scenarios Explainer Footnote */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
        <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-500" />
          <span>Pause Rules &amp; Realistic Demonstration Scenarios:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-white border border-stone-200">
            <span className="font-bold text-amber-900 block">Scenario A — Active Pause</span>
            <p className="text-stone-500 mt-0.5">
              <strong>Aditya Deshmukh</strong> (90 Meals): Travelling for conference. Pause active today (Sept 28 - Oct 05). Kitchen preparation reduced automatically by 1 meal.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-stone-200">
            <span className="font-bold text-stone-800 block">Scenario B — Completed Pause</span>
            <p className="text-stone-500 mt-0.5">
              <strong>Pooja Kulkarni</strong> (180 Meals): Pause finished on Sept 20. Service resumed on Sept 21 with automatic 11-day validity extension intact.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-red-200 bg-red-50/30">
            <span className="font-bold text-red-900 block">Scenario C — Limit Check Alert</span>
            <p className="text-red-800 mt-0.5">
              <strong>Rohan Shinde</strong> (90 Meals): Requested 14 days when only 5 pause days remain. Late notice past 8:00 PM cutoff. Highlighted with Exceeded Limit status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
