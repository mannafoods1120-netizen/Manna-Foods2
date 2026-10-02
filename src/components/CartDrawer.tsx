import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, MapPin, Clock, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { CartItem, User, DeliveryAddress } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onProceedToCheckout: (checkoutData: {
    deliveryAddress: DeliveryAddress;
    deliverySlot: string;
    deliveryDate: string;
    couponCode?: string;
    notes?: string;
  }) => void;
  deliveryAreas: string[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  user,
  onOpenAuth,
  onProceedToCheckout,
  deliveryAreas
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Guest details if not logged in
  const [customerName, setCustomerName] = useState(user?.name || 'Aditya Deshmukh');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98901 23456');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'aditya.deshmukh@gmail.com');

  // Delivery details
  const [addressLine, setAddressLine] = useState(user?.address || 'Flat 402, Ganga Carnation, Clover Highlands');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState(user?.area || (deliveryAreas[0] || 'Kondhwa'));
  const [pincode, setPincode] = useState(user?.pincode || '411048');
  const [deliverySlot, setDeliverySlot] = useState('12:30 PM - 02:00 PM');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  // Update address & contact when user logs in
  React.useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
      if (user.address) setAddressLine(user.address);
      if (user.area) setArea(user.area);
      if (user.pincode) setPincode(user.pincode);
    }
  }, [user]);

  if (!isOpen) return null;

  // Pricing calculations
  const rawSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const hasSubscription = cartItems.some(it => it.type === 'subscription');

  // Delivery charge rule
  const deliveryFee = hasSubscription || rawSubtotal >= 350 || rawSubtotal === 0 ? 0 : 30;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, rawSubtotal - couponDiscount + deliveryFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsVerifyingCoupon(true);
    setCouponError(null);

    try {
      const res = await api.validateCoupon(couponInput.trim(), rawSubtotal, hasSubscription);
      if (res.valid) {
        setAppliedCoupon({
          code: couponInput.trim().toUpperCase(),
          discount: res.discountAmount,
          message: res.message
        });
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleCheckout = () => {
    const finalAddress = addressLine.trim() || 'Flat 402, Ganga Carnation, Clover Highlands';
    const finalName = user?.name || customerName.trim() || 'Aditya Deshmukh';
    const finalPhone = user?.phone || customerPhone.trim() || '+91 98901 23456';
    const finalEmail = user?.email || customerEmail.trim() || 'aditya.deshmukh@gmail.com';

    setCheckoutError(null);

    onProceedToCheckout({
      deliveryAddress: {
        addressLine: finalAddress,
        landmark: landmark.trim() || undefined,
        area: area || (deliveryAreas[0] || 'Kondhwa'),
        city: 'Pune',
        pincode: pincode.trim() || '411048',
        name: finalName,
        phone: finalPhone,
        email: finalEmail
      } as any,
      deliverySlot,
      deliveryDate,
      couponCode: appliedCoupon?.code,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div>
              <h2 className="font-display font-bold text-lg text-stone-900">
                Your Tiffin Cart
              </h2>
              <p className="text-xs text-stone-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in order
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🍱</div>
                <h3 className="font-display font-semibold text-stone-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Add fresh homestyle thalis or explore our 30-meal monthly subscriptions.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.mealType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <h4 className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                            {item.name}
                          </h4>
                        </div>
                        {item.type === 'subscription' && item.subscriptionConfig && (
                          <div className="text-[11px] text-stone-500 mt-0.5 font-medium">
                            Starts {item.subscriptionConfig.startDate} · Slot: {item.subscriptionConfig.deliverySlot}
                          </div>
                        )}
                        <div className="text-xs text-stone-600 font-semibold tabular-nums mt-1">
                          ₹{item.price} each
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-stone-200 text-stone-600"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-stone-400 hover:text-red-600"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Input Box */}
                {(() => {
                  const hasLongTermInCart = cartItems.some(it => 
                    it.type === 'subscription' && (
                      it.planId?.startsWith('lt-') || 
                      it.name.toLowerCase().includes('long-term') || 
                      it.name.toLowerCase().includes('cashback') ||
                      (it.subscriptionConfig?.mealsCount && it.subscriptionConfig.mealsCount >= 90)
                    )
                  );

                  if (hasLongTermInCart) {
                    return (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-amber-900">Coupons Disabled for Long-Term Cashback:</span>
                          <span className="text-[11px] text-amber-900/90 leading-relaxed block mt-0.5">
                            External coupon codes are disabled for Long-Term plans. Your order already includes guaranteed upfront cashback of up to ₹5,000 and the subsidized flat meal rate.
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                      <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Apply Coupon or Discount</span>
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                          <div>
                            <div className="font-bold text-emerald-900 font-mono">
                              {appliedCoupon.code}
                            </div>
                            <div className="text-[11px] text-emerald-700">
                              {appliedCoupon.message}
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-stone-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. FIRSTMONTH, PUNETIFFIN"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-1.5 text-xs uppercase font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="submit"
                            disabled={isVerifyingCoupon || !couponInput.trim()}
                            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {isVerifyingCoupon ? 'Checking...' : 'Apply'}
                          </button>
                        </form>
                      )}

                      {couponError && (
                        <p className="mt-1.5 text-[11px] text-red-600 font-medium">
                          {couponError}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Delivery Information Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Delivery &amp; Contact Details in Pune</span>
                    </div>
                    {!user && (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                      >
                        Log In for Saved Address
                      </button>
                    )}
                  </div>

                  {!user && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aditya Deshmukh"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 block mb-1">
                          WhatsApp / Mobile *
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9890123456"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Street / Flat / Society *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Ganga Carnation, Clover Highlands"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Pune Area / Locality
                      </label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {deliveryAreas.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="411038"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Near MIT College / Opposite Infosys"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Delivery Slot
                      </label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                      >
                        <option value="12:30 PM - 02:00 PM">Lunch (12:30 - 2:00 PM)</option>
                        <option value="07:45 PM - 09:15 PM">Dinner (7:45 - 9:15 PM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Cooking or Gate Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mild spice, leave at security"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & Price Calculation */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900 tabular-nums">₹{rawSubtotal}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount:</span>
                    <span className="tabular-nums">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-medium tabular-nums">
                    {deliveryFee === 0 ? (
                      <strong className="text-emerald-700">FREE</strong>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <div className="text-[10px] text-stone-500 italic">
                    Add ₹{350 - rawSubtotal} more for free delivery
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-stone-900">Total Payable:</span>
                  <span className="text-lg font-extrabold text-amber-900 tabular-nums">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                  <span>{checkoutError}</span>
                  <button 
                    onClick={() => setCheckoutError(null)} 
                    className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Proceed to Pay (₹{finalTotal})</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              {!user && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full text-center text-xs text-stone-600 hover:text-amber-800 font-medium py-1 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="underline font-semibold">Log In</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 text-center">
                <span>🔒 256-bit Secure Razorpay Checkout</span>
                <span>·</span>
                <span>Instant WhatsApp Updates</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
