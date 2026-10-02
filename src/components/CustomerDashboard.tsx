import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Tag, 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Phone, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { User, Order, CustomerSubscription, Coupon, BusinessSettings } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CustomerDashboardProps {
  user: User;
  onUpdateProfile: (updated: User) => void;
  onLogout: () => void;
  onStartOrder: () => void;
  deliveryAreas: string[];
  settings?: BusinessSettings | null;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  onUpdateProfile,
  onLogout,
  onStartOrder,
  deliveryAreas,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'subscriptions' | 'profile' | 'coupons'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileAddress, setProfileAddress] = useState(user.address || '');
  const [profileArea, setProfileArea] = useState(user.area || 'Kothrud');
  const [profilePincode, setProfilePincode] = useState(user.pincode || '411038');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [user.id]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [ordersData, subsData] = await Promise.all([
        api.getOrders(),
        api.getSubscriptions()
      ]);
      setOrders(ordersData);
      setSubscriptions(subsData);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscriptionPause = async (sub: CustomerSubscription) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateSubscriptionStatus(sub.id, newStatus);
      setActionMessage(`Subscription #${sub.subscriptionNumber} marked as ${newStatus}`);
      loadCustomerData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update subscription status');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
        area: profileArea,
        pincode: profilePincode
      });
      onUpdateProfile(res.user);
      setActionMessage('Profile updated successfully!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">Delivered</span>;
      case 'out_for_delivery':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs font-semibold animate-pulse">Out for Delivery</span>;
      case 'preparing':
        return <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">In Kitchen (Preparing)</span>;
      case 'confirmed':
        return <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">Confirmed</span>;
      case 'cancelled':
        return <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Welcome Card */}
      <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-2xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white text-2xl font-bold flex items-center justify-center font-display shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
              Welcome back, {user.name}
            </h1>
            <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
              <span>{user.email}</span>
              <span>·</span>
              <span>{user.phone}</span>
              <span>·</span>
              <span>{user.area || 'Pune'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartOrder}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            + Order New Meal
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'subscriptions'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Subscriptions ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Delivery Address &amp; Profile</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center">
              <div className="text-4xl mb-3">🍱</div>
              <h3 className="font-bold text-stone-800 text-base">No orders placed yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Explore our daily changing kitchen menu cooked fresh with authentic Pune homestyle taste.
              </p>
              <button
                onClick={onStartOrder}
                className="mt-4 px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-xl"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 font-mono text-sm">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500">Paid via {order.paymentMethod.toUpperCase()}: </span>
                    <span className="text-base font-extrabold text-stone-900 tabular-nums">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Items & Delivery Info */}
                <div className="py-3.5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <span className="font-semibold text-stone-700 block mb-1">Items:</span>
                    <ul className="space-y-1 text-stone-800">
                      {order.items.map((it) => (
                        <li key={it.id} className="flex justify-between max-w-md">
                          <span>
                            {it.name} <strong className="text-stone-500">× {it.quantity}</strong>
                            {it.details && <span className="text-stone-400 text-[10px]"> ({it.details})</span>}
                          </span>
                          <span className="font-medium tabular-nums">₹{it.totalPrice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <span className="font-semibold text-stone-800 flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Delivery Details:</span>
                    </span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      {order.deliveryAddress.addressLine}, {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                    </p>
                    <div className="mt-1 text-[11px] text-stone-500">
                      Slot: <strong className="text-stone-700">{order.deliverySlot}</strong>
                    </div>
                  </div>
                </div>

                {/* Timeline status bar */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Payment: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong></span>
                    {order.razorpayPaymentId && (
                      <span className="text-stone-400 font-mono text-[10px]">
                        ({order.razorpayPaymentId})
                      </span>
                    )}
                  </div>

                  <a
                    href={`https://wa.me/${(settings?.whatsappNumber || '9890786024').replace(/[^0-9]/g, '') || '919890786024'}?text=Hi%20Manna%20Foods%2C%20checking%20status%20for%20order%20%23${order.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp Support (+91 9890786024)</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {subscriptions.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-bold text-stone-800 text-base">No active tiffin subscriptions</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Get wholesome homestyle meals delivered every single day with our 30-meal monthly plans.
              </p>
              <button
                onClick={onStartOrder}
                className="mt-4 px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-xl"
              >
                Explore Monthly Plans
              </button>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const progressPercent = Math.round((sub.mealsUsed / sub.mealsTotal) * 100);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-lg font-display">
                          {sub.planName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 font-mono mt-0.5 block">
                        Subscription #{sub.subscriptionNumber} · {sub.mealType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubscriptionPause(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          sub.status === 'active'
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {sub.status === 'active' ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause Subscription</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Resume Subscription</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Meals Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                      <span>Meals Delivered: {sub.mealsUsed} / {sub.mealsTotal}</span>
                      <span className="text-amber-800 font-bold">{sub.mealsRemaining} Meals Left</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Plan Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl text-xs text-stone-700">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Start Date</span>
                      <span className="font-bold text-stone-800">{sub.startDate}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Estimated End</span>
                      <span className="font-bold text-stone-800">{sub.endDate}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Slot Window</span>
                      <span className="font-bold text-stone-800">{sub.deliverySlot}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Total Paid</span>
                      <span className="font-bold text-stone-800 tabular-nums">₹{sub.finalPaid}</span>
                    </div>
                  </div>

                  {/* Pause Policy Notice */}
                  <div className="text-[11px] text-stone-500 bg-amber-50/60 p-3 rounded-lg border border-amber-200/50 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pune Tiffin Pause Policy:</strong> You can pause for up to 7 consecutive days anytime. Just toggle above or message us on WhatsApp with 12 hours notice.
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & ADDRESS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
          <h3 className="font-display font-bold text-base text-stone-900 mb-1">
            Customer Profile &amp; Saved Delivery Address
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Keep your address updated for smooth daily tiffin handoffs in Pune.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Mobile (+91)</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-50 rounded-lg text-stone-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Flat / Building / Street Address</label>
              <input
                type="text"
                required
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pune Area</label>
                <select
                  value={profileArea}
                  onChange={(e) => setProfileArea(e.target.value)}
                  className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 text-xs"
                >
                  {deliveryAreas.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={profilePincode}
                  onChange={(e) => setProfilePincode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {savingProfile ? 'Saving...' : 'Save Updated Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
