import React, { useState } from 'react';
import { Tag, Check, Sparkles } from 'lucide-react';
import { Coupon } from '../types/index.ts';

interface OffersSectionProps {
  coupons: Coupon[];
  onApplyCodeToCart?: (code: string) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ coupons, onApplyCodeToCart }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    if (onApplyCodeToCart) {
      onApplyCodeToCart(code);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Save On Every Bite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Active Discount Coupons &amp; Tiffin Offers
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
            Apply these verified coupon codes during checkout to save instantly on your daily and monthly tiffins in Pune.
          </p>
        </div>

        {coupons.filter(c => c.isActive).length === 0 ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Promotional Coupons Currently Disabled
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              All promotional coupon codes have been paused in favor of our <strong>Long-Term Cashback Packages</strong>. Subscribers receive up to <strong>₹5,000 guaranteed upfront cashback</strong>, comprehensive pause flexibility, and transparent zero-deficit cancellation protection without needing coupon codes.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <span>Direct Cashback (90, 180, 270, 360 Meals) Active</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.filter(c => c.isActive).map((coupon) => (
              <div
                key={coupon.id}
                className="p-5 rounded-2xl border border-stone-200/90 bg-stone-50/70 hover:bg-stone-50 hover:border-amber-400 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span className="font-mono font-bold text-sm text-stone-900 tracking-wider">
                        {coupon.code}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-stone-900 text-sm">
                    {coupon.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {coupon.description}
                  </p>

                  <div className="mt-3 text-[11px] text-stone-500 space-y-0.5 border-t border-stone-200/60 pt-2">
                    <div>Min Order: <strong className="text-stone-700">₹{coupon.minOrderValue}</strong></div>
                    <div>Max Discount: <strong className="text-stone-700">₹{coupon.maxDiscount}</strong></div>
                    <div>Valid for: <strong className="text-stone-700 capitalize">{coupon.applicableFor}</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3">
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copiedCode === coupon.code
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <span>Copy Code</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
