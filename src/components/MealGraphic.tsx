import React from 'react';

interface MealGraphicProps {
  name: string;
  category: string;
  mealType: 'veg' | 'non-veg';
  className?: string;
}

export const MealGraphic: React.FC<MealGraphicProps> = ({ name, category, mealType, className = '' }) => {
  const isVeg = mealType === 'veg';
  const lower = (name + ' ' + category).toLowerCase();

  // Color schemes based on dish profile
  let bgGradient = 'from-amber-700 via-orange-600 to-amber-900';
  let accentColor = '#f59e0b';

  if (lower.includes('paneer')) {
    bgGradient = 'from-amber-600 via-yellow-600 to-amber-800';
    accentColor = '#fde047';
  } else if (lower.includes('mutton') || lower.includes('gosht')) {
    bgGradient = 'from-rose-950 via-red-900 to-amber-950';
    accentColor = '#f43f5e';
  } else if (lower.includes('chicken') || lower.includes('kolhapuri')) {
    bgGradient = 'from-red-800 via-orange-700 to-amber-900';
    accentColor = '#ef4444';
  } else if (lower.includes('anda') || lower.includes('egg')) {
    bgGradient = 'from-amber-700 via-orange-600 to-yellow-800';
    accentColor = '#facc15';
  } else if (lower.includes('dal') || lower.includes('homely') || lower.includes('ghar')) {
    bgGradient = 'from-yellow-700 via-amber-600 to-orange-800';
    accentColor = '#eab308';
  } else if (lower.includes('solkadhi') || lower.includes('kokum')) {
    bgGradient = 'from-rose-700 via-pink-700 to-purple-900';
    accentColor = '#fb7185';
  } else if (lower.includes('sweet') || lower.includes('jamun')) {
    bgGradient = 'from-amber-800 via-yellow-700 to-amber-950';
    accentColor = '#fbbf24';
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} flex items-center justify-center select-none ${className}`}>
      {/* Decorative culinary background rings */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#ffffff" strokeWidth="0.75" />
      </svg>

      {/* Stainless steel thali base representation */}
      <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-stone-400 via-stone-200 to-stone-300 shadow-xl border-4 border-stone-100 flex items-center justify-center p-2">
        {/* Inner culinary plate content */}
        <div className="w-full h-full rounded-full bg-stone-900/90 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden shadow-inner">
          <div className="text-2xl mb-0.5 transform hover:scale-110 transition-transform">
            {lower.includes('paneer') ? '🧀' : 
             lower.includes('mutton') || lower.includes('gosht') ? '🥩' :
             lower.includes('chicken') ? '🍗' : 
             lower.includes('egg') || lower.includes('anda') ? '🥚' : 
             lower.includes('solkadhi') ? '🥥' : 
             lower.includes('jamun') ? '🍯' : 
             lower.includes('phulka') || lower.includes('roti') ? '🫓' : '🍲'}
          </div>
          <span className="text-[11px] font-bold tracking-tight text-amber-200 leading-tight line-clamp-1 max-w-[85px]">
            {name.split(' ')[0]}
          </span>
          <span className="text-[9px] text-stone-300 uppercase tracking-widest font-mono">
            {isVeg ? 'Pure Veg' : 'Non-Veg'}
          </span>
        </div>
      </div>

      {/* Floating spice dust dots */}
      <div className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full bg-amber-300/60" />
      <div className="absolute bottom-4 right-5 w-2 h-2 rounded-full bg-emerald-400/40" />
      <div className="absolute top-4 right-6 w-1 h-1 rounded-full bg-white/70" />

      {/* Fresh Pune Homemade seal badge */}
      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-900/75 backdrop-blur-xs text-[10px] text-amber-200 font-medium border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Fresh Daily
      </div>
    </div>
  );
};
