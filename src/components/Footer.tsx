import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { BusinessSettings } from '../types/index.ts';
import { MannaLogo } from './MannaLogo.tsx';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigate: (page: string) => void;
  onOpenLegal?: (doc: 'long_term' | 'general' | 'privacy') => void;
  settings?: BusinessSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigate, onOpenLegal, settings }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 pb-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <MannaLogo size={42} showText={true} dark={true} />
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Homemade • Healthy • Hygienic • Delicious • Affordable
            </p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Wholesome lunch and dinner tiffins cooked daily in small batches for working professionals and students in Pune.
            </p>
          </div>

          {/* Quick links & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Explore &amp; Policies
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Daily Thali Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('plans')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Long-Term Cashback Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Promo Offers &amp; Discounts
                </button>
              </li>
              <li className="pt-2 border-t border-stone-800/80">
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('privacy')} 
                  className="hover:text-amber-400 transition-colors cursor-pointer font-medium text-stone-300"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('general')} 
                  className="hover:text-amber-400 transition-colors cursor-pointer font-medium text-stone-300"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('long_term')} 
                  className="hover:text-amber-400 transition-colors cursor-pointer font-medium text-amber-400/90"
                >
                  Long-Term Cashback Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery areas in Pune */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Delivery Hubs (Pune)
            </h4>
            <div className="text-[11px] text-stone-400 space-y-1.5 leading-relaxed">
              <div>
                {(settings?.deliveryAreas && settings.deliveryAreas.length > 0
                  ? settings.deliveryAreas
                  : [
                      'Kondhwa',
                      'Kondhwa Bk',
                      'NIBM',
                      'Salunke Vihar',
                      'Mohammad Wadi Road',
                      'Pisoli',
                      'Kad Nagar',
                      'Wadachi Wadi',
                      'Undri',
                      'Yewalewadi',
                      'Tilekar Nagar',
                      'Sukhsagar Nagar',
                      'VIT Collage Kondhwa'
                    ]
                ).join(' · ')}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-400/90 font-medium">
              Lunch Delivery: 12:30 PM - 02:00 PM<br />
              Dinner Delivery: 07:45 PM - 09:15 PM
            </div>
          </div>

          {/* Kitchen & Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Pune Kitchen &amp; WhatsApp
            </h4>
            <div className="space-y-2 text-stone-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings?.address || 'A3 Saket Building, Kondhwa Katraj Road, Kondhwa Bk, Pune 411048'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings?.contactNumber || '+91 9890786024'} (WhatsApp Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{settings?.email || 'mannafoods1120@gmail.com'}</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
              >
                Access Admin Panel
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
          <div>
            © {new Date().getFullYear()} Manna Foods. All rights reserved. Pune, Maharashtra.
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center text-stone-400">
            <button 
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="hover:text-amber-400 underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button 
              onClick={() => onOpenLegal && onOpenLegal('general')}
              className="hover:text-amber-400 underline transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span>·</span>
            <button 
              onClick={() => onOpenLegal && onOpenLegal('long_term')}
              className="hover:text-amber-400 underline transition-colors cursor-pointer"
            >
              Cashback Terms
            </button>
            <span>·</span>
            <span>FSSAI Certified Homestyle Kitchen</span>
            <span>·</span>
            <span>Razorpay Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
