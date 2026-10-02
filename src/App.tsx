import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  Category, 
  SubscriptionPlan, 
  Coupon, 
  CartItem, 
  User, 
  Order, 
  CustomerSubscription, 
  BusinessSettings,
  LegalPolicies
} from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { MealCard } from './components/MealCard.tsx';
import { SubscriptionPlans } from './components/SubscriptionPlans.tsx';
import { OffersSection } from './components/OffersSection.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { RazorpayModal } from './components/RazorpayModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { Footer } from './components/Footer.tsx';
import { LegalModal } from './components/LegalModal.tsx';
import { Heart, ShieldCheck, Sparkles, Clock, Check, Utensils, MessageCircle, Phone } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<'customer' | 'admin'>('customer');
  const [activeCustomerPage, setActiveCustomerPage] = useState<string>('home');

  // Application Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // User Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Menu Filter State (on Menu page or Home)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<'all' | 'Chicken' | 'Mutton'>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Checkout & Payment State
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState<any | null>(null);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);

  // Order Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedSubscription, setConfirmedSubscription] = useState<CustomerSubscription | null>(null);
  const [confirmedWhatsApp, setConfirmedWhatsApp] = useState<any | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Selected meal preview modal
  const [selectedMealDetail, setSelectedMealDetail] = useState<MenuItem | null>(null);
  const [checkoutGlobalError, setCheckoutGlobalError] = useState<string | null>(null);

  // Legal & Terms Modal States
  const [legalPolicies, setLegalPolicies] = useState<LegalPolicies | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<'long_term' | 'general' | 'privacy'>('long_term');

  // Load Initial Data on Mount
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const [menuRes, catRes, plansRes, settingsRes, legalRes] = await Promise.all([
          api.getMenu().catch(() => []),
          api.getCategories().catch(() => []),
          api.getPlans().catch(() => []),
          api.getSettings().catch(() => null),
          api.getLegalPolicies().catch(() => null)
        ]);

        setMenuItems(menuRes);
        setCategories(catRes);
        setPlans(plansRes);
        if (settingsRes) setSettings(settingsRes);
        if (legalRes) setLegalPolicies(legalRes);

        // Fetch coupons
        try {
          const couponRes = await api.getCoupons();
          setCoupons(couponRes);
        } catch {
          // Public users won't get admin coupon list, fallback to standard promo list
          setCoupons([
            {
              id: 'cpn-01',
              code: 'FIRSTMONTH',
              name: 'New Subscriber Welcome',
              description: '10% discount on 30-day monthly tiffin plans',
              discountType: 'percentage',
              discountValue: 10,
              minOrderValue: 2500,
              maxDiscount: 400,
              startDate: '2026-01-01',
              expiryDate: '2026-12-31',
              usageLimit: 500,
              usedCount: 28,
              perCustomerLimit: 1,
              isActive: true,
              applicableFor: 'subscriptions'
            },
            {
              id: 'cpn-02',
              code: 'PUNETIFFIN',
              name: 'Pune Foodie Special',
              description: 'Flat ₹50 OFF on daily meal orders above ₹250',
              discountType: 'fixed',
              discountValue: 50,
              minOrderValue: 250,
              maxDiscount: 50,
              startDate: '2026-01-01',
              expiryDate: '2026-12-31',
              usageLimit: 300,
              usedCount: 42,
              perCustomerLimit: 3,
              isActive: true,
              applicableFor: 'meals'
            },
            {
              id: 'cpn-03',
              code: 'MANNA100',
              name: 'Flat ₹100 Subscription Discount',
              description: 'Flat ₹100 discount on your tiffin plan renewal',
              discountType: 'fixed',
              discountValue: 100,
              minOrderValue: 750,
              maxDiscount: 100,
              startDate: '2026-01-01',
              expiryDate: '2026-12-31',
              usageLimit: 1000,
              usedCount: 64,
              perCustomerLimit: 2,
              isActive: true,
              applicableFor: 'subscriptions'
            }
          ]);
        }

        // Restore Sessions
        try {
          const userSession = await api.getMe(false);
          if (userSession?.user) setCurrentUser(userSession.user);
        } catch {
          // No active customer token
        }

        try {
          const adminSession = await api.getMe(true);
          if (adminSession?.user && adminSession.user.role === 'admin') {
            setAdminUser(adminSession.user);
          }
        } catch {
          // No active admin token
        }
      } catch (err) {
        console.error('Initial data load failed:', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Cart operations
  const handleAddToCart = (meal: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.mealId === meal.id);
      if (existing) {
        return prev.map((item) =>
          item.mealId === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          type: 'meal',
          mealId: meal.id,
          name: meal.name,
          price: meal.price,
          quantity: 1,
          mealType: meal.mealType,
          image: meal.image
        }
      ];
    });
  };

  const handleRemoveFromCart = (mealId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.mealId === mealId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.mealId !== mealId);
      }
      return prev.map((item) =>
        item.mealId === mealId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Add Subscription Plan to Cart
  const handleSelectPlanForSubscription = (
    plan: SubscriptionPlan,
    config: { startDate: string; deliverySlot: 'lunch' | 'dinner' | 'both'; mealTypePreference: any }
  ) => {
    const discountAmt = Math.round((plan.basePrice * (plan.discountPercentage || 0)) / 100);
    const effectivePrice = plan.basePrice - discountAmt;

    const newCartItem: CartItem = {
      id: `cart-sub-${Date.now()}`,
      type: 'subscription',
      planId: plan.id,
      name: `${plan.name} (${plan.mealsCount} Meals)`,
      price: effectivePrice,
      quantity: 1,
      mealType: config.mealTypePreference,
      subscriptionConfig: {
        startDate: config.startDate,
        deliverySlot: config.deliverySlot,
        mealsCount: plan.mealsCount,
        frequency: plan.deliveryFrequency
      }
    };

    setCartItems((prev) => [...prev, newCartItem]);
    setCartDrawerOpen(true);
  };

  // Proceed from Cart to Razorpay Checkout
  const handleProceedToCheckout = async (checkoutData: {
    deliveryAddress: any;
    deliverySlot: string;
    deliveryDate: string;
    couponCode?: string;
    notes?: string;
  }) => {
    try {
      const itemsPayload = cartItems.map((it) => ({
        type: it.type,
        mealId: it.mealId,
        planId: it.planId,
        quantity: it.quantity,
        name: it.name,
        price: it.price
      }));

      const res = await api.createPaymentOrder({
        items: itemsPayload as any,
        couponCode: checkoutData.couponCode,
        deliveryAddress: checkoutData.deliveryAddress,
        deliverySlot: checkoutData.deliverySlot,
        deliveryDate: checkoutData.deliveryDate,
        notes: checkoutData.notes,
        paymentMethod: 'razorpay'
      });

      if (res.success) {
        setCheckoutGlobalError(null);
        setActiveRazorpayOrder(res);
        setCartDrawerOpen(false);
        setRazorpayModalOpen(true);
      }
    } catch (err: any) {
      setCheckoutGlobalError(err.message || 'Failed to initialize payment order');
    }
  };

  // Payment Verification Success
  const handlePaymentSuccess = (order: Order, subscription?: CustomerSubscription, waDetails?: any) => {
    setRazorpayModalOpen(false);
    setActiveRazorpayOrder(null);
    setCartItems([]); // Clear cart
    setConfirmedOrder(order);
    setConfirmedSubscription(subscription || null);
    setConfirmedWhatsApp(waDetails || null);
    setOrderModalOpen(true);

    if (!currentUser && order.customerId) {
      setCurrentUser({
        id: order.customerId,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        role: 'customer',
        address: order.deliveryAddress?.addressLine,
        area: order.deliveryAddress?.area,
        city: order.deliveryAddress?.city || 'Pune',
        pincode: order.deliveryAddress?.pincode,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
    }
  };

  // Customer Logout
  const handleCustomerLogout = () => {
    api.clearToken(false);
    setCurrentUser(null);
    if (activeCustomerPage === 'dashboard') {
      setActiveCustomerPage('home');
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    api.clearToken(true);
    setAdminUser(null);
  };

  // Filtered menu items
  const filteredMeals = menuItems.filter((meal) => {
    if (selectedCategory === 'Veg') {
      if (meal.category !== 'Veg' && meal.mealType !== 'veg') return false;
    } else if (selectedCategory === 'Non-Veg') {
      if (meal.category !== 'Non-Veg' && meal.mealType !== 'non-veg') return false;
      if (selectedSubCategory !== 'all' && meal.subCategory !== selectedSubCategory) return false;
    } else if (selectedCategory !== 'all') {
      if (meal.category !== selectedCategory) return false;
    }

    if (dietFilter !== 'all' && meal.mealType !== dietFilter) return false;
    return true;
  });

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const deliveryAreasList = settings?.deliveryAreas || [
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
  ];

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-stone-900 flex flex-col antialiased">
      {/* Primary Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeCustomerPage={activeCustomerPage}
        setActiveCustomerPage={setActiveCustomerPage}
        cartCount={cartTotalCount}
        onOpenCart={() => setCartDrawerOpen(true)}
        user={currentUser}
        adminUser={adminUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogoutCustomer={handleCustomerLogout}
        onLogoutAdmin={handleAdminLogout}
        settings={settings}
      />

      {checkoutGlobalError && (
        <div className="bg-red-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-md sticky top-16 z-50">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span>⚠️ {checkoutGlobalError}</span>
            <button 
              onClick={() => setCheckoutGlobalError(null)} 
              className="ml-auto text-white/80 hover:text-white font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: ADMIN PANEL */}
      {currentTab === 'admin' ? (
        <div className="flex-1">
          <AdminPanel
            adminUser={adminUser}
            onAdminLogin={(admin) => setAdminUser(admin)}
            onCloseAdmin={() => setCurrentTab('customer')}
          />
        </div>
      ) : (
        /* VIEW 2: CUSTOMER INTERFACE */
        <main className="flex-1">
          {/* A. CUSTOMER DASHBOARD PAGE */}
          {activeCustomerPage === 'dashboard' && currentUser ? (
            <CustomerDashboard
              user={currentUser}
              onUpdateProfile={(u) => setCurrentUser(u)}
              onLogout={handleCustomerLogout}
              onStartOrder={() => setActiveCustomerPage('menu')}
              deliveryAreas={deliveryAreasList}
              settings={settings}
            />
          ) : (
            <>
              {/* B. HOME PAGE HERO */}
              {activeCustomerPage === 'home' && (
                <Hero
                  onExploreMenu={() => setActiveCustomerPage('menu')}
                  onExplorePlans={() => {
                    const el = document.getElementById('plans-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else setActiveCustomerPage('plans');
                  }}
                />
              )}

              {/* C. OFFERS TICKER (ON HOME OR OFFERS PAGE) */}
              {(activeCustomerPage === 'home' || activeCustomerPage === 'offers') && (
                <OffersSection
                  coupons={coupons}
                  onApplyCodeToCart={(code) => {
                    setCartDrawerOpen(true);
                  }}
                />
              )}

              {/* D. MENU SECTION (ON HOME & MENU PAGES) */}
              <section id="menu-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
                      <Utensils className="w-3.5 h-3.5 text-amber-700" />
                      <span>Today's Fresh Kitchen Board</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                      Daily Homestyle Thalis &amp; Meals
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      Cooked with pure spices and unadulterated desi ghee in Kothrud, Pune. Order single meals or add to cart.
                    </p>
                  </div>

                  {/* Veg / Non-Veg Quick Segmented Toggle */}
                  <div className="inline-flex p-1 bg-stone-200/80 rounded-xl self-start">
                    <button
                      onClick={() => setDietFilter('all')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        dietFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      All Dishes
                    </button>
                    <button
                      onClick={() => setDietFilter('veg')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                        dietFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>Pure Veg</span>
                    </button>
                    <button
                      onClick={() => setDietFilter('non-veg')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                        dietFilter === 'non-veg' ? 'bg-red-700 text-white shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>

                {/* Two Main Categories: All, Veg, Non-Veg */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubCategory('all');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors font-semibold ${
                        selectedCategory === 'all'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      All Dishes
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('Veg');
                        setSelectedSubCategory('all');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors font-semibold flex items-center gap-1.5 ${
                        selectedCategory === 'Veg'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>🌿 Veg</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('Non-Veg');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors font-semibold flex items-center gap-1.5 ${
                        selectedCategory === 'Non-Veg'
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>🍗 Non-Veg</span>
                    </button>
                  </div>

                  {/* Two Sub-Categories in Non-Veg: Chicken & Mutton */}
                  {selectedCategory === 'Non-Veg' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 animate-in fade-in-50 duration-150">
                      <span className="text-xs font-semibold text-stone-500">Non-Veg Variety:</span>
                      <button
                        onClick={() => setSelectedSubCategory('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedSubCategory === 'all'
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        All Non-Veg
                      </button>
                      <button
                        onClick={() => setSelectedSubCategory('Chicken')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          selectedSubCategory === 'Chicken'
                            ? 'bg-amber-600 text-white font-semibold shadow-xs'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <span>🍗 Chicken</span>
                      </button>
                      <button
                        onClick={() => setSelectedSubCategory('Mutton')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          selectedSubCategory === 'Mutton'
                            ? 'bg-red-800 text-white font-semibold shadow-xs'
                            : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        <span>🥩 Mutton</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Meals Grid */}
                {loadingData ? (
                  <div className="py-20 text-center text-xs text-stone-500">
                    Loading today's fresh kitchen items...
                  </div>
                ) : filteredMeals.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8">
                    <p className="text-sm font-semibold text-stone-700">
                      No items match this category filter today.
                    </p>
                    <button
                      onClick={() => { setSelectedCategory('all'); setDietFilter('all'); }}
                      className="mt-3 px-4 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMeals.map((meal) => {
                      const itemInCart = cartItems.find((it) => it.mealId === meal.id);
                      return (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          quantityInCart={itemInCart ? itemInCart.quantity : 0}
                          onAddToCart={handleAddToCart}
                          onRemoveFromCart={handleRemoveFromCart}
                          onSelectMealDetails={(m) => setSelectedMealDetail(m)}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* E. SUBSCRIPTION PLANS SECTION */}
              <div id="plans-section">
                <SubscriptionPlans
                  plans={plans}
                  onSelectPlanForSubscription={handleSelectPlanForSubscription}
                  onOpenTermsModal={(doc) => {
                    setActiveLegalDoc(doc);
                    setLegalModalOpen(true);
                  }}
                  legalPolicies={legalPolicies}
                />
              </div>

              {/* F. WHY MANNA FOODS / HYGIENE STANDARDS */}
              <section className="py-16 bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>The Manna Foods Hygiene Promise</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                      Why Over 2,500 Pune Residents Rely on Us Daily
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2">
                      Cooked just like at home — clean, non-repetitive, and easy on your stomach.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                        🌾
                      </div>
                      <h3 className="font-display font-bold text-stone-900 text-base">
                        100% Sharbati Whole Wheat Atta
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Never mixed with maida. Every phulka is puffed fresh on an open flame with pure Cow Desi Ghee so you stay energetic throughout your workday.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                        🌿
                      </div>
                      <h3 className="font-display font-bold text-stone-900 text-base">
                        Zero Soda &amp; Zero Artificial Colors
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        We grind our own dry coconut, kanda-lasan masala, and whole spices daily. No artificial MSG, preservatives, or thickeners.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                        🚚
                      </div>
                      <h3 className="font-display font-bold text-stone-900 text-base">
                        Insulated Spillproof Dabba Delivery
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Packed in food-grade microwave-safe airtight containers or traditional stainless steel carriers with thermal wraps to keep food steaming hot.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        user={currentUser}
        onOpenAuth={() => {
          setCartDrawerOpen(false);
          setAuthModalOpen(true);
        }}
        onProceedToCheckout={handleProceedToCheckout}
        deliveryAreas={deliveryAreasList}
      />

      {/* Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        orderData={activeRazorpayOrder}
        onSuccess={handlePaymentSuccess}
        onFailure={(msg) => {
          // Keep active order so user can retry
          console.warn('Payment failed:', msg);
        }}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={confirmedOrder}
        subscription={confirmedSubscription}
        whatsAppResult={confirmedWhatsApp}
        onGoToOrders={() => {
          setOrderModalOpen(false);
          setActiveCustomerPage('dashboard');
        }}
      />

      {/* Auth Modal (Customer Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
        }}
        deliveryAreas={deliveryAreasList}
      />

      {/* Meal Detail Modal */}
      {selectedMealDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedMealDetail(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${selectedMealDetail.mealType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'}`} />
              <span className="text-xs font-semibold text-stone-500 uppercase">{selectedMealDetail.category}</span>
            </div>

            {selectedMealDetail.image && (
              <div className="w-full h-44 rounded-xl overflow-hidden mb-3 border border-stone-200">
                <img
                  src={selectedMealDetail.image}
                  alt={selectedMealDetail.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="font-display font-bold text-xl text-stone-900">
              {selectedMealDetail.name}
            </h3>

            <div className="text-lg font-extrabold text-amber-800 tabular-nums my-2">
              ₹{selectedMealDetail.price}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {selectedMealDetail.description}
            </p>

            {selectedMealDetail.ingredients && selectedMealDetail.ingredients.length > 0 && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 mb-4 text-xs">
                <span className="font-semibold text-stone-800 block mb-1">Key Ingredients &amp; Recipe:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedMealDetail.ingredients.map((ing, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700 text-[11px]">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleAddToCart(selectedMealDetail);
                  setSelectedMealDetail(null);
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Add to Cart (₹{selectedMealDetail.price})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setCurrentTab('admin')}
        onNavigate={(page) => setActiveCustomerPage(page)}
        onOpenLegal={(doc) => {
          setActiveLegalDoc(doc);
          setLegalModalOpen(true);
        }}
      />

      {/* Global Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
        policies={legalPolicies}
      />

      {/* Floating Customer & Chat Support Widget */}
      {currentTab === 'customer' && (
        <aside aria-label="Customer Support">
          <a
            href={`https://wa.me/${(settings?.whatsappNumber || '9890786024').replace(/[^0-9]/g, '') || '919890786024'}?text=Hello%20Manna%20Foods%20Support%2C%20I%20have%20an%20inquiry%20regarding%20my%20tiffin%20order`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 text-xs font-semibold group border border-emerald-500/50 hover:scale-105"
            title="Chat Support: +91 9890786024"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
            </span>
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Chat Support: {settings?.whatsappNumber || '+91 9890786024'}</span>
            <span className="sm:hidden">Chat Support</span>
          </a>
        </aside>
      )}
    </div>
  );
}
