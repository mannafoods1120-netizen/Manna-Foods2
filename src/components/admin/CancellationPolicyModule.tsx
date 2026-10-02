import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calculator, 
  RotateCcw, 
  Info, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { CustomerSubscription, CancellationPolicyReference } from '../../types/index.ts';

interface CancellationPolicyModuleProps {
  subscriptions: CustomerSubscription[];
  onOpenEarlyCancellationModal?: (sub: CustomerSubscription) => void;
}

export const CancellationPolicyModule: React.FC<CancellationPolicyModuleProps> = ({
  subscriptions,
  onOpenEarlyCancellationModal
}) => {
  // Policy Parameters
  const STANDARD_MEAL_RATE = 123.08;
  const ADMIN_FEE = 500.00;

  // Plan Packages Reference
  const packagesReference = [
    {
      mealsCount: 90,
      planName: '90 Meals Plan',
      upfrontPaid: 11077.00,
      cashbackDisbursed: 500.00,
      effectiveCost: 10577.00,
      perMealCost: 117.52,
      maxPauseDays: 15,
      maxValidityText: 'Up to 4.5 months'
    },
    {
      mealsCount: 180,
      planName: '180 Meals Plan',
      upfrontPaid: 22154.00,
      cashbackDisbursed: 1500.00,
      effectiveCost: 20654.00,
      perMealCost: 114.74,
      maxPauseDays: 30,
      maxValidityText: 'Up to 8.5 months'
    },
    {
      mealsCount: 270,
      planName: '270 Meals Plan',
      upfrontPaid: 33231.00,
      cashbackDisbursed: 3000.00,
      effectiveCost: 30231.00,
      perMealCost: 111.97,
      maxPauseDays: 45,
      maxValidityText: 'Up to 13 months'
    },
    {
      mealsCount: 360,
      planName: '360 Meals Plan',
      upfrontPaid: 44308.00,
      cashbackDisbursed: 5000.00,
      effectiveCost: 39308.00,
      perMealCost: 109.19,
      maxPauseDays: 60,
      maxValidityText: 'Up to 16 months'
    }
  ];

  // Simulator State
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [simMealsConsumed, setSimMealsConsumed] = useState<number>(15);
  const [selectedCustomerSubId, setSelectedCustomerSubId] = useState<string>('');

  const currentPkg = packagesReference[selectedPlanIndex];

  // Optional link to active customer subscription
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'paused');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled' && s.cancellationDetails);

  const handleSelectCustomerSub = (subId: string) => {
    setSelectedCustomerSubId(subId);
    if (!subId) return;
    const sub = subscriptions.find(s => s.id === subId);
    if (sub) {
      const pkgIdx = packagesReference.findIndex(p => p.mealsCount === sub.mealsTotal);
      if (pkgIdx !== -1) {
        setSelectedPlanIndex(pkgIdx);
      }
      setSimMealsConsumed(sub.mealsUsed || 0);
    }
  };

  // Interactive Live Calculation
  const simUpfrontPaid = currentPkg.upfrontPaid;
  const simCashback = currentPkg.cashbackDisbursed;
  const simConsumedCharges = Math.round(simMealsConsumed * STANDARD_MEAL_RATE * 100) / 100;
  const simTotalDeductions = Math.round((simConsumedCharges + simCashback + ADMIN_FEE) * 100) / 100;
  const simNetRefund = Math.max(0, Math.round((simUpfrontPaid - simTotalDeductions) * 100) / 100);
  const simStatusFlag = simNetRefund > 0 ? 'Refund Due' : 'No Refund / Deficit Absorbed';
  const simDeficitAbsorbed = simTotalDeductions > simUpfrontPaid ? Math.round((simTotalDeductions - simUpfrontPaid) * 100) / 100 : 0;

  // Pre-Populated Scenarios
  const scenarios = [
    {
      id: 'scenario-early',
      title: 'Scenario 1: Early Exit',
      subtitle: '15 meals consumed on 90-meal plan',
      pkgIndex: 0,
      mealsTotal: 90,
      mealsConsumed: 15,
      upfrontPaid: 11077.00,
      consumedCharges: 1846.20,
      cashbackDisbursed: 500.00,
      adminFee: 500.00,
      totalDeductions: 2846.20,
      netRefundPayable: 8230.80,
      statusFlag: 'Refund Due' as const,
      description: 'Subscriber relocation after 15 meals. Clear refund balance of ₹8,230.80 is due after deductions.'
    },
    {
      id: 'scenario-midway',
      title: 'Scenario 2: Mid-Way Exit',
      subtitle: '70 meals consumed on 180-meal plan',
      pkgIndex: 1,
      mealsTotal: 180,
      mealsConsumed: 70,
      upfrontPaid: 22154.00,
      consumedCharges: 8615.60,
      cashbackDisbursed: 1500.00,
      adminFee: 500.00,
      totalDeductions: 10615.60,
      netRefundPayable: 11538.40,
      statusFlag: 'Refund Due' as const,
      description: 'Subscriber completes 70 meals. Standard non-discounted rate ₹123.08 applied. ₹11,538.40 refund due.'
    },
    {
      id: 'scenario-late',
      title: 'Scenario 3: Late Exit (Deductions Exceed Balance)',
      subtitle: '175 meals consumed on 180-meal plan',
      pkgIndex: 1,
      mealsTotal: 180,
      mealsConsumed: 175,
      upfrontPaid: 22154.00,
      consumedCharges: 21539.00,
      cashbackDisbursed: 1500.00,
      adminFee: 500.00,
      totalDeductions: 23539.00,
      netRefundPayable: 0.00,
      statusFlag: 'No Refund / Deficit Absorbed' as const,
      description: 'Deductions (₹23,539.00) exceed upfront paid by ₹1,385.00. Deficit absorbed 100% by Manna Foods. Customer owes ₹0.'
    }
  ];

  const loadScenarioIntoSimulator = (sc: typeof scenarios[0]) => {
    setSelectedPlanIndex(sc.pkgIndex);
    setSimMealsConsumed(sc.mealsConsumed);
    setSelectedCustomerSubId('');
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Policy Parameters */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-7 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Operational Governance &amp; Cancellation Policy</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Long-Term Cashback Cancellation Policy &amp; Refund Engine
          </h2>

          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-3xl">
            A transparent, audit-ready framework for long-term tiffin subscribers who wish to exit early. 
            All calculations strictly enforce the non-discounted meal rate, administrative processing fee, and zero negative balance guarantee.
          </p>

          {/* Policy Parameters Badges */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-stone-300 uppercase tracking-wider block font-semibold">
                Parameter 1
              </span>
              <span className="text-lg font-bold font-mono text-amber-300">
                ₹{STANDARD_MEAL_RATE.toFixed(2)}
              </span>
              <span className="text-xs text-stone-300 block font-medium">
                Standard Non-Discounted Meal Rate
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-stone-300 uppercase tracking-wider block font-semibold">
                Parameter 2
              </span>
              <span className="text-lg font-bold font-mono text-amber-300">
                ₹{ADMIN_FEE.toFixed(2)}
              </span>
              <span className="text-xs text-stone-300 block font-medium">
                Flat Administrative Processing Fee
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30">
              <span className="text-[10px] text-emerald-200 uppercase tracking-wider block font-semibold">
                Core Guarantee
              </span>
              <span className="text-lg font-bold text-emerald-300">
                Zero Negative Balance
              </span>
              <span className="text-xs text-emerald-200 block font-medium">
                Deficit is 100% absorbed by Manna Foods
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Reference Table for Long-Term Cashback Packages */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-display font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Reference Table: 90, 180, 270 &amp; 360-Meal Packages</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Standard contract baselines used for calculating refunds across Pune delivery sectors.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            4 Standard Packages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="p-3">Package Tier</th>
                <th className="p-3 text-center">Meals Count</th>
                <th className="p-3 text-right">Upfront Paid</th>
                <th className="p-3 text-right">Cashback Disbursed</th>
                <th className="p-3 text-right">Effective Package Cost</th>
                <th className="p-3 text-center">Pause Allowance</th>
                <th className="p-3 text-center">Max Validity</th>
                <th className="p-3 text-right">Effective Meal Rate</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {packagesReference.map((pkg, idx) => (
                <tr key={pkg.mealsCount} className={`hover:bg-amber-50/40 transition-colors ${selectedPlanIndex === idx ? 'bg-amber-50/60 font-semibold' : ''}`}>
                  <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                    <span>{pkg.planName}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-stone-800">
                    {pkg.mealsCount} Meals
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    ₹{pkg.upfrontPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    ₹{pkg.cashbackDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-amber-900 text-sm">
                    ₹{pkg.effectiveCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center font-semibold text-stone-800">
                    {pkg.maxPauseDays} Days
                  </td>
                  <td className="p-3 text-center text-stone-600">
                    {pkg.maxValidityText}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    ~₹{pkg.perMealCost.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanIndex(idx);
                        setSimMealsConsumed(Math.round(pkg.mealsCount / 3));
                        setSelectedCustomerSubId('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Pre-Populated Scenarios Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Pre-Populated Case Scenarios</span>
            </h3>
            <p className="text-xs text-stone-500">
              Demonstrating early exits, mid-way terminations, and late exits where deductions exceed the balance.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            Click any scenario to load into the Automated Calculator below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenarios.map((sc) => {
            const isLate = sc.id === 'scenario-late';
            return (
              <div
                key={sc.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md relative ${
                  isLate 
                    ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400/30' 
                    : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {sc.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sc.statusFlag === 'Refund Due'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {sc.statusFlag}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900">
                    {sc.subtitle}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {sc.description}
                  </p>

                  {/* Financial Breakdown Card */}
                  <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Upfront Paid:</span>
                      <strong className="font-mono text-stone-800">₹{sc.upfrontPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Consumed Charges ({sc.mealsConsumed} × ₹123.08):</span>
                      <span className="font-mono font-semibold text-rose-700">₹{sc.consumedCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Cashback Disbursed:</span>
                      <span className="font-mono font-semibold text-rose-700">₹{sc.cashbackDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Admin Fee:</span>
                      <span className="font-mono font-semibold text-rose-700">₹{sc.adminFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-900 pt-1 border-t border-stone-200">
                      <span>Total Deductions:</span>
                      <span className="font-mono">₹{sc.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 flex items-baseline justify-between">
                      <span className="font-bold text-stone-900">Net Refund Payable:</span>
                      <span className={`font-display font-extrabold text-lg tabular-nums ${
                        sc.netRefundPayable > 0 ? 'text-emerald-700' : 'text-stone-900'
                      }`}>
                        ₹{sc.netRefundPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => loadScenarioIntoSimulator(sc)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Load into Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Automated Refund Calculation Table & Live Simulator */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              <h3 className="font-display font-extrabold text-lg text-stone-900">
                Automated Refund Calculation Table &amp; Live Simulator
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live algorithmic execution of Manna Foods early cancellation formula with instant zero-deficit clamping.
            </p>
          </div>

          {/* Quick Select: Link to existing subscriber */}
          {activeSubs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600 shrink-0">
                Load Active Subscriber:
              </span>
              <select
                value={selectedCustomerSubId}
                onChange={(e) => handleSelectCustomerSub(e.target.value)}
                className="text-xs px-3 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 font-medium"
              >
                <option value="">-- Choose Subscription --</option>
                {activeSubs.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.customerName} ({s.subscriptionNumber} • {s.mealsUsed}/{s.mealsTotal} meals)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Inputs Control Bar */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1.5">
              1. Choose Contracted Plan:
            </label>
            <select
              value={selectedPlanIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedPlanIndex(idx);
                setSimMealsConsumed(Math.min(packagesReference[idx].mealsCount, simMealsConsumed));
                setSelectedCustomerSubId('');
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-bold text-stone-900"
            >
              {packagesReference.map((p, i) => (
                <option key={p.mealsCount} value={i}>
                  {p.planName} ({p.mealsCount} Meals • Upfront ₹{p.upfrontPaid.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-800">
                2. Meals Consumed by Customer:
              </label>
              <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                {simMealsConsumed} / {currentPkg.mealsCount} Meals
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={currentPkg.mealsCount}
                value={simMealsConsumed}
                onChange={(e) => setSimMealsConsumed(Number(e.target.value))}
                className="flex-1 accent-amber-600"
              />
              <input
                type="number"
                min={0}
                max={currentPkg.mealsCount}
                value={simMealsConsumed}
                onChange={(e) => setSimMealsConsumed(Math.max(0, Math.min(currentPkg.mealsCount, Number(e.target.value) || 0)))}
                className="w-20 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold font-mono text-center"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            {selectedCustomerSubId && onOpenEarlyCancellationModal ? (
              <button
                type="button"
                onClick={() => {
                  const sub = subscriptions.find(s => s.id === selectedCustomerSubId);
                  if (sub) onOpenEarlyCancellationModal(sub);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Execute Early Cancellation for this Subscriber</span>
              </button>
            ) : (
              <div className="text-[11px] text-stone-500 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                💡 Select an active subscriber above to immediately process early cancellation with these parameters.
              </div>
            )}
          </div>
        </div>

        {/* Live Calculation Table Output */}
        <div className="rounded-xl border border-stone-300 overflow-hidden shadow-xs">
          <div className="bg-stone-900 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs sm:text-sm">
                Formula Execution: {currentPkg.planName} ({simMealsConsumed} Meals Consumed)
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
              simStatusFlag === 'Refund Due' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-stone-950'
            }`}>
              {simStatusFlag}
            </span>
          </div>

          <div className="divide-y divide-stone-200 bg-white text-xs">
            {/* Step 1: Upfront Paid */}
            <div className="px-5 py-3 flex items-center justify-between bg-stone-50/70">
              <div>
                <span className="font-bold text-stone-900 block">Upfront Paid Balance (A):</span>
                <span className="text-[11px] text-stone-500">Contracted package fee received upfront</span>
              </div>
              <span className="font-mono font-bold text-stone-900 text-sm">
                ₹{simUpfrontPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Step 2: Consumed Charges */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">
                  Consumed Meal Charges (B):
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  = Meals Consumed ({simMealsConsumed}) × Non-Discounted Rate (₹{STANDARD_MEAL_RATE.toFixed(2)})
                </span>
              </div>
              <span className="font-mono font-bold text-rose-700 text-sm">
                ₹{simConsumedCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Step 3: Cashback Disbursed */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">
                  Cashback Disbursed Reversal (C):
                </span>
                <span className="text-[11px] text-stone-500">
                  Upfront promotional cashback given on this plan
                </span>
              </div>
              <span className="font-mono font-bold text-rose-700 text-sm">
                ₹{simCashback.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Step 4: Admin Fee */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">
                  Flat Administrative Processing Fee (D):
                </span>
                <span className="text-[11px] text-stone-500">
                  Standard fixed administrative processing fee
                </span>
              </div>
              <span className="font-mono font-bold text-rose-700 text-sm">
                ₹{ADMIN_FEE.toFixed(2)}
              </span>
            </div>

            {/* Step 5: Total Deductions */}
            <div className="px-5 py-3.5 flex items-center justify-between bg-rose-50/70 font-bold text-rose-950">
              <div>
                <span className="text-xs uppercase tracking-wide block">
                  Total Deductions (E = B + C + D):
                </span>
                <span className="text-[11px] text-rose-700 font-normal font-mono">
                  = ₹{simConsumedCharges.toFixed(2)} + ₹{simCashback.toFixed(2)} + ₹{ADMIN_FEE.toFixed(2)}
                </span>
              </div>
              <span className="font-mono text-base font-extrabold text-rose-800">
                ₹{simTotalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Step 6: Net Refund Payable */}
            <div className={`px-5 py-4 flex items-center justify-between ${
              simStatusFlag === 'Refund Due' ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'
            }`}>
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider block">
                  Net Refund Payable:
                </span>
                <span className="text-[11px] text-stone-600 font-mono">
                  = MAX(0, Upfront Paid − Total Deductions)
                </span>
              </div>
              <div className="text-right">
                <span className={`font-display font-extrabold text-2xl sm:text-3xl tabular-nums ${
                  simStatusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-stone-900'
                }`}>
                  ₹{simNetRefund.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`block text-[11px] font-bold uppercase mt-0.5 ${
                  simStatusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  Status Flag: {simStatusFlag}
                </span>
              </div>
            </div>
          </div>

          {/* Zero Negative Balance Protection Display */}
          {simDeficitAbsorbed > 0 && (
            <div className="p-4 bg-stone-900 text-stone-200 text-xs flex items-start gap-3 border-t border-stone-700">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 block text-xs">
                  Zero Negative Balance Enforced:
                </strong>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  Total deductions of <strong>₹{simTotalDeductions.toFixed(2)}</strong> exceed the upfront payment of <strong>₹{simUpfrontPaid.toFixed(2)}</strong> by <strong>₹{simDeficitAbsorbed.toFixed(2)}</strong>. 
                  Under Manna Foods cancellation guarantee, no negative balance is ever collected from the customer. The ₹{simDeficitAbsorbed.toFixed(2)} shortfall is 100% absorbed by kitchen operations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Processed Early Cancellations Audit History (if any exist) */}
      {cancelledSubs.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <span>Historical Early Cancellation Records ({cancelledSubs.length})</span>
              </h3>
              <p className="text-xs text-stone-500">
                Audited refund disbursements and deficit absorption logs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                <tr>
                  <th className="p-3">Customer &amp; Sub #</th>
                  <th className="p-3">Plan Name</th>
                  <th className="p-3 text-center">Meals Consumed</th>
                  <th className="p-3 text-right">Consumed Charges</th>
                  <th className="p-3 text-right">Cashback Disbursed</th>
                  <th className="p-3 text-right">Admin Fee</th>
                  <th className="p-3 text-right">Total Deductions</th>
                  <th className="p-3 text-right">Net Refund</th>
                  <th className="p-3 text-center">Status Flag</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {cancelledSubs.map((sub) => {
                  const details = sub.cancellationDetails!;
                  return (
                    <tr key={sub.id} className="hover:bg-rose-50/20">
                      <td className="p-3">
                        <strong className="text-stone-900 block">{sub.customerName}</strong>
                        <span className="font-mono text-[10px] text-stone-500">{sub.subscriptionNumber}</span>
                      </td>
                      <td className="p-3 font-medium text-stone-800">
                        {sub.planName}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {details.mealsConsumed} / {sub.mealsTotal}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700">
                        ₹{details.consumedCharges?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700">
                        ₹{details.cashbackDisbursed?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700">
                        ₹{details.adminFee?.toFixed(2) || '500.00'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-800">
                        ₹{details.totalDeductions?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-sm text-emerald-700">
                        ₹{details.netRefundPayable?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          details.statusFlag === 'Refund Due' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {details.statusFlag}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500 text-[11px]">
                        {details.cancelledAt?.split('T')[0] || 'Recently'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
