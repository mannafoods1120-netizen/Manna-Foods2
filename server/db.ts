import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { 
  User, 
  MenuItem, 
  Category, 
  SubscriptionPlan, 
  Coupon, 
  Order, 
  CustomerSubscription, 
  WhatsAppNotification, 
  BusinessSettings,
  LongTermCashbackPlan,
  CustomerPauseRecord,
  LegalPolicies
} from '../src/types/index.ts';
import {
  DEFAULT_LONG_TERM_TERMS,
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_GENERAL_TERMS
} from '../src/data/legalDefaults.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'manna_db.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  categories: Category[];
  menuItems: MenuItem[];
  subscriptionPlans: SubscriptionPlan[];
  longTermOffers: LongTermCashbackPlan[];
  customerPauses: CustomerPauseRecord[];
  coupons: Coupon[];
  couponUsage: {
    id: string;
    couponId: string;
    couponCode: string;
    customerId: string;
    orderId: string;
    discountAmount: number;
    usedAt: string;
  }[];
  orders: Order[];
  subscriptions: CustomerSubscription[];
  notifications: WhatsAppNotification[];
  settings: BusinessSettings;
  legalPolicies: LegalPolicies;
}

const defaultSettings: BusinessSettings = {
  businessName: 'Manna Foods',
  tagline: 'Homemade • Healthy • Hygienic • Delicious • Affordable',
  contactNumber: '+91 9890786024',
  whatsappNumber: '+91 9890786024',
  email: 'orders@mannafoods.in',
  address: 'A3 Saket Building, Kondhwa Katraj Road, Kondhwa Bk, Pune 411048',
  deliveryCharge: 30,
  freeDeliveryThreshold: 399,
  minOrderValue: 120,
  deliveryAreas: [
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
  ],
  orderTimings: {
    lunchBookingCutoff: '10:00 AM',
    dinnerBookingCutoff: '05:00 PM',
    lunchDeliveryWindow: '12:30 PM - 02:00 PM',
    dinnerDeliveryWindow: '07:30 PM - 09:00 PM'
  },
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mannafoods_pune',
  whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
};

const initialCategories: Category[] = [
  { 
    id: 'cat-veg', 
    name: 'Veg', 
    slug: 'veg', 
    description: 'Fresh, nutritious homestyle Maharashtrian and North Indian daily vegetarian fare' 
  },
  { 
    id: 'cat-nonveg', 
    name: 'Non-Veg', 
    slug: 'non-veg', 
    description: 'Tender chicken and mutton curries prepared with freshly ground aromatic spices',
    subCategories: ['Chicken', 'Mutton']
  }
];

const initialMenuItems: MenuItem[] = [
  {
    id: 'meal-001',
    name: 'Royal Shahi Paneer Thali',
    category: 'Paneer Meals',
    mealType: 'veg',
    description: 'Fresh malai paneer simmered in rich cashew and tomato gravy, 3 whole wheat butter phulkas, jeera rice, dal tadka, salad, and soft gulab jamun.',
    price: 185,
    isAvailable: true,
    isFeatured: true,
    ingredients: ['Fresh Paneer', 'Cashew Gravy', 'Whole Wheat Atta', 'Basmati Rice', 'Yellow Toor Dal', 'Desi Ghee'],
    dietaryTags: ['High Protein', 'Pure Ghee'],
    calories: 620
  },
  {
    id: 'meal-002',
    name: 'Kolhapuri Chicken Masala Thali',
    category: 'Chicken Meals',
    mealType: 'non-veg',
    description: 'Aromatic Pune-Kolhapuri tender chicken curry cooked in dry-roasted coconut spice paste, 3 soft chapatis, steamed basmati rice, rassa gravy, and onion lemon salad.',
    price: 210,
    isAvailable: true,
    isFeatured: true,
    ingredients: ['Fresh Farm Chicken', 'Kolhapuri Kanda-Lasan Masala', 'Whole Wheat Rotis', 'Steamed Rice'],
    dietaryTags: ['High Protein', 'Homestyle Spices'],
    calories: 680
  },
  {
    id: 'meal-003',
    name: 'Homely Ghar Ki Thali (Everyday Veg)',
    category: 'Veg Meals',
    mealType: 'veg',
    description: 'Light, wholesome daily tiffin featuring seasonal sabzi (Bhindi / Aloo Gobi), comforting yellow dal fry, 3 warm whole wheat chapatis, steamed rice, and fresh kachumber.',
    price: 140,
    isAvailable: true,
    isFeatured: true,
    ingredients: ['Seasonal Green Veg', 'Toor Dal', 'Chapatis with Ghee', 'Basmati Rice'],
    dietaryTags: ['Low Oil', 'Digestive Friendly'],
    calories: 490
  },
  {
    id: 'meal-004',
    name: 'Special Anda Curry Tiffin',
    category: 'Egg Meals',
    mealType: 'non-veg',
    description: '2 farm-fresh boiled eggs cooked in rich caramelized onion-tomato gravy, 3 phulkas, jeera rice, salad and roasted papad.',
    price: 160,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['2 Eggs', 'Onion Tomato Gravy', 'Whole Wheat Rotis', 'Jeera Rice'],
    dietaryTags: ['High Protein'],
    calories: 540
  },
  {
    id: 'meal-005',
    name: 'Dal Makhani & Jeera Rice Bowl Combo',
    category: 'Combo Meals',
    mealType: 'veg',
    description: 'Slow-simmered black lentils finished with cream and butter, paired with fragrant jeera basmati rice, 2 butter chapatis, and pickled onions.',
    price: 165,
    isAvailable: true,
    isFeatured: true,
    ingredients: ['Black Urad Dal', 'Amul Butter', 'Jeera Basmati Rice', '2 Phulkas'],
    dietaryTags: ['Classic Punjabi Homestyle'],
    calories: 590
  },
  {
    id: 'meal-006',
    name: 'Methi Paneer Bhurji Meal',
    category: 'Paneer Meals',
    mealType: 'veg',
    description: 'Crumbled cottage cheese sautéed with fresh fenugreek leaves, green chillies, and ginger. Served with 3 multigrain rotis, dal fry, and steamed rice.',
    price: 175,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['Fresh Paneer', 'Fresh Methi', 'Multigrain Atta', 'Toor Dal'],
    dietaryTags: ['Diabetic Friendly', 'Iron Rich'],
    calories: 510
  },
  {
    id: 'meal-007',
    name: 'Butter Chicken Homestyle Dabba',
    category: 'Chicken Meals',
    mealType: 'non-veg',
    description: 'Boneless tender chicken tikka in a mildly sweet and tangy velvet tomato-cream gravy, served with 3 soft rotis, pulao rice, and mint chutney.',
    price: 225,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['Boneless Chicken', 'Fresh Tomato Puree', 'Cream', 'Spiced Pulao'],
    dietaryTags: ['Chef Special'],
    calories: 720
  },
  {
    id: 'meal-008',
    name: 'Kokum Solkadhi (250ml)',
    category: 'Add-ons & Sweets',
    mealType: 'veg',
    description: 'Traditional refreshing Konkani digestive drink made with fresh coconut milk, wild kokum extract, garlic, and fresh green coriander.',
    price: 45,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['Fresh Coconut Milk', 'Agallochum Kokum', 'Garlic', 'Himalayan Pink Salt'],
    dietaryTags: ['Digestive Booster', 'Cooling'],
    calories: 85
  },
  {
    id: 'meal-009',
    name: 'Tawa Phulka Pack (Set of 4)',
    category: 'Add-ons & Sweets',
    mealType: 'veg',
    description: 'Hot puffed 100% whole wheat chapatis brushed with pure desi ghee.',
    price: 40,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['100% MP Sharbati Wheat', 'Desi Ghee'],
    calories: 280
  },
  {
    id: 'meal-010',
    name: 'Angoori Gulab Jamun (2 pcs)',
    category: 'Add-ons & Sweets',
    mealType: 'veg',
    description: 'Melt-in-the-mouth mawa dumplings soaked in cardamom and saffron-infused sugar syrup.',
    price: 50,
    isAvailable: true,
    isFeatured: false,
    ingredients: ['Pure Khoya Mawa', 'Cardamom', 'Kesar Saffron'],
    calories: 220
  }
];

const initialSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-monthly-30',
    name: '30-Meal Monthly Executive Tiffin',
    planType: 'monthly',
    mealType: 'both',
    mealsCount: 30,
    basePrice: 4200,
    discountPercentage: 15, // Calculated: ₹3570 (₹119/meal vs ₹140-185 normal)
    deliveryFrequency: 'daily_lunch',
    description: 'Best value 30-day continuous homestyle tiffin. Choose Veg, Non-Veg, or alternating days. Free pause & resume up to 7 days.',
    features: [
      '30 Freshly Cooked Homestyle Meals',
      'Choose Lunch or Dinner delivery slot',
      'Daily variety menu (no repeated sabzis)',
      'Flexible 7-day pause anytime via app',
      'Zero delivery charge on all 30 drops',
      'Free Solkadhi or Sweet twice a week'
    ],
    isPopular: true
  },
  {
    id: 'plan-monthly-veg-30',
    name: '30-Meal Monthly Pure Veg Plan',
    planType: 'monthly',
    mealType: 'veg',
    mealsCount: 30,
    basePrice: 3900,
    discountPercentage: 15, // Calculated: ₹3315 (₹110/meal)
    deliveryFrequency: 'daily_lunch',
    description: 'Wholesome, pure vegetarian tiffins tailored for working professionals and students with balanced nutrition and home-ground spices.',
    features: [
      '30 Pure Vegetarian Homestyle Meals',
      'Fresh Paneer dishes twice every week',
      'Phulkas with Desi Ghee & low oil cooking',
      'Easy pause / date adjustment',
      'Priority delivery directly to your desk or home'
    ],
    isPopular: false
  },
  {
    id: 'plan-weekly-6',
    name: '6-Meal Weekly Starter Plan',
    planType: 'weekly',
    mealType: 'both',
    mealsCount: 6,
    basePrice: 870,
    discountPercentage: 8, // Calculated: ₹800 (₹133/meal)
    deliveryFrequency: 'weekdays_only',
    description: 'Monday to Saturday lunch or dinner delivery. Ideal for testing our food quality and taste before committing to a monthly plan.',
    features: [
      '6 Fresh Hot Tiffins (Mon-Sat)',
      'Option to toggle Veg or Non-Veg',
      'No cooking hassle on busy workdays',
      'Doorstep delivery between 12:30 - 2:00 PM'
    ],
    isPopular: false
  },
  {
    id: 'plan-daily-combo',
    name: 'Single Homestyle Dabba (Daily)',
    planType: 'daily',
    mealType: 'both',
    mealsCount: 1,
    basePrice: 150,
    discountPercentage: 0,
    deliveryFrequency: 'daily_lunch',
    description: 'Order as needed with zero subscription commitment. Choose any thali from today’s fresh daily kitchen board.',
    features: [
      'Instant same-day delivery',
      'Packed in food-grade spillproof containers',
      'Complete meal with Rotis, Dal, Sabzi & Rice'
    ],
    isPopular: false
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'cpn-001',
    code: 'FIRSTMONTH',
    name: 'New Subscriber Welcome',
    description: 'Special 10% instant discount on any monthly tiffin subscription',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 2500,
    maxDiscount: 400,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 28,
    perCustomerLimit: 1,
    isActive: false,
    applicableFor: 'subscriptions',
    applicablePlans: ['plan-monthly-30', 'plan-monthly-veg-30']
  },
  {
    id: 'cpn-002',
    code: 'MANNA100',
    name: 'Flat ₹100 Subscription Discount',
    description: 'Special subscription discount (Deactivated: Coupons disabled in favor of Long-Term Cashback packages)',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 750,
    maxDiscount: 100,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 64,
    perCustomerLimit: 2,
    isActive: false,
    applicableFor: 'subscriptions'
  },
  {
    id: 'cpn-003',
    code: 'PUNETIFFIN',
    name: 'Pune Foodie Special',
    description: 'Flat ₹50 OFF on daily meal orders (Deactivated: Coupons disabled)',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 250,
    maxDiscount: 50,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 300,
    usedCount: 42,
    perCustomerLimit: 3,
    isActive: false,
    applicableFor: 'meals'
  },
  {
    id: 'cpn-004',
    code: 'HOMELY20',
    name: 'Healthy Homestyle 20% OFF',
    description: '20% OFF meal promo (Deactivated: Coupons disabled)',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 200,
    maxDiscount: 100,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 15,
    perCustomerLimit: 1,
    isActive: false,
    applicableFor: 'all'
  }
];

export const initialLongTermOffers: LongTermCashbackPlan[] = [
  {
    id: 'lt-plan-90',
    name: '90 Meals Plan',
    mealsCount: 90,
    mealType: 'veg',
    basePrice: 11077, // 90 * ₹123.08 = ₹11,077.20
    cashbackAmount: 500,
    effectiveValue: 10577, // 11077 - 500 = 10577
    maxPauseDays: 15,
    maxValidityMonths: 4.5,
    maxValidityText: 'Up to 4.5 months',
    description: 'Quarterly pure-veg homestyle tiffin with guaranteed ₹500 cashback & 15 days travel pause freedom.',
    features: [
      '90 Wholesome Pure Veg Homestyle Meals',
      'Flat ₹500 Guaranteed Cashback Credited',
      'Effective Value: ₹10,577 (Standard Rate: ₹123.08/meal)',
      '15 Days Maximum Pause Allowance',
      'Extended Validity Up to 4.5 Months',
      'Zero Delivery Charge across Pune delivery zones',
      'Fresh Sharbati Wheat Desi Ghee Phulkas Daily',
      'Full Early Cancellation Protection (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-180',
    name: '180 Meals Plan',
    mealsCount: 180,
    mealType: 'veg',
    basePrice: 22154, // 180 * ₹123.08 = ₹22,154.40
    cashbackAmount: 1500,
    effectiveValue: 20654, // 22154 - 1500 = 20654
    maxPauseDays: 30,
    maxValidityMonths: 8.5,
    maxValidityText: 'Up to 8.5 months',
    description: 'Half-yearly comprehensive homestyle tiffin commitment with ₹1,500 guaranteed cashback & 30 days travel pause.',
    features: [
      '180 Nutritious Pure Veg Homestyle Meals',
      'Flat ₹1,500 Guaranteed Cashback Credited',
      'Effective Value: ₹20,654 (Standard Rate: ₹123.08/meal)',
      '30 Days Maximum Pause Allowance',
      'Extended Validity Up to 8.5 Months',
      'Priority Dispatch Window for Lunch or Dinner',
      'Free Digestive Kokum Solkadhi Weekly',
      'Full Early Cancellation Protection (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-270',
    name: '270 Meals Plan',
    mealsCount: 270,
    mealType: 'veg',
    basePrice: 33231, // 270 * ₹123.08 = ₹33,231.60
    cashbackAmount: 3000,
    effectiveValue: 30231, // 33231 - 3000 = 30231
    maxPauseDays: 45,
    maxValidityMonths: 13,
    maxValidityText: 'Up to 13 months',
    description: '9-Month academic & corporate tiffin package. Maximum savings with ₹3,000 cashback & 45 days pause allowance.',
    features: [
      '270 Healthy Homestyle Pure Veg Meals',
      'Flat ₹3,000 Guaranteed Cashback Credited',
      'Effective Value: ₹30,231 (Standard Rate: ₹123.08/meal)',
      '45 Days Maximum Pause Allowance',
      'Extended Validity Up to 13 Months',
      'Ideal for College Semesters & Project Stints',
      'Weekend Pause & Resume with Single Tap',
      'Full Early Cancellation Protection (Zero Negative Balance)'
    ],
    isActive: true
  },
  {
    id: 'lt-plan-360',
    name: '360 Meals Plan',
    mealsCount: 360,
    mealType: 'veg',
    basePrice: 44308, // 360 * ₹123.08 = ₹44,308.80
    cashbackAmount: 5000,
    effectiveValue: 39308, // 44308 - 5000 = 39308
    maxPauseDays: 60,
    maxValidityMonths: 16,
    maxValidityText: 'Up to 16 months',
    description: 'Annual VIP tiffin subscription. Ultimate value with ₹5,000 direct cashback & 60 days of pause freedom.',
    features: [
      '360 Complete Homestyle Veg Thalis',
      'Flat ₹5,000 Maximum Cashback Credited',
      'Effective Value: ₹39,308 (Standard Rate: ₹123.08/meal)',
      '60 Days Maximum Pause Allowance',
      'Extended Validity Up to 16 Months',
      'Dedicated Pune Kitchen Concierge Support',
      'Includes Festive Sweets & Holiday Dabba Treats',
      'Full Early Cancellation Protection (Zero Negative Balance)'
    ],
    isActive: true
  }
];

export const initialCustomerPauses: CustomerPauseRecord[] = [
  // Scenario A — Active Pause: Customer currently travelling and pause period is active today (2026-10-01)
  {
    id: 'pause-001',
    subscriptionId: 'sub-lt-001',
    subscriptionNumber: 'SUB-LT-9001',
    customerId: 'usr-cust-01',
    customerName: 'Aditya Deshmukh',
    customerPhone: '+919890123456',
    planName: '90 Meals Plan',
    mealsCount: 90,
    subscriptionStartDate: '2026-09-01',
    originalEndDate: '2026-12-15',
    extendedEndDate: '2026-12-23', // Extended by 8 days
    totalAllowedPauseDays: 15,
    pauseStartDate: '2026-09-28',
    pauseEndDate: '2026-10-05',
    daysPaused: 8, // 2026-10-05 - 2026-09-28 + 1 = 8 days
    totalPauseDaysUsed: 8,
    remainingPauseDays: 7, // 15 - 8 = 7 days
    status: 'active', // Active Pause (current date falls within pause period)
    noticeCompliance: 'on_time', // Notice given 2026-09-27 18:20 (before 8:00 PM previous day)
    noticeRecordedAt: '2026-09-27T18:20:00.000Z',
    notes: 'Travelling to Bangalore for corporate conference. Automatic validity extension of 8 days applied.',
    approvedBy: 'Manna Foods Admin',
    createdAt: '2026-09-27T18:22:00.000Z',
    updatedAt: '2026-09-27T18:22:00.000Z'
  },
  // Scenario B — Completed Pause: Customer whose travel/pause period has already ended
  {
    id: 'pause-002',
    subscriptionId: 'sub-lt-002',
    subscriptionNumber: 'SUB-LT-1801',
    customerId: 'usr-cust-02',
    customerName: 'Pooja Kulkarni',
    customerPhone: '+919765432109',
    planName: '180 Meals Plan',
    mealsCount: 180,
    subscriptionStartDate: '2026-08-01',
    originalEndDate: '2027-02-15',
    extendedEndDate: '2027-02-26', // Extended by 11 days
    totalAllowedPauseDays: 30,
    pauseStartDate: '2026-09-10',
    pauseEndDate: '2026-09-20',
    daysPaused: 11, // 2026-09-20 - 2026-09-10 + 1 = 11 days
    totalPauseDaysUsed: 11,
    remainingPauseDays: 19, // 30 - 11 = 19 days
    status: 'completed', // Completed pause (period has ended)
    noticeCompliance: 'on_time', // Notice given 2026-09-09 19:10
    noticeRecordedAt: '2026-09-09T19:10:00.000Z',
    notes: 'Family trip to Mahabaleshwar. Successfully resumed on Sept 21 as scheduled.',
    approvedBy: 'Manna Foods Admin',
    createdAt: '2026-09-09T19:15:00.000Z',
    updatedAt: '2026-09-20T23:59:00.000Z'
  },
  // Scenario C — Limit Check Alert: Customer requested pause exceeding remaining allowance
  {
    id: 'pause-003',
    subscriptionId: 'sub-lt-003',
    subscriptionNumber: 'SUB-LT-9002',
    customerId: 'usr-cust-03',
    customerName: 'Rohan Shinde',
    customerPhone: '+919822334455',
    planName: '90 Meals Plan',
    mealsCount: 90,
    subscriptionStartDate: '2026-08-15',
    originalEndDate: '2026-11-28',
    extendedEndDate: '2026-12-08',
    totalAllowedPauseDays: 15,
    pauseStartDate: '2026-10-02',
    pauseEndDate: '2026-10-15',
    daysPaused: 14, // 2026-10-15 - 2026-10-02 + 1 = 14 days
    totalPauseDaysUsed: 10, // already used 10 days in Aug
    remainingPauseDays: 5, // only 5 days remaining, but requested 14! (Exceeds by 9 days)
    status: 'exceeded_limit', // Flagged Exceeded Limit Alert!
    noticeCompliance: 'late', // Notice submitted at 10:45 PM on previous night (Past 8:00 PM cutoff)
    noticeRecordedAt: '2026-10-01T22:45:00.000Z',
    notes: 'ALERT: Customer requested 14 days leave when only 5 pause days remain. Submitted after 8:00 PM cutoff. Requires special approval.',
    approvedBy: 'Pending Admin Review',
    createdAt: '2026-10-01T22:45:00.000Z',
    updatedAt: '2026-10-01T22:45:00.000Z'
  }
];

class DatabaseManager {
  private db: DatabaseSchema | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.seedInitialDatabase();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        let updated = false;
        if (!this.db!.longTermOffers || this.db!.longTermOffers.length === 0) {
          this.db!.longTermOffers = initialLongTermOffers;
          updated = true;
        }
        if (!this.db!.customerPauses || this.db!.customerPauses.length === 0) {
          this.db!.customerPauses = initialCustomerPauses;
          updated = true;
        }
        if (!this.db!.legalPolicies) {
          this.db!.legalPolicies = {
            longTermTerms: DEFAULT_LONG_TERM_TERMS,
            generalTerms: DEFAULT_GENERAL_TERMS,
            privacyPolicy: DEFAULT_PRIVACY_POLICY,
            updatedAt: new Date().toISOString()
          };
          updated = true;
        }
        if (this.db!.subscriptions) {
          // If none of the long-term subscriptions are present, re-seed long term subscriptions
          if (!this.db!.subscriptions.some(s => s.id === 'sub-lt-001')) {
            this.seedInitialDatabase();
            return;
          }
        }
        if (updated) {
          this.save();
        }
      } catch (err) {
        console.error('Failed reading database file, re-seeding:', err);
        this.seedInitialDatabase();
      }
    }
  }

  private seedInitialDatabase() {
    const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'MannaAdmin@Pune2026';
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    const customerHash = bcrypt.hashSync('Customer@123', 10);

    const initialUsers: (User & { passwordHash: string })[] = [
      {
        id: 'usr-admin-01',
        name: 'Manna Foods Admin',
        email: 'mannafoods1120@gmail.com',
        phone: '+919890786024',
        role: 'admin',
        address: 'A3 Saket Building, Kondhwa Katraj Road, Kondhwa Bk',
        area: 'Kondhwa Bk',
        city: 'Pune',
        pincode: '411048',
        createdAt: '2026-01-01T08:00:00.000Z',
        status: 'active',
        passwordHash: adminHash
      },
      {
        id: 'usr-cust-01',
        name: 'Aditya Deshmukh',
        email: 'aditya.deshmukh@gmail.com',
        phone: '+919890123456',
        role: 'customer',
        address: 'Flat 402, Rohan Tarang, Wakad',
        area: 'Wakad',
        city: 'Pune',
        pincode: '411057',
        createdAt: '2026-02-10T11:20:00.000Z',
        status: 'active',
        passwordHash: customerHash
      },
      {
        id: 'usr-cust-02',
        name: 'Pooja Kulkarni',
        email: 'pooja.kulkarni@techpune.com',
        phone: '+919765432109',
        role: 'customer',
        address: 'Tower 5, Blue Ridge, Hinjawadi Phase 1',
        area: 'Hinjawadi Phase 1 & 2',
        city: 'Pune',
        pincode: '411057',
        createdAt: '2026-02-15T09:40:00.000Z',
        status: 'active',
        passwordHash: customerHash
      },
      {
        id: 'usr-cust-03',
        name: 'Rohan Shinde',
        email: 'rohan.shinde@gmail.com',
        phone: '+919822334455',
        role: 'customer',
        address: 'B2 Ganga Florentina, NIBM Post Road',
        area: 'NIBM',
        city: 'Pune',
        pincode: '411048',
        createdAt: '2026-08-10T10:00:00.000Z',
        status: 'active',
        passwordHash: customerHash
      },
      {
        id: 'usr-cust-04',
        name: 'Sneha Patil',
        email: 'sneha.patil@outlook.com',
        phone: '+919833445566',
        role: 'customer',
        address: 'Rowhouse 12, Nyati Estate, Undri',
        area: 'Undri',
        city: 'Pune',
        pincode: '411060',
        createdAt: '2026-09-12T14:20:00.000Z',
        status: 'active',
        passwordHash: customerHash
      }
    ];

    const initialOrders: Order[] = [
      {
        id: 'ord-1001',
        orderNumber: 'MF1001',
        customerId: 'usr-cust-01',
        customerName: 'Aditya Deshmukh',
        customerPhone: '+919890123456',
        customerEmail: 'aditya.deshmukh@gmail.com',
        items: [
          {
            id: 'item-01',
            type: 'meal',
            name: 'Royal Shahi Paneer Thali',
            mealType: 'veg',
            unitPrice: 185,
            quantity: 2,
            totalPrice: 370
          },
          {
            id: 'item-02',
            type: 'meal',
            name: 'Kokum Solkadhi (250ml)',
            mealType: 'veg',
            unitPrice: 45,
            quantity: 2,
            totalPrice: 90
          }
        ],
        subtotal: 460,
        couponCode: 'PUNETIFFIN',
        couponDiscount: 50,
        subscriptionDiscount: 0,
        deliveryFee: 0,
        totalAmount: 410,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_MF1001_rzp',
        razorpayPaymentId: 'pay_MF1001_chk',
        orderStatus: 'delivered',
        deliveryAddress: {
          addressLine: 'Flat 402, Rohan Tarang',
          landmark: 'Near Datta Mandir',
          area: 'Wakad',
          city: 'Pune',
          pincode: '411057'
        },
        deliveryDate: '2026-09-28',
        deliverySlot: '12:30 PM - 02:00 PM',
        notes: 'Please ring bell twice',
        createdAt: '2026-09-28T10:15:00.000Z',
        updatedAt: '2026-09-28T13:45:00.000Z',
        statusHistory: [
          { status: 'pending', timestamp: '2026-09-28T10:15:00.000Z', note: 'Order placed' },
          { status: 'confirmed', timestamp: '2026-09-28T10:17:00.000Z', note: 'Payment verified via Razorpay' },
          { status: 'preparing', timestamp: '2026-09-28T11:30:00.000Z', note: 'Kitchen started preparation' },
          { status: 'out_for_delivery', timestamp: '2026-09-28T12:45:00.000Z', note: 'Assigned to delivery agent' },
          { status: 'delivered', timestamp: '2026-09-28T13:45:00.000Z', note: 'Handed over to customer' }
        ]
      },
      {
        id: 'ord-1002',
        orderNumber: 'MF1002',
        customerId: 'usr-cust-02',
        customerName: 'Pooja Kulkarni',
        customerPhone: '+919765432109',
        customerEmail: 'pooja.kulkarni@techpune.com',
        items: [
          {
            id: 'item-03',
            type: 'subscription',
            name: '30-Meal Monthly Executive Tiffin',
            mealType: 'both',
            unitPrice: 3570,
            quantity: 1,
            totalPrice: 3570,
            details: 'Starts 2026-10-01, Lunch delivery'
          }
        ],
        subtotal: 3570,
        couponCode: 'FIRSTMONTH',
        couponDiscount: 357,
        subscriptionDiscount: 630,
        deliveryFee: 0,
        totalAmount: 3213,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_MF1002_rzp',
        razorpayPaymentId: 'pay_MF1002_chk',
        orderStatus: 'confirmed',
        deliveryAddress: {
          addressLine: 'Tower 5, Flat 1102, Blue Ridge',
          landmark: 'Opposite Cognizant',
          area: 'Hinjawadi Phase 1 & 2',
          city: 'Pune',
          pincode: '411057'
        },
        deliveryDate: '2026-10-01',
        deliverySlot: '12:30 PM - 02:00 PM',
        notes: 'Leave at security reception if not reachable',
        createdAt: '2026-09-29T14:30:00.000Z',
        updatedAt: '2026-09-29T14:32:00.000Z',
        statusHistory: [
          { status: 'pending', timestamp: '2026-09-29T14:30:00.000Z', note: 'Order created' },
          { status: 'confirmed', timestamp: '2026-09-29T14:32:00.000Z', note: 'Monthly subscription activated' }
        ]
      }
    ];

    const initialSubscriptions: CustomerSubscription[] = [
      // 1. Scenario A — Active Pause (Aditya Deshmukh, 90 Meals Plan)
      {
        id: 'sub-lt-001',
        subscriptionNumber: 'SUB-LT-9001',
        customerId: 'usr-cust-01',
        customerName: 'Aditya Deshmukh',
        customerPhone: '+919890123456',
        planId: 'lt-plan-90',
        planName: '90 Meals Plan',
        mealType: 'veg',
        mealsTotal: 90,
        mealsUsed: 24, // 24 delivered
        mealsRemaining: 66, // 90 - 24 = 66
        planCompletionPercentage: 26.7,
        startDate: '2026-09-01',
        endDate: '2026-12-23', // Original was 2026-12-15 + 8 days pause extension = 2026-12-23
        originalEndDate: '2026-12-15',
        extendedEndDate: '2026-12-23',
        deliveryFrequency: 'daily_lunch',
        deliverySlot: '12:30 PM - 02:00 PM',
        deliveryAddress: {
          addressLine: 'Flat 402, Rohan Tarang, Wakad',
          landmark: 'Near Datta Mandir',
          area: 'Wakad',
          city: 'Pune',
          pincode: '411057'
        },
        basePrice: 10500,
        cashbackAmount: 1400,
        effectiveValue: 9100,
        finalPaid: 10500,
        paymentStatus: 'paid',
        status: 'active',
        isLongTerm: true,
        totalAllowedPauseDays: 15,
        totalPauseDaysUsed: 8,
        remainingPauseDays: 7, // 15 - 8 = 7 days
        currentPauseStatus: 'active', // Active Pause today
        orderId: 'ord-lt-101',
        createdAt: '2026-09-01T09:00:00.000Z',
        updatedAt: '2026-09-27T18:22:00.000Z'
      },
      // 2. Scenario B — Completed Pause (Pooja Kulkarni, 180 Meals Plan)
      {
        id: 'sub-lt-002',
        subscriptionNumber: 'SUB-LT-1801',
        customerId: 'usr-cust-02',
        customerName: 'Pooja Kulkarni',
        customerPhone: '+919765432109',
        planId: 'lt-plan-180',
        planName: '180 Meals Plan',
        mealType: 'veg',
        mealsTotal: 180,
        mealsUsed: 52, // 52 delivered
        mealsRemaining: 128, // 180 - 52 = 128
        planCompletionPercentage: 28.9,
        startDate: '2026-08-01',
        endDate: '2027-02-26', // Extended by 11 days
        originalEndDate: '2027-02-15',
        extendedEndDate: '2027-02-26',
        deliveryFrequency: 'daily_lunch',
        deliverySlot: '12:30 PM - 02:00 PM',
        deliveryAddress: {
          addressLine: 'Tower 5, Flat 1102, Blue Ridge',
          landmark: 'Opposite Cognizant',
          area: 'Hinjawadi Phase 1 & 2',
          city: 'Pune',
          pincode: '411057'
        },
        basePrice: 21000,
        cashbackAmount: 3000,
        effectiveValue: 18000,
        finalPaid: 21000,
        paymentStatus: 'paid',
        status: 'active',
        isLongTerm: true,
        totalAllowedPauseDays: 30,
        totalPauseDaysUsed: 11,
        remainingPauseDays: 19, // 30 - 11 = 19 days
        currentPauseStatus: 'completed', // Past completed pause, currently receiving meals
        orderId: 'ord-lt-102',
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-09-21T08:00:00.000Z'
      },
      // 3. Scenario C — Limit Check Alert (Rohan Shinde, 90 Meals Plan)
      {
        id: 'sub-lt-003',
        subscriptionNumber: 'SUB-LT-9002',
        customerId: 'usr-cust-03',
        customerName: 'Rohan Shinde',
        customerPhone: '+919822334455',
        planId: 'lt-plan-90',
        planName: '90 Meals Plan',
        mealType: 'veg',
        mealsTotal: 90,
        mealsUsed: 18,
        mealsRemaining: 72,
        planCompletionPercentage: 20.0,
        startDate: '2026-08-15',
        endDate: '2026-12-08',
        originalEndDate: '2026-11-28',
        extendedEndDate: '2026-12-08',
        deliveryFrequency: 'daily_dinner',
        deliverySlot: '07:30 PM - 09:00 PM',
        deliveryAddress: {
          addressLine: 'B2 Ganga Florentina, NIBM Post Road',
          landmark: 'Near Dorabjee Mall',
          area: 'NIBM',
          city: 'Pune',
          pincode: '411048'
        },
        basePrice: 10500,
        cashbackAmount: 1400,
        effectiveValue: 9100,
        finalPaid: 10500,
        paymentStatus: 'paid',
        status: 'active',
        isLongTerm: true,
        totalAllowedPauseDays: 15,
        totalPauseDaysUsed: 10,
        remainingPauseDays: 5, // 5 days left, but requested 14!
        currentPauseStatus: 'exceeded_limit', // Flagged!
        orderId: 'ord-lt-103',
        createdAt: '2026-08-15T11:00:00.000Z',
        updatedAt: '2026-10-01T22:45:00.000Z'
      },
      // 4. Scenario D — VIP Long-Term Annual (Sneha Patil, 360 Meals Plan)
      {
        id: 'sub-lt-004',
        subscriptionNumber: 'SUB-LT-3601',
        customerId: 'usr-cust-04',
        customerName: 'Sneha Patil',
        customerPhone: '+919833445566',
        planId: 'lt-plan-360',
        planName: '360 Meals Plan',
        mealType: 'veg',
        mealsTotal: 360,
        mealsUsed: 15,
        mealsRemaining: 345,
        planCompletionPercentage: 4.2,
        startDate: '2026-09-15',
        endDate: '2027-10-15',
        originalEndDate: '2027-10-15',
        extendedEndDate: '2027-10-15',
        deliveryFrequency: 'both_meals',
        deliverySlot: '12:30 PM - 02:00 PM',
        deliveryAddress: {
          addressLine: 'Rowhouse 12, Nyati Estate, Undri',
          landmark: 'Near Bishop School',
          area: 'Undri',
          city: 'Pune',
          pincode: '411060'
        },
        basePrice: 42000,
        cashbackAmount: 6000,
        effectiveValue: 36000,
        finalPaid: 42000,
        paymentStatus: 'paid',
        status: 'active',
        isLongTerm: true,
        totalAllowedPauseDays: 60,
        totalPauseDaysUsed: 0,
        remainingPauseDays: 60,
        currentPauseStatus: 'none',
        orderId: 'ord-lt-104',
        createdAt: '2026-09-15T12:00:00.000Z',
        updatedAt: '2026-09-15T12:00:00.000Z'
      },
      // Standard monthly
      {
        id: 'sub-001',
        subscriptionNumber: 'SUB-MF-2001',
        customerId: 'usr-cust-02',
        customerName: 'Pooja Kulkarni',
        customerPhone: '+919765432109',
        planId: 'plan-monthly-30',
        planName: '30-Meal Monthly Executive Tiffin',
        mealType: 'both',
        mealsTotal: 30,
        mealsUsed: 4,
        mealsRemaining: 26,
        planCompletionPercentage: 13.3,
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        deliveryFrequency: 'daily_lunch',
        deliverySlot: '12:30 PM - 02:00 PM',
        deliveryAddress: {
          addressLine: 'Tower 5, Flat 1102, Blue Ridge',
          landmark: 'Opposite Cognizant',
          area: 'Hinjawadi Phase 1 & 2',
          city: 'Pune',
          pincode: '411057'
        },
        basePrice: 4200,
        finalPaid: 3213,
        paymentStatus: 'paid',
        status: 'active',
        orderId: 'ord-1002',
        createdAt: '2026-09-29T14:32:00.000Z',
        updatedAt: '2026-09-29T14:32:00.000Z'
      }
    ];

    const initialNotifications: WhatsAppNotification[] = [
      {
        id: 'notif-001',
        orderId: 'ord-1001',
        customerName: 'Aditya Deshmukh',
        phone: '+919890123456',
        message: 'New Manna Foods Order\n\nOrder ID: #MF1001\nCustomer: Aditya Deshmukh\nPlan/Items: Royal Shahi Paneer Thali x 2, Kokum Solkadhi x 2\nAmount: ₹410\nPayment: Paid\nDelivery Address: Flat 402, Rohan Tarang, Wakad, Pune\n\nThank you for ordering from Manna Foods.',
        status: 'sent',
        type: 'order_confirmed',
        sentAt: '2026-09-28T10:17:05.000Z'
      },
      {
        id: 'notif-002',
        orderId: 'ord-1002',
        customerName: 'Pooja Kulkarni',
        phone: '+919765432109',
        message: 'New Manna Foods Order\n\nOrder ID: #MF1002\nCustomer: Pooja Kulkarni\nPlan/Items: 30-Meal Monthly Executive Tiffin (30 Meals)\nAmount: ₹3213\nPayment: Paid\nDelivery Address: Tower 5, Flat 1102, Blue Ridge, Hinjawadi Phase 1 & 2, Pune\n\nThank you for ordering from Manna Foods.',
        status: 'sent',
        type: 'order_confirmed',
        sentAt: '2026-09-29T14:32:10.000Z'
      }
    ];

    this.db = {
      users: initialUsers,
      categories: initialCategories,
      menuItems: initialMenuItems,
      subscriptionPlans: initialSubscriptionPlans,
      longTermOffers: initialLongTermOffers,
      customerPauses: initialCustomerPauses,
      coupons: initialCoupons,
      couponUsage: [
        {
          id: 'use-001',
          couponId: 'cpn-003',
          couponCode: 'PUNETIFFIN',
          customerId: 'usr-cust-01',
          orderId: 'ord-1001',
          discountAmount: 50,
          usedAt: '2026-09-28T10:15:00.000Z'
        },
        {
          id: 'use-002',
          couponId: 'cpn-001',
          couponCode: 'FIRSTMONTH',
          customerId: 'usr-cust-02',
          orderId: 'ord-1002',
          discountAmount: 357,
          usedAt: '2026-09-29T14:30:00.000Z'
        }
      ],
      orders: initialOrders,
      subscriptions: initialSubscriptions,
      notifications: initialNotifications,
      settings: defaultSettings,
      legalPolicies: {
        longTermTerms: DEFAULT_LONG_TERM_TERMS,
        generalTerms: DEFAULT_GENERAL_TERMS,
        privacyPolicy: DEFAULT_PRIVACY_POLICY,
        updatedAt: new Date().toISOString()
      }
    };

    this.save();
  }

  public save(): void {
    if (!this.db) return;
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database atomically:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    if (!this.db) this.init();
    return this.db![key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, data: DatabaseSchema[K]): void {
    if (!this.db) this.init();
    this.db![key] = data;
    this.save();
  }
}

export const dbManager = new DatabaseManager();
