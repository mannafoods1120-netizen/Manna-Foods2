import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Edit3, 
  Check, 
  Percent, 
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { LongTermCashbackPlan, CustomerSubscription } from '../../types/index.ts';

interface LongTermOffersModuleProps {
  offers: LongTermCashbackPlan[];
  subscriptions: CustomerSubscription[];
  onEditOffer: (offer: LongTermCashbackPlan) => void;
  onOpenCreateSubscriptionWithPlan?: (planId: string) => void;
  onNavigateToLegalTerms?: () => void;
}

export const LongTermOffersModule: React.FC<LongTermOffersModuleProps> = ({
  offers,
  subscriptions,
  onEditOffer,
  onOpenCreateSubscriptionWithPlan,
  onNavigateToLegalTerms
}) => {
  // Sort offers by mealsCount
  const sortedOffers = [...offers].sort((a, b) => a.mealsCount - b.mealsCount);

  // Active subscribers per offer
  const activeSubsByPlan = (planMeals: number) => {
    return subscriptions.filter(s => s.isLongTerm && s.mealsTotal === planMeals && s.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Clear Branding & Separation */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Dedicated Module</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Long-Term Subscription Cashback Offers
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 mt-1.5 leading-relaxed">
            Standard base pricing with guaranteed upfront cashback and extended pause allowances. 
            All plans are <strong>Pure Vegetarian Only</strong>, cooked with 100% Sharbati wheat, Desi Ghee, and fresh vegetables.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-amber-200/90 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-linked cashback formulas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              <span>Separate from short-term monthly packages</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              <span>Full travel pause &amp; validity protection</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Formula Rules Notice Box */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">
            System Formula &amp; Protection Rule:
          </span>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <code>Effective Value After Cashback = Base Price − Cashback Amount</code>. 
            Cashback amounts are strictly anchored to the corresponding meal count (90 → ₹1,400 | 180 → ₹3,000 | 270 → ₹4,500 | 360 → ₹6,000) 
            to prevent misallocation. Any admin adjustments immediately update subscriber calculations and storefront cards.
          </p>
        </div>
      </div>

      {/* Terms & Conditions Configuration Banner */}
      <div className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <strong className="text-stone-900 block font-bold">
              Subscription Terms &amp; Conditions and Legal Protection
            </strong>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Customers must agree to the Terms &amp; Conditions checkbox before adding long-term plans to cart. You can configure and edit these terms at any time.
            </p>
          </div>
        </div>

        {onNavigateToLegalTerms && (
          <button
            type="button"
            onClick={onNavigateToLegalTerms}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Configure Terms &amp; Conditions</span>
          </button>
        )}
      </div>

      {/* Grid of the 4 Long-Term Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {sortedOffers.map((offer) => {
          const effective = Math.max(0, offer.basePrice - offer.cashbackAmount);
          const perMealEffective = offer.mealsCount > 0 ? Math.round(effective / offer.mealsCount) : 0;
          const activeSubCount = activeSubsByPlan(offer.mealsCount);

          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
            >
              {/* Card Header */}
              <div className="p-5 pb-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    🌿 Pure Veg
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {offer.mealsCount} Meals
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-lg text-stone-900 leading-snug">
                  {offer.name}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  {offer.description}
                </p>

                {/* Primary Financial Values Box */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  {/* Base Price */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Base Price:</span>
                    <span className="font-mono font-bold text-stone-800 tabular-nums">
                      ₹{offer.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Guaranteed Cashback */}
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-200/60">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Cashback:
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded tabular-nums">
                      − ₹{offer.cashbackAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Effective Value After Cashback */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-amber-900 tracking-wider block">
                        Effective Value
                      </span>
                      <span className="text-[10px] text-stone-400">
                        (~₹{perMealEffective}/meal)
                      </span>
                    </div>
                    <span className="text-xl font-black text-amber-900 font-display tabular-nums">
                      ₹{effective.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Operational Pause & Validity Specs */}
                <div className="mt-3 space-y-1.5 text-[11px] text-stone-600 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Max Travel Pause:</span>
                    <strong className="text-stone-900 font-bold">{offer.maxPauseDays} Days</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Extended Validity:</span>
                    <strong className="text-stone-900 font-bold">{offer.maxValidityText}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/40">
                    <span className="text-stone-500">Active Subscribers:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                      {activeSubCount} Active
                    </span>
                  </div>
                </div>

                {/* Key Plan Features */}
                <ul className="mt-3 space-y-1 text-[11px] text-stone-600 border-t border-stone-100 pt-2.5">
                  {offer.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-3 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onEditOffer(offer)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Configure Offer</span>
                </button>

                {onOpenCreateSubscriptionWithPlan && (
                  <button
                    type="button"
                    onClick={() => onOpenCreateSubscriptionWithPlan(offer.id)}
                    className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                    title="Onboard Customer to this Plan"
                  >
                    + Assign
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Reference Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3">
        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <span>Standard Long-Term Offer Specification Matrix</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="p-3">Subscription Plan</th>
                <th className="p-3">Dietary Type</th>
                <th className="p-3 text-right">Base Price</th>
                <th className="p-3 text-right">Cashback</th>
                <th className="p-3 text-right">Effective Value</th>
                <th className="p-3 text-center">Max Pause Allowance</th>
                <th className="p-3 text-center">Max Validity</th>
                <th className="p-3 text-right">Per Meal Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {sortedOffers.map((o) => {
                const eff = o.basePrice - o.cashbackAmount;
                const perMeal = Math.round(eff / o.mealsCount);
                return (
                  <tr key={o.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{o.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Pure Veg Only
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-stone-800">
                      ₹{o.basePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{o.cashbackAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-amber-900 text-sm">
                      ₹{eff.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center font-semibold text-stone-800">
                      {o.maxPauseDays} days
                    </td>
                    <td className="p-3 text-center text-stone-600 font-semibold">
                      {o.maxValidityText}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">
                      ~₹{perMeal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
