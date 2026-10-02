import React, { useState, useEffect } from 'react';
import { Check, Calendar, Clock, Sparkles, Gift, ShieldCheck, PauseCircle, ArrowRight, Zap, Calculator, AlertTriangle, RotateCcw, Info } from 'lucide-react';
import { SubscriptionPlan, MealDietType, LongTermCashbackPlan, LegalPolicies } from '../types/index.ts';
import { api } from '../services/api.ts';
import { LegalModal } from './LegalModal.tsx';

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  onSelectPlanForSubscription: (plan: SubscriptionPlan, config: {
    startDate: string;
    deliverySlot: 'lunch' | 'dinner' | 'both';
    mealTypePreference: MealDietType | 'both';
  }) => void;
  onOpenTermsModal?: (docType: 'long_term' | 'general' | 'privacy') => void;
  legalPolicies?: LegalPolicies | null;
}

const defaultLongTermOffers: LongTermCashbackPlan[] = [
  {
    id: 'lt-plan-90',
    name: '90 Meals Plan',
    mealsCount: 90,
    mealType: 'veg',
    basePrice: 11077, // 90 * ₹123.08 = ₹11,077.20
    cashbackAmount: 500,
    effectiveValue: 10577,
    maxPauseDays: 15,
    maxValidityMonths: 4.5,
    maxValidityText: 'Up to 4.5 months',
    description: 'Quarterly pure-veg homestyle tiffin with guaranteed ₹500 cashback & 15 days travel pause freedom.',
    features: [
      '90 Wholesome Pure Veg Homestyle Meals',
      'Flat ₹500 Guaranteed Cashback Credited',
      'Effective Value: ₹10,577 (Standard Rate: ₹123.08/meal)',
      '15 Days Maximum Pause Allowance',
      'Extended Validity Up to 4.5 Months',
      'Zero Delivery Charge across Pune zones',
      'Fresh Sharbati Wheat Desi Ghee Phulkas Daily',
      'Transparent Early Cancellation (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-180',
    name: '180 Meals Plan',
    mealsCount: 180,
    mealType: 'veg',
    basePrice: 22154, // 180 * ₹123.08 = ₹22,154.40
    cashbackAmount: 1500,
    effectiveValue: 20654,
    maxPauseDays: 30,
    maxValidityMonths: 8.5,
    maxValidityText: 'Up to 8.5 months',
    description: 'Half-yearly comprehensive homestyle tiffin commitment with ₹1,500 guaranteed cashback & 30 days travel pause.',
    features: [
      '180 Nutritious Pure Veg Homestyle Meals',
      'Flat ₹1,500 Guaranteed Cashback Credited',
      'Effective Value: ₹20,654 (Standard Rate: ₹123.08/meal)',
      '30 Days Maximum Pause Allowance',
      'Extended Validity Up to 8.5 Months',
      'Priority Dispatch Window for Lunch or Dinner',
      'Free Digestive Kokum Solkadhi Weekly',
      'Transparent Early Cancellation (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-270',
    name: '270 Meals Plan',
    mealsCount: 270,
    mealType: 'veg',
    basePrice: 33231, // 270 * ₹123.08 = ₹33,231.60
    cashbackAmount: 3000,
    effectiveValue: 30231,
    maxPauseDays: 45,
    maxValidityMonths: 13,
    maxValidityText: 'Up to 13 months',
    description: '9-Month academic & corporate tiffin package. Maximum savings with ₹3,000 cashback & 45 days pause allowance.',
    features: [
      '270 Healthy Homestyle Pure Veg Meals',
      'Flat ₹3,000 Guaranteed Cashback Credited',
      'Effective Value: ₹30,231 (Standard Rate: ₹123.08/meal)',
      '45 Days Maximum Pause Allowance',
      'Extended Validity Up to 13 Months',
      'Ideal for College Semesters & Project Stints',
      'Weekend Pause & Resume with Single Tap',
      'Transparent Early Cancellation (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-360',
    name: '360 Meals Plan',
    mealsCount: 360,
    mealType: 'veg',
    basePrice: 44308, // 360 * ₹123.08 = ₹44,308.80
    cashbackAmount: 5000,
    effectiveValue: 39308,
    maxPauseDays: 60,
    maxValidityMonths: 16,
    maxValidityText: 'Up to 16 months',
    description: 'Annual VIP tiffin subscription. Ultimate value with ₹5,000 direct cashback & 60 days of pause freedom.',
    features: [
      '360 Complete Homestyle Veg Thalis',
      'Flat ₹5,000 Maximum Cashback Credited',
      'Effective Value: ₹39,308 (Standard Rate: ₹123.08/meal)',
      '60 Days Maximum Pause Allowance',
      'Extended Validity Up to 16 Months',
      'Dedicated Pune Kitchen Concierge Support',
      'Includes Festive Sweets & Holiday Dabba Treats',
      'Transparent Early Cancellation (Zero Negative Balance)'
    ],
    isActive: true
  }
];

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  plans, 
  onSelectPlanForSubscription,
  onOpenTermsModal,
  legalPolicies
}) => {
  // Main Category Tab: 'long_term' (Cashback Offers) or 'standard' (Monthly/Weekly)
  const [activeTab, setActiveTab] = useState<'long_term' | 'standard'>('long_term');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');

  // Long-Term Offers State
  const [longTermOffers, setLongTermOffers] = useState<LongTermCashbackPlan[]>(defaultLongTermOffers);

  // Terms & Conditions Acceptance State for Long-Term Cashback Popup
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<boolean>(false);
  const [showInternalTermsModal, setShowInternalTermsModal] = useState<boolean>(false);

  useEffect(() => {
    api.getLongTermOffers()
      .then(res => {
        if (res && res.length > 0) setLongTermOffers(res);
      })
      .catch(() => {});
  }, []);

  // Customization modal state
  const [configuringPlan, setConfiguringPlan] = useState<SubscriptionPlan | null>(null);
  const [configuringLtOffer, setConfiguringLtOffer] = useState<LongTermCashbackPlan | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [selectedMealType, setSelectedMealType] = useState<MealDietType | 'both'>('both');
  
  // Default start date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(tomorrowStr);

  // Cancellation Policy & Refund Simulator State
  const [selectedPlanForSim, setSelectedPlanForSim] = useState<number>(0);
  const [simMealsUsed, setSimMealsUsed] = useState<number>(15);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState<boolean>(true);

  const filteredPlans = plans.filter(p => {
    if (filterType === 'all') return true;
    return p.planType === filterType;
  });

  const handleOpenConfigStandard = (plan: SubscriptionPlan) => {
    setConfiguringPlan(plan);
    setConfiguringLtOffer(null);
    setSelectedSlot(plan.deliveryFrequency === 'daily_dinner' ? 'dinner' : 'lunch');
    setSelectedMealType(plan.mealType);
    setTermsAccepted(false);
    setTermsError(false);
  };

  const handleOpenConfigLongTerm = (offer: LongTermCashbackPlan) => {
    setConfiguringLtOffer(offer);
    setConfiguringPlan(null);
    setSelectedSlot('lunch');
    setSelectedMealType('veg');
    setTermsAccepted(false);
    setTermsError(false);
  };

  const handleConfirmSubscription = () => {
    if (configuringLtOffer) {
      if (!termsAccepted) {
        setTermsError(true);
        return;
      }
      const adaptedPlan: SubscriptionPlan = {
        id: configuringLtOffer.id,
        name: `${configuringLtOffer.name} (Long-Term Cashback Offer)`,
        planType: 'monthly',
        mealType: 'veg',
        mealsCount: configuringLtOffer.mealsCount,
        basePrice: configuringLtOffer.basePrice,
        discountPercentage: 0,
        deliveryFrequency: selectedSlot === 'dinner' ? 'daily_dinner' : 'daily_lunch',
        description: configuringLtOffer.description,
        features: configuringLtOffer.features,
        isPopular: configuringLtOffer.mealsCount === 180
      };

      onSelectPlanForSubscription(adaptedPlan, {
        startDate,
        deliverySlot: selectedSlot,
        mealTypePreference: 'veg'
      });
      setConfiguringLtOffer(null);
    } else if (configuringPlan) {
      onSelectPlanForSubscription(configuringPlan, {
        startDate,
        deliverySlot: selectedSlot,
        mealTypePreference: selectedMealType
      });
      setConfiguringPlan(null);
    }
  };

  return (
    <section className="py-12 bg-stone-50/70 border-t border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Category Segmented Switch: Long-Term Cashback vs Regular Subscriptions */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <div className="inline-flex p-1.5 bg-stone-200/80 rounded-2xl border border-stone-300 shadow-2xs max-w-xl w-full">
            <button
              onClick={() => setActiveTab('long_term')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'long_term'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Gift className="w-4 h-4 shrink-0 text-amber-200" />
              <span>Long-Term Cashback Offers</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white uppercase">
                Up to ₹6,000 Off
              </span>
            </button>

            <button
              onClick={() => setActiveTab('standard')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'standard'
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0 text-amber-700" />
              <span>Standard Monthly &amp; Weekly</span>
            </button>
          </div>
        </div>

        {/* 1. DEDICATED MODULE: LONG-TERM SUBSCRIPTION CASHBACK OFFERS */}
        {activeTab === 'long_term' && (
          <div className="space-y-10">
            {/* Header Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-bold border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Standard Base Pricing — Veg Only • Guaranteed Cashback</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display tracking-tight">
                Long-Term Subscription Cashback Offers
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Enjoy hot, homestyle vegetarian Pune tiffins with direct cashback, generous meal pause allowances, and extended validity periods.
              </p>

              {/* Notice: Coupons Disabled for Long-Term Cashback */}
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center justify-center gap-2 max-w-2xl mx-auto shadow-2xs">
                <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px] tracking-wide shrink-0">
                  Coupons Disabled
                </span>
                <span className="font-medium text-stone-700">
                  All promotional coupon codes are <strong>strictly disabled</strong> for Long-Term Cashback packages. These packages already provide maximum guaranteed direct cashback (up to ₹5,000) and upfront rate subsidies.
                </span>
              </div>
            </div>

            {/* 4 Standard Long-Term Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {longTermOffers.map((offer) => {
                const perMealEffective = Math.round(offer.effectiveValue / offer.mealsCount);
                const isHighlight = offer.mealsCount === 180 || offer.mealsCount === 360;

                return (
                  <div
                    key={offer.id}
                    className={`relative rounded-2xl bg-white border transition-all flex flex-col justify-between p-6 ${
                      isHighlight
                        ? 'border-amber-500 shadow-xl ring-2 ring-amber-500/20'
                        : 'border-stone-200 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {/* Badge */}
                    {offer.mealsCount === 180 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Most Popular (6 Months)
                      </div>
                    )}
                    {offer.mealsCount === 360 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-stone-900 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Max Savings (Annual VIP)
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="border-b border-stone-100 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-lg text-stone-900">
                            {offer.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                            Veg Only
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 font-medium">
                          {offer.mealsCount} Complete Thali Meals
                        </span>
                      </div>

                      {/* Pricing & Cashback Breakdown */}
                      <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/70">
                        {/* Base Price */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500">Base Price:</span>
                          <span className="font-bold text-stone-700 font-mono">
                            ₹{offer.basePrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Cashback */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" />
                            <span>Cashback:</span>
                          </span>
                          <span className="font-extrabold text-emerald-700 font-mono bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            − ₹{offer.cashbackAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* Effective Value After Cashback */}
                        <div className="pt-2 border-t border-stone-200/60 flex items-baseline justify-between">
                          <div>
                            <span className="block text-[11px] font-bold text-stone-800 uppercase tracking-tight">
                              Effective Value
                            </span>
                            <span className="text-[10px] text-stone-500">After Cashback</span>
                          </div>
                          <div className="text-right">
                            <span className="font-display font-extrabold text-2xl text-amber-700 leading-none">
                              ₹{offer.effectiveValue.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-emerald-800 font-bold mt-0.5">
                              ~₹{perMealEffective} / meal
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pause & Validity Feature Badges */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60">
                          <PauseCircle className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                          <span className="block font-bold text-stone-900 text-[11px]">
                            {offer.maxPauseDays} Days
                          </span>
                          <span className="text-[10px] text-stone-500">Max Pause</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200/60">
                          <Clock className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                          <span className="block font-bold text-stone-900 text-[11px]">
                            {offer.maxValidityText}
                          </span>
                          <span className="text-[10px] text-stone-500">Max Validity</span>
                        </div>
                      </div>

                      {/* Bullet Features */}
                      <ul className="space-y-2 pt-2 text-xs text-stone-600">
                        {offer.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6">
                      <button
                        onClick={() => handleOpenConfigLongTerm(offer)}
                        className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isHighlight
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        <span>Subscribe with ₹{offer.cashbackAmount.toLocaleString()} Cashback</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1B. CANCELLATION POLICY PARAMETERS & PLAN REFERENCE */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>Transparent Consumer Protection</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight">
                    Early Cancellation Policy &amp; Automated Refund Reference
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Clear mathematical rules govern early exit requests. No hidden clauses, no arbitrary penalties, and complete zero-deficit protection.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Zero Negative Balance Guaranteed
                  </span>
                </div>
              </div>

              {/* Policy Parameters Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Core Parameter 1
                  </span>
                  <span className="text-xl font-bold font-mono text-stone-900 mt-0.5 block">
                    ₹123.08
                  </span>
                  <span className="text-xs font-semibold text-stone-700 block mt-0.5">
                    Standard Non-Discounted Meal Rate
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Consumed meals are assessed at the non-discounted base rate of ₹123.08 per thali.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Core Parameter 2
                  </span>
                  <span className="text-xl font-bold font-mono text-stone-900 mt-0.5 block">
                    ₹500.00
                  </span>
                  <span className="text-xs font-semibold text-stone-700 block mt-0.5">
                    Flat Administrative Processing Fee
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Covers kitchen provisioning, insulated dabba handling, and banking reconciliation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Zero Balance Safety
                  </span>
                  <span className="text-xl font-bold text-emerald-800 mt-0.5 block">
                    100% Protected
                  </span>
                  <span className="text-xs font-semibold text-emerald-900 block mt-0.5">
                    No Negative Balance Collected
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    If total deductions exceed the upfront balance, Manna Foods absorbs the deficit. You owe ₹0.
                  </p>
                </div>
              </div>

              {/* Reference Table for the 90, 180, 270, and 360-Meal Packages */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>Reference Table: 90, 180, 270 &amp; 360-Meal Cashback Packages</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Plan Name</th>
                        <th className="p-3 text-center">Meals Total</th>
                        <th className="p-3 text-right">Upfront Paid</th>
                        <th className="p-3 text-right">Guaranteed Cashback</th>
                        <th className="p-3 text-right">Effective Package Cost</th>
                        <th className="p-3 text-center">Pause Allowance</th>
                        <th className="p-3 text-center">Max Validity</th>
                        <th className="p-3 text-right">Effective Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      {[
                        { name: '90 Meals Plan', meals: 90, upfront: 11077, cashback: 500, eff: 10577, pause: '15 Days', val: 'Up to 4.5 months', rate: '~₹117.52/meal' },
                        { name: '180 Meals Plan', meals: 180, upfront: 22154, cashback: 1500, eff: 20654, pause: '30 Days', val: 'Up to 8.5 months', rate: '~₹114.74/meal' },
                        { name: '270 Meals Plan', meals: 270, upfront: 33231, cashback: 3000, eff: 30231, pause: '45 Days', val: 'Up to 13 months', rate: '~₹111.97/meal' },
                        { name: '360 Meals Plan', meals: 360, upfront: 44308, cashback: 5000, eff: 39308, pause: '60 Days', val: 'Up to 16 months', rate: '~₹109.19/meal' }
                      ].map((pkg, idx) => (
                        <tr key={pkg.meals} className={`hover:bg-amber-50/30 transition-colors ${selectedPlanForSim === idx ? 'bg-amber-50/60 font-semibold' : ''}`}>
                          <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>{pkg.name}</span>
                          </td>
                          <td className="p-3 text-center font-bold">{pkg.meals}</td>
                          <td className="p-3 text-right font-mono font-bold text-stone-900">₹{pkg.upfront.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">₹{pkg.cashback.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono font-black text-amber-900">₹{pkg.eff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-center font-semibold text-stone-800">{pkg.pause}</td>
                          <td className="p-3 text-center text-stone-600">{pkg.val}</td>
                          <td className="p-3 text-right font-mono font-bold text-stone-900">{pkg.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Automated Refund Calculation Table & Live Simulator */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-600" />
                      <span>Automated Refund Calculation Table &amp; Live Simulator</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Test any meal consumption number to see the exact formula output in real-time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600">Select Plan:</span>
                    <select
                      value={selectedPlanForSim}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setSelectedPlanForSim(idx);
                        const pkgs = [90, 180, 270, 360];
                        setSimMealsUsed(Math.min(pkgs[idx], simMealsUsed));
                      }}
                      className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white font-bold"
                    >
                      <option value={0}>90 Meals Plan</option>
                      <option value={1}>180 Meals Plan</option>
                      <option value={2}>270 Meals Plan</option>
                      <option value={3}>360 Meals Plan</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const pkgs = [
                    { meals: 90, upfront: 11077.00, cashback: 500.00, name: '90 Meals Plan' },
                    { meals: 180, upfront: 22154.00, cashback: 1500.00, name: '180 Meals Plan' },
                    { meals: 270, upfront: 33231.00, cashback: 3000.00, name: '270 Meals Plan' },
                    { meals: 360, upfront: 44308.00, cashback: 5000.00, name: '360 Meals Plan' }
                  ];
                  const cur = pkgs[selectedPlanForSim];
                  const consumedCharges = Math.round(simMealsUsed * 123.08 * 100) / 100;
                  const totalDeductions = Math.round((consumedCharges + cur.cashback + 500.00) * 100) / 100;
                  const netRefund = Math.max(0, Math.round((cur.upfront - totalDeductions) * 100) / 100);
                  const statusFlag = netRefund > 0 ? 'Refund Due' : 'No Refund / Deficit Absorbed';
                  const deficit = totalDeductions > cur.upfront ? Math.round((totalDeductions - cur.upfront) * 100) / 100 : 0;

                  return (
                    <div className="space-y-3">
                      {/* Slider Input */}
                      <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 flex-1">
                          <label className="font-bold text-stone-800 shrink-0">
                            Meals Consumed:
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={cur.meals}
                            value={simMealsUsed}
                            onChange={(e) => setSimMealsUsed(Number(e.target.value))}
                            className="flex-1 accent-amber-600"
                          />
                          <span className="font-mono font-bold text-sm bg-white border border-stone-300 px-2.5 py-1 rounded-lg text-stone-900 shrink-0">
                            {simMealsUsed} / {cur.meals} Meals
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 shrink-0">
                          Formula: Consumed × ₹123.08 + Cashback + ₹500
                        </span>
                      </div>

                      {/* Calculation Output Table */}
                      <div className="rounded-xl border border-stone-300 overflow-hidden shadow-xs">
                        <div className="bg-stone-800 text-white px-4 py-2.5 flex items-center justify-between">
                          <span className="font-bold text-xs">
                            {cur.name} ({simMealsUsed} Meals Consumed Breakdown)
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            statusFlag === 'Refund Due' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-stone-950'
                          }`}>
                            Status: {statusFlag}
                          </span>
                        </div>

                        <div className="divide-y divide-stone-200 bg-white text-xs">
                          <div className="px-4 py-2 flex items-center justify-between bg-stone-50/50">
                            <span className="text-stone-600">Upfront Amount Paid:</span>
                            <span className="font-mono font-bold text-stone-900">₹{cur.upfront.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div className="px-4 py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-stone-800">Consumed Meal Charges:</span>
                              <span className="text-[10px] text-stone-500 block font-mono">= {simMealsUsed} meals × ₹123.08</span>
                            </div>
                            <span className="font-mono font-bold text-rose-700">₹{consumedCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div className="px-4 py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-stone-800">Cashback Disbursed Reversal:</span>
                              <span className="text-[10px] text-stone-500 block">Upfront cashback benefit disbursed</span>
                            </div>
                            <span className="font-mono font-bold text-rose-700">₹{cur.cashback.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div className="px-4 py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-stone-800">Flat Administrative Processing Fee:</span>
                              <span className="text-[10px] text-stone-500 block">Standard administrative exit fee</span>
                            </div>
                            <span className="font-mono font-bold text-rose-700">₹500.00</span>
                          </div>

                          <div className="px-4 py-2.5 flex items-center justify-between bg-rose-50/70 font-bold text-rose-950">
                            <div>
                              <span>Total Deductions:</span>
                              <span className="text-[10px] text-rose-700 font-normal block font-mono">
                                = Consumed Charges + Cashback Disbursed + Admin Fee
                              </span>
                            </div>
                            <span className="font-mono text-sm">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div className={`px-4 py-3.5 flex items-center justify-between ${
                            statusFlag === 'Refund Due' ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'
                          }`}>
                            <div>
                              <span className="font-extrabold uppercase tracking-wide block">Net Refund Payable:</span>
                              <span className="text-[10px] text-stone-500 font-mono">= MAX(0, Upfront Paid − Total Deductions)</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-display font-extrabold text-xl sm:text-2xl tabular-nums ${
                                statusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-stone-900'
                              }`}>
                                ₹{netRefund.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`block text-[10px] font-bold uppercase mt-0.5 ${
                                statusFlag === 'Refund Due' ? 'text-emerald-700' : 'text-amber-800'
                              }`}>
                                {statusFlag}
                              </span>
                            </div>
                          </div>
                        </div>

                        {deficit > 0 && (
                          <div className="p-3 bg-stone-900 text-stone-200 text-xs flex items-start gap-2 border-t border-stone-700">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-400 block">Zero Negative Balance Protection:</strong>
                              <span>
                                Deductions exceed upfront payment by <strong>₹{deficit.toFixed(2)}</strong>. Under Manna Foods policy, this deficit is 100% absorbed by our kitchen. You will never be asked to pay any deficit upon early exit.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 3. Pre-Populated Scenarios Cards */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Pre-Populated Case Scenarios</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click any scenario to immediately demonstrate the calculation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Scenario 1: Early Exit */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Early Exit
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Refund Due
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-xs">15 Meals on 90-Meal Plan</h5>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Subscriber consumes 15 meals and relocates. Consumed charges (₹1,846.20) + Cashback (₹500) + Admin Fee (₹500) = ₹2,846.20 total deductions.
                      </p>
                      <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-baseline justify-between text-xs">
                        <span className="font-medium text-stone-600">Net Refund Payable:</span>
                        <span className="font-display font-extrabold text-base text-emerald-700">₹8,230.80</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForSim(0);
                        setSimMealsUsed(15);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Demonstrate Scenario 1
                    </button>
                  </div>

                  {/* Scenario 2: Mid-Way Exit */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Mid-Way Exit
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Refund Due
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-xs">70 Meals on 180-Meal Plan</h5>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Subscriber completes 70 meals. Consumed charges (₹8,615.60) + Cashback (₹1,500) + Admin Fee (₹500) = ₹10,615.60 total deductions.
                      </p>
                      <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-baseline justify-between text-xs">
                        <span className="font-medium text-stone-600">Net Refund Payable:</span>
                        <span className="font-display font-extrabold text-base text-emerald-700">₹11,538.40</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForSim(1);
                        setSimMealsUsed(70);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Demonstrate Scenario 2
                    </button>
                  </div>

                  {/* Scenario 3: Late Exit (Deductions Exceed Balance) */}
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          Late Exit
                        </span>
                        <span className="text-[10px] font-bold text-stone-800">
                          Deficit Absorbed
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-xs">175 Meals on 180-Meal Plan</h5>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        Deductions (₹23,539.00) exceed upfront paid (₹22,154.00) by ₹1,385.00. Deficit is 100% absorbed by Manna Foods. You owe ₹0.
                      </p>
                      <div className="mt-3 pt-2 border-t border-amber-200/80 flex items-baseline justify-between text-xs">
                        <span className="font-medium text-stone-600">Net Refund Payable:</span>
                        <span className="font-display font-extrabold text-base text-stone-900">₹0.00</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForSim(1);
                        setSimMealsUsed(175);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Demonstrate Scenario 3
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Transparency & Pause Guarantee Callout */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <PauseCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Flexible Meal Pause Guarantee</h4>
                  <p className="text-stone-500 mt-1 leading-relaxed">
                    Travelling out of Pune? Pause lunch or dinner deliveries with a single tap. Your subscription validity is automatically extended by the exact number of days paused.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Guaranteed Direct Cashback</h4>
                  <p className="text-stone-500 mt-1 leading-relaxed">
                    No complicated voucher rules. Your cashback is directly linked to the plan and brings your effective meal cost down to just ₹100 per thali.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Pune Central Kitchen Delivery</h4>
                  <p className="text-stone-500 mt-1 leading-relaxed">
                    Freshly cooked in Kondhwa and delivered hot daily to Kondhwa, NIBM, Undri, Pisoli, and Tilekar Nagar with 100% zero delivery fees on long-term plans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGULAR MONTHLY & WEEKLY PLANS */}
        {activeTab === 'standard' && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
                Daily, Weekly &amp; Monthly Tiffin Plans
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Flexible short-term options for office professionals and trial subscribers.
              </p>

              {/* Interactive filter tabs */}
              <div className="mt-4 inline-flex p-1 bg-stone-200/80 rounded-xl">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  All Plans
                </button>
                <button
                  onClick={() => setFilterType('monthly')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === 'monthly' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Monthly (30 Meals)
                </button>
                <button
                  onClick={() => setFilterType('weekly')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === 'weekly' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Weekly (6 Meals)
                </button>
                <button
                  onClick={() => setFilterType('daily')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === 'daily' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Daily Tiffin
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map((plan) => {
                const discountAmt = Math.round((plan.basePrice * (plan.discountPercentage || 0)) / 100);
                const finalPrice = plan.basePrice - discountAmt;
                const perMealPrice = Math.round(finalPrice / plan.mealsCount);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl bg-white border transition-all flex flex-col justify-between p-6 sm:p-7 ${
                      plan.isPopular 
                        ? 'border-amber-500 shadow-lg ring-2 ring-amber-500/20' 
                        : 'border-stone-200/90 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                            {plan.planType} Plan
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold font-display text-stone-900 mt-1">
                            {plan.name}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          plan.mealType === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {plan.mealType === 'both' ? 'Veg & Non-Veg' : plan.mealType.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                            ₹{finalPrice}
                          </span>
                          {plan.discountPercentage > 0 && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{plan.basePrice}
                            </span>
                          )}
                          <span className="text-xs text-stone-500 ml-auto">
                            ~₹{perMealPrice}/meal
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-stone-600 font-medium">
                          <span>Total Meals: <strong>{plan.mealsCount}</strong></span>
                          <span>Delivery: <strong className="text-emerald-700">FREE</strong></span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
                          What's Included:
                        </h4>
                        <ul className="space-y-2.5 text-xs text-stone-600">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenConfigStandard(plan)}
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Choose This Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customization & Start Date Modal for Standard or Long-Term */}
        {(configuringPlan || configuringLtOffer) && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  {configuringLtOffer ? 'Long-Term Cashback Offer' : 'Subscription Setup'}
                </span>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  {configuringLtOffer ? configuringLtOffer.name : configuringPlan?.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {configuringLtOffer 
                    ? `${configuringLtOffer.mealsCount} Meals • ₹${configuringLtOffer.cashbackAmount.toLocaleString()} Instant Cashback • ${configuringLtOffer.maxPauseDays} Days Pause` 
                    : `${configuringPlan?.mealsCount} Meals • Fresh Homestyle Cooking`}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Long-term pricing summary card */}
                {configuringLtOffer && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-950">
                    <div className="flex justify-between font-bold">
                      <span>Base Plan Price:</span>
                      <span>₹{configuringLtOffer.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Instant Cashback Credited:</span>
                      <span>− ₹{configuringLtOffer.cashbackAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-200 font-extrabold text-sm text-stone-900">
                      <span>Effective Value:</span>
                      <span className="text-amber-700 font-mono">₹{configuringLtOffer.effectiveValue.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Delivery Slot Preference */}
                <div>
                  <label className="font-semibold text-stone-800 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Select Preferred Delivery Slot:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlot('lunch')}
                      className={`p-2.5 rounded-lg border text-left font-medium ${selectedSlot === 'lunch' ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold' : 'border-stone-200 text-stone-700'}`}
                    >
                      <div>🌞 Lunch Tiffin</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">12:30 PM - 02:00 PM</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot('dinner')}
                      className={`p-2.5 rounded-lg border text-left font-medium ${selectedSlot === 'dinner' ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold' : 'border-stone-200 text-stone-700'}`}
                    >
                      <div>🌙 Dinner Tiffin</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">07:30 PM - 09:00 PM</div>
                    </button>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>Subscription Start Date:</span>
                  </label>
                  <input
                    type="date"
                    min={tomorrowStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    {configuringLtOffer 
                      ? `Includes up to ${configuringLtOffer.maxPauseDays} days of pause allowance with automatic validity extension up to ${configuringLtOffer.maxValidityText.toLowerCase()}.` 
                      : 'Meals can be paused or resumed anytime from your customer dashboard with advance notice.'}
                  </p>
                </div>

                {/* Terms & Conditions Checkbox (for Long-Term Cashback Offer) */}
                {configuringLtOffer && (
                  <div className="pt-2 border-t border-stone-200/80">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) setTermsError(false);
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-stone-700 leading-snug">
                        I have read and agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onOpenTermsModal) {
                              onOpenTermsModal('long_term');
                            } else {
                              setShowInternalTermsModal(true);
                            }
                          }}
                          className="font-bold text-amber-700 hover:text-amber-800 underline inline cursor-pointer"
                        >
                          Terms &amp; Conditions
                        </button>{' '}
                        for Long-Term Subscription Cashback Offers.
                      </span>
                    </label>
                    {termsError && (
                      <p className="text-[11px] text-rose-600 mt-1 pl-6 font-semibold animate-in fade-in">
                        Please check and agree to the Terms &amp; Conditions before adding this plan to cart.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfiguringPlan(null);
                    setConfiguringLtOffer(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubscription}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                >
                  Add Plan to Cart →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legal Modal */}
        <LegalModal
          isOpen={showInternalTermsModal}
          onClose={() => setShowInternalTermsModal(false)}
          initialDoc="long_term"
          policies={legalPolicies}
        />

      </div>
    </section>
  );
};
