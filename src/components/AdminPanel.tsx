import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  CalendarRange, 
  Users, 
  Tag, 
  Settings as SettingsIcon, 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Phone, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  RotateCcw,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
  PauseCircle,
  Play,
  Gift,
  AlertTriangle,
  PieChart,
  ChefHat
} from 'lucide-react';
import { 
  Order, 
  MenuItem, 
  Category, 
  SubscriptionPlan, 
  PlanDurationType,
  MealDietType,
  Coupon, 
  CustomerSubscription, 
  User, 
  BusinessSettings, 
  DashboardReportSummary, 
  WhatsAppNotification, 
  OrderStatus,
  LongTermCashbackPlan,
  CustomerPauseRecord,
  SubscriptionOperationsSummary,
  PauseStatus,
  NoticeCompliance
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { compressImageFile } from '../utils/imageHelper.ts';
import { ExecutiveKPIHeader } from './admin/ExecutiveKPIHeader.tsx';
import { LongTermOffersModule } from './admin/LongTermOffersModule.tsx';
import { PauseTrackerModule } from './admin/PauseTrackerModule.tsx';
import { MealUtilizationModule } from './admin/MealUtilizationModule.tsx';
import { MasterSubscriptionsModule } from './admin/MasterSubscriptionsModule.tsx';
import { CreateSubscriptionModal } from './admin/CreateSubscriptionModal.tsx';
import { AddPauseModal } from './admin/AddPauseModal.tsx';
import { EditOfferModal } from './admin/EditOfferModal.tsx';
import { EditSubscriptionModal } from './admin/EditSubscriptionModal.tsx';
import { EarlyCancellationModal } from './admin/EarlyCancellationModal.tsx';
import { CancellationPolicyModule } from './admin/CancellationPolicyModule.tsx';
import { LegalTermsModule } from './admin/LegalTermsModule.tsx';
import { LegalModal } from './LegalModal.tsx';
import { MannaLogo } from './MannaLogo.tsx';

interface AdminPanelProps {
  adminUser: User | null;
  onAdminLogin: (admin: User) => void;
  onCloseAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  onAdminLogin,
  onCloseAdmin
}) => {
  // Login State
  const [adminEmail, setAdminEmail] = useState('mannafoods1120@gmail.com');
  const [adminPassword, setAdminPassword] = useState('MannaAdmin@Pune2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Section (organized per requirements)
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'customers'
    | 'subscriptions'
    | 'long_term_offers'
    | 'cancellation_policy'
    | 'legal_terms'
    | 'pause_tracker'
    | 'meal_utilization'
    | 'orders'
    | 'menu'
    | 'coupons'
    | 'reports'
    | 'settings'
    | 'security'
  >('dashboard');

  // Legal Preview Modal State
  const [adminLegalPreviewOpen, setAdminLegalPreviewOpen] = useState(false);
  const [adminLegalPreviewDoc, setAdminLegalPreviewDoc] = useState<'long_term' | 'general' | 'privacy'>('long_term');

  // Security & Credentials State
  const [securityCurrentPass, setSecurityCurrentPass] = useState('');
  const [securityNewPass, setSecurityNewPass] = useState('');
  const [securityConfirmPass, setSecurityConfirmPass] = useState('');
  const [securityAdminEmail, setSecurityAdminEmail] = useState('');
  const [securityAdminName, setSecurityAdminName] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securitySubmitting, setSecuritySubmitting] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityMeta, setSecurityMeta] = useState<{
    admin?: User;
    isCustomPasswordSet: boolean;
    lastPasswordChange: string | null;
    bootstrapFallbackActive: boolean;
  } | null>(null);

  // Shared Data States
  const [dashboardSummary, setDashboardSummary] = useState<DashboardReportSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'cancelled'>('all');
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'subscription' | 'meal'>('all');
  const [customers, setCustomers] = useState<(User & { totalOrders: number; totalSpent: number; activeSubscriptionsCount: number })[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Long-Term Offers & Customer Pause Tracker States
  const [longTermOffers, setLongTermOffers] = useState<LongTermCashbackPlan[]>([]);
  const [customerPauses, setCustomerPauses] = useState<CustomerPauseRecord[]>([]);
  const [operationsSummary, setOperationsSummary] = useState<SubscriptionOperationsSummary | null>(null);

  // Pause Tracker Filters
  const [pauseFilterStatus, setPauseFilterStatus] = useState<string>('all');
  const [pauseDateFilter, setPauseDateFilter] = useState<'all' | 'today'>('all');
  const [pauseSearch, setPauseSearch] = useState('');

  // Pause Modal (Add / Register Customer Pause)
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [selectedSubForPause, setSelectedSubForPause] = useState<CustomerSubscription | null>(null);
  const [pauseForm, setPauseForm] = useState({
    subscriptionId: '',
    pauseStartDate: new Date().toISOString().split('T')[0],
    pauseEndDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })(),
    noticeCompliance: 'on_time' as 'on_time' | 'late' | 'not_provided',
    notes: ''
  });
  const [pauseSubmitting, setPauseSubmitting] = useState(false);

  // Create Subscription Modal (Admin Onboarding)
  const [createSubModalOpen, setCreateSubModalOpen] = useState(false);
  const [createSubForm, setCreateSubForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    planTypeChoice: 'lt-90' as 'lt-90' | 'lt-180' | 'lt-270' | 'lt-360' | 'regular-30' | 'regular-6',
    planName: '90 Meals Plan',
    mealsTotal: 90,
    mealType: 'veg' as MealDietType | 'both',
    startDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })(),
    deliverySlot: '12:30 PM - 02:00 PM',
    deliveryFrequency: 'daily_lunch',
    addressLine: '',
    area: 'Kondhwa',
    city: 'Pune',
    pincode: '411048',
    isLongTerm: true,
    basePrice: 10500,
    cashbackAmount: 1400,
    totalAllowedPauseDays: 15
  });
  const [createSubSubmitting, setCreateSubSubmitting] = useState(false);

  // Edit Subscription Modal
  const [editSubModalOpen, setEditSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<CustomerSubscription | null>(null);
  const [editSubForm, setEditSubForm] = useState({
    customerName: '',
    customerPhone: '',
    mealsTotal: 90,
    mealsUsed: 0,
    status: 'active' as any,
    deliverySlot: '',
    deliveryFrequency: '',
    endDate: '',
    addressLine: '',
    area: ''
  });
  const [editSubSubmitting, setEditSubSubmitting] = useState(false);

  // Edit Long-Term Offer Modal (Cashback & Base Price Configuration)
  const [editOfferModalOpen, setEditOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<LongTermCashbackPlan | null>(null);
  const [offerForm, setOfferForm] = useState({
    basePrice: 10500,
    cashbackAmount: 1400,
    maxPauseDays: 15,
    maxValidityText: 'Up to 4.5 months',
    description: '',
    featuresText: ''
  });
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Orders Multi-Select Statuses and Date Range Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState<OrderStatus[]>([]);
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderDatePreset, setOrderDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [orderDateBasis, setOrderDateBasis] = useState<'createdAt' | 'deliveryDate'>('createdAt');
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [recentlyUpdatedOrderId, setRecentlyUpdatedOrderId] = useState<string | null>(null);
  const [recentStatusUpdateInfo, setRecentStatusUpdateInfo] = useState<{
    id: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
  } | null>(null);

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  const handleSetDatePreset = (preset: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom') => {
    setOrderDatePreset(preset);
    const now = new Date();
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'all') {
      setOrderStartDate('');
      setOrderEndDate('');
    } else if (preset === 'today') {
      const d = toYMD(now);
      setOrderStartDate(d);
      setOrderEndDate(d);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const d = toYMD(y);
      setOrderStartDate(d);
      setOrderEndDate(d);
    } else if (preset === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setOrderStartDate(toYMD(w));
      setOrderEndDate(toYMD(now));
    } else if (preset === 'month') {
      const m = new Date(now);
      m.setDate(m.getDate() - 30);
      setOrderStartDate(toYMD(m));
      setOrderEndDate(toYMD(now));
    }
  };

  const handleToggleStatusFilter = (status: OrderStatus) => {
    setSelectedOrderStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleClearAllOrderFilters = () => {
    setOrderSearch('');
    setSelectedOrderStatuses([]);
    setOrderPaymentFilter('all');
    setOrderTypeFilter('all');
    setOrderDatePreset('all');
    setOrderDateBasis('createdAt');
    setOrderStartDate('');
    setOrderEndDate('');
  };

  // Menu Edit / Create Modal
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'all' | 'Veg' | 'Non-Veg'>('all');
  const [menuSubCategoryFilter, setMenuSubCategoryFilter] = useState<'all' | 'Chicken' | 'Mutton'>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [mealForm, setMealForm] = useState({
    name: '',
    category: 'Veg',
    subCategory: '',
    mealType: 'veg' as 'veg' | 'non-veg',
    description: '',
    image: '',
    price: 150,
    isAvailable: true,
    isFeatured: false,
    ingredients: '',
    calories: 500
  });

  // Coupon Edit / Create Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 200,
    maxDiscount: 100,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    usageLimit: 500,
    perCustomerLimit: 1,
    applicableFor: 'all' as 'all' | 'meals' | 'subscriptions',
    isActive: true
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<BusinessSettings | null>(null);

  // Subscription Plans Management States
  const [subSectionTab, setSubSectionTab] = useState<'plans' | 'active_subscriptions'>('plans');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    planType: 'monthly' as PlanDurationType,
    mealType: 'both' as MealDietType | 'both',
    mealsCount: 30,
    basePrice: 4200,
    discountPercentage: 15,
    deliveryFrequency: 'daily_lunch' as 'daily_lunch' | 'daily_dinner' | 'both_meals' | 'weekdays_only',
    description: '',
    featuresText: '',
    isPopular: false
  });

  useEffect(() => {
    if (adminUser) {
      loadAllAdminData();
      if (adminUser.email) setSecurityAdminEmail(adminUser.email);
      if (adminUser.name) setSecurityAdminName(adminUser.name);
    }
  }, [adminUser]);

  const fetchSecurityMeta = async () => {
    try {
      const sec = await api.getAdminSecurity();
      setSecurityMeta(sec);
      if (sec.admin?.email) setSecurityAdminEmail(sec.admin.email);
      if (sec.admin?.name) setSecurityAdminName(sec.admin.name);
    } catch (err) {
      console.error('Failed to fetch admin security info:', err);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        ordersRes,
        menuRes,
        catRes,
        plansRes,
        couponsRes,
        customersRes,
        settingsRes,
        notifsRes,
        subscriptionsRes,
        secRes,
        ltOffersRes,
        pausesRes,
        opsSummaryRes
      ] = await Promise.all([
        api.getReportsSummary().catch(() => null),
        api.getOrders({}, true),
        api.getMenu(true),
        api.getCategories(),
        api.getPlans(),
        api.getCoupons(),
        api.getCustomers(),
        api.getSettings(),
        api.getWhatsAppNotifications(),
        api.getSubscriptions({}, true).catch(() => []),
        api.getAdminSecurity().catch(() => null),
        api.getLongTermOffers().catch(() => []),
        api.getCustomerPauses().catch(() => []),
        api.getOperationsSummary().catch(() => null)
      ]);

      if (summaryRes) setDashboardSummary(summaryRes);
      setOrders(ordersRes);
      setMenuItems(menuRes);
      setCategories(catRes);
      setPlans(plansRes);
      setCoupons(couponsRes);
      setCustomers(customersRes);
      setSettings(settingsRes);
      setSettingsForm(settingsRes);
      setNotifications(notifsRes);
      if (subscriptionsRes) setSubscriptions(subscriptionsRes);
      if (ltOffersRes) setLongTermOffers(ltOffersRes);
      if (pausesRes) setCustomerPauses(pausesRes);
      if (opsSummaryRes) setOperationsSummary(opsSummaryRes);
      if (secRes) {
        setSecurityMeta(secRes);
        if (secRes.admin?.email) setSecurityAdminEmail(secRes.admin.email);
        if (secRes.admin?.name) setSecurityAdminName(secRes.admin.name);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Long-Term Subscriptions, Pauses, and Meal Utilization ---
  const handleSelectPlanTypeForCreateSub = (choice: 'lt-90' | 'lt-180' | 'lt-270' | 'lt-360' | 'regular-30' | 'regular-6') => {
    let mealsTotal = 90;
    let basePrice = 10500;
    let cashbackAmount = 1400;
    let totalAllowedPauseDays = 15;
    let planName = '90 Meals Plan';
    let isLongTerm = true;

    if (choice === 'lt-90') {
      mealsTotal = 90;
      basePrice = 10500;
      cashbackAmount = 1400;
      totalAllowedPauseDays = 15;
      planName = '90 Meals Plan';
      isLongTerm = true;
    } else if (choice === 'lt-180') {
      mealsTotal = 180;
      basePrice = 21000;
      cashbackAmount = 3000;
      totalAllowedPauseDays = 30;
      planName = '180 Meals Plan';
      isLongTerm = true;
    } else if (choice === 'lt-270') {
      mealsTotal = 270;
      basePrice = 31500;
      cashbackAmount = 4500;
      totalAllowedPauseDays = 45;
      planName = '270 Meals Plan';
      isLongTerm = true;
    } else if (choice === 'lt-360') {
      mealsTotal = 360;
      basePrice = 42000;
      cashbackAmount = 6000;
      totalAllowedPauseDays = 60;
      planName = '360 Meals Plan';
      isLongTerm = true;
    } else if (choice === 'regular-30') {
      mealsTotal = 30;
      basePrice = 4200;
      cashbackAmount = 0;
      totalAllowedPauseDays = 7;
      planName = '30-Meal Monthly Executive Tiffin';
      isLongTerm = false;
    } else if (choice === 'regular-6') {
      mealsTotal = 6;
      basePrice = 870;
      cashbackAmount = 0;
      totalAllowedPauseDays = 2;
      planName = '6-Meal Weekly Starter Plan';
      isLongTerm = false;
    }

    setCreateSubForm(prev => ({
      ...prev,
      planTypeChoice: choice,
      planName,
      mealsTotal,
      basePrice,
      cashbackAmount,
      totalAllowedPauseDays,
      isLongTerm
    }));
  };

  const handleSaveCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createSubForm.customerName || !createSubForm.customerPhone || !createSubForm.startDate) {
      showError('Please fill customer name, phone number, and subscription start date');
      return;
    }

    setCreateSubSubmitting(true);
    try {
      const res = await api.createSubscription({
        customerName: createSubForm.customerName,
        customerPhone: createSubForm.customerPhone,
        customerEmail: createSubForm.customerEmail || 'orders@mannafoods.in',
        planName: createSubForm.planName,
        mealsTotal: createSubForm.mealsTotal,
        mealType: createSubForm.mealType,
        startDate: createSubForm.startDate,
        deliverySlot: createSubForm.deliverySlot,
        deliveryFrequency: createSubForm.deliveryFrequency,
        deliveryAddress: {
          addressLine: createSubForm.addressLine || 'Customer Address',
          area: createSubForm.area,
          city: createSubForm.city,
          pincode: createSubForm.pincode
        },
        basePrice: createSubForm.basePrice,
        cashbackAmount: createSubForm.cashbackAmount,
        totalAllowedPauseDays: createSubForm.totalAllowedPauseDays,
        isLongTerm: createSubForm.isLongTerm
      });

      setSuccessBanner(`Subscription #${res.subscription.subscriptionNumber} created successfully! Effective Value: ₹${res.subscription.effectiveValue || res.subscription.basePrice}`);
      setCreateSubModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to create subscription: ' + (err.message || 'Error'));
    } finally {
      setCreateSubSubmitting(false);
    }
  };

  const handleOpenEditSub = (sub: CustomerSubscription) => {
    setEditingSub(sub);
    setEditSubForm({
      customerName: sub.customerName,
      customerPhone: sub.customerPhone,
      mealsTotal: sub.mealsTotal,
      mealsUsed: sub.mealsUsed,
      status: sub.status,
      deliverySlot: sub.deliverySlot || '12:30 PM - 02:00 PM',
      deliveryFrequency: sub.deliveryFrequency || 'daily_lunch',
      endDate: sub.endDate,
      addressLine: sub.deliveryAddress?.addressLine || '',
      area: sub.deliveryAddress?.area || ''
    });
    setEditSubModalOpen(true);
  };

  const handleSaveEditSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setEditSubSubmitting(true);
    try {
      const res = await api.updateSubscription(editingSub.id, {
        customerName: editSubForm.customerName,
        customerPhone: editSubForm.customerPhone,
        mealsTotal: Number(editSubForm.mealsTotal),
        mealsUsed: Number(editSubForm.mealsUsed),
        status: editSubForm.status,
        deliverySlot: editSubForm.deliverySlot,
        deliveryFrequency: editSubForm.deliveryFrequency,
        endDate: editSubForm.endDate,
        deliveryAddress: {
          ...editingSub.deliveryAddress,
          addressLine: editSubForm.addressLine,
          area: editSubForm.area
        }
      });
      setSuccessBanner(`Subscription #${res.subscription.subscriptionNumber} updated successfully!`);
      setEditSubModalOpen(false);
      setEditingSub(null);
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to update subscription: ' + (err.message || 'Error'));
    } finally {
      setEditSubSubmitting(false);
    }
  };

  const handleOpenAddPause = (sub?: CustomerSubscription) => {
    const targetSub = sub || subscriptions[0];
    if (!targetSub) {
      showError('No active subscriptions found to pause.');
      return;
    }
    setSelectedSubForPause(targetSub);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setPauseForm({
      subscriptionId: targetSub.id,
      pauseStartDate: today,
      pauseEndDate: nextWeek.toISOString().split('T')[0],
      noticeCompliance: 'on_time',
      notes: ''
    });
    setPauseModalOpen(true);
  };

  const handleSaveCustomerPause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pauseForm.subscriptionId || !pauseForm.pauseStartDate || !pauseForm.pauseEndDate) {
      showError('Please fill subscription, pause start date and pause end date.');
      return;
    }

    setPauseSubmitting(true);
    try {
      const res = await api.createCustomerPause({
        subscriptionId: pauseForm.subscriptionId,
        pauseStartDate: pauseForm.pauseStartDate,
        pauseEndDate: pauseForm.pauseEndDate,
        noticeCompliance: pauseForm.noticeCompliance,
        notes: pauseForm.notes
      });

      if (res.isExceeded) {
        setSuccessBanner(`⚠️ Pause recorded with WARNING: Requested pause exceeds remaining allowance. Status flagged as Exceeded Limit.`);
      } else {
        setSuccessBanner(`Customer pause registered successfully! Validity extended to ${res.pause.extendedEndDate}.`);
      }
      setPauseModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to register pause: ' + (err.message || 'Error'));
    } finally {
      setPauseSubmitting(false);
    }
  };

  const handleDeletePause = async (pauseId: string) => {
    if (!confirm('Are you sure you want to cancel / remove this pause record? Subscription validity will be recalculated.')) return;
    try {
      await api.deleteCustomerPause(pauseId);
      setSuccessBanner('Pause record removed and subscription validity re-synchronized.');
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to remove pause: ' + (err.message || 'Error'));
    }
  };

  // Early Cancellation State & Handler
  const [earlyCancelModalOpen, setEarlyCancelModalOpen] = useState(false);
  const [selectedSubForCancellation, setSelectedSubForCancellation] = useState<CustomerSubscription | null>(null);

  const handleConfirmEarlyCancellation = async (
    subscriptionId: string, 
    mealsConsumed: number, 
    reason: string, 
    notes?: string
  ) => {
    try {
      const res = await api.cancelSubscriptionEarly(subscriptionId, {
        mealsConsumed,
        reason,
        notes
      });
      setSuccessBanner(`Early cancellation successfully processed for ${res.subscription.customerName}! Flag: ${res.cancellationRecord.statusFlag} (${res.cancellationRecord.netRefundPayable > 0 ? `₹${res.cancellationRecord.netRefundPayable.toFixed(2)} refund payable` : 'zero deficit absorbed'}).`);
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to process early cancellation: ' + (err.message || 'Error'));
      throw err;
    }
  };

  const handleOpenEditOffer = (offer: LongTermCashbackPlan) => {
    setEditingOffer(offer);
    setOfferForm({
      basePrice: offer.basePrice,
      cashbackAmount: offer.cashbackAmount,
      maxPauseDays: offer.maxPauseDays,
      maxValidityText: offer.maxValidityText,
      description: offer.description,
      featuresText: offer.features.join('\n')
    });
    setEditOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    setOfferSubmitting(true);
    try {
      const base = Number(offerForm.basePrice);
      const cb = Number(offerForm.cashbackAmount);
      const effective = Math.max(0, base - cb);

      await api.updateLongTermOffer(editingOffer.id, {
        basePrice: base,
        cashbackAmount: cb,
        effectiveValue: effective,
        maxPauseDays: Number(offerForm.maxPauseDays),
        maxValidityText: offerForm.maxValidityText,
        description: offerForm.description,
        features: offerForm.featuresText.split('\n').map(s => s.trim()).filter(Boolean)
      });

      setSuccessBanner(`Long-term offer "${editingOffer.name}" updated! Effective value: ₹${effective}`);
      setEditOfferModalOpen(false);
      setEditingOffer(null);
      loadAllAdminData();
    } catch (err: any) {
      showError('Failed to update offer: ' + (err.message || 'Error'));
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (!securityCurrentPass) {
      setSecurityError('Please enter your current password to verify authorization.');
      return;
    }

    if (!securityNewPass) {
      setSecurityError('Please enter a new password.');
      return;
    }

    if (securityNewPass.length < 8) {
      setSecurityError('The new password must be at least 8 characters long.');
      return;
    }

    if (securityNewPass !== securityConfirmPass) {
      setSecurityError('The new password and confirmation password do not match.');
      return;
    }

    if (securityCurrentPass === securityNewPass) {
      setSecurityError('The new password must be different from your current password.');
      return;
    }

    setSecuritySubmitting(true);
    try {
      const res = await api.updateAdminCredentials({
        currentPassword: securityCurrentPass,
        newPassword: securityNewPass,
        newEmail: securityAdminEmail.trim() || undefined,
        newName: securityAdminName.trim() || undefined
      });

      setSecuritySuccess(res.message || 'Admin credentials updated successfully! New password is now active.');
      showNotification('Admin credentials updated successfully');
      setSecurityCurrentPass('');
      setSecurityNewPass('');
      setSecurityConfirmPass('');

      if (res.admin) {
        onAdminLogin(res.admin);
      }
      fetchSecurityMeta();
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update credentials. Please verify your current password.');
    } finally {
      setSecuritySubmitting(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await api.adminLogin(adminEmail, adminPassword);
      onAdminLogin(res.admin);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderForEdit) return;
    const orderId = selectedOrderForEdit.id;
    const oldStatus = selectedOrderForEdit.orderStatus;
    const targetStatus = newOrderStatus;

    try {
      await api.updateOrderStatus(orderId, targetStatus, statusNote);
      showNotification(`Order #${selectedOrderForEdit.orderNumber} updated: ${oldStatus.toUpperCase()} → ${targetStatus.toUpperCase()}`);

      // Trigger subtle visual transition animation
      setRecentlyUpdatedOrderId(orderId);
      setRecentStatusUpdateInfo({
        id: orderId,
        fromStatus: oldStatus,
        toStatus: targetStatus
      });

      // Clear transition after 3.2 seconds
      setTimeout(() => {
        setRecentlyUpdatedOrderId(curr => curr === orderId ? null : curr);
        setRecentStatusUpdateInfo(curr => curr?.id === orderId ? null : curr);
      }, 3200);

      setSelectedOrderForEdit(null);
      setStatusNote('');
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update order status');
    }
  };

  // Quick in-row status update handler with visual feedback transition
  const handleQuickStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    if (order.orderStatus === nextStatus) return;
    const oldStatus = order.orderStatus;
    try {
      await api.updateOrderStatus(order.id, nextStatus, `Updated to ${nextStatus} via quick action`);
      showNotification(`Order #${order.orderNumber} updated: ${oldStatus.toUpperCase()} → ${nextStatus.toUpperCase()}`);

      // Trigger visual transition animation immediately
      setRecentlyUpdatedOrderId(order.id);
      setRecentStatusUpdateInfo({
        id: order.id,
        fromStatus: oldStatus,
        toStatus: nextStatus
      });

      setTimeout(() => {
        setRecentlyUpdatedOrderId(curr => curr === order.id ? null : curr);
        setRecentStatusUpdateInfo(curr => curr?.id === order.id ? null : curr);
      }, 3200);

      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update order status');
    }
  };

  // Resend WhatsApp confirmation
  const handleResendWhatsApp = async (orderId: string) => {
    try {
      await api.resendWhatsApp(orderId);
      showNotification(`WhatsApp notification dispatched!`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to send WhatsApp message');
    }
  };

  // Menu item image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setUploadError(null);

    try {
      // Compress and optimize image on client side
      const compressedDataUrl = await compressImageFile(file, 1000, 700, 0.85);

      // Attempt server upload for clean static file path
      try {
        const uploadRes = await api.uploadImage(compressedDataUrl, file.name);
        setMealForm(prev => ({ ...prev, image: uploadRes.url }));
        showNotification('Meal image uploaded successfully');
      } catch (uploadErr) {
        // Fallback to data URL so the user is never blocked
        setMealForm(prev => ({ ...prev, image: compressedDataUrl }));
        showNotification('Meal image prepared and optimized');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image file');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setMealForm(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Menu item add / update
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...mealForm,
        subCategory: mealForm.category === 'Non-Veg' ? (mealForm.subCategory || 'Chicken') : undefined,
        ingredients: mealForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingMenuItem) {
        await api.updateMenuItem(editingMenuItem.id, payload);
        showNotification('Meal updated successfully');
      } else {
        await api.createMenuItem(payload);
        showNotification('Meal created successfully');
      }
      setMenuModalOpen(false);
      setEditingMenuItem(null);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to save menu item');
    }
  };

  const handleToggleMealAvailability = async (meal: MenuItem) => {
    try {
      await api.updateMenuItem(meal.id, { isAvailable: !meal.isAvailable });
      showNotification(`${meal.name} is now ${!meal.isAvailable ? 'AVAILABLE' : 'DISABLED'}`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to toggle availability');
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteMenuItem(id);
      showNotification('Menu item deleted');
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete meal');
    }
  };

  // Coupon save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon(couponForm);
      showNotification(`Coupon ${couponForm.code.toUpperCase()} created successfully`);
      setCouponModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleCouponActive = async (coupon: Coupon) => {
    try {
      await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      showNotification(`Coupon ${coupon.code} updated`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update coupon');
    }
  };

  // --- Subscription Plan CRUD Handlers ---
  const handleOpenAddPlan = (typePreset: PlanDurationType = 'monthly') => {
    setEditingPlan(null);
    const isMonthly = typePreset === 'monthly';
    setPlanForm({
      name: isMonthly ? '30-Meal Monthly Executive Tiffin' : typePreset === 'weekly' ? '6-Meal Weekly Starter Plan' : 'Single Homestyle Dabba',
      planType: typePreset,
      mealType: 'both',
      mealsCount: isMonthly ? 30 : typePreset === 'weekly' ? 6 : 1,
      basePrice: isMonthly ? 4200 : typePreset === 'weekly' ? 870 : 150,
      discountPercentage: isMonthly ? 15 : typePreset === 'weekly' ? 8 : 0,
      deliveryFrequency: typePreset === 'weekly' ? 'weekdays_only' : 'daily_lunch',
      description: isMonthly 
        ? 'Best value 30-day continuous homestyle tiffin. Choose Veg, Non-Veg, or alternating days. Free pause & resume up to 7 days.'
        : 'Freshly packed homestyle tiffin delivered to your doorstep.',
      featuresText: isMonthly
        ? '30 Freshly Cooked Homestyle Meals\nChoose Lunch or Dinner delivery slot\nDaily variety menu (no repeated sabzis)\nFlexible 7-day pause anytime via app\nZero delivery charge on all 30 drops\nFree Solkadhi or Sweet twice a week'
        : 'Fresh hot dabba delivery\n100% whole wheat phulkas & pure ghee\nLow oil and balanced nutrition',
      isPopular: false
    });
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      planType: plan.planType,
      mealType: plan.mealType,
      mealsCount: plan.mealsCount,
      basePrice: plan.basePrice,
      discountPercentage: plan.discountPercentage || 0,
      deliveryFrequency: plan.deliveryFrequency,
      description: plan.description || '',
      featuresText: plan.features && plan.features.length > 0 ? plan.features.join('\n') : '',
      isPopular: Boolean(plan.isPopular)
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = planForm.featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: planForm.name.trim(),
        planType: planForm.planType,
        mealType: planForm.mealType,
        mealsCount: Number(planForm.mealsCount),
        basePrice: Number(planForm.basePrice),
        discountPercentage: Number(planForm.discountPercentage) || 0,
        deliveryFrequency: planForm.deliveryFrequency,
        description: planForm.description.trim(),
        features: featuresArray,
        isPopular: Boolean(planForm.isPopular)
      };

      if (editingPlan) {
        await api.updatePlan(editingPlan.id, payload);
        showNotification(`Plan "${payload.name}" updated successfully`);
      } else {
        await api.createPlan(payload);
        showNotification(`New plan "${payload.name}" created successfully`);
      }

      setPlanModalOpen(false);
      setEditingPlan(null);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to save subscription plan');
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) return;
    try {
      await api.deletePlan(plan.id);
      showNotification(`Plan "${plan.name}" deleted successfully`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete subscription plan');
    }
  };

  // Subscription meal increment
  const handleRecordMealDelivery = async (subId: string) => {
    try {
      await api.updateSubscriptionStatus(subId, undefined, 1, true);
      showNotification('Recorded 1 meal delivered for subscription');
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update subscription');
    }
  };

  // Subscription pause / resume toggle
  const handleToggleSubscriptionStatus = async (sub: CustomerSubscription) => {
    const nextStatus = sub.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateSubscriptionStatus(sub.id, nextStatus, undefined, true);
      showNotification(`Subscription ${sub.subscriptionNumber} marked as ${nextStatus.toUpperCase()}`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update subscription status');
    }
  };

  // Toggle Customer status
  const handleToggleCustomer = async (cust: any) => {
    const nextStatus = cust.status === 'active' ? 'disabled' : 'active';
    try {
      await api.toggleCustomerStatus(cust.id, nextStatus);
      showNotification(`Customer ${cust.name} is now ${nextStatus}`);
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update customer status');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      await api.updateSettings(settingsForm);
      showNotification('Business settings and Pune operational parameters saved');
      loadAllAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update settings');
    }
  };

  // CSV Export download with authentication & current filter params
  const [exportingCSV, setExportingCSV] = useState(false);

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const blob = await api.exportOrdersCSV({
        status: selectedOrderStatuses.length > 0 ? selectedOrderStatuses.join(',') : undefined,
        paymentStatus: orderPaymentFilter !== 'all' ? orderPaymentFilter : undefined,
        startDate: orderStartDate || undefined,
        endDate: orderEndDate || undefined,
        search: orderSearch || undefined
      });

      // Create download trigger without window.open
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateSuffix = new Date().toISOString().split('T')[0];
      link.download = `manna_foods_orders_${dateSuffix}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('Orders exported to CSV successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to export CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  // Filtered orders with multi-select status and date range
  const filteredOrders = orders.filter(o => {
    // Multi-select Status Filter
    if (selectedOrderStatuses.length > 0 && !selectedOrderStatuses.includes(o.orderStatus)) {
      return false;
    }

    if (orderPaymentFilter !== 'all' && o.paymentStatus !== orderPaymentFilter) return false;
    if (orderTypeFilter === 'subscription' && !o.items.some(i => i.type === 'subscription')) return false;
    if (orderTypeFilter === 'meal' && !o.items.some(i => i.type === 'meal')) return false;

    // Date Range Filter (compares against createdAt or deliveryDate based on orderDateBasis)
    const targetDate = orderDateBasis === 'deliveryDate'
      ? (o.deliveryDate || (o.createdAt ? o.createdAt.split('T')[0] : ''))
      : (o.createdAt ? o.createdAt.split('T')[0] : (o.deliveryDate || ''));
    if (orderStartDate && targetDate < orderStartDate) return false;
    if (orderEndDate && targetDate > orderEndDate) return false;

    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.area.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Performance metrics for currently filtered selection
  const performanceRevenue = filteredOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const performancePaidRevenue = filteredOrders
    .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const performanceValidOrdersCount = filteredOrders.filter(o => o.orderStatus !== 'cancelled').length;
  const performanceAOV = performanceValidOrdersCount > 0
    ? Math.round(performanceRevenue / performanceValidOrdersCount)
    : 0;
  const performanceDeliveredCount = filteredOrders.filter(o => o.orderStatus === 'delivered').length;
  const performanceCancelledCount = filteredOrders.filter(o => o.orderStatus === 'cancelled').length;
  const performanceActiveCount = filteredOrders.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.orderStatus)).length;

  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter(s => {
    if (subscriptionFilter !== 'all' && s.status !== subscriptionFilter) return false;
    if (subscriptionSearch) {
      const q = subscriptionSearch.toLowerCase();
      return (
        s.subscriptionNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.includes(q) ||
        s.planName.toLowerCase().includes(q) ||
        s.deliveryAddress.area.toLowerCase().includes(q) ||
        (s.orderId && s.orderId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered menu items for Menu Management
  const filteredMenuItems = menuItems.filter(meal => {
    if (menuCategoryFilter !== 'all' && meal.category !== menuCategoryFilter) return false;
    if (menuCategoryFilter === 'Non-Veg' && menuSubCategoryFilter !== 'all') {
      if (meal.subCategory !== menuSubCategoryFilter) return false;
    }
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return (
        meal.name.toLowerCase().includes(q) ||
        meal.description.toLowerCase().includes(q) ||
        (meal.subCategory && meal.subCategory.toLowerCase().includes(q)) ||
        meal.ingredients?.some(i => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // If not logged in, show dedicated Admin Login screen
  if (!adminUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-stone-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <MannaLogo size={52} showText={false} />
            </div>
            <h2 className="text-xl font-bold font-display text-stone-900">
              Manna Foods Admin Workspace
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Restricted management console for Pune central kitchen
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700 block">
                  Admin Secret Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  {showLoginPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 pr-10"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Prioritizes your updated database password with bootstrap fallback enabled.
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authenticate &amp; Enter Admin Suite</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Admin: mannafoods1120@gmail.com</span>
            <button
              onClick={onCloseAdmin}
              className="text-stone-700 font-semibold hover:underline"
            >
              ← Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Sub-bar */}
      <div className="bg-stone-900 text-stone-200 px-6 py-3 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <MannaLogo size={28} showText={false} dark={true} />
          <span className="font-display font-bold text-amber-400 text-base">
            Manna Foods
          </span>
          <span className="text-stone-500">/</span>
          <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
            Admin Suite (Pune Central)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-stone-400 hidden sm:inline">
            Logged in: <strong className="text-stone-200 font-mono">{adminUser.email}</strong>
          </span>
          <button
            onClick={loadAllAdminData}
            title="Refresh All Data"
            className="p-1.5 rounded-md hover:bg-stone-800 text-stone-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onCloseAdmin}
            className="px-3 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
          >
            Exit to Storefront
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)}>✕</button>
        </div>
      )}

      {errorBanner && (
        <div className="bg-rose-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)}>✕</button>
        </div>
      )}

      {/* Main Admin Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white rounded-2xl border border-stone-200 p-3 shadow-2xs shrink-0 self-start">
          <div className="px-3 py-1.5 mb-2 border-b border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Operations &amp; Subscriptions
            </span>
          </div>
          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'dashboard' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-700" />
              <span>Dashboard Overview</span>
            </button>

            {/* 2. Customers */}
            <button
              onClick={() => setActiveSection('customers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'customers' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-stone-700" />
                <span>Customers</span>
              </div>
              <span className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                {customers.length}
              </span>
            </button>

            {/* 3. Subscriptions (Master Operations) */}
            <button
              onClick={() => setActiveSection('subscriptions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'subscriptions' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarRange className="w-4 h-4 text-stone-700" />
                <span>Subscriptions</span>
              </div>
              <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                {subscriptions.length}
              </span>
            </button>

            {/* 4. Long-Term Cashback Offers */}
            <button
              onClick={() => setActiveSection('long_term_offers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'long_term_offers' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-amber-700" />
                <span>Long-Term Cashback</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                4 Offers
              </span>
            </button>

            {/* 4B. Early Cancellation & Policy */}
            <button
              onClick={() => setActiveSection('cancellation_policy')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'cancellation_policy' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Early Cancellation &amp; Policy</span>
              </div>
              <span className="font-mono text-[10px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold">
                Refunds
              </span>
            </button>

            {/* 4C. Terms & Conditions Policy Editor */}
            <button
              onClick={() => setActiveSection('legal_terms')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'legal_terms' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Terms &amp; Policies</span>
              </div>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                T&amp;C
              </span>
            </button>

            {/* 5. Pause Tracker */}
            <button
              onClick={() => setActiveSection('pause_tracker')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'pause_tracker' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PauseCircle className="w-4 h-4 text-amber-700" />
                <span>Pause Tracker</span>
              </div>
              {customerPauses.filter(p => p.status === 'exceeded_limit').length > 0 ? (
                <span className="font-mono text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold animate-pulse">
                  {customerPauses.filter(p => p.status === 'exceeded_limit').length} Alert
                </span>
              ) : (
                <span className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                  {customerPauses.length}
                </span>
              )}
            </button>

            {/* 6. Meal Utilization */}
            <button
              onClick={() => setActiveSection('meal_utilization')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'meal_utilization' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="w-4 h-4 text-stone-700" />
                <span>Meal Utilization</span>
              </div>
              <span className="font-mono text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-semibold">
                Burn-Down
              </span>
            </button>

            {/* 7. Reports */}
            <button
              onClick={() => setActiveSection('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'reports' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4 text-stone-700" />
              <span>Reports &amp; Audit</span>
            </button>

            {/* Additional Modules divider */}
            <div className="pt-3 pb-1 border-t border-stone-100 px-3">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Storefront &amp; Config
              </span>
            </div>

            {/* 8. Orders */}
            <button
              onClick={() => setActiveSection('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'orders' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-stone-700" />
                <span>Daily Orders</span>
              </div>
              <span className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                {orders.length}
              </span>
            </button>

            {/* 9. Menu Management */}
            <button
              onClick={() => setActiveSection('menu')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'menu' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-4 h-4 text-stone-700" />
                <span>Kitchen Menu</span>
              </div>
              <span className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                {menuItems.length}
              </span>
            </button>

            {/* 10. Coupons */}
            <button
              onClick={() => setActiveSection('coupons')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'coupons' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-stone-700" />
                <span>Coupons &amp; Offers</span>
              </div>
              <span className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                {coupons.length}
              </span>
            </button>

            {/* 11. Business Settings */}
            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'settings' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-stone-700" />
              <span>Business Settings</span>
            </button>

            {/* 12. Security */}
            <button
              onClick={() => {
                setActiveSection('security');
                fetchSecurityMeta();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeSection === 'security' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Admin Security</span>
              </div>
              <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                Auth
              </span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs min-w-0">
          {/* 1. DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">
                  Kitchen Operations &amp; Executive Dashboard
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time metrics for Manna Foods Pune tiffin service &amp; daily kitchen preparation
                </p>
              </div>

              {/* Executive KPI Header with the 5 required cards */}
              <ExecutiveKPIHeader
                subscriptions={subscriptions}
                customerPauses={customerPauses}
                operationsSummary={operationsSummary}
                onNavigateSection={(sec) => setActiveSection(sec)}
              />

              {/* Secondary Financial & Kitchen Stat Cards Grid */}
              {dashboardSummary && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
                        Total Revenue
                      </span>
                  <div className="text-2xl font-extrabold text-stone-950 tabular-nums mt-1">
                    ₹{dashboardSummary.totalRevenue}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <span>₹{dashboardSummary.todayRevenue} today</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
                    Total Orders
                  </span>
                  <div className="text-2xl font-extrabold text-stone-950 tabular-nums mt-1">
                    {dashboardSummary.totalOrders}
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                    {dashboardSummary.todayOrders} placed today
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
                    Active Subscriptions
                  </span>
                  <div className="text-2xl font-extrabold text-amber-700 tabular-nums mt-1">
                    {dashboardSummary.activeSubscriptions}
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                    Monthly &amp; weekly plans
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
                    Pending In Kitchen
                  </span>
                  <div className="text-2xl font-extrabold text-indigo-700 tabular-nums mt-1">
                    {dashboardSummary.pendingOrders}
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                    Need preparation / dispatch
                  </span>
                </div>
              </div>

              {/* 7-Day Sales Chart Representation */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-900 text-sm">
                    7-Day Pune Tiffin Order Volume
                  </h3>
                  <span className="text-xs text-stone-500">Daily Revenue (₹)</span>
                </div>
                <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4">
                  {dashboardSummary.salesByDate.map((item, idx) => {
                    const maxAmt = Math.max(...dashboardSummary.salesByDate.map(s => s.amount), 500);
                    const heightPercent = Math.max(15, Math.round((item.amount / maxAmt) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono text-stone-600 font-bold tabular-nums">
                          ₹{item.amount}
                        </span>
                        <div
                          className="w-full bg-amber-500 hover:bg-amber-600 rounded-t-md transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-stone-400 font-mono truncate w-full text-center">
                          {item.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Meals Ranking */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <h3 className="font-bold text-stone-900 text-sm mb-3">
                  Most Ordered Homestyle Meals
                </h3>
                <div className="divide-y divide-stone-200/70 text-xs">
                  {dashboardSummary.topMeals.map((meal, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-stone-400 font-mono font-bold">{idx + 1}.</span>
                        <span className="font-semibold text-stone-800">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-stone-500">{meal.count} orders</span>
                        <span className="font-bold text-stone-900 tabular-nums">₹{meal.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

          {/* 2. ORDERS MANAGEMENT */}
          {activeSection === 'orders' && (
            <div className="space-y-5">
              {/* Header & Export Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-xl text-stone-900">
                    Order Management &amp; Sales Review
                  </h2>
                  <p className="text-xs text-stone-500">
                    Filter by multiple statuses, inspect daily/weekly sales performance, and manage live tiffin delivery updates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(orderDatePreset !== 'all' || selectedOrderStatuses.length > 0 || orderSearch || orderPaymentFilter !== 'all' || orderTypeFilter !== 'all' || orderStartDate || orderEndDate) && (
                    <button
                      onClick={handleClearAllOrderFilters}
                      className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                      <span>Reset Filters</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportCSV}
                    disabled={exportingCSV}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-1.5 self-start cursor-pointer shadow-xs transition-opacity"
                  >
                    {exportingCSV ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{exportingCSV ? 'Exporting...' : 'Export to CSV'}</span>
                  </button>
                </div>
              </div>

              {/* 1. SALES PERFORMANCE REVIEW RIBBON */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                        <span>Sales Performance Summary</span>
                        {orderDatePreset !== 'all' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 uppercase">
                            {orderDatePreset === 'today' ? 'Today' : orderDatePreset === 'yesterday' ? 'Yesterday' : orderDatePreset === 'week' ? 'Past 7 Days' : orderDatePreset === 'month' ? 'Past 30 Days' : 'Custom Dates'}
                          </span>
                        )}
                        {selectedOrderStatuses.length > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                            {selectedOrderStatuses.length} Statuses Filtered
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        {orderStartDate && orderEndDate
                          ? `Sales window (${orderDateBasis === 'createdAt' ? 'Order Date' : 'Delivery Date'}): ${orderStartDate} to ${orderEndDate} · ${filteredOrders.length} orders analyzed`
                          : `Sales window: All Time · ${filteredOrders.length} orders analyzed`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Filter Insights</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block uppercase tracking-wider">Filtered Revenue</span>
                    <span className="text-xl sm:text-2xl font-bold font-display text-amber-400 tabular-nums">
                      ₹{performanceRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      ₹{performancePaidRevenue.toLocaleString('en-IN')} paid online
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block uppercase tracking-wider">Orders In Scope</span>
                    <span className="text-xl sm:text-2xl font-bold font-display text-stone-100 tabular-nums">
                      {filteredOrders.length}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {performanceValidOrdersCount} non-cancelled
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block uppercase tracking-wider">Average Order Value</span>
                    <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400 tabular-nums">
                      ₹{performanceAOV}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Per active / completed order
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block uppercase tracking-wider">Delivery Breakdown</span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {performanceDeliveredCount} Delivered
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {performanceActiveCount} In Kitchen/Transit
                      </span>
                      {performanceCancelledCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          {performanceCancelledCount} Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. DATE RANGE PICKER & PRESETS */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Review Period (Daily / Weekly / Custom):
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
                    <button
                      onClick={() => handleSetDatePreset('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        orderDatePreset === 'all' && !orderStartDate && !orderEndDate
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      onClick={() => handleSetDatePreset('today')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        orderDatePreset === 'today'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span>📅 Today</span>
                    </button>
                    <button
                      onClick={() => handleSetDatePreset('yesterday')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        orderDatePreset === 'yesterday'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => handleSetDatePreset('week')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        orderDatePreset === 'week'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>📊 This Week (7 Days)</span>
                    </button>
                    <button
                      onClick={() => handleSetDatePreset('month')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        orderDatePreset === 'month'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>📈 This Month (30 Days)</span>
                    </button>
                  </div>
                </div>

                {/* Explicit Start and End Date Inputs & Basis Switch */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2.5 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Date Basis selector */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                      <span className="text-[11px] font-semibold text-stone-600 px-1">Basis:</span>
                      <button
                        type="button"
                        onClick={() => setOrderDateBasis('createdAt')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          orderDateBasis === 'createdAt'
                            ? 'bg-white text-stone-900 shadow-2xs font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Order Placed (Sales)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderDateBasis('deliveryDate')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          orderDateBasis === 'deliveryDate'
                            ? 'bg-white text-stone-900 shadow-2xs font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Delivery Date (Kitchen)
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">Custom Range:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-stone-400">From</span>
                        <input
                          type="date"
                          value={orderStartDate}
                          onChange={(e) => {
                            setOrderStartDate(e.target.value);
                            setOrderDatePreset('custom');
                          }}
                          className="px-2.5 py-1 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-stone-400">To</span>
                        <input
                          type="date"
                          value={orderEndDate}
                          onChange={(e) => {
                            setOrderEndDate(e.target.value);
                            setOrderDatePreset('custom');
                          }}
                          className="px-2.5 py-1 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {(orderStartDate || orderEndDate) && (
                    <button
                      onClick={() => {
                        setOrderStartDate('');
                        setOrderEndDate('');
                        setOrderDatePreset('all');
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      Clear Date Range
                    </button>
                  )}
                </div>
              </div>

              {/* 3. MULTI-SELECT ORDER STATUS FILTER BAR */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-700" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Multi-Select Order Statuses:
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {selectedOrderStatuses.length === 0 ? '(Showing All Statuses)' : `(${selectedOrderStatuses.length} selected)`}
                    </span>
                  </div>

                  {selectedOrderStatuses.length > 0 && (
                    <button
                      onClick={() => setSelectedOrderStatuses([])}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      Reset to All Statuses
                    </button>
                  )}
                </div>

                {/* Status Toggle Pills with Checkboxes */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none flex-wrap">
                  <button
                    onClick={() => setSelectedOrderStatuses([])}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedOrderStatuses.length === 0
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>All Statuses</span>
                    <span className="text-[10px] opacity-80 font-mono">({orders.length})</span>
                  </button>

                  {[
                    { key: 'pending' as OrderStatus, label: 'Pending', dot: 'bg-indigo-500', activeBg: 'bg-indigo-600 text-white', inactiveBg: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
                    { key: 'confirmed' as OrderStatus, label: 'Confirmed', dot: 'bg-blue-500', activeBg: 'bg-blue-600 text-white', inactiveBg: 'bg-blue-50 text-blue-900 border-blue-200' },
                    { key: 'preparing' as OrderStatus, label: 'Preparing (Kitchen)', dot: 'bg-amber-500', activeBg: 'bg-amber-600 text-white', inactiveBg: 'bg-amber-50 text-amber-900 border-amber-200' },
                    { key: 'out_for_delivery' as OrderStatus, label: 'Out for Delivery', dot: 'bg-purple-500', activeBg: 'bg-purple-600 text-white', inactiveBg: 'bg-purple-50 text-purple-900 border-purple-200' },
                    { key: 'delivered' as OrderStatus, label: 'Delivered', dot: 'bg-emerald-500', activeBg: 'bg-emerald-600 text-white', inactiveBg: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                    { key: 'cancelled' as OrderStatus, label: 'Cancelled', dot: 'bg-red-500', activeBg: 'bg-red-600 text-white', inactiveBg: 'bg-red-50 text-red-900 border-red-200' }
                  ].map((st) => {
                    const isSelected = selectedOrderStatuses.includes(st.key);
                    const count = orders.filter(o => o.orderStatus === st.key).length;

                    return (
                      <button
                        key={st.key}
                        onClick={() => handleToggleStatusFilter(st.key)}
                        className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${st.activeBg} border-transparent shadow-xs font-bold`
                            : `${st.inactiveBg} hover:opacity-90`
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : st.dot}`} />
                        <span>{st.label}</span>
                        <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-black/5'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. SEARCH, ORDER TYPE & PAYMENT FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by order#, name, phone, area, plan..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>

                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-medium"
                >
                  <option value="all">All Order Types (Meals + Plans)</option>
                  <option value="subscription">📅 Subscription Plans Only</option>
                  <option value="meal">🍲 Regular Meal Orders Only</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-medium"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid (Razorpay)</option>
                  <option value="pending">Pending Payment</option>
                  <option value="failed">Failed Payment</option>
                </select>
              </div>

              {/* 5. ORDERS TABLE */}
              <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer &amp; Location</th>
                      <th className="p-3">Order Date &amp; Slot</th>
                      <th className="p-3">Items / Subscription Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-stone-500">
                          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="font-semibold text-stone-700">No orders matching current filter criteria.</p>
                          <p className="text-[11px] text-stone-400 mt-1">
                            Try adjusting your status multi-select or date range filter.
                          </p>
                          <button
                            onClick={handleClearAllOrderFilters}
                            className="mt-3 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                          >
                            Reset All Filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const orderDateFormatted = o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : o.deliveryDate;
                        const orderTimeFormatted = o.createdAt
                          ? new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : '';

                        const isJustUpdated = recentlyUpdatedOrderId === o.id;
                        const updateInfo = isJustUpdated ? recentStatusUpdateInfo : null;

                        let rowHighlightClass = '';
                        if (isJustUpdated) {
                          if (o.orderStatus === 'delivered') rowHighlightClass = 'animate-order-row-emerald ring-1 ring-emerald-400/50';
                          else if (o.orderStatus === 'preparing') rowHighlightClass = 'animate-order-row-amber ring-1 ring-amber-400/50';
                          else if (o.orderStatus === 'out_for_delivery') rowHighlightClass = 'animate-order-row-purple ring-1 ring-purple-400/50';
                          else if (o.orderStatus === 'confirmed') rowHighlightClass = 'animate-order-row-blue ring-1 ring-blue-400/50';
                          else if (o.orderStatus === 'cancelled') rowHighlightClass = 'animate-order-row-red ring-1 ring-red-400/50';
                          else rowHighlightClass = 'animate-order-row-amber ring-1 ring-amber-400/50';
                        }

                        return (
                          <tr
                            key={o.id}
                            className={`transition-colors duration-700 ${rowHighlightClass} ${
                              !isJustUpdated ? 'hover:bg-stone-50/80' : ''
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-stone-900 align-top">
                              <div>#{o.orderNumber}</div>
                              <span className="text-[10px] text-stone-400 font-normal font-sans">
                                {o.paymentMethod.toUpperCase()}
                              </span>
                            </td>

                            <td className="p-3 align-top">
                              <div className="font-semibold text-stone-900">{o.customerName}</div>
                              <div className="text-[11px] text-stone-500">{o.customerPhone}</div>
                              <div className="text-[10px] text-stone-500 mt-0.5">📍 {o.deliveryAddress.area}</div>
                            </td>

                            <td className="p-3 align-top whitespace-nowrap">
                              <div className="font-medium text-stone-900 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                <span>{orderDateFormatted}</span>
                              </div>
                              {orderTimeFormatted && (
                                <div className="text-[10px] text-stone-400">
                                  {orderTimeFormatted}
                                </div>
                              )}
                              <div className="text-[10px] text-stone-500 mt-0.5">
                                Slot: {o.deliverySlot || 'Standard'}
                              </div>
                            </td>

                            <td className="p-3 max-w-xs text-stone-700 align-top">
                              {o.items.some(i => i.type === 'subscription') ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-1">
                                    <CalendarRange className="w-3 h-3 text-amber-700" />
                                    Subscription Plan
                                  </span>
                                  <div className="font-semibold text-stone-900 text-xs">
                                    {o.items.map(i => `${i.name} (${i.details || `x${i.quantity}`})`).join(', ')}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-xs text-stone-800 font-medium">
                                    {o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="p-3 font-bold text-stone-900 tabular-nums align-top">
                              ₹{o.totalAmount}
                              {o.couponDiscount > 0 && (
                                <span className="text-[10px] text-emerald-700 block font-normal">
                                  Saved ₹{o.couponDiscount}
                                </span>
                              )}
                            </td>

                            <td className="p-3 align-top">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {o.paymentStatus}
                              </span>
                            </td>

                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 transition-all duration-500 ${
                                    isJustUpdated ? 'animate-status-pop shadow-xs' : ''
                                  } ${
                                    o.orderStatus === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : o.orderStatus === 'cancelled'
                                      ? 'bg-red-50 text-red-800 border border-red-200'
                                      : o.orderStatus === 'preparing'
                                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                      : o.orderStatus === 'out_for_delivery'
                                      ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                      : o.orderStatus === 'confirmed'
                                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                                  }`}>
                                    <span className="relative flex h-1.5 w-1.5">
                                      {isJustUpdated && (
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                          o.orderStatus === 'delivered' ? 'bg-emerald-500' :
                                          o.orderStatus === 'cancelled' ? 'bg-red-500' :
                                          o.orderStatus === 'preparing' ? 'bg-amber-500' :
                                          o.orderStatus === 'out_for_delivery' ? 'bg-purple-500' :
                                          o.orderStatus === 'confirmed' ? 'bg-blue-500' : 'bg-indigo-500'
                                        }`} />
                                      )}
                                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 transition-colors duration-500 ${
                                        o.orderStatus === 'delivered' ? 'bg-emerald-600' :
                                        o.orderStatus === 'cancelled' ? 'bg-red-600' :
                                        o.orderStatus === 'preparing' ? 'bg-amber-600' :
                                        o.orderStatus === 'out_for_delivery' ? 'bg-purple-600' :
                                        o.orderStatus === 'confirmed' ? 'bg-blue-600' : 'bg-indigo-600'
                                      }`} />
                                    </span>
                                    <span>{o.orderStatus.replace(/_/g, ' ')}</span>
                                  </span>

                                  {/* Subtle visual transition feedback pill */}
                                  {isJustUpdated && updateInfo && (
                                    <span className="animate-feedback-toast inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/90 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                      <span>{updateInfo.fromStatus.replace(/_/g, ' ')} → {updateInfo.toStatus.replace(/_/g, ' ')}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-3 text-right space-x-1 whitespace-nowrap align-top">
                              {/* Quick in-row status selector */}
                              <select
                                value={o.orderStatus}
                                onChange={(e) => handleQuickStatusChange(o, e.target.value as OrderStatus)}
                                className="px-2 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer mr-1"
                                title="Quick change status"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <button
                                onClick={() => {
                                  setSelectedOrderForEdit(o);
                                  setNewOrderStatus(o.orderStatus);
                                }}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px] cursor-pointer"
                                title="Open detailed update modal"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleResendWhatsApp(o.id)}
                                title="Resend WhatsApp Confirmation"
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Status Update Modal */}
              {selectedOrderForEdit && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <h3 className="font-bold text-base text-stone-900 mb-1">
                      Update Order #{selectedOrderForEdit.orderNumber}
                    </h3>
                    <p className="text-xs text-stone-500 mb-4">
                      Customer: {selectedOrderForEdit.customerName} ({selectedOrderForEdit.customerPhone})
                    </p>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Delivery Status
                        </label>
                        <select
                          value={newOrderStatus}
                          onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing (Cooking in Kitchen)</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Audit Trail Note (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Handed to delivery executive Suresh"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setSelectedOrderForEdit(null)}
                        className="px-4 py-2 text-stone-600 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateOrderStatus}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
                      >
                        Save Status
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MENU MANAGEMENT */}
          {activeSection === 'menu' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-stone-900">
                    Menu Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Add, edit, or disable kitchen dishes. Immediate real-time reflection on customer portal.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMenuItem(null);
                    setMealForm({
                      name: '',
                      category: 'Veg',
                      subCategory: '',
                      mealType: 'veg',
                      description: '',
                      image: '',
                      price: 150,
                      isAvailable: true,
                      isFeatured: false,
                      ingredients: '',
                      calories: 500
                    });
                    setUploadError(null);
                    setShowUrlInput(false);
                    setMenuModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Meal Item</span>
                </button>
              </div>

              {/* Category Filter Tabs & Search */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Two Main Categories: Veg & Non-Veg */}
                  <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                    <button
                      onClick={() => {
                        setMenuCategoryFilter('all');
                        setMenuSubCategoryFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        menuCategoryFilter === 'all'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      All Dishes ({menuItems.length})
                    </button>
                    <button
                      onClick={() => {
                        setMenuCategoryFilter('Veg');
                        setMenuSubCategoryFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        menuCategoryFilter === 'Veg'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Veg ({menuItems.filter(m => m.category === 'Veg' || m.mealType === 'veg').length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuCategoryFilter('Non-Veg');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        menuCategoryFilter === 'Non-Veg'
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'text-red-800 hover:bg-red-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Non-Veg ({menuItems.filter(m => m.category === 'Non-Veg' || m.mealType === 'non-veg').length})</span>
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search dish or ingredient..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Two Sub-Categories in Non-Veg: Chicken & Mutton */}
                {menuCategoryFilter === 'Non-Veg' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 flex-wrap">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Non-Veg Sub-Categories:
                    </span>
                    <button
                      onClick={() => setMenuSubCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        menuSubCategoryFilter === 'all'
                          ? 'bg-stone-900 text-white font-semibold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      All Non-Veg
                    </button>
                    <button
                      onClick={() => setMenuSubCategoryFilter('Chicken')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        menuSubCategoryFilter === 'Chicken'
                          ? 'bg-amber-600 text-white font-semibold shadow-xs'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span>🍗 Chicken</span>
                      <span className="text-[10px] opacity-80">
                        ({menuItems.filter(m => (m.category === 'Non-Veg' || m.mealType === 'non-veg') && m.subCategory === 'Chicken').length})
                      </span>
                    </button>
                    <button
                      onClick={() => setMenuSubCategoryFilter('Mutton')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        menuSubCategoryFilter === 'Mutton'
                          ? 'bg-red-800 text-white font-semibold shadow-xs'
                          : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <span>🥩 Mutton</span>
                      <span className="text-[10px] opacity-80">
                        ({menuItems.filter(m => (m.category === 'Non-Veg' || m.mealType === 'non-veg') && m.subCategory === 'Mutton').length})
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-stone-50 rounded-xl border border-stone-200 p-6">
                    <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700 text-xs">No menu dishes found</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Try resetting your category filter or search query</p>
                  </div>
                ) : (
                  filteredMenuItems.map((meal) => (
                    <div key={meal.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between overflow-hidden">
                      <div>
                        {meal.image && (
                          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-stone-200/80 bg-stone-100">
                            <img
                              src={meal.image}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <span className={`w-2 h-2 rounded-full ${meal.mealType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                meal.category === 'Veg' || meal.mealType === 'veg'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {meal.category || (meal.mealType === 'veg' ? 'Veg' : 'Non-Veg')}
                              </span>
                              {meal.subCategory && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                                  {meal.subCategory === 'Mutton' ? '🥩' : '🍗'} {meal.subCategory}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{meal.name}</h4>
                          </div>
                          <span className="font-bold text-stone-900 tabular-nums">₹{meal.price}</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{meal.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleMealAvailability(meal)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            meal.isAvailable ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {meal.isAvailable ? 'Enabled' : 'Disabled'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingMenuItem(meal);
                              const isVeg = meal.category === 'Veg' || meal.mealType === 'veg';
                              setMealForm({
                                name: meal.name,
                                category: isVeg ? 'Veg' : 'Non-Veg',
                                subCategory: meal.subCategory || (!isVeg ? 'Chicken' : ''),
                                mealType: isVeg ? 'veg' : 'non-veg',
                                description: meal.description,
                                image: meal.image || '',
                                price: meal.price,
                                isAvailable: meal.isAvailable,
                                isFeatured: Boolean(meal.isFeatured),
                                ingredients: meal.ingredients?.join(', ') || '',
                                calories: meal.calories || 500
                              });
                              setUploadError(null);
                              setShowUrlInput(Boolean(meal.image && meal.image.startsWith('http')));
                              setMenuModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Meal Add/Edit Modal */}
              {menuModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                      <h3 className="font-bold text-base text-stone-900">
                        {editingMenuItem ? 'Edit Menu Item' : 'Add New Kitchen Meal'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setMenuModalOpen(false)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveMeal} className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Meal Name *</label>
                        <input
                          type="text"
                          required
                          value={mealForm.name}
                          onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                          placeholder="e.g. Paneer Butter Masala Thali"
                        />
                      </div>

                      {/* Image Upload Zone */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-stone-700">Dish Photo / Meal Image</label>
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                          >
                            {showUrlInput ? '← Switch to File Upload' : 'Or paste Image URL'}
                          </button>
                        </div>

                        {/* Hidden file input for native file picker */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageFileChange}
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                        />

                        {/* Live Image Preview Card if image is present */}
                        {mealForm.image ? (
                          <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-2.5 flex items-center gap-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-300 relative group">
                              <img
                                src={mealForm.image}
                                alt="Dish preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <p className="text-xs font-bold text-stone-800">Photo Attached</p>
                              </div>
                              <p className="text-[10px] text-stone-500 truncate mt-0.5 font-mono">
                                {mealForm.image.startsWith('data:') ? 'Optimized Local Photo (JPEG)' : mealForm.image}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={imageUploading}
                                  className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  {imageUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                  <span>{imageUploading ? 'Uploading...' : 'Replace Photo'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : showUrlInput ? (
                          <div className="space-y-1">
                            <input
                              type="url"
                              value={mealForm.image}
                              onChange={(e) => setMealForm({ ...mealForm, image: e.target.value })}
                              placeholder="https://images.unsplash.com/... or /uploads/meal.jpg"
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                            />
                            <p className="text-[10px] text-stone-400">Direct link to JPG, PNG, or WebP file.</p>
                          </div>
                        ) : (
                          /* Drop & Click Upload Box */
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-stone-300 hover:border-amber-500 hover:bg-amber-50/40 rounded-xl p-4 text-center cursor-pointer transition-all duration-150 group"
                          >
                            {imageUploading ? (
                              <div className="flex flex-col items-center justify-center py-2">
                                <Loader2 className="w-6 h-6 text-amber-600 animate-spin mb-1" />
                                <span className="text-xs font-semibold text-stone-700">Compressing &amp; uploading image...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                                  <UploadCloud className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-stone-800">
                                  Click to upload meal photo from device
                                </span>
                                <span className="text-[11px] text-stone-500 mt-0.5">
                                  Select JPG, PNG, WebP (auto-compressed for fast loading)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {uploadError && (
                          <div className="mt-1.5 text-[11px] text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Main Category *</label>
                          <select
                            value={mealForm.category}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              setMealForm({
                                ...mealForm,
                                category: newCat,
                                mealType: newCat === 'Veg' ? 'veg' : 'non-veg',
                                subCategory: newCat === 'Non-Veg' ? (mealForm.subCategory || 'Chicken') : ''
                              });
                            }}
                            className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold text-stone-900"
                          >
                            <option value="Veg">🌿 Veg</option>
                            <option value="Non-Veg">🍗 Non-Veg</option>
                          </select>
                        </div>

                        {mealForm.category === 'Non-Veg' ? (
                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Non-Veg Sub-Category *
                            </label>
                            <select
                              value={mealForm.subCategory || 'Chicken'}
                              onChange={(e) => setMealForm({ ...mealForm, subCategory: e.target.value })}
                              className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold text-amber-900"
                            >
                              <option value="Chicken">🍗 Chicken</option>
                              <option value="Mutton">🥩 Mutton</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">Diet Classification</label>
                            <div className="w-full px-2 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span>Pure Vegetarian (Veg)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={mealForm.price}
                            onChange={(e) => setMealForm({ ...mealForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Calories (kcal)</label>
                          <input
                            type="number"
                            value={mealForm.calories}
                            onChange={(e) => setMealForm({ ...mealForm, calories: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={mealForm.description}
                          onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                          placeholder="Fresh phulkas, seasonal sabzi, dal..."
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Key Ingredients (comma separated)</label>
                        <input
                          type="text"
                          value={mealForm.ingredients}
                          onChange={(e) => setMealForm({ ...mealForm, ingredients: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                          placeholder="Paneer, Whole Wheat Atta, Toor Dal, Desi Ghee"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-stone-700">
                          <input
                            type="checkbox"
                            checked={mealForm.isAvailable}
                            onChange={(e) => setMealForm({ ...mealForm, isAvailable: e.target.checked })}
                          />
                          <span>Available Today</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs text-stone-700">
                          <input
                            type="checkbox"
                            checked={mealForm.isFeatured}
                            onChange={(e) => setMealForm({ ...mealForm, isFeatured: e.target.checked })}
                          />
                          <span>Featured Dish</span>
                        </label>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setMenuModalOpen(false)}
                          className="px-4 py-2 text-stone-600 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs"
                        >
                          Save Meal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SUBSCRIPTION & PLAN MANAGEMENT */}
          {activeSection === 'subscriptions' && (
            <div className="space-y-6">
              {/* Header with Segmented Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-stone-900">
                    Monthly Tiffin Plans &amp; Subscriptions
                  </h2>
                  <p className="text-xs text-stone-500">
                    Add new tiffin packages, change pricing, update meal allowances, or track active customer deliveries
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setSubSectionTab('plans')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        subSectionTab === 'plans'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Monthly Tiffin Plans ({plans.length})</span>
                    </button>
                    <button
                      onClick={() => setSubSectionTab('active_subscriptions')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        subSectionTab === 'active_subscriptions'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Customer Subscriptions ({subscriptions.length})</span>
                    </button>
                  </div>

                  {subSectionTab === 'plans' && (
                    <button
                      onClick={() => handleOpenAddPlan('monthly')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Plan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: MONTHLY TIFFIN PLANS MANAGEMENT */}
              {subSectionTab === 'plans' && (
                <div className="space-y-5">
                  {/* Plan Filter Pills & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                      <button
                        onClick={() => setPlanTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          planTypeFilter === 'all'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        All Packages ({plans.length})
                      </button>
                      <button
                        onClick={() => setPlanTypeFilter('monthly')}
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          planTypeFilter === 'monthly'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <span>🌟 Monthly Tiffin Plans ({plans.filter(p => p.planType === 'monthly').length})</span>
                      </button>
                      <button
                        onClick={() => setPlanTypeFilter('weekly')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          planTypeFilter === 'weekly'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Weekly Plans ({plans.filter(p => p.planType === 'weekly').length})
                      </button>
                      <button
                        onClick={() => setPlanTypeFilter('daily')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          planTypeFilter === 'daily'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Daily Packs ({plans.filter(p => p.planType === 'daily').length})
                      </button>
                    </div>

                    <div className="text-xs text-stone-500 font-medium">
                      Immediate real-time sync with customer storefront
                    </div>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans
                      .filter(p => planTypeFilter === 'all' || p.planType === planTypeFilter)
                      .map((plan) => {
                        const discountAmt = Math.round((plan.basePrice * (plan.discountPercentage || 0)) / 100);
                        const effectivePrice = Math.max(0, plan.basePrice - discountAmt);
                        const perMeal = plan.mealsCount > 0 ? Math.round(effectivePrice / plan.mealsCount) : 0;

                        return (
                          <div
                            key={plan.id}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative bg-white ${
                              plan.isPopular 
                                ? 'border-amber-400 shadow-md ring-1 ring-amber-300' 
                                : 'border-stone-200 shadow-2xs hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Top Tags */}
                              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                  plan.planType === 'monthly'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : plan.planType === 'weekly'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}>
                                  {plan.planType} ({plan.mealsCount} Meals)
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {plan.isPopular && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                                      ★ Popular
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    plan.mealType === 'veg'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : plan.mealType === 'non-veg'
                                      ? 'bg-red-50 text-red-800 border border-red-200'
                                      : 'bg-purple-50 text-purple-800 border border-purple-200'
                                  }`}>
                                    {plan.mealType === 'both' ? 'Veg & Non-Veg' : plan.mealType}
                                  </span>
                                </div>
                              </div>

                              <h3 className="font-display font-bold text-base text-stone-900 leading-snug">
                                {plan.name}
                              </h3>

                              {/* Price Box */}
                              <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black text-amber-800 font-display">
                                    ₹{effectivePrice}
                                  </span>
                                  {plan.discountPercentage > 0 && (
                                    <>
                                      <span className="text-xs text-stone-400 line-through">
                                        ₹{plan.basePrice}
                                      </span>
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                        {plan.discountPercentage}% OFF
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-600 font-medium mt-0.5">
                                  ~₹{perMeal} per meal · {plan.mealsCount} fresh deliveries
                                </div>
                              </div>

                              <div className="text-[11px] text-stone-600 mt-2 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                <span>Frequency: <strong className="text-stone-800">{plan.deliveryFrequency.replace(/_/g, ' ')}</strong></span>
                              </div>

                              <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-2">
                                {plan.description}
                              </p>

                              {/* Key Features List */}
                              {plan.features && plan.features.length > 0 && (
                                <ul className="mt-3 space-y-1.5 text-[11px] text-stone-700 border-t border-stone-100 pt-2.5">
                                  {plan.features.slice(0, 4).map((f, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{f}</span>
                                    </li>
                                  ))}
                                  {plan.features.length > 4 && (
                                    <li className="text-[10px] text-stone-400 italic">
                                      +{plan.features.length - 4} more inclusions
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>

                            {/* Plan Action Buttons */}
                            <div className="mt-5 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleOpenEditPlan(plan)}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Change / Update</span>
                              </button>

                              <button
                                onClick={() => handleDeletePlan(plan)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 2: MASTER CUSTOMER SUBSCRIPTIONS & OPERATIONS */}
              {subSectionTab === 'active_subscriptions' && (
                <MasterSubscriptionsModule
                  subscriptions={subscriptions}
                  customerPauses={customerPauses}
                  onOpenCreateSubscription={() => setCreateSubModalOpen(true)}
                  onOpenEditSubscription={handleOpenEditSub}
                  onOpenAddPause={handleOpenAddPause}
                  onOpenEarlyCancellation={(sub) => {
                    setSelectedSubForCancellation(sub);
                    setEarlyCancelModalOpen(true);
                  }}
                  onRecordMealDelivery={handleRecordMealDelivery}
                  onToggleStatus={handleToggleSubscriptionStatus}
                />
              )}


              {/* ADD / EDIT / UPDATE PLAN MODAL */}
              {planModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
                      <div>
                        <h3 className="font-bold text-base text-stone-900">
                          {editingPlan ? 'Change & Update Tiffin Plan' : 'Add New Tiffin Plan'}
                        </h3>
                        <p className="text-[11px] text-stone-500">
                          Configure package pricing, quota, dietary inclusions, and duration
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlanModalOpen(false)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Plan Name *</label>
                        <input
                          type="text"
                          required
                          value={planForm.name}
                          onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                          placeholder="e.g. 30-Meal Monthly Executive Tiffin"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Plan Duration *</label>
                          <select
                            value={planForm.planType}
                            onChange={(e) => {
                              const pt = e.target.value as PlanDurationType;
                              setPlanForm({
                                ...planForm,
                                planType: pt,
                                mealsCount: pt === 'monthly' ? 30 : pt === 'weekly' ? 6 : 1
                              });
                            }}
                            className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold"
                          >
                            <option value="monthly">🌟 Monthly (30 Meals)</option>
                            <option value="weekly">📅 Weekly (6 Meals)</option>
                            <option value="daily">🍱 Daily (1 Meal Pack)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Dietary Options *</label>
                          <select
                            value={planForm.mealType}
                            onChange={(e) => setPlanForm({ ...planForm, mealType: e.target.value as any })}
                            className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold"
                          >
                            <option value="both">Veg &amp; Non-Veg Both (Flexible)</option>
                            <option value="veg">🌿 Pure Vegetarian Only</option>
                            <option value="non-veg">🍗 Non-Vegetarian Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Total Meals *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={planForm.mealsCount}
                            onChange={(e) => setPlanForm({ ...planForm, mealsCount: Number(e.target.value) })}
                            className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Base Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={planForm.basePrice}
                            onChange={(e) => setPlanForm({ ...planForm, basePrice: Number(e.target.value) })}
                            className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={planForm.discountPercentage}
                            onChange={(e) => setPlanForm({ ...planForm, discountPercentage: Number(e.target.value) })}
                            className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Live Calculated Price Indicator */}
                      {(() => {
                        const disc = Math.round((planForm.basePrice * (planForm.discountPercentage || 0)) / 100);
                        const effective = Math.max(0, planForm.basePrice - disc);
                        const per = planForm.mealsCount > 0 ? Math.round(effective / planForm.mealsCount) : 0;
                        return (
                          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-stone-600">Customer Pays:</span>
                            <div className="text-right">
                              <span className="text-sm font-black text-amber-900 font-display">₹{effective}</span>
                              <span className="text-[10px] text-stone-500 block font-medium">
                                ~₹{per} per meal · ₹{disc} discount savings
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Delivery Slot Frequency *</label>
                        <select
                          value={planForm.deliveryFrequency}
                          onChange={(e) => setPlanForm({ ...planForm, deliveryFrequency: e.target.value as any })}
                          className="w-full px-2.5 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                        >
                          <option value="daily_lunch">Daily Lunch (12:30 - 2:00 PM)</option>
                          <option value="daily_dinner">Daily Dinner (7:30 - 9:00 PM)</option>
                          <option value="both_meals">Both Lunch &amp; Dinner Everyday</option>
                          <option value="weekdays_only">Weekdays Only (Mon - Sat Lunch)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Plan Description</label>
                        <textarea
                          rows={2}
                          value={planForm.description}
                          onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                          placeholder="Short summary highlighting convenience, freshness, and savings..."
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Key Inclusions &amp; Features (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={planForm.featuresText}
                          onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono text-[11px]"
                          placeholder="30 Freshly Cooked Homestyle Meals&#10;Choose Lunch or Dinner delivery slot&#10;Flexible 7-day pause anytime via app&#10;Zero delivery charge on all 30 drops"
                        />
                      </div>

                      <div className="pt-1">
                        <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={planForm.isPopular}
                            onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-semibold">Mark as Featured / "Most Popular" Plan</span>
                        </label>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPlanModalOpen(false)}
                          className="px-4 py-2 text-stone-600 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                        >
                          {editingPlan ? 'Update Plan' : 'Save New Plan'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4B. LONG-TERM SUBSCRIPTION CASHBACK OFFERS */}
          {activeSection === 'long_term_offers' && (
            <LongTermOffersModule
              offers={longTermOffers}
              subscriptions={subscriptions}
              onEditOffer={handleOpenEditOffer}
              onOpenCreateSubscriptionWithPlan={(planChoice) => {
                handleSelectPlanTypeForCreateSub(planChoice as any);
                setCreateSubModalOpen(true);
              }}
              onNavigateToLegalTerms={() => setActiveSection('legal_terms')}
            />
          )}

          {/* 4E. EARLY CANCELLATION & POLICY MODULE */}
          {activeSection === 'cancellation_policy' && (
            <CancellationPolicyModule
              subscriptions={subscriptions}
              onOpenEarlyCancellationModal={(sub) => {
                setSelectedSubForCancellation(sub);
                setEarlyCancelModalOpen(true);
              }}
            />
          )}

          {/* 4F. TERMS & CONDITIONS POLICY EDITOR MODULE */}
          {activeSection === 'legal_terms' && (
            <LegalTermsModule
              onOpenStorefrontPolicyPreview={(docType) => {
                setAdminLegalPreviewDoc(docType);
                setAdminLegalPreviewOpen(true);
              }}
            />
          )}

          {/* 4C. CUSTOMER PAUSE TRACKER */}
          {activeSection === 'pause_tracker' && (
            <PauseTrackerModule
              pauses={customerPauses}
              subscriptions={subscriptions}
              onOpenAddPause={(sub) => handleOpenAddPause(sub)}
              onDeletePause={handleDeletePause}
            />
          )}

          {/* 4D. MEAL UTILIZATION & KITCHEN BURN-DOWN */}
          {activeSection === 'meal_utilization' && (
            <MealUtilizationModule
              subscriptions={subscriptions}
              customerPauses={customerPauses}
              onRecordMealDelivery={handleRecordMealDelivery}
              onOpenAddPause={handleOpenAddPause}
            />
          )}

          {/* 5. CUSTOMER MANAGEMENT */}
          {activeSection === 'customers' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">
                  Customer Directory
                </h2>
                <p className="text-xs text-stone-500">
                  Manage registered Pune users, order history, and account standing
                </p>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Mobile &amp; Email</th>
                      <th className="p-3">Area &amp; Address</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Total Spend</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">
                          {c.name}
                        </td>
                        <td className="p-3 text-stone-600">
                          <div>{c.phone}</div>
                          <div className="text-[11px] text-stone-400">{c.email}</div>
                        </td>
                        <td className="p-3 text-stone-600 max-w-xs truncate">
                          {c.address}, {c.area} - {c.pincode}
                        </td>
                        <td className="p-3 font-bold tabular-nums">
                          {c.totalOrders}
                        </td>
                        <td className="p-3 font-bold text-stone-900 tabular-nums">
                          ₹{c.totalSpent}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            c.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleCustomer(c)}
                            className="px-2.5 py-1 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded text-[11px] font-medium"
                          >
                            {c.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. COUPON MANAGEMENT */}
          {activeSection === 'coupons' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-stone-900">
                    Coupon &amp; Discount Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Create promo codes with minimum cart rules, subscription applicability, and usage limits
                  </p>
                </div>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-base text-stone-950 bg-amber-100 px-2 py-0.5 rounded">
                            {c.code}
                          </span>
                          <h4 className="font-semibold text-xs text-stone-800 mt-2">{c.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{c.description}</p>
                      <div className="text-[11px] text-stone-500 mt-2 space-y-0.5">
                        <div>Min Order: ₹{c.minOrderValue} · Max Cap: ₹{c.maxDiscount}</div>
                        <div>Valid for: <strong className="capitalize">{c.applicableFor}</strong> · Redeemed: {c.usedCount}/{c.usageLimit}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleCouponActive(c)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          c.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Coupon Modal */}
              {couponModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
                    <h3 className="font-bold text-base text-stone-900 mb-3">
                      Create Promotional Coupon
                    </h3>

                    <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Coupon Code *</label>
                        <input
                          type="text"
                          required
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg uppercase font-mono"
                          placeholder="e.g. MONSOON20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Discount Type</label>
                          <select
                            value={couponForm.discountType}
                            onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                            className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Discount Value *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={couponForm.discountValue}
                            onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Min Order Value (₹)</label>
                          <input
                            type="number"
                            value={couponForm.minOrderValue}
                            onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Max Discount Cap (₹)</label>
                          <input
                            type="number"
                            value={couponForm.maxDiscount}
                            onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Applicable Scope</label>
                        <select
                          value={couponForm.applicableFor}
                          onChange={(e) => setCouponForm({ ...couponForm, applicableFor: e.target.value as any })}
                          className="w-full px-2 py-2 border border-stone-300 rounded-lg bg-white"
                        >
                          <option value="all">All Orders (Daily + Subscriptions)</option>
                          <option value="subscriptions">Subscriptions Only (Monthly/Weekly)</option>
                          <option value="meals">Daily Homestyle Meals Only</option>
                        </select>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCouponModalOpen(false)}
                          className="px-4 py-2 text-stone-600 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                        >
                          Save Coupon
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. REPORTS & AUDIT */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-stone-900">
                    Audit Trail &amp; WhatsApp Dispatch Log
                  </h2>
                  <p className="text-xs text-stone-500">
                    Verification records for all customer orders, payment callbacks, and notifications
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  disabled={exportingCSV}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-1.5 transition-opacity cursor-pointer"
                >
                  {exportingCSV ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{exportingCSV ? 'Downloading...' : 'Download Orders CSV'}</span>
                </button>
              </div>

              {/* Notification logs list */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">
                  Recent WhatsApp Messages Dispatched ({notifications.length})
                </h3>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{n.customerName}</span>
                          <span className="text-stone-500">({n.phone})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-900">
                            {n.status}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(n.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <pre className="text-[11px] font-mono text-stone-700 whitespace-pre-wrap bg-white p-2.5 rounded border border-stone-200/70">
                        {n.message}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. SETTINGS */}
          {activeSection === 'settings' && settingsForm && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">
                  Business &amp; Kitchen Configuration
                </h2>
                <p className="text-xs text-stone-500">
                  Manage Pune delivery logistics, cut-off timings, and payment gateway keys
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kitchen / Operating Address</label>
                  <input
                    type="text"
                    value={settingsForm.address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    placeholder="e.g. Shop 14, Anand Park, Near MIT College Road, Kothrud, Pune, Maharashtra 411038"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={settingsForm.contactNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">WhatsApp Business Number</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Standard Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.deliveryCharge}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryCharge: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Free Delivery Over (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.freeDeliveryThreshold}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.minOrderValue}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minOrderValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Serviced Pune Delivery Localities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.deliveryAreas.join(', ')}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-semibold text-stone-800 block">Payment Integration</span>
                  <div className="text-[11px] text-stone-500">
                    Razorpay Key ID: <strong className="font-mono text-stone-900">{settingsForm.razorpayKeyId}</strong>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Secret keys are securely managed server-side and never exposed to the client browser.
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Save Business Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 9. SECURITY & CREDENTIALS */}
          {activeSection === 'security' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                    <h2 className="font-display font-bold text-xl text-stone-900">
                      Security &amp; Admin Credentials
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Update your admin password, change login email, and inspect credential security configurations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchSecurityMeta}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>

              {/* Status Banners */}
              {securitySuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Credentials Updated Successfully!</strong>
                    <span className="mt-0.5 block">{securitySuccess}</span>
                  </div>
                </div>
              )}

              {securityError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Failed to Update Credentials</strong>
                    <span className="mt-0.5 block">{securityError}</span>
                  </div>
                </div>
              )}

              {/* Identity & Hierarchy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Current Identity
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      Primary Administrator
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block">Admin Email / Username</label>
                    <span className="font-mono text-xs font-bold text-stone-900 break-all">
                      {adminUser?.email || 'mannafoods1120@gmail.com'}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block">Admin Name</label>
                    <span className="text-xs font-semibold text-stone-800">
                      {adminUser?.name || 'Manna Foods Admin'}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block">Password Storage</label>
                    <span className="text-[11px] font-mono text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded">
                      bcrypt (cost factor 10 salted)
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Authentication Hierarchy
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-800">1. Database Secure Password</span>
                        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          1st Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        {securityMeta?.lastPasswordChange
                          ? `Custom password updated on ${new Date(securityMeta.lastPasswordChange).toLocaleDateString()} at ${new Date(securityMeta.lastPasswordChange).toLocaleTimeString()}`
                          : 'Database password active. Updating below will immediately prioritize your new password.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-800">2. Bootstrap Password</span>
                        <span className="text-[10px] font-bold uppercase text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          Emergency Fallback
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        ADMIN_BOOTSTRAP_PASSWORD configuration remains available as a disaster recovery fallback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Password & Credentials Form */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                  <Lock className="w-5 h-5 text-amber-700" />
                  <h3 className="font-display font-bold text-base text-stone-900">
                    Update Admin Password &amp; Identity
                  </h3>
                </div>

                <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">
                      Current Admin Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={securityCurrentPass}
                        onChange={(e) => setSecurityCurrentPass(e.target.value)}
                        placeholder="Enter your current password to authorize changes"
                        className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Accepts your active database password or the bootstrap password as authorization.
                    </p>
                  </div>

                  {/* Change Email / Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Admin Login Email
                      </label>
                      <input
                        type="email"
                        value={securityAdminEmail}
                        onChange={(e) => setSecurityAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Leave unchanged to keep current email
                      </span>
                    </div>

                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Admin Display Name
                      </label>
                      <input
                        type="text"
                        value={securityAdminName}
                        onChange={(e) => setSecurityAdminName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Shown across admin management logs
                      </span>
                    </div>
                  </div>

                  {/* New Password & Confirmation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                    <div>
                      <label className="font-semibold text-stone-800 block mb-1">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={securityNewPass}
                          onChange={(e) => setSecurityNewPass(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password strength meter */}
                      {securityNewPass.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-stone-500">Password Strength:</span>
                            <span className={`font-semibold ${
                              securityNewPass.length >= 10 && /[0-9]/.test(securityNewPass) && /[^A-Za-z0-9]/.test(securityNewPass)
                                ? 'text-emerald-600'
                                : securityNewPass.length >= 8 && /[0-9]/.test(securityNewPass)
                                ? 'text-amber-600'
                                : 'text-red-500'
                            }`}>
                              {securityNewPass.length >= 10 && /[0-9]/.test(securityNewPass) && /[^A-Za-z0-9]/.test(securityNewPass)
                                ? 'Strong'
                                : securityNewPass.length >= 8 && /[0-9]/.test(securityNewPass)
                                ? 'Good'
                                : 'Weak (min 8 chars)'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                securityNewPass.length >= 10 && /[0-9]/.test(securityNewPass) && /[^A-Za-z0-9]/.test(securityNewPass)
                                  ? 'w-full bg-emerald-500'
                                  : securityNewPass.length >= 8 && /[0-9]/.test(securityNewPass)
                                  ? 'w-2/3 bg-amber-500'
                                  : 'w-1/3 bg-red-400'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-semibold text-stone-800 block mb-1">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={securityConfirmPass}
                          onChange={(e) => setSecurityConfirmPass(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Match Indicator */}
                      {securityConfirmPass.length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                          {securityNewPass === securityConfirmPass ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Passwords match
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <X className="w-3.5 h-3.5" /> Passwords do not match
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-stone-700 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-amber-950 text-xs">
                      <Key className="w-4 h-4 text-amber-700" />
                      <span>How Password Security Works</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Your new password is immediately hashed with bcrypt (salted) and written to the database. The system prioritizes this updated password on your next login, while the environment <code>ADMIN_BOOTSTRAP_PASSWORD</code> remains available as an emergency fallback.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={securitySubmitting || (securityNewPass.length > 0 && securityNewPass !== securityConfirmPass)}
                      className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {securitySubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving New Password...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          <span>Update Admin Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Subscription & Pause Modals */}
      <CreateSubscriptionModal
        isOpen={createSubModalOpen}
        onClose={() => setCreateSubModalOpen(false)}
        onSubmit={handleSaveCreateSubscription}
        form={createSubForm}
        onChangePlanChoice={handleSelectPlanTypeForCreateSub}
        setForm={setCreateSubForm}
        submitting={createSubSubmitting}
      />

      <EditSubscriptionModal
        isOpen={editSubModalOpen}
        onClose={() => {
          setEditSubModalOpen(false);
          setEditingSub(null);
        }}
        onSubmit={handleSaveEditSub}
        subscription={editingSub}
        form={editSubForm}
        setForm={setEditSubForm}
        submitting={editSubSubmitting}
      />

      <AddPauseModal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onSubmit={handleSaveCustomerPause}
        subscriptions={subscriptions}
        selectedSub={selectedSubForPause}
        form={pauseForm}
        setForm={setPauseForm}
        submitting={pauseSubmitting}
      />

      <EditOfferModal
        isOpen={editOfferModalOpen}
        onClose={() => {
          setEditOfferModalOpen(false);
          setEditingOffer(null);
        }}
        onSubmit={handleSaveOffer}
        offer={editingOffer}
        form={offerForm}
        setForm={setOfferForm}
        submitting={offerSubmitting}
      />

      <EarlyCancellationModal
        isOpen={earlyCancelModalOpen}
        onClose={() => {
          setEarlyCancelModalOpen(false);
          setSelectedSubForCancellation(null);
        }}
        subscription={selectedSubForCancellation}
        onConfirmCancellation={handleConfirmEarlyCancellation}
      />

      <LegalModal
        isOpen={adminLegalPreviewOpen}
        onClose={() => setAdminLegalPreviewOpen(false)}
        initialDoc={adminLegalPreviewDoc}
      />
    </div>
  );
};

