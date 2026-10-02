import React from 'react';

interface MannaLogoProps {
  className?: string;
  size?: number; // Size in pixels for the icon
  showText?: boolean;
  layout?: 'horizontal' | 'stacked' | 'icon-only';
  tagline?: string | boolean;
  dark?: boolean; // For dark backgrounds (e.g. Footer or dark headers)
}

export const MannaLogo: React.FC<MannaLogoProps> = ({
  className = '',
  size = 42,
  showText = true,
  layout = 'horizontal',
  tagline = 'Every Meal is a Happy Meal',
  dark = false
}) => {
  // SVG Chef Hat with Rising Yellow & Red Flame bursting through top
  const icon = (
    <svg 
      viewBox="0 0 512 512" 
      width={size} 
      height={size} 
      className="shrink-0 transition-transform group-hover:scale-105"
      aria-label="Manna Foods Official Logo"
    >
      {/* Chef Hat Outline (Charcoal brush contour, transparent fill) */}
      <g id="chef-hat">
        {/* Base inner cuff line */}
        <path 
          d="M 215 375 C 245 382, 280 382, 318 375" 
          fill="none" 
          stroke={dark ? "#F5F5F4" : "#222222"} 
          strokeWidth="16" 
          strokeLinecap="round" 
        />

        {/* Main Hat Silhouette */}
        <path 
          d="M 180 378 
             C 174 345, 165 315, 160 300 
             C 120 292, 108 238, 126 198 
             C 142 158, 188 165, 204 190 
             C 216 142, 244 118, 266 118 
             C 292 118, 314 142, 324 190 
             C 342 165, 386 158, 402 198 
             C 418 238, 408 292, 368 300 
             C 363 315, 354 345, 348 378 
             C 305 400, 222 400, 180 378 Z" 
          fill="none" 
          stroke={dark ? "#F5F5F4" : "#222222"} 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* Center Rising Flame (Bursts out through the top arch) */}
      <g id="rising-flame">
        {/* Outer Yellow Backing & Border */}
        <path 
          d="M 256 370 
             C 222 310, 218 240, 224 200 
             C 230 160, 248 125, 245 78 
             C 243 60, 238 48, 240 44 
             C 244 44, 256 65, 260 90 
             C 268 135, 252 170, 266 220 
             C 278 260, 302 220, 300 185 
             C 298 162, 288 138, 290 115 
             C 292 126, 302 155, 304 185 
             C 308 232, 282 302, 256 370 Z" 
          fill="#FFD000" 
          stroke="#FFD000" 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />

        {/* Fire Red Inner Core - Left Petal */}
        <path 
          d="M 256 365 
             C 228 308, 224 242, 229 205 
             C 234 166, 250 134, 248 88 
             C 246 72, 242 58, 243 52 
             C 245 58, 252 80, 255 104 
             C 260 145, 248 185, 256 240 
             C 260 270, 262 315, 256 365 Z" 
          fill="#E51A1A" 
        />

        {/* Fire Red Inner Core - Right Petal */}
        <path 
          d="M 256 365 
             C 262 315, 260 270, 256 240 
             C 254 222, 252 205, 255 180 
             C 262 215, 274 245, 286 245 
             C 294 245, 298 222, 297 198 
             C 295 180, 288 162, 288 145 
             C 292 162, 300 185, 301 210 
             C 304 252, 280 312, 256 365 Z" 
          fill="#E51A1A" 
        />

        {/* Central Yellow Accent Streak */}
        <path 
          d="M 256 362 
             C 260 310, 256 262, 252 222 
             C 248 180, 255 142, 256 104 
             C 257 80, 252 62, 248 50 
             C 252 60, 262 86, 262 110 
             C 262 145, 254 180, 258 228 
             C 262 270, 264 315, 256 362 Z" 
          fill="#FFD700" 
        />
      </g>
    </svg>
  );

  if (layout === 'icon-only' || !showText) {
    return <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>{icon}</div>;
  }

  const taglineText = typeof tagline === 'string' ? tagline : 'Every Meal is a Happy Meal';

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {icon}
        <div className="mt-1.5">
          <span 
            className={`text-2xl font-black tracking-tight block leading-none ${
              dark ? 'text-white' : 'text-stone-950'
            }`}
            style={{ fontFamily: "'Permanent Marker', 'Sedgwick Ave', 'Plus Jakarta Sans', cursive, sans-serif" }}
          >
            Manna Foods
          </span>
          {tagline && (
            <span 
              className={`text-xs block mt-1 tracking-wide ${
                dark ? 'text-amber-300 font-bold' : 'text-stone-800 font-bold'
              }`}
              style={{ fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive" }}
            >
              {taglineText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout (Default: icon on left, typography on right)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="shrink-0 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <span 
          className={`text-xl sm:text-2xl font-black tracking-tight block leading-tight ${
            dark ? 'text-white' : 'text-stone-950'
          }`}
          style={{ fontFamily: "'Permanent Marker', 'Sedgwick Ave', 'Outfit', cursive, sans-serif" }}
        >
          Manna Foods
        </span>
        {tagline && (
          <span 
            className={`text-xs block leading-none mt-0.5 tracking-wide ${
              dark ? 'text-amber-300 font-bold' : 'text-stone-800 font-bold'
            }`}
            style={{ fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive" }}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
