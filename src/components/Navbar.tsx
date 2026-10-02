import React from 'react';
import { ShoppingBag, User as UserIcon, Shield, Menu as MenuIcon, X, Phone, LogOut } from 'lucide-react';
import { User, BusinessSettings } from '../types/index.ts';
import { MannaLogo } from './MannaLogo.tsx';

interface NavbarProps {
  currentTab: 'customer' | 'admin';
  setCurrentTab: (tab: 'customer' | 'admin') => void;
  activeCustomerPage: string;
  setActiveCustomerPage: (page: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: User | null;
  adminUser: User | null;
  onOpenAuth: () => void;
  onLogoutCustomer: () => void;
  onLogoutAdmin: () => void;
  settings?: BusinessSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeCustomerPage,
  setActiveCustomerPage,
  cartCount,
  onOpenCart,
  user,
  adminUser,
  onOpenAuth,
  onLogoutCustomer,
  onLogoutAdmin,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (page: string) => {
    setCurrentTab('customer');
    setActiveCustomerPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span>📍 Fresh Homestyle Tiffin Across Pune (Kondhwa, NIBM, Undri, Pisoli, Tilekar Nagar)</span>
        <span className="hidden sm:inline text-stone-400">·</span>
        <span className="hidden sm:inline text-amber-300">Use code <strong className="font-mono text-white">FIRSTMONTH</strong> for 10% off subscriptions</span>
      </div>

      {/* Main 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left group cursor-pointer"
            title="Manna Foods Home"
          >
            <MannaLogo size={42} showText={true} />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text with hover states) */}
        {currentTab === 'customer' ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-amber-700 transition-colors ${activeCustomerPage === 'home' ? 'text-amber-700 font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className={`hover:text-amber-700 transition-colors ${activeCustomerPage === 'menu' ? 'text-amber-700 font-semibold' : ''}`}
            >
              Daily Menu
            </button>
            <button
              onClick={() => handleNavClick('plans')}
              className={`hover:text-amber-700 transition-colors ${activeCustomerPage === 'plans' ? 'text-amber-700 font-semibold' : ''}`}
            >
              Tiffin Plans
            </button>
            <button
              onClick={() => handleNavClick('offers')}
              className={`hover:text-amber-700 transition-colors ${activeCustomerPage === 'offers' ? 'text-amber-700 font-semibold' : ''}`}
            >
              Offers &amp; Coupons
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`hover:text-amber-700 transition-colors ${activeCustomerPage === 'about' ? 'text-amber-700 font-semibold' : ''}`}
            >
              Why Manna
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-stone-600">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-mono">
              🛡️ Admin Workspace
            </span>
            <span className="text-stone-400">·</span>
            <span>Real-time Pune Operations Control</span>
          </div>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {currentTab === 'customer' ? (
            <>
              {/* WhatsApp Quick Order & Chat Support button */}
              <a
                href={`https://wa.me/${(settings?.whatsappNumber || '9890786024').replace(/[^0-9]/g, '') || '919890786024'}?text=Hello%20Manna%20Foods%20Support%2C%20I%20want%20to%20inquire%20about%20tiffin%20plans`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: {settings?.whatsappNumber || '+91 9890786024'}</span>
              </a>

              {/* Cart Drawer Button */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Customer Account Button */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                  </button>
                  <button
                    onClick={onLogoutCustomer}
                    title="Log Out"
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
              )}

              {/* Switch to Admin Mode */}
              <button
                onClick={() => setCurrentTab('admin')}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1 transition-colors"
                title="Open Admin Management Panel"
              >
                <Shield className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </>
          ) : (
            <>
              {/* Back to Customer Interface */}
              <button
                onClick={() => setCurrentTab('customer')}
                className="px-3.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
              >
                ← Customer App
              </button>

              {adminUser && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 font-mono hidden md:inline">
                    {adminUser.email}
                  </span>
                  <button
                    onClick={onLogoutAdmin}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                    title="Log Out Admin"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mobile hamburger toggle */}
          {currentTab === 'customer' && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && currentTab === 'customer' && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('menu')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Daily Menu
          </button>
          <button
            onClick={() => handleNavClick('plans')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Tiffin Plans &amp; Monthly Subscriptions
          </button>
          <button
            onClick={() => handleNavClick('offers')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Offers &amp; Coupons
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            About &amp; Hygiene Standards
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-amber-700 bg-amber-50"
            >
              My Account &amp; Active Subscriptions
            </button>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-stone-900 bg-stone-100"
            >
              Customer Log In / Register
            </button>
          )}

          <a
            href={`https://wa.me/${(settings?.whatsappNumber || '9890786024').replace(/[^0-9]/g, '') || '919890786024'}?text=Hello%20Manna%20Foods%20Support%2C%20I%20want%20to%20inquire%20about%20tiffin%20plans`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 mt-2"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Chat Support: {settings?.whatsappNumber || '+91 9890786024'}</span>
          </a>
        </div>
      )}
    </header>
  );
};
