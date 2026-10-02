import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { dbManager } from './server/db.ts';
import { razorpayService } from './server/razorpay.ts';
import { whatsAppService } from './server/whatsapp.ts';
import type { 
  User, 
  MenuItem, 
  Category, 
  SubscriptionPlan, 
  Coupon, 
  Order, 
  OrderItem, 
  CustomerSubscription, 
  BusinessSettings, 
  OrderStatus,
  CustomerPauseRecord,
  LongTermCashbackPlan,
  SubscriptionCancellationRecord,
  CancellationPolicyReference,
  LegalPolicies
} from './src/types/index.ts';
import {
  DEFAULT_LONG_TERM_TERMS,
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_GENERAL_TERMS
} from './src/data/legalDefaults.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'manna_foods_jwt_secure_secret_pune_2026';

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Enforce coupons disabled across the system in favor of Long-Term Cashback packages
try {
  const allCoupons = dbManager.get('coupons');
  if (Array.isArray(allCoupons)) {
    let modified = false;
    allCoupons.forEach((c) => {
      if (c.isActive) {
        c.isActive = false;
        modified = true;
      }
    });
    if (modified) {
      dbManager.set('coupons', allCoupons);
    }
  }
} catch (e) {
  console.warn('Failed to sync coupon disabled status:', e);
}

// Auth Helper Types
interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload | import('firebase-admin/auth').DecodedIdToken | any;
    }
  }
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.cookies?.manna_token as string) || (typeof req.query?.token === 'string' ? req.query.token : undefined);

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid or expired session token' });
      return;
    }
    req.user = decoded as AuthTokenPayload;
    next();
  });
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin credentials required' });
      return;
    }
    next();
  });
}

// Optional Auth (populates req.user if token present)
function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.manna_token as string);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      // ignore
    }
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Customer Registration
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, mobile, email, password, address, area, city, pincode } = req.body;

  if (!name || !mobile || !email || !password) {
    res.status(400).json({ error: 'Name, mobile number, email, and password are required' });
    return;
  }

  const users = dbManager.get('users');
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === mobile);
  if (existingUser) {
    res.status(409).json({ error: 'An account with this email or mobile number already exists' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: mobile.trim(),
    role: 'customer' as const,
    address: address?.trim() || '',
    area: area?.trim() || 'Kondhwa',
    city: city?.trim() || 'Pune',
    pincode: pincode?.trim() || '411048',
    createdAt: new Date().toISOString(),
    status: 'active' as const,
    passwordHash
  };

  users.push(newUser);
  dbManager.set('users', users);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: safeUser
  });
});

// Customer Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body; // email or mobile

  if (!identifier || !password) {
    res.status(400).json({ error: 'Email/Mobile and password are required' });
    return;
  }

  const users = dbManager.get('users');
  const user = users.find(u => 
    (u.email.toLowerCase() === identifier.toLowerCase().trim() || u.phone === identifier.trim())
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  if (user.status === 'disabled') {
    res.status(403).json({ error: 'This account has been temporarily disabled. Please contact Manna Foods support.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    message: 'Login successful',
    token,
    user: safeUser
  });
});

// Dedicated Admin Login
app.post('/api/auth/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Admin email and password are required' });
    return;
  }

  const users = dbManager.get('users');
  const adminUser = users.find(u => 
    u.role === 'admin' && u.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!adminUser) {
    res.status(401).json({ error: 'Admin account not found or unauthorized' });
    return;
  }

  // Priority 1: Check database hashed password (prioritizes user's updated secure password)
  let isMatch = bcrypt.compareSync(password, adminUser.passwordHash);

  // Priority 2 (Emergency Fallback): Check ADMIN_BOOTSTRAP_PASSWORD configuration
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'MannaAdmin@Pune2026';
  if (!isMatch && password === bootstrapPassword) {
    isMatch = true;
  }

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid admin credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeAdmin } = adminUser;
  res.json({
    message: 'Admin authentication successful',
    token,
    admin: safeAdmin
  });
});

// Admin Security Status
app.get('/api/admin/security', requireAdmin, (req: Request, res: Response) => {
  const users = dbManager.get('users');
  const adminUser = users.find(u => 
    u.id === req.user?.userId || (u.role === 'admin' && u.email.toLowerCase() === req.user?.email.toLowerCase())
  );

  if (!adminUser) {
    res.status(404).json({ error: 'Admin account record not found' });
    return;
  }

  const { passwordHash: _, ...safeAdmin } = adminUser;
  res.json({
    admin: safeAdmin,
    isCustomPasswordSet: Boolean((adminUser as any).customPasswordSetAt),
    lastPasswordChange: (adminUser as any).customPasswordSetAt || null,
    bootstrapFallbackActive: true
  });
});

// Admin Security Update Credentials (password and/or username/email)
app.post(['/api/admin/security/update-password', '/api/admin/change-credentials'], requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword, newEmail, newName } = req.body;

  if (!currentPassword) {
    res.status(400).json({ error: 'Current password is required to verify authorization' });
    return;
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long' });
    return;
  }

  const users = dbManager.get('users');
  const adminUser = users.find(u => 
    u.id === req.user?.userId || (u.role === 'admin' && u.email.toLowerCase() === req.user?.email.toLowerCase())
  );

  if (!adminUser) {
    res.status(404).json({ error: 'Admin account not found' });
    return;
  }

  // Verify current password: check database hash first, then bootstrap password fallback
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'MannaAdmin@Pune2026';
  const isDbMatch = bcrypt.compareSync(currentPassword, adminUser.passwordHash);
  const isBootstrapMatch = currentPassword === bootstrapPassword;

  if (!isDbMatch && !isBootstrapMatch) {
    res.status(401).json({ error: 'Current password verification failed. Please check and try again.' });
    return;
  }

  // Optional new email validation and update
  if (newEmail && newEmail.toLowerCase().trim() !== adminUser.email.toLowerCase()) {
    const trimmedEmail = newEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const emailTaken = users.some(u => u.id !== adminUser.id && u.email.toLowerCase() === trimmedEmail);
    if (emailTaken) {
      res.status(409).json({ error: 'Another user account is already using this email address' });
      return;
    }
    adminUser.email = trimmedEmail;
  }

  if (newName && newName.trim()) {
    adminUser.name = newName.trim();
  }

  // Hash new password using bcrypt
  adminUser.passwordHash = bcrypt.hashSync(newPassword, 10);
  const updatedTimestamp = new Date().toISOString();
  (adminUser as any).customPasswordSetAt = updatedTimestamp;

  dbManager.set('users', users);

  // Generate fresh JWT token with updated admin credentials
  const token = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeAdmin } = adminUser;

  res.json({
    message: 'Admin credentials updated successfully! The database prioritizes your secure new password.',
    token,
    admin: safeAdmin,
    updatedAt: updatedTimestamp
  });
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const users = dbManager.get('users');
  const user = users.find(u => u.id === req.user?.userId);
  if (!user) {
    res.status(404).json({ error: 'User record not found' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req: Request, res: Response) => {
  const { name, phone, address, area, city, pincode } = req.body;
  const users = dbManager.get('users');
  const userIndex = users.findIndex(u => u.id === req.user?.userId);

  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const current = users[userIndex];
  users[userIndex] = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    phone: phone !== undefined ? phone.trim() : current.phone,
    address: address !== undefined ? address.trim() : current.address,
    area: area !== undefined ? area.trim() : current.area,
    city: city !== undefined ? city.trim() : current.city,
    pincode: pincode !== undefined ? pincode.trim() : current.pincode
  };

  dbManager.set('users', users);
  const { passwordHash: _, ...safeUser } = users[userIndex];
  res.json({ message: 'Profile updated successfully', user: safeUser });
});

// ==========================================
// 2. BUSINESS SETTINGS ENDPOINTS
// ==========================================

app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = dbManager.get('settings');
  // Hide secret credentials, expose client-safe key
  res.json({
    ...settings,
    razorpayKeyId: razorpayService.getKeyId(),
    isRazorpayTestMode: razorpayService.getIsTestMode()
  });
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const incoming = req.body as Partial<BusinessSettings>;
  const current = dbManager.get('settings');

  const updated: BusinessSettings = {
    ...current,
    ...incoming,
    razorpayKeyId: incoming.razorpayKeyId || current.razorpayKeyId
  };

  dbManager.set('settings', updated);
  res.json({ message: 'Business settings updated', settings: updated });
});

// ==========================================
// 2B. LEGAL & TERMS POLICIES ENDPOINTS
// ==========================================

app.get('/api/legal-policies', (_req: Request, res: Response) => {
  const policies = dbManager.get('legalPolicies') || {
    longTermTerms: DEFAULT_LONG_TERM_TERMS,
    generalTerms: DEFAULT_GENERAL_TERMS,
    privacyPolicy: DEFAULT_PRIVACY_POLICY,
    updatedAt: new Date().toISOString()
  };
  res.json(policies);
});

app.put('/api/legal-policies', requireAdmin, (req: Request, res: Response) => {
  const incoming = req.body as Partial<LegalPolicies>;
  const current = dbManager.get('legalPolicies') || {
    longTermTerms: DEFAULT_LONG_TERM_TERMS,
    generalTerms: DEFAULT_GENERAL_TERMS,
    privacyPolicy: DEFAULT_PRIVACY_POLICY,
    updatedAt: new Date().toISOString()
  };

  const updated: LegalPolicies = {
    ...current,
    longTermTerms: typeof incoming.longTermTerms === 'string' ? incoming.longTermTerms : current.longTermTerms,
    generalTerms: typeof incoming.generalTerms === 'string' ? incoming.generalTerms : current.generalTerms,
    privacyPolicy: typeof incoming.privacyPolicy === 'string' ? incoming.privacyPolicy : current.privacyPolicy,
    updatedAt: new Date().toISOString(),
    updatedBy: (req.user as any)?.name || (req.user as any)?.email || 'admin'
  };

  dbManager.set('legalPolicies', updated);
  res.json({ message: 'Legal policies and terms updated successfully', policies: updated });
});

// ==========================================
// 3. CATEGORIES & MENU ENDPOINTS
// ==========================================

app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = dbManager.get('categories');
  res.json(categories);
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  const categories = dbManager.get('categories');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug,
    description: description?.trim()
  };
  categories.push(newCat);
  dbManager.set('categories', categories);
  res.status(201).json(newCat);
});

// Menu items: public sees available, admin sees all
app.get('/api/menu', optionalAuth, (req: Request, res: Response) => {
  const items = dbManager.get('menuItems');
  const isAdmin = req.user?.role === 'admin';
  if (isAdmin) {
    res.json(items);
  } else {
    res.json(items.filter(i => i.isAvailable));
  }
});

app.post('/api/menu', requireAdmin, (req: Request, res: Response) => {
  const { name, category, mealType, description, price, isAvailable, isFeatured, ingredients, dietaryTags, calories } = req.body;

  if (!name || !category || !price) {
    res.status(400).json({ error: 'Meal name, category, and price are required' });
    return;
  }

  const items = dbManager.get('menuItems');
  const newItem: MenuItem = {
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: name.trim(),
    category: category.trim(),
    mealType: mealType || 'veg',
    description: description?.trim() || '',
    price: Number(price),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    isFeatured: Boolean(isFeatured),
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map((s: string) => s.trim()) : []),
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : (dietaryTags ? dietaryTags.split(',').map((s: string) => s.trim()) : []),
    calories: calories ? Number(calories) : undefined
  };

  items.unshift(newItem);
  dbManager.set('menuItems', items);
  res.status(201).json({ message: 'Menu item created successfully', item: newItem });
});

app.put('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const items = dbManager.get('menuItems');
  const idx = items.findIndex(i => i.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const current = items[idx];
  const updated: MenuItem = {
    ...current,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : current.ingredients,
    dietaryTags: Array.isArray(req.body.dietaryTags) ? req.body.dietaryTags : current.dietaryTags
  };

  items[idx] = updated;
  dbManager.set('menuItems', items);
  res.json({ message: 'Menu item updated', item: updated });
});

app.delete('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const items = dbManager.get('menuItems');
  const filtered = items.filter(i => i.id !== id);

  if (filtered.length === items.length) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  dbManager.set('menuItems', filtered);
  res.json({ message: 'Menu item deleted' });
});

// Admin Image Upload
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://') || imageBase64.startsWith('/uploads/')) {
      res.json({ url: imageBase64, filename: filename || 'image.jpg' });
      return;
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid base64 image data' });
      return;
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const safeName = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, dataBuffer);

    const fileUrl = `/uploads/${safeName}`;
    res.json({ url: fileUrl, filename: safeName });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to upload image: ' + err.message });
  }
});

// ==========================================
// 4. TIFFIN SUBSCRIPTION PLANS
// ==========================================

app.get('/api/plans', (_req: Request, res: Response) => {
  const plans = dbManager.get('subscriptionPlans');
  res.json(plans);
});

app.post('/api/plans', requireAdmin, (req: Request, res: Response) => {
  const { name, planType, mealType, mealsCount, basePrice, discountPercentage, deliveryFrequency, description, features, isPopular } = req.body;

  if (!name || !mealsCount || !basePrice) {
    res.status(400).json({ error: 'Plan name, meals count, and base price are required' });
    return;
  }

  const plans = dbManager.get('subscriptionPlans');
  const newPlan: SubscriptionPlan = {
    id: `plan-${Date.now()}`,
    name: name.trim(),
    planType: planType || 'monthly',
    mealType: mealType || 'both',
    mealsCount: Number(mealsCount),
    basePrice: Number(basePrice),
    discountPercentage: Number(discountPercentage) || 0,
    deliveryFrequency: deliveryFrequency || 'daily_lunch',
    description: description?.trim() || '',
    features: Array.isArray(features) ? features : [],
    isPopular: Boolean(isPopular)
  };

  plans.push(newPlan);
  dbManager.set('subscriptionPlans', plans);
  res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
});

app.put('/api/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const plans = dbManager.get('subscriptionPlans');
  const idx = plans.findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Subscription plan not found' });
    return;
  }

  plans[idx] = {
    ...plans[idx],
    ...req.body,
    basePrice: req.body.basePrice !== undefined ? Number(req.body.basePrice) : plans[idx].basePrice,
    mealsCount: req.body.mealsCount !== undefined ? Number(req.body.mealsCount) : plans[idx].mealsCount,
    discountPercentage: req.body.discountPercentage !== undefined ? Number(req.body.discountPercentage) : plans[idx].discountPercentage
  };

  dbManager.set('subscriptionPlans', plans);
  res.json({ message: 'Subscription plan updated', plan: plans[idx] });
});

app.delete('/api/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const plans = dbManager.get('subscriptionPlans');
  const filtered = plans.filter(p => p.id !== id);
  dbManager.set('subscriptionPlans', filtered);
  res.json({ message: 'Subscription plan deleted' });
});

// ==========================================
// 5. COUPONS & DISCOUNTS ENGINE (STRICT SERVER-SIDE CALCULATION)
// ==========================================

// Helper to calculate validated discount
function calculateServerSideCoupon(
  code: string, 
  subtotal: number, 
  hasSubscription: boolean, 
  customerId?: string,
  hasLongTermOffer = false
): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } {
  if (hasLongTermOffer) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'Coupons cannot be applied to Long-Term Cashback packages. These offers already include guaranteed upfront cashback benefits.'
    };
  }

  const cleanCode = code.trim().toUpperCase();
  const coupons = dbManager.get('coupons');
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
  }

  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, message: 'This coupon is no longer active' };
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, discountAmount: 0, message: 'Coupon promotion has not started yet' };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { valid: false, discountAmount: 0, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, message: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minOrderValue) {
    return { valid: false, discountAmount: 0, message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` };
  }

  // Type compatibility check
  if (coupon.applicableFor === 'subscriptions' && !hasSubscription) {
    return { valid: false, discountAmount: 0, message: 'This coupon is valid only on Monthly / Weekly Tiffin Subscriptions' };
  }

  if (coupon.applicableFor === 'meals' && hasSubscription && subtotal < coupon.minOrderValue) {
    return { valid: false, discountAmount: 0, message: 'This coupon is valid only on daily meal orders' };
  }

  // Customer per-user usage check
  if (customerId && coupon.perCustomerLimit) {
    const usages = dbManager.get('couponUsage');
    const customerUsageCount = usages.filter(u => u.customerId === customerId && u.couponId === coupon.id).length;
    if (customerUsageCount >= coupon.perCustomerLimit) {
      return { valid: false, discountAmount: 0, message: `You have already redeemed this coupon the maximum allowed times (${coupon.perCustomerLimit})` };
    }
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Never discount more than subtotal
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discountAmount: discount,
    message: `Coupon applied: ₹${discount} saved!`,
    coupon
  };
}

// Public Validate Coupon Endpoint
app.post('/api/coupons/validate', optionalAuth, (req: Request, res: Response) => {
  const { code, subtotal, hasSubscription, hasLongTerm } = req.body;

  if (!code) {
    res.status(400).json({ valid: false, discountAmount: 0, message: 'Coupon code required' });
    return;
  }

  if (hasLongTerm) {
    res.json({
      valid: false,
      discountAmount: 0,
      message: 'Coupons cannot be applied to Long-Term Cashback packages. These offers already include guaranteed upfront cashback benefits.'
    });
    return;
  }

  const result = calculateServerSideCoupon(
    code, 
    Number(subtotal) || 0, 
    Boolean(hasSubscription), 
    req.user?.userId,
    Boolean(hasLongTerm)
  );

  res.json(result);
});

// Admin Coupon Management
app.get('/api/coupons', requireAdmin, (_req: Request, res: Response) => {
  const coupons = dbManager.get('coupons');
  res.json(coupons);
});

app.post('/api/coupons', requireAdmin, (req: Request, res: Response) => {
  const { 
    code, 
    name, 
    description, 
    discountType, 
    discountValue, 
    minOrderValue, 
    maxDiscount, 
    startDate, 
    expiryDate, 
    usageLimit, 
    perCustomerLimit, 
    applicableFor, 
    isActive 
  } = req.body;

  if (!code || !discountValue) {
    res.status(400).json({ error: 'Coupon code and discount value are required' });
    return;
  }

  const coupons = dbManager.get('coupons');
  const existing = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (existing) {
    res.status(409).json({ error: 'A coupon with this code already exists' });
    return;
  }

  const newCoupon: Coupon = {
    id: `cpn-${Date.now()}`,
    code: code.trim().toUpperCase(),
    name: name?.trim() || code.trim().toUpperCase(),
    description: description?.trim() || '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue) || 0,
    maxDiscount: Number(maxDiscount) || Number(discountValue),
    startDate: startDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '2026-12-31',
    usageLimit: Number(usageLimit) || 500,
    usedCount: 0,
    perCustomerLimit: Number(perCustomerLimit) || 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    applicableFor: applicableFor || 'all'
  };

  coupons.unshift(newCoupon);
  dbManager.set('coupons', coupons);
  res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
});

app.put('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const coupons = dbManager.get('coupons');
  const idx = coupons.findIndex(c => c.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }

  coupons[idx] = {
    ...coupons[idx],
    ...req.body,
    code: req.body.code ? req.body.code.trim().toUpperCase() : coupons[idx].code,
    discountValue: req.body.discountValue !== undefined ? Number(req.body.discountValue) : coupons[idx].discountValue,
    minOrderValue: req.body.minOrderValue !== undefined ? Number(req.body.minOrderValue) : coupons[idx].minOrderValue,
    maxDiscount: req.body.maxDiscount !== undefined ? Number(req.body.maxDiscount) : coupons[idx].maxDiscount
  };

  dbManager.set('coupons', coupons);
  res.json({ message: 'Coupon updated', coupon: coupons[idx] });
});

app.delete('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const coupons = dbManager.get('coupons');
  const filtered = coupons.filter(c => c.id !== id);
  dbManager.set('coupons', filtered);
  res.json({ message: 'Coupon deleted' });
});

// ==========================================
// 6. ORDER RECALCULATION & RAZORPAY PAYMENT
// ==========================================

// Helper: strictly calculate true order pricing from backend database
function computeOrderPricing(
  items: { type: 'meal' | 'subscription'; mealId?: string; planId?: string; quantity: number; name?: string; price?: number }[],
  couponCode?: string,
  customerId?: string
): { 
  subtotal: number; 
  orderItems: OrderItem[]; 
  couponDiscount: number; 
  subscriptionDiscount: number; 
  deliveryFee: number; 
  finalTotal: number;
  hasSubscription: boolean;
  couponObj?: Coupon;
} {
  const menuItems = dbManager.get('menuItems');
  const plans = dbManager.get('subscriptionPlans');
  const longTermOffers = dbManager.get('longTermOffers') || [];
  const settings = dbManager.get('settings');

  let subtotal = 0;
  let subscriptionDiscount = 0;
  let hasSubscription = false;
  let hasLongTermOffer = false;
  const verifiedOrderItems: OrderItem[] = [];

  for (const it of items) {
    if (it.quantity <= 0) continue;

    if (it.type === 'subscription' && (it.planId || it.name)) {
      const plan = plans.find(p => p.id === it.planId || (it.name && it.name.includes(p.name)));
      const ltOffer = longTermOffers.find(lt => 
        lt.id === it.planId || 
        (it.name && (it.name.includes(lt.name) || it.name.includes(`${lt.mealsCount} Meals`)))
      );

      if (ltOffer) {
        hasSubscription = true;
        hasLongTermOffer = true;
        const effectivePrice = ltOffer.effectiveValue || (ltOffer.basePrice - ltOffer.cashbackAmount);
        const cashback = ltOffer.cashbackAmount || 0;
        subscriptionDiscount += cashback * it.quantity;
        const lineTotal = effectivePrice * it.quantity;
        subtotal += lineTotal;

        verifiedOrderItems.push({
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          type: 'subscription',
          name: `${ltOffer.name} (Long-Term Cashback Offer)`,
          mealType: ltOffer.mealType || 'veg',
          unitPrice: effectivePrice,
          quantity: it.quantity,
          totalPrice: lineTotal,
          details: `${ltOffer.mealsCount} meals long-term plan (${ltOffer.maxPauseDays} max pause days, ₹${cashback} cashback)`
        });
      } else if (plan) {
        hasSubscription = true;
        const base = plan.basePrice;
        const discountAmt = Math.round((base * (plan.discountPercentage || 0)) / 100);
        const effectivePrice = base - discountAmt;
        subscriptionDiscount += discountAmt * it.quantity;
        const lineTotal = effectivePrice * it.quantity;
        subtotal += lineTotal;

        verifiedOrderItems.push({
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          type: 'subscription',
          name: plan.name,
          mealType: plan.mealType,
          unitPrice: effectivePrice,
          quantity: it.quantity,
          totalPrice: lineTotal,
          details: `${plan.mealsCount} meals plan (${plan.planType})`
        });
      }
    } else if (it.mealId) {
      const meal = menuItems.find(m => m.id === it.mealId);
      if (meal && meal.isAvailable) {
        const lineTotal = meal.price * it.quantity;
        subtotal += lineTotal;

        verifiedOrderItems.push({
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          type: 'meal',
          name: meal.name,
          mealType: meal.mealType,
          unitPrice: meal.price,
          quantity: it.quantity,
          totalPrice: lineTotal
        });
      }
    }
  }

  let couponDiscount = 0;
  let couponObj: Coupon | undefined;

  // Requirement: Disable all coupons on Long-Term Cashback packages
  if (couponCode && !hasLongTermOffer) {
    const couponValidation = calculateServerSideCoupon(couponCode, subtotal, hasSubscription, customerId, hasLongTermOffer);
    if (couponValidation.valid) {
      couponDiscount = couponValidation.discountAmount;
      couponObj = couponValidation.coupon;
    }
  }

  // Delivery charge rule:
  // Free delivery for subscriptions, or if order >= freeDeliveryThreshold
  let deliveryFee = 0;
  if (!hasSubscription) {
    if (subtotal > 0 && subtotal < settings.freeDeliveryThreshold) {
      deliveryFee = settings.deliveryCharge;
    }
  }

  const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  return {
    subtotal,
    orderItems: verifiedOrderItems,
    couponDiscount,
    subscriptionDiscount,
    deliveryFee,
    finalTotal,
    hasSubscription,
    couponObj
  };
}

// Create Razorpay Order
app.post('/api/payments/create-order', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { items, couponCode, deliveryAddress, deliverySlot, deliveryDate, notes, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.addressLine || !deliveryAddress.area) {
      res.status(400).json({ error: 'Complete delivery address is required' });
      return;
    }

    const users = dbManager.get('users');
    let customer: (User & { passwordHash?: string }) | undefined = req.user ? users.find(u => u.id === req.user?.userId) : undefined;
    if (!customer) {
      const custName = deliveryAddress.name || req.body.customerName || 'Customer';
      const custPhone = deliveryAddress.phone || req.body.customerPhone || '+919890123456';
      const custEmail = deliveryAddress.email || req.body.customerEmail || 'customer@mannafoods.in';

      const existing = users.find(u => u.phone === custPhone || (custEmail && u.email.toLowerCase() === custEmail.toLowerCase()));
      if (existing) {
        customer = existing;
      } else {
        const guestUser = {
          id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: custName,
          phone: custPhone,
          email: custEmail,
          role: 'customer' as const,
          address: deliveryAddress.addressLine,
          area: deliveryAddress.area,
          city: deliveryAddress.city || 'Pune',
          pincode: deliveryAddress.pincode || '411048',
          createdAt: new Date().toISOString(),
          status: 'active' as const,
          passwordHash: ''
        };
        users.push(guestUser);
        dbManager.set('users', users);
        customer = guestUser;
      }
    }

    if (!customer) {
      res.status(500).json({ error: 'Customer profile could not be created' });
      return;
    }

    // Backend strictly recalculates prices & discounts
    const calculated = computeOrderPricing(items, couponCode, customer.id);

    if (calculated.orderItems.length === 0) {
      res.status(400).json({ error: 'No valid items available for ordering' });
      return;
    }

    const settings = dbManager.get('settings');
    if (calculated.finalTotal < settings.minOrderValue && !calculated.hasSubscription) {
      res.status(400).json({ error: `Minimum order amount is ₹${settings.minOrderValue}` });
      return;
    }

    const orderNumber = `MF${Math.floor(1000 + Math.random() * 9000)}`;
    const orders = dbManager.get('orders');

    // Create Razorpay order on backend
    const razorpayOrder = await razorpayService.createOrder(
      calculated.finalTotal, 
      orderNumber, 
      { customerId: customer.id, orderNumber }
    );

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      items: calculated.orderItems,
      subtotal: calculated.subtotal,
      couponCode: calculated.couponDiscount > 0 ? couponCode : undefined,
      couponDiscount: calculated.couponDiscount,
      subscriptionDiscount: calculated.subscriptionDiscount,
      deliveryFee: calculated.deliveryFee,
      totalAmount: calculated.finalTotal,
      paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      orderStatus: 'pending',
      deliveryAddress,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot: deliverySlot || '12:30 PM - 02:00 PM',
      notes: notes?.trim(),
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        { status: 'pending', timestamp: now, note: 'Order checkout initiated' }
      ]
    };

    orders.unshift(newOrder);
    dbManager.set('orders', orders);

    res.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      totalAmount: calculated.finalTotal,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: razorpayService.getKeyId(),
      isTestMode: razorpayService.getIsTestMode(),
      customerDetails: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (err: any) {
    console.error('Failed to create order / Razorpay transaction:', err);
    res.status(500).json({ error: 'Failed to initialize payment order: ' + err.message });
  }
});

// Verify Payment and Finalize Order
app.post('/api/payments/verify', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      res.status(400).json({ error: 'Missing required payment verification parameters' });
      return;
    }

    const orders = dbManager.get('orders');
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const currentOrder = orders[orderIndex];

    // Prevent duplicate processing
    if (currentOrder.paymentStatus === 'paid') {
      res.json({
        success: true,
        message: 'Order already verified and paid',
        order: currentOrder
      });
      return;
    }

    // Cryptographically verify signature on the server
    const isValidSignature = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || `sandbox_sig_${razorpayPaymentId}`
    );

    if (!isValidSignature) {
      // Mark as failed
      currentOrder.paymentStatus = 'failed';
      currentOrder.updatedAt = new Date().toISOString();
      currentOrder.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: 'Payment signature verification failed'
      });
      dbManager.set('orders', orders);

      res.status(400).json({ error: 'Invalid payment signature. Payment could not be verified.' });
      return;
    }

    // Payment successfully verified
    const now = new Date().toISOString();
    currentOrder.paymentStatus = 'paid';
    currentOrder.orderStatus = 'confirmed';
    currentOrder.razorpayPaymentId = razorpayPaymentId;
    currentOrder.updatedAt = now;
    currentOrder.statusHistory.push({
      status: 'confirmed',
      timestamp: now,
      note: `Payment verified via Razorpay ID: ${razorpayPaymentId}`
    });

    // Record Coupon usage if applied
    if (currentOrder.couponCode) {
      const coupons = dbManager.get('coupons');
      const couponIdx = coupons.findIndex(c => c.code.toUpperCase() === currentOrder.couponCode?.toUpperCase());
      if (couponIdx !== -1) {
        coupons[couponIdx].usedCount += 1;
        dbManager.set('coupons', coupons);

        const usages = dbManager.get('couponUsage');
        usages.push({
          id: `use-${Date.now()}`,
          couponId: coupons[couponIdx].id,
          couponCode: coupons[couponIdx].code,
          customerId: currentOrder.customerId,
          orderId: currentOrder.id,
          discountAmount: currentOrder.couponDiscount,
          usedAt: now
        });
        dbManager.set('couponUsage', usages);
      }
    }

    // If order contains a subscription, create/activate subscription record
    const subscriptionItem = currentOrder.items.find(i => i.type === 'subscription');
    let createdSubscription: CustomerSubscription | null = null;

    if (subscriptionItem) {
      const plans = dbManager.get('subscriptionPlans');
      const longTermOffers = dbManager.get('longTermOffers') || [];
      const matchedLt = longTermOffers.find(lt => 
        subscriptionItem.name.includes(lt.name) || subscriptionItem.name.includes(`${lt.mealsCount} Meals`)
      );

      const plan = plans.find(p => p.name === subscriptionItem.name) || plans[0];
      const subscriptions = dbManager.get('subscriptions');

      const startDate = currentOrder.deliveryDate || now.split('T')[0];
      const endDateObj = new Date(startDate);

      const isLongTerm = Boolean(matchedLt);
      let allowedPause = 7;
      let cashback = 0;
      let effectiveVal = currentOrder.totalAmount;

      if (matchedLt) {
        endDateObj.setDate(endDateObj.getDate() + (matchedLt.maxValidityMonths ? matchedLt.maxValidityMonths * 30 : matchedLt.maxPauseDays * 8));
        allowedPause = matchedLt.maxPauseDays;
        cashback = matchedLt.cashbackAmount;
        effectiveVal = matchedLt.effectiveValue;
      } else {
        endDateObj.setDate(endDateObj.getDate() + (plan.planType === 'monthly' ? 30 : 7));
      }

      const calculatedEndDate = endDateObj.toISOString().split('T')[0];

      createdSubscription = {
        id: `sub-${Date.now()}`,
        subscriptionNumber: isLongTerm ? `SUB-LT-${Math.floor(1000 + Math.random() * 9000)}` : `SUB-MF-${Math.floor(2000 + Math.random() * 8000)}`,
        customerId: currentOrder.customerId,
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        planId: matchedLt ? matchedLt.id : plan.id,
        planName: matchedLt ? matchedLt.name : plan.name,
        mealType: matchedLt ? 'veg' : ((plan.mealType as any) || 'both'),
        mealsTotal: matchedLt ? matchedLt.mealsCount : plan.mealsCount,
        mealsUsed: 0,
        mealsRemaining: matchedLt ? matchedLt.mealsCount : plan.mealsCount,
        planCompletionPercentage: 0,
        startDate,
        endDate: calculatedEndDate,
        originalEndDate: calculatedEndDate,
        extendedEndDate: calculatedEndDate,
        deliveryFrequency: matchedLt ? 'daily_lunch' : plan.deliveryFrequency,
        deliverySlot: currentOrder.deliverySlot,
        deliveryAddress: currentOrder.deliveryAddress,
        basePrice: matchedLt ? matchedLt.basePrice : plan.basePrice,
        cashbackAmount: cashback,
        effectiveValue: effectiveVal,
        finalPaid: currentOrder.totalAmount,
        paymentStatus: 'paid',
        status: 'active',
        isLongTerm,
        totalAllowedPauseDays: allowedPause,
        totalPauseDaysUsed: 0,
        remainingPauseDays: allowedPause,
        currentPauseStatus: 'none',
        orderId: currentOrder.id,
        createdAt: now,
        updatedAt: now
      };

      subscriptions.unshift(createdSubscription);
      dbManager.set('subscriptions', subscriptions);
    }

    orders[orderIndex] = currentOrder;
    dbManager.set('orders', orders);

    // Trigger WhatsApp notification automatically
    const waResult = await whatsAppService.sendOrderConfirmation(currentOrder);

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: currentOrder,
      subscription: createdSubscription,
      whatsAppNotification: waResult
    });
  } catch (err: any) {
    console.error('Error during payment verification:', err);
    res.status(500).json({ error: 'Server error during payment verification: ' + err.message });
  }
});

// Record Payment Failure or Cancellation
app.post('/api/payments/fail', authenticateToken, (req: Request, res: Response) => {
  const { orderId, reason } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }

  const orders = dbManager.get('orders');
  const order = orders.find(o => o.id === orderId && o.customerId === req.user?.userId);

  if (order) {
    order.paymentStatus = 'failed';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'pending',
      timestamp: new Date().toISOString(),
      note: `Payment attempt failed: ${reason || 'User cancelled or gateway timeout'}`
    });
    dbManager.set('orders', orders);
  }

  res.json({ success: true, message: 'Payment failure recorded' });
});

// ==========================================
// 7. ORDER MANAGEMENT ENDPOINTS
// ==========================================

// Get Orders (Customers see theirs; Admins see all with query filters)
app.get('/api/orders', authenticateToken, (req: Request, res: Response) => {
  const orders = dbManager.get('orders');
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    const customerOrders = orders.filter(o => o.customerId === req.user?.userId);
    res.json(customerOrders);
    return;
  }

  // Admin filters
  let filtered = [...orders];
  const { status, paymentStatus, search, date } = req.query as Record<string, string>;

  if (status && status !== 'all') {
    filtered = filtered.filter(o => o.orderStatus === status);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    filtered = filtered.filter(o => o.paymentStatus === paymentStatus);
  }

  if (date) {
    filtered = filtered.filter(o => o.createdAt.startsWith(date) || o.deliveryDate === date);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o => 
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.deliveryAddress.area.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// Get single order detail
app.get('/api/orders/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = dbManager.get('orders');
  const order = orders.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (req.user?.role !== 'admin' && order.customerId !== req.user?.userId) {
    res.status(403).json({ error: 'Unauthorized to view this order' });
    return;
  }

  res.json(order);
});

// Admin update order status (Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered -> Cancelled)
app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status' });
    return;
  }

  const orders = dbManager.get('orders');
  const orderIdx = orders.findIndex(o => o.id === id);

  if (orderIdx === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const order = orders[orderIdx];
  const now = new Date().toISOString();
  order.orderStatus = status;
  order.updatedAt = now;
  order.statusHistory.push({
    status,
    timestamp: now,
    note: note || `Order status updated to ${status.replace(/_/g, ' ')}`
  });

  orders[orderIdx] = order;
  dbManager.set('orders', orders);

  res.json({ message: 'Order status updated', order });
});

// Customer can cancel pending order before preparation
app.post('/api/orders/:id/cancel', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = dbManager.get('orders');
  const order = orders.find(o => o.id === id && o.customerId === req.user?.userId);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered') {
    res.status(400).json({ error: 'This order is already being prepared or out for delivery and cannot be cancelled.' });
    return;
  }

  const now = new Date().toISOString();
  order.orderStatus = 'cancelled';
  order.updatedAt = now;
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: now,
    note: 'Cancelled by customer'
  });

  dbManager.set('orders', orders);
  res.json({ message: 'Order successfully cancelled', order });
});

// ==========================================
// 8. SUBSCRIPTION & PAUSE OPERATIONS MANAGEMENT
// ==========================================

// Helper: Calculate today's date in YYYY-MM-DD
function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

// 8.1 Long-Term Subscription Cashback Offers
app.get('/api/long-term-offers', (_req: Request, res: Response) => {
  const offers = dbManager.get('longTermOffers') || [];
  res.json(offers);
});

app.put('/api/long-term-offers/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const offers = dbManager.get('longTermOffers') || [];
  const idx = offers.findIndex(o => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Long-term cashback offer not found' });
    return;
  }

  const existing = offers[idx];
  const basePrice = req.body.basePrice !== undefined ? Number(req.body.basePrice) : existing.basePrice;
  const cashbackAmount = req.body.cashbackAmount !== undefined ? Number(req.body.cashbackAmount) : existing.cashbackAmount;
  // Effective Value After Cashback = Base Price - Cashback
  const effectiveValue = Math.max(0, basePrice - cashbackAmount);

  offers[idx] = {
    ...existing,
    ...req.body,
    basePrice,
    cashbackAmount,
    effectiveValue,
    updatedAt: new Date().toISOString()
  };

  dbManager.set('longTermOffers', offers);
  res.json({ message: 'Long-term cashback plan updated successfully', plan: offers[idx] });
});

// 8.2 Master Customer Subscriptions List (Enriched with meal burn-down & pause status)
app.get('/api/subscriptions', authenticateToken, (req: Request, res: Response) => {
  const subscriptions = dbManager.get('subscriptions') || [];
  const customerPauses = dbManager.get('customerPauses') || [];
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    const userSubs = subscriptions
      .filter(s => s.customerId === req.user?.userId)
      .map(s => {
        const pauses = customerPauses.filter(p => p.subscriptionId === s.id);
        const mealsUsed = s.mealsUsed || 0;
        const mealsTotal = s.mealsTotal || 30;
        const mealsRemaining = Math.max(0, mealsTotal - mealsUsed);
        const planCompletionPercentage = Math.round((mealsUsed / mealsTotal) * 1000) / 10;
        return {
          ...s,
          mealsUsed,
          mealsRemaining,
          planCompletionPercentage,
          pauses
        };
      });
    res.json(userSubs);
    return;
  }

  const { status, search, type } = req.query as Record<string, string>;
  const today = getTodayDateStr();

  let enriched = subscriptions.map(s => {
    const pauses = customerPauses.filter(p => p.subscriptionId === s.id);
    const mealsUsed = s.mealsUsed || 0;
    const mealsTotal = s.mealsTotal || (s.isLongTerm ? 90 : 30);
    const mealsRemaining = Math.max(0, mealsTotal - mealsUsed);
    const planCompletionPercentage = Math.round((mealsUsed / mealsTotal) * 1000) / 10;
    
    // Check if customer has an active pause covering today
    const activePause = pauses.find(p => p.status === 'active' && today >= p.pauseStartDate && today <= p.pauseEndDate);
    const currentPauseStatus = activePause ? 'active' : (s.currentPauseStatus || 'none');

    // Effective value after cashback
    const effectiveValue = s.isLongTerm && s.cashbackAmount ? (s.basePrice - s.cashbackAmount) : (s.finalPaid || s.basePrice);

    return {
      ...s,
      mealsUsed,
      mealsRemaining,
      planCompletionPercentage,
      effectiveValue,
      currentPauseStatus,
      pauses
    };
  });

  if (status && status !== 'all') {
    enriched = enriched.filter(s => s.status === status);
  }

  if (type === 'long_term') {
    enriched = enriched.filter(s => s.isLongTerm);
  } else if (type === 'regular') {
    enriched = enriched.filter(s => !s.isLongTerm);
  }

  if (search) {
    const q = search.toLowerCase();
    enriched = enriched.filter(s => 
      s.subscriptionNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.customerPhone.includes(q) ||
      s.planName.toLowerCase().includes(q) ||
      s.deliveryAddress?.area?.toLowerCase().includes(q)
    );
  }

  res.json(enriched);
});

// 8.3 Record Meals Delivered / Consumed (+1 or batch)
app.post('/api/subscriptions/:id/record-meal', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const count = typeof req.body.count === 'number' && req.body.count > 0 ? req.body.count : 1;

  const subscriptions = dbManager.get('subscriptions') || [];
  const idx = subscriptions.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  const sub = subscriptions[idx];
  const newUsed = Math.min(sub.mealsTotal, (sub.mealsUsed || 0) + count);
  sub.mealsUsed = newUsed;
  sub.mealsRemaining = Math.max(0, sub.mealsTotal - newUsed);
  sub.planCompletionPercentage = Math.round((newUsed / sub.mealsTotal) * 1000) / 10;
  
  if (sub.mealsRemaining === 0) {
    sub.status = 'completed';
  }
  sub.updatedAt = new Date().toISOString();

  subscriptions[idx] = sub;
  dbManager.set('subscriptions', subscriptions);

  res.json({
    message: `Recorded ${count} meal(s) delivered. ${sub.mealsRemaining} meals remaining in plan.`,
    subscription: sub
  });
});

// Admin Create Subscription
app.post('/api/subscriptions', requireAdmin, (req: Request, res: Response) => {
  const {
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    planId,
    planName,
    mealType,
    mealsTotal,
    startDate,
    deliveryFrequency,
    deliverySlot,
    deliveryAddress,
    basePrice,
    cashbackAmount,
    totalAllowedPauseDays,
    isLongTerm
  } = req.body;

  if (!customerName || !customerPhone || !startDate) {
    res.status(400).json({ error: 'Customer name, phone, and start date are required' });
    return;
  }

  const subscriptions = dbManager.get('subscriptions') || [];
  const longTermOffers = dbManager.get('longTermOffers') || [];
  const matchedLt = longTermOffers.find(o => o.id === planId || o.mealsCount === Number(mealsTotal));

  const totalMeals = Number(mealsTotal) || (matchedLt ? matchedLt.mealsCount : 30);
  const isLt = Boolean(isLongTerm || matchedLt);
  const base = Number(basePrice) || (matchedLt ? matchedLt.basePrice : 4200);
  const cb = isLt ? (Number(cashbackAmount) !== undefined ? Number(cashbackAmount) : (matchedLt?.cashbackAmount || 1400)) : 0;
  const effectiveVal = Math.max(0, base - cb);

  let allowedPause = Number(totalAllowedPauseDays);
  if (!allowedPause) {
    if (totalMeals >= 360) allowedPause = 60;
    else if (totalMeals >= 270) allowedPause = 45;
    else if (totalMeals >= 180) allowedPause = 30;
    else if (totalMeals >= 90) allowedPause = 15;
    else allowedPause = 7;
  }

  // Calculate validity period
  const startObj = new Date(startDate + 'T00:00:00');
  let validityDays = 30;
  if (totalMeals >= 360) validityDays = 485; // ~16 months
  else if (totalMeals >= 270) validityDays = 395; // ~13 months
  else if (totalMeals >= 180) validityDays = 255; // ~8.5 months
  else if (totalMeals >= 90) validityDays = 135; // ~4.5 months
  else validityDays = 30;

  startObj.setDate(startObj.getDate() + validityDays);
  const calculatedEndDate = startObj.toISOString().split('T')[0];
  const now = new Date().toISOString();

  const newSub: CustomerSubscription = {
    id: `sub-${Date.now()}`,
    subscriptionNumber: isLt ? `SUB-LT-${Math.floor(1000 + Math.random() * 9000)}` : `SUB-MF-${Math.floor(2000 + Math.random() * 8000)}`,
    customerId: customerId || `usr-cust-${Date.now().toString(36)}`,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    planId: planId || (matchedLt ? matchedLt.id : 'plan-custom'),
    planName: planName || (matchedLt ? matchedLt.name : `${totalMeals} Meals Subscription`),
    mealType: mealType || 'veg',
    mealsTotal,
    mealsUsed: 0,
    mealsRemaining: totalMeals,
    planCompletionPercentage: 0,
    startDate,
    endDate: calculatedEndDate,
    originalEndDate: calculatedEndDate,
    extendedEndDate: calculatedEndDate,
    deliveryFrequency: deliveryFrequency || 'daily_lunch',
    deliverySlot: deliverySlot || '12:30 PM - 02:00 PM',
    deliveryAddress: deliveryAddress || {
      addressLine: 'Direct Kitchen Onboard',
      area: 'Kondhwa',
      city: 'Pune',
      pincode: '411048'
    },
    basePrice: base,
    cashbackAmount: cb,
    effectiveValue: effectiveVal,
    finalPaid: base,
    paymentStatus: 'paid',
    status: 'active',
    isLongTerm: isLt,
    totalAllowedPauseDays: allowedPause,
    totalPauseDaysUsed: 0,
    remainingPauseDays: allowedPause,
    currentPauseStatus: 'none',
    orderId: `ord-admin-${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  subscriptions.unshift(newSub);
  dbManager.set('subscriptions', subscriptions);

  res.status(201).json({
    message: 'Subscription created successfully!',
    subscription: newSub
  });
});

// Admin Update Full Subscription Details
app.put('/api/subscriptions/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const subscriptions = dbManager.get('subscriptions') || [];
  const idx = subscriptions.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  const sub = subscriptions[idx];
  const {
    customerName,
    customerPhone,
    status,
    mealsTotal,
    mealsUsed,
    deliverySlot,
    deliveryFrequency,
    deliveryAddress,
    endDate
  } = req.body;

  if (customerName) sub.customerName = customerName.trim();
  if (customerPhone) sub.customerPhone = customerPhone.trim();
  if (status) sub.status = status;
  if (deliverySlot) sub.deliverySlot = deliverySlot;
  if (deliveryFrequency) sub.deliveryFrequency = deliveryFrequency;
  if (deliveryAddress) sub.deliveryAddress = { ...sub.deliveryAddress, ...deliveryAddress };
  if (endDate) sub.endDate = endDate;

  if (typeof mealsTotal === 'number' && mealsTotal > 0) {
    sub.mealsTotal = mealsTotal;
  }
  if (typeof mealsUsed === 'number' && mealsUsed >= 0) {
    sub.mealsUsed = Math.min(sub.mealsTotal, mealsUsed);
  }

  sub.mealsRemaining = Math.max(0, sub.mealsTotal - sub.mealsUsed);
  sub.planCompletionPercentage = Math.round((sub.mealsUsed / sub.mealsTotal) * 1000) / 10;
  if (sub.mealsRemaining === 0) {
    sub.status = 'completed';
  }
  sub.updatedAt = new Date().toISOString();

  subscriptions[idx] = sub;
  dbManager.set('subscriptions', subscriptions);

  res.json({ message: 'Subscription details updated successfully', subscription: sub });
});

// Update Subscription status (pause, resume, cancel, etc.)
app.put('/api/subscriptions/:id/status', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, mealsUsedDelta } = req.body;
  const subscriptions = dbManager.get('subscriptions') || [];
  const idx = subscriptions.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  const sub = subscriptions[idx];
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin && sub.customerId !== req.user?.userId) {
    res.status(403).json({ error: 'Unauthorized to modify this subscription' });
    return;
  }

  if (status) {
    sub.status = status;
  }

  if (isAdmin && typeof mealsUsedDelta === 'number') {
    sub.mealsUsed = Math.min(sub.mealsTotal, Math.max(0, (sub.mealsUsed || 0) + mealsUsedDelta));
    sub.mealsRemaining = Math.max(0, sub.mealsTotal - sub.mealsUsed);
    sub.planCompletionPercentage = Math.round((sub.mealsUsed / sub.mealsTotal) * 1000) / 10;
    if (sub.mealsRemaining === 0) {
      sub.status = 'completed';
    }
  }

  sub.updatedAt = new Date().toISOString();
  subscriptions[idx] = sub;
  dbManager.set('subscriptions', subscriptions);

  res.json({ message: 'Subscription updated', subscription: sub });
});

// 8.35 Cancellation Policy & Early Cancellation Engine
app.get('/api/subscriptions/cancellation-policy', (_req: Request, res: Response) => {
  const standardMealRate = 123.08;
  const adminFee = 500.00;

  const policyResponse: CancellationPolicyReference = {
    standardMealRate,
    adminFee,
    packages: [
      {
        id: 'lt-plan-90',
        mealsCount: 90,
        planName: '90 Meals Plan',
        upfrontPaid: 11077,
        cashbackDisbursed: 500,
        effectiveCost: 10577,
        maxPauseDays: 15,
        maxValidityText: 'Up to 4.5 months'
      },
      {
        id: 'lt-plan-180',
        mealsCount: 180,
        planName: '180 Meals Plan',
        upfrontPaid: 22154,
        cashbackDisbursed: 1500,
        effectiveCost: 20654,
        maxPauseDays: 30,
        maxValidityText: 'Up to 8.5 months'
      },
      {
        id: 'lt-plan-270',
        mealsCount: 270,
        planName: '270 Meals Plan',
        upfrontPaid: 33231,
        cashbackDisbursed: 3000,
        effectiveCost: 30231,
        maxPauseDays: 45,
        maxValidityText: 'Up to 13 months'
      },
      {
        id: 'lt-plan-360',
        mealsCount: 360,
        planName: '360 Meals Plan',
        upfrontPaid: 44308,
        cashbackDisbursed: 5000,
        effectiveCost: 39308,
        maxPauseDays: 60,
        maxValidityText: 'Up to 16 months'
      }
    ],
    scenarios: [
      {
        id: 'scenario-early-90',
        title: 'Scenario 1: Early Exit (15 meals on 90-meal plan)',
        scenarioType: 'early_exit',
        planMeals: 90,
        planName: '90 Meals Plan',
        upfrontPaid: 11077.00,
        mealsConsumed: 15,
        consumedCharges: 1846.20,
        cashbackDisbursed: 500.00,
        adminFee: 500.00,
        totalDeductions: 2846.20,
        netRefundPayable: 8230.80,
        statusFlag: 'Refund Due',
        notes: 'Subscriber consumes 15 meals and relocates. Consumed charges (₹1,846.20) + Cashback (₹500) + Admin Fee (₹500) = ₹2,846.20 total deductions. Clear refund of ₹8,230.80 is due.'
      },
      {
        id: 'scenario-midway-180',
        title: 'Scenario 2: Mid-Way Exit (70 meals on 180-meal plan)',
        scenarioType: 'midway_exit',
        planMeals: 180,
        planName: '180 Meals Plan',
        upfrontPaid: 22154.00,
        mealsConsumed: 70,
        consumedCharges: 8615.60,
        cashbackDisbursed: 1500.00,
        adminFee: 500.00,
        totalDeductions: 10615.60,
        netRefundPayable: 11538.40,
        statusFlag: 'Refund Due',
        notes: 'Subscriber completes 70 meals. Consumed charges (₹8,615.60) + Cashback (₹1,500) + Admin Fee (₹500) = ₹10,615.60 total deductions. Clear refund of ₹11,538.40 is due.'
      },
      {
        id: 'scenario-late-180',
        title: 'Scenario 3: Late Exit (175 meals on 180-meal plan — Deductions Exceed Balance)',
        scenarioType: 'late_exit',
        planMeals: 180,
        planName: '180 Meals Plan',
        upfrontPaid: 22154.00,
        mealsConsumed: 175,
        consumedCharges: 21539.00,
        cashbackDisbursed: 1500.00,
        adminFee: 500.00,
        totalDeductions: 23539.00,
        netRefundPayable: 0.00,
        statusFlag: 'No Refund / Deficit Absorbed',
        notes: 'Total deductions (₹23,539.00) exceed upfront paid. Net refund is ₹0.00. Deficit of ₹1,385.00 is 100% absorbed by Manna Foods (Zero Negative Balance guarantee).'
      }
    ]
  };

  res.json(policyResponse);
});

// Admin Early Cancellation & Refund Calculation
app.post('/api/admin/subscriptions/:id/cancel-early', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { mealsConsumed, reason, notes } = req.body;

  const subscriptions = dbManager.get('subscriptions') || [];
  const idx = subscriptions.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  const sub = subscriptions[idx];
  const standardMealRate = 123.08;
  const adminFee = 500.00;
  const consumed = typeof mealsConsumed === 'number' && mealsConsumed >= 0 ? mealsConsumed : (sub.mealsUsed || 0);

  const upfrontPaid = Number(sub.finalPaid) || Number(sub.basePrice) || (sub.mealsTotal * standardMealRate);
  const cashbackDisbursed = Number(sub.cashbackAmount) || 0;

  // Automated Formula:
  // Consumed Meal Charges: =Meals Consumed * 123.08
  const consumedCharges = Math.round(consumed * standardMealRate * 100) / 100;
  // Total Deductions: =Consumed Charges + Cashback Disbursed + Admin Fee
  const totalDeductions = Math.round((consumedCharges + cashbackDisbursed + adminFee) * 100) / 100;
  // Net Refund Payable: =MAX(0, Upfront Paid - Total Deductions)
  const netRefundPayable = Math.max(0, Math.round((upfrontPaid - totalDeductions) * 100) / 100);
  // Status Flag: Automatically indicates "Refund Due" or "No Refund / Deficit Absorbed"
  const statusFlag = netRefundPayable > 0 ? 'Refund Due' : 'No Refund / Deficit Absorbed';
  const deficitAbsorbed = totalDeductions > upfrontPaid ? Math.round((totalDeductions - upfrontPaid) * 100) / 100 : 0;

  const now = new Date().toISOString();
  const cancellationRecord: SubscriptionCancellationRecord = {
    cancelledAt: now,
    cancelledBy: 'admin',
    mealsConsumed: consumed,
    standardMealRate,
    consumedCharges,
    cashbackDisbursed,
    adminFee,
    totalDeductions,
    netRefundPayable,
    statusFlag,
    deficitAbsorbed,
    reason: reason?.trim() || 'Early cancellation processed by administrator',
    notes: notes?.trim()
  };

  sub.status = 'cancelled';
  sub.mealsUsed = consumed;
  sub.mealsRemaining = Math.max(0, sub.mealsTotal - consumed);
  sub.planCompletionPercentage = Math.round((consumed / sub.mealsTotal) * 1000) / 10;
  sub.cancellationDetails = cancellationRecord;
  sub.updatedAt = now;

  subscriptions[idx] = sub;
  dbManager.set('subscriptions', subscriptions);

  // Send WhatsApp notification record
  try {
    const notifications = dbManager.get('notifications') || [];
    const message = `🔔 *Manna Foods - Subscription Cancellation & Refund Notice*\n\n` +
      `Dear ${sub.customerName},\n` +
      `Your subscription *${sub.subscriptionNumber}* (${sub.planName}) has been cancelled.\n\n` +
      `*Refund Breakdown:*\n` +
      `• Upfront Amount Paid: ₹${upfrontPaid.toLocaleString()}\n` +
      `• Meals Consumed: ${consumed} @ ₹${standardMealRate} = ₹${consumedCharges.toLocaleString()}\n` +
      `• Cashback Disbursed: ₹${cashbackDisbursed.toLocaleString()}\n` +
      `• Flat Admin Processing Fee: ₹${adminFee.toLocaleString()}\n` +
      `• Total Deductions: ₹${totalDeductions.toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `*Net Refund Payable: ₹${netRefundPayable.toLocaleString()}*\n` +
      `*Status: ${statusFlag}*` +
      (deficitAbsorbed > 0 ? `\n(Deficit of ₹${deficitAbsorbed} absorbed by Manna Foods — Zero Negative Balance Guarantee)` : '') +
      `\n\nFor questions, WhatsApp our kitchen at +91 98907 86024.`;

    notifications.push({
      id: `notif-${Date.now()}`,
      orderId: sub.orderId || sub.id,
      customerName: sub.customerName,
      phone: sub.customerPhone,
      message,
      status: 'sent',
      type: 'status_update',
      sentAt: now
    });
    dbManager.set('notifications', notifications);
  } catch (err) {
    console.error('Failed to create cancellation notification:', err);
  }

  res.json({
    success: true,
    message: `Subscription ${sub.subscriptionNumber} cancelled successfully. ${statusFlag}: ₹${netRefundPayable}`,
    subscription: sub,
    cancellationRecord
  });
});

// 8.4 Customer Pause Tracker Endpoints
app.get('/api/pauses', requireAdmin, (req: Request, res: Response) => {
  const pauses = dbManager.get('customerPauses') || [];
  const today = getTodayDateStr();

  // Dynamic status evaluation
  const evaluated = pauses.map(p => {
    let status = p.status;
    if (status !== 'exceeded_limit') {
      if (today >= p.pauseStartDate && today <= p.pauseEndDate) {
        status = 'active';
      } else if (today > p.pauseEndDate) {
        status = 'completed';
      } else {
        status = 'active'; // Scheduled upcoming
      }
    }
    return { ...p, status };
  });

  const { status, filter } = req.query as Record<string, string>;
  let result = evaluated;

  if (status && status !== 'all') {
    result = result.filter(p => p.status === status);
  }
  if (filter === 'today') {
    result = result.filter(p => today >= p.pauseStartDate && today <= p.pauseEndDate && p.status === 'active');
  }

  res.json(result);
});

// Create Customer Pause
app.post('/api/pauses', requireAdmin, (req: Request, res: Response) => {
  const { subscriptionId, pauseStartDate, pauseEndDate, noticeCompliance, notes } = req.body;

  if (!subscriptionId || !pauseStartDate || !pauseEndDate) {
    res.status(400).json({ error: 'Subscription ID, Pause Start Date, and Pause End Date are required' });
    return;
  }

  const subscriptions = dbManager.get('subscriptions') || [];
  const subIdx = subscriptions.findIndex(s => s.id === subscriptionId);

  if (subIdx === -1) {
    res.status(404).json({ error: 'Subscription record not found' });
    return;
  }

  const sub = subscriptions[subIdx];
  const start = new Date(pauseStartDate + 'T00:00:00');
  const end = new Date(pauseEndDate + 'T00:00:00');

  if (end < start) {
    res.status(400).json({ error: 'Pause End Date must be after or on Pause Start Date' });
    return;
  }

  // Days Paused = End Date - Start Date + 1
  const daysPaused = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  const totalAllowed = sub.totalAllowedPauseDays || 15;
  const currentUsed = sub.totalPauseDaysUsed || 0;
  const availableRemaining = Math.max(0, totalAllowed - currentUsed);

  // Check if pause exceeds customer's remaining allowance
  const isExceeded = daysPaused > availableRemaining;

  const today = getTodayDateStr();
  let status: 'active' | 'completed' | 'exceeded_limit' = 'completed';
  if (isExceeded) {
    status = 'exceeded_limit';
  } else if (today >= pauseStartDate && today <= pauseEndDate) {
    status = 'active';
  } else if (today < pauseStartDate) {
    status = 'active';
  } else {
    status = 'completed';
  }

  // Check Notice Compliance: Before 8:00 PM on the previous day
  let finalCompliance: 'on_time' | 'late' | 'not_provided' = noticeCompliance || 'on_time';
  const now = new Date();
  const prevDay = new Date(start);
  prevDay.setDate(prevDay.getDate() - 1);
  const cutoff = new Date(prevDay.toISOString().split('T')[0] + 'T20:00:00');

  if (!noticeCompliance) {
    finalCompliance = now <= cutoff ? 'on_time' : 'late';
  }

  const originalEndDate = sub.originalEndDate || sub.endDate;
  // Calculate extended end date: Add daysPaused to current end date
  let extendedEndDate = sub.endDate;
  if (!isExceeded) {
    const curEndObj = new Date(sub.endDate + 'T00:00:00');
    curEndObj.setDate(curEndObj.getDate() + daysPaused);
    extendedEndDate = curEndObj.toISOString().split('T')[0];
    sub.endDate = extendedEndDate;
    sub.extendedEndDate = extendedEndDate;
    sub.originalEndDate = originalEndDate;
    sub.totalPauseDaysUsed = currentUsed + daysPaused;
    sub.remainingPauseDays = Math.max(0, totalAllowed - sub.totalPauseDaysUsed);
    sub.currentPauseStatus = status;
  } else {
    sub.currentPauseStatus = 'exceeded_limit';
  }

  const pauses = dbManager.get('customerPauses') || [];
  const newPause: CustomerPauseRecord = {
    id: `pause-${Date.now()}`,
    subscriptionId: sub.id,
    subscriptionNumber: sub.subscriptionNumber,
    customerId: sub.customerId,
    customerName: sub.customerName,
    customerPhone: sub.customerPhone,
    planName: sub.planName,
    mealsCount: sub.mealsTotal,
    subscriptionStartDate: sub.startDate,
    originalEndDate,
    extendedEndDate,
    totalAllowedPauseDays: totalAllowed,
    pauseStartDate,
    pauseEndDate,
    daysPaused,
    totalPauseDaysUsed: sub.totalPauseDaysUsed || currentUsed,
    remainingPauseDays: Math.max(0, totalAllowed - (sub.totalPauseDaysUsed || currentUsed)),
    status,
    noticeCompliance: finalCompliance,
    noticeRecordedAt: now.toISOString(),
    notes: notes?.trim() || (isExceeded ? `Exceeded allowance by ${daysPaused - availableRemaining} day(s)` : undefined),
    approvedBy: req.user?.email || 'Manna Admin',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  pauses.unshift(newPause);
  dbManager.set('customerPauses', pauses);

  subscriptions[subIdx] = sub;
  dbManager.set('subscriptions', subscriptions);

  res.status(201).json({
    message: isExceeded
      ? `Pause recorded with WARNING: Requested ${daysPaused} days exceeds remaining allowance (${availableRemaining} days left). Flagged as Exceeded Limit.`
      : `Customer pause registered successfully! Validity extended to ${extendedEndDate}.`,
    pause: newPause,
    subscription: sub,
    isExceeded
  });
});

// Delete or cancel a pause record
app.delete('/api/pauses/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const pauses = dbManager.get('customerPauses') || [];
  const pauseIdx = pauses.findIndex(p => p.id === id);

  if (pauseIdx === -1) {
    res.status(404).json({ error: 'Pause record not found' });
    return;
  }

  const targetPause = pauses[pauseIdx];
  const subscriptions = dbManager.get('subscriptions') || [];
  const subIdx = subscriptions.findIndex(s => s.id === targetPause.subscriptionId);

  if (subIdx !== -1) {
    const sub = subscriptions[subIdx];
    // Rollback pause days if it was approved/counted
    if (targetPause.status !== 'exceeded_limit') {
      sub.totalPauseDaysUsed = Math.max(0, (sub.totalPauseDaysUsed || 0) - targetPause.daysPaused);
      sub.remainingPauseDays = Math.min(sub.totalAllowedPauseDays || 15, (sub.remainingPauseDays || 0) + targetPause.daysPaused);
      // Rollback validity extension
      const curEndObj = new Date(sub.endDate + 'T00:00:00');
      curEndObj.setDate(curEndObj.getDate() - targetPause.daysPaused);
      sub.endDate = curEndObj.toISOString().split('T')[0];
      sub.extendedEndDate = sub.endDate;
      sub.currentPauseStatus = 'none';
      subscriptions[subIdx] = sub;
      dbManager.set('subscriptions', subscriptions);
    }
  }

  const filtered = pauses.filter(p => p.id !== id);
  dbManager.set('customerPauses', filtered);

  res.json({ message: 'Pause record removed and subscription validity re-synchronized' });
});

// 8.5 Executive Dashboard & Subscription Operations Summary KPI
app.get('/api/subscriptions/operations-summary', requireAdmin, (_req: Request, res: Response) => {
  const subscriptions = dbManager.get('subscriptions') || [];
  const customerPauses = dbManager.get('customerPauses') || [];
  const today = getTodayDateStr();

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const totalActiveSubscriptions = activeSubs.length;

  // Total Contracted Meals = Sum of meals included in all active subscriptions
  const totalContractedMeals = activeSubs.reduce((sum, s) => sum + (s.mealsTotal || 0), 0);

  // Meals Delivered / Consumed = Total meals already delivered/consumed across active subscriptions
  const totalMealsDelivered = activeSubs.reduce((sum, s) => sum + (s.mealsUsed || 0), 0);

  // Pipeline Meals Remaining = Total Contracted Meals - Meals Delivered / Consumed
  const pipelineMealsRemaining = Math.max(0, totalContractedMeals - totalMealsDelivered);

  // Active Pauses Today = Number of active customer pause records covering today's date
  const activePausesToday = customerPauses.filter(p => 
    p.status === 'active' && 
    today >= p.pauseStartDate && 
    today <= p.pauseEndDate
  ).length;

  // Adjusted Daily Kitchen Prep = Total Active Subscriptions - Active Pauses Today
  const adjustedDailyKitchenPrep = Math.max(0, totalActiveSubscriptions - activePausesToday);

  const longTermSubs = activeSubs.filter(s => s.isLongTerm);
  const totalCashbackCommitted = longTermSubs.reduce((sum, s) => sum + (s.cashbackAmount || 0), 0);

  res.json({
    totalActiveSubscriptions,
    totalContractedMeals,
    totalMealsDelivered,
    pipelineMealsRemaining,
    activePausesToday,
    adjustedDailyKitchenPrep,
    longTermSubscribersCount: longTermSubs.length,
    totalCashbackCommitted
  });
});

// ==========================================
// 9. CUSTOMER MANAGEMENT (ADMIN)
// ==========================================

app.get('/api/customers', requireAdmin, (_req: Request, res: Response) => {
  const users = dbManager.get('users');
  const orders = dbManager.get('orders');
  const subscriptions = dbManager.get('subscriptions');

  const customerList = users
    .filter(u => u.role === 'customer')
    .map(u => {
      const userOrders = orders.filter(o => o.customerId === u.id);
      const userSubs = subscriptions.filter(s => s.customerId === u.id);
      const totalSpent = userOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);

      const { passwordHash: _, ...safeUser } = u;
      return {
        ...safeUser,
        totalOrders: userOrders.length,
        totalSpent,
        activeSubscriptionsCount: userSubs.filter(s => s.status === 'active').length
      };
    });

  res.json(customerList);
});

app.put('/api/customers/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'disabled'

  const users = dbManager.get('users');
  const user = users.find(u => u.id === id && u.role === 'customer');

  if (!user) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  user.status = status === 'disabled' ? 'disabled' : 'active';
  dbManager.set('users', users);

  res.json({ message: `Customer account marked as ${user.status}` });
});

// ==========================================
// 10. ADMIN DASHBOARD & REPORTS
// ==========================================

app.get('/api/reports/summary', requireAdmin, (_req: Request, res: Response) => {
  const orders = dbManager.get('orders');
  const subscriptions = dbManager.get('subscriptions');
  const users = dbManager.get('users');
  const usages = dbManager.get('couponUsage');

  const todayStr = new Date().toISOString().split('T')[0];
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
  const todayPaid = todayOrders.filter(o => o.paymentStatus === 'paid');
  const todayRevenue = todayPaid.reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed');
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered');
  const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled');
  const failedPaymentsCount = orders.filter(o => o.paymentStatus === 'failed').length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const newCustomersCount = users.filter(u => u.role === 'customer').length;

  // Meal popularity ranking
  const mealCounts: Record<string, { count: number; revenue: number }> = {};
  for (const o of paidOrders) {
    for (const it of o.items) {
      if (!mealCounts[it.name]) {
        mealCounts[it.name] = { count: 0, revenue: 0 };
      }
      mealCounts[it.name].count += it.quantity;
      mealCounts[it.name].revenue += it.totalPrice;
    }
  }

  const topMeals = Object.entries(mealCounts)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Sales by date for past 7 days
  const dateMap: Record<string, { amount: number; orders: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    dateMap[ds] = { amount: 0, orders: 0 };
  }

  for (const o of paidOrders) {
    const dStr = o.createdAt.split('T')[0];
    if (dateMap[dStr]) {
      dateMap[dStr].amount += o.totalAmount;
      dateMap[dStr].orders += 1;
    }
  }

  const salesByDate = Object.entries(dateMap).map(([date, val]) => ({
    date,
    amount: val.amount,
    orders: val.orders
  }));

  res.json({
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    cancelledOrders: cancelledOrders.length,
    totalRevenue,
    todayRevenue,
    activeSubscriptions,
    newCustomersCount,
    couponUsageCount: usages.length,
    failedPaymentsCount,
    recentOrders: orders.slice(0, 10),
    topMeals,
    salesByDate
  });
});

// CSV Export
app.get('/api/reports/export-csv', requireAdmin, (req: Request, res: Response) => {
  let orders = dbManager.get('orders');
  const { status, paymentStatus, startDate, endDate, search } = req.query as Record<string, string>;

  if (status && status !== 'all') {
    const statuses = status.split(',').map(s => s.trim().toLowerCase());
    orders = orders.filter(o => statuses.includes(o.orderStatus.toLowerCase()));
  }

  if (paymentStatus && paymentStatus !== 'all') {
    orders = orders.filter(o => o.paymentStatus.toLowerCase() === paymentStatus.toLowerCase());
  }

  if (startDate) {
    orders = orders.filter(o => {
      const orderDate = (o.createdAt ? o.createdAt.split('T')[0] : o.deliveryDate);
      return orderDate >= startDate;
    });
  }

  if (endDate) {
    orders = orders.filter(o => {
      const orderDate = (o.createdAt ? o.createdAt.split('T')[0] : o.deliveryDate);
      return orderDate <= endDate;
    });
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.deliveryAddress.area.toLowerCase().includes(q)
    );
  }

  const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Items / Subscription', 'Subtotal', 'Discount', 'Delivery Fee', 'Total Amount', 'Payment Status', 'Order Status', 'Delivery Area', 'Delivery Slot'];

  const rows = orders.map(o => [
    o.orderNumber,
    o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : (o.deliveryDate || ''),
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    o.customerPhone || '',
    `"${(o.items || []).map(i => `${i.name} (x${i.quantity})`).join('; ').replace(/"/g, '""')}"`,
    o.subtotal || 0,
    (o.couponDiscount || 0) + (o.subscriptionDiscount || 0),
    o.deliveryFee || 0,
    o.totalAmount || 0,
    o.paymentStatus || '',
    o.orderStatus || '',
    `"${(o.deliveryAddress?.area || '').replace(/"/g, '""')}"`,
    `"${(o.deliverySlot || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="manna_foods_orders_${Date.now()}.csv"`);
  res.send(csv);
});

// ==========================================
// 11. WHATSAPP NOTIFICATIONS & WEBHOOK
// ==========================================

app.get('/api/notifications', requireAdmin, (_req: Request, res: Response) => {
  const notifications = dbManager.get('notifications');
  res.json(notifications);
});

// Webhook endpoint for Meta WhatsApp Cloud API status verification
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'manna_verify_token')) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/whatsapp/webhook', (req: Request, res: Response) => {
  console.log('Incoming WhatsApp Webhook Payload:', JSON.stringify(req.body));
  res.status(200).send('EVENT_RECEIVED');
});

// Manual WhatsApp Resend / Share Link
app.post('/api/whatsapp/send-manual', requireAdmin, async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const orders = dbManager.get('orders');
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const result = await whatsAppService.sendOrderConfirmation(order);
  res.json(result);
});

// ==========================================
// VITE DEV MIDDLEWARE & PRODUCTION SERVING
// ==========================================

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        ws: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          }
        }
      }));
      app.get('*', (_req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✅ Manna Foods Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Manna Foods server:', err);
});
