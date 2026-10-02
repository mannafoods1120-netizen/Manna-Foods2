import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Clock, ShieldCheck, Heart } from 'lucide-react';
import { MannaLogo } from './MannaLogo.tsx';

interface HeroProps {
  onExploreMenu: () => void;
  onExplorePlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onExplorePlans }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-stone-50 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition & Messaging */}
          <div className="lg:col-span-7 space-y-6">
            {/* Homemade tagline kicker */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-950 text-xs font-bold tracking-wide border border-amber-300/80 shadow-2xs">
              <MannaLogo size={22} showText={false} />
              <span>Pune’s Trusted Homemade Tiffin Service</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] font-display text-balance">
              Wholesome <span className="text-amber-700">Ghar Ka Khana</span> cooked with mother's love, delivered hot across Pune.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Tired of oily restaurant food? Manna Foods brings you nutritious, hygienic, homestyle lunch and dinner tiffins with pure desi ghee phulkas, fresh seasonal sabzis, and zero preservatives.
            </p>

            {/* Core Values Badge Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700 bg-white/80 p-2.5 rounded-lg border border-stone-200/70 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Desi Ghee &amp; Low Oil</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700 bg-white/80 p-2.5 rounded-lg border border-stone-200/70 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>On-Time Office &amp; Home Drops</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700 bg-white/80 p-2.5 rounded-lg border border-stone-200/70 shadow-2xs col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Hygienic Spillproof Packing</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onExplorePlans}
                className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Subscribe Monthly Plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-300 shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>Order Today's Menu</span>
              </button>
            </div>

            {/* Delivery Hubs */}
            <div className="pt-2 text-xs text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-stone-700">Delivering in:</span>
              <span>Kondhwa</span>
              <span>·</span>
              <span>Kondhwa Bk</span>
              <span>·</span>
              <span>NIBM</span>
              <span>·</span>
              <span>Salunke Vihar</span>
              <span>·</span>
              <span>Mohammad Wadi Road</span>
              <span>·</span>
              <span>Pisoli</span>
              <span>·</span>
              <span>Kad Nagar</span>
              <span>·</span>
              <span>Wadachi Wadi</span>
              <span>·</span>
              <span>Undri</span>
              <span>·</span>
              <span>Yewalewadi</span>
              <span>·</span>
              <span>Tilekar Nagar</span>
              <span>·</span>
              <span>Sukhsagar Nagar</span>
              <span>·</span>
              <span>VIT Collage Kondhwa</span>
            </div>
          </div>

          {/* Right Column: Culinary Presentation Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative background glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-3xl blur-xl opacity-70" />

              <div className="relative rounded-2xl bg-white p-6 shadow-xl border border-stone-200/80">
                {/* Visual Dabba / Thali Presentation */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 flex flex-col items-center justify-center p-6 text-white text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-2 mb-3 border-2 border-amber-400">
                    <img src="/logo.svg" alt="Manna Foods Logo" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-amber-100">
                    Manna Foods Pune
                  </h3>
                  <p className="text-xs text-amber-200/90 mt-1 max-w-xs">
                    3 Phulkas + 2 Sabzis (Paneer/Curry &amp; Dry) + Dal Tadka + Jeera Rice + Salad + Sweet
                  </p>
                  <div className="mt-3 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-200">
                    Pure Veg · 100% Desi Ghee · Sharbati Wheat
                  </div>
                </div>

                {/* Micro social proof and stats */}
                <div className="mt-5 grid grid-cols-3 divide-x divide-stone-200 text-center">
                  <div>
                    <div className="text-lg font-bold text-stone-900 tabular-nums">25,000+</div>
                    <div className="text-[11px] text-stone-500 font-medium">Meals Served</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900 tabular-nums">4.8 ★</div>
                    <div className="text-[11px] text-stone-500 font-medium">Google Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900">7 Days</div>
                    <div className="text-[11px] text-stone-500 font-medium">Pause Flexibility</div>
                  </div>
                </div>

                {/* Hygiene highlight */}
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-emerald-700 shrink-0" />
                  <p className="text-xs text-emerald-900">
                    <strong>Cooked Daily in Small Batches:</strong> Never pre-cooked or stored overnight. Pure homestyle taste guaranteed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
