export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  area?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
  status: 'active' | 'disabled';
  customPasswordSetAt?: string;
}

export type MealDietType = 'veg' | 'non-veg';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  mealType: MealDietType;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  ingredients?: string[];
  dietaryTags?: string[];
  calories?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string | null;
  subCategories?: string[];
}

export type PlanDurationType = 'daily' | 'weekly' | 'monthly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  planType: PlanDurationType;
  mealType: MealDietType | 'both';
  mealsCount: number;
  basePrice: number;
  discountPercentage: number;
  deliveryFrequency: 'daily_lunch' | 'daily_dinner' | 'both_meals' | 'weekdays_only';
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface LongTermCashbackPlan {
  id: string;
  name: string; // e.g. "90 Meals Plan", "180 Meals Plan", "270 Meals Plan", "360 Meals Plan"
  mealsCount: number; // 90 | 180 | 270 | 360
  mealType: MealDietType; // 'veg'
  basePrice: number; // 10500 | 21000 | 31500 | 42000
  cashbackAmount: number; // 1400 | 3000 | 4500 | 6000
  effectiveValue: number; // Base Price - Cashback
  maxPauseDays: number; // 15 | 30 | 45 | 60
  maxValidityMonths: number; // 4.5 | 8.5 | 13 | 16
  maxValidityText: string; // "Up to 4.5 months", "Up to 8.5 months", "Up to 13 months", "Up to 16 months"
  description: string;
  features: string[];
  isActive: boolean;
  updatedAt?: string;
}

export type PauseStatus = 'active' | 'completed' | 'exceeded_limit';
export type NoticeCompliance = 'on_time' | 'late' | 'not_provided';

export interface CustomerPauseRecord {
  id: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  planName: string;
  mealsCount: number;
  subscriptionStartDate: string;
  originalEndDate: string;
  extendedEndDate: string;
  totalAllowedPauseDays: number;
  pauseStartDate: string;
  pauseEndDate: string;
  daysPaused: number; // End Date - Start Date + 1
  totalPauseDaysUsed: number;
  remainingPauseDays: number; // Total Allowed - Total Used
  status: PauseStatus; // active | completed | exceeded_limit
  noticeCompliance: NoticeCompliance; // on_time | late | not_provided
  noticeRecordedAt?: string;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  isActive: boolean;
  applicableFor: 'all' | 'meals' | 'subscriptions';
  applicablePlans?: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: Coupon;
}

export interface CartItem {
  id: string; // unique cart line id
  type: 'meal' | 'subscription';
  mealId?: string;
  planId?: string;
  name: string;
  price: number;
  quantity: number;
  mealType?: MealDietType | 'both';
  image?: string;
  subscriptionConfig?: {
    startDate: string;
    deliverySlot: 'lunch' | 'dinner' | 'both';
    mealsCount: number;
    frequency: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  type: 'meal' | 'subscription';
  name: string;
  mealType?: MealDietType | 'both';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  details?: string;
}

export interface DeliveryAddress {
  addressLine: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  subscriptionDiscount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  deliveryAddress: DeliveryAddress;
  deliveryDate: string;
  deliverySlot: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export type SubscriptionStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'expired';

export interface CustomerSubscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  mealType: MealDietType | 'both';
  mealsTotal: number;
  mealsUsed: number; // Meals Delivered / Consumed
  mealsRemaining: number; // Plan Meals - Meals Delivered
  planCompletionPercentage?: number; // (Meals Delivered / Plan Meals) * 100
  startDate: string;
  endDate: string; // Current Extended Validity/End Date
  originalEndDate?: string;
  extendedEndDate?: string;
  deliveryFrequency: string;
  deliverySlot: string;
  deliveryAddress: DeliveryAddress;
  basePrice: number;
  cashbackAmount?: number;
  effectiveValue?: number; // Base Price - Cashback
  finalPaid: number;
  paymentStatus: PaymentStatus;
  status: SubscriptionStatus;
  orderId: string;
  isLongTerm?: boolean;
  totalAllowedPauseDays?: number;
  totalPauseDaysUsed?: number;
  remainingPauseDays?: number;
  currentPauseStatus?: 'none' | 'active' | 'completed' | 'exceeded_limit';
  pauses?: CustomerPauseRecord[];
  cancellationDetails?: SubscriptionCancellationRecord;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionCancellationRecord {
  cancelledAt: string;
  cancelledBy: 'admin' | 'customer';
  mealsConsumed: number;
  standardMealRate: number; // 123.08
  consumedCharges: number; // mealsConsumed * 123.08
  cashbackDisbursed: number;
  adminFee: number; // 500.00
  totalDeductions: number; // consumedCharges + cashbackDisbursed + adminFee
  netRefundPayable: number; // MAX(0, upfrontPaid - totalDeductions)
  statusFlag: 'Refund Due' | 'No Refund / Deficit Absorbed';
  deficitAbsorbed?: number;
  reason?: string;
  notes?: string;
}

export interface CancellationPolicyReference {
  standardMealRate: number;
  adminFee: number;
  packages: {
    id: string;
    mealsCount: number;
    planName: string;
    upfrontPaid: number;
    cashbackDisbursed: number;
    effectiveCost: number;
    maxPauseDays: number;
    maxValidityText: string;
  }[];
  scenarios: {
    id: string;
    title: string;
    scenarioType: 'early_exit' | 'midway_exit' | 'late_exit';
    planMeals: number;
    planName: string;
    upfrontPaid: number;
    mealsConsumed: number;
    consumedCharges: number;
    cashbackDisbursed: number;
    adminFee: number;
    totalDeductions: number;
    netRefundPayable: number;
    statusFlag: 'Refund Due' | 'No Refund / Deficit Absorbed';
    notes: string;
  }[];
}

export interface SubscriptionOperationsSummary {
  totalActiveSubscriptions: number;
  totalContractedMeals: number;
  totalMealsDelivered: number;
  pipelineMealsRemaining: number;
  activePausesToday: number;
  adjustedDailyKitchenPrep: number; // Total Active - Active Pauses Today
  longTermSubscribersCount: number;
  totalCashbackCommitted: number;
}

export interface WhatsAppNotification {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  message: string;
  status: 'sent' | 'queued' | 'simulated' | 'failed';
  type: 'order_confirmed' | 'payment_failed' | 'out_for_delivery' | 'status_update';
  sentAt: string;
  error?: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  deliveryAreas: string[];
  orderTimings: {
    lunchBookingCutoff: string;
    dinnerBookingCutoff: string;
    lunchDeliveryWindow: string;
    dinnerDeliveryWindow: string;
  };
  razorpayKeyId: string;
  whatsappConfigured: boolean;
}

export interface DashboardReportSummary {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeSubscriptions: number;
  newCustomersCount: number;
  couponUsageCount: number;
  failedPaymentsCount: number;
  recentOrders: Order[];
  topMeals: { name: string; count: number; revenue: number }[];
  salesByDate: { date: string; amount: number; orders: number }[];
}

export interface LegalPolicies {
  longTermTerms: string;
  generalTerms: string;
  privacyPolicy: string;
  updatedAt?: string;
  updatedBy?: string;
}
