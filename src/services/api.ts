import { 
  User, 
  MenuItem, 
  Category, 
  SubscriptionPlan, 
  Coupon, 
  Order, 
  CustomerSubscription, 
  BusinessSettings, 
  DashboardReportSummary,
  WhatsAppNotification,
  LongTermCashbackPlan,
  CustomerPauseRecord,
  SubscriptionOperationsSummary,
  CancellationPolicyReference,
  SubscriptionCancellationRecord,
  LegalPolicies
} from '../types/index.ts';

const TOKEN_KEY = 'manna_foods_token';
const ADMIN_TOKEN_KEY = 'manna_foods_admin_token';

class ApiService {
  private getToken(isAdmin = false): string | null {
    return localStorage.getItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  }

  public setToken(token: string, isAdmin = false): void {
    localStorage.setItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY, token);
  }

  public clearToken(isAdmin = false): void {
    localStorage.removeItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isAdmin = false): Promise<T> {
    const token = this.getToken(isAdmin);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // --- Auth ---
  public async register(payload: { name: string; mobile: string; email: string; password: string; address?: string; area?: string; city?: string; pincode?: string }) {
    const res = await this.request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token, false);
    return res;
  }

  public async login(identifier: string, password: string) {
    const res = await this.request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    this.setToken(res.token, false);
    return res;
  }

  public async adminLogin(email: string, password: string) {
    const res = await this.request<{ message: string; token: string; admin: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token, true);
    return res;
  }

  public async getMe(isAdmin = false) {
    return this.request<{ user: User }>('/api/auth/me', {}, isAdmin);
  }

  public async updateProfile(payload: Partial<User>) {
    return this.request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // --- Settings ---
  public async getSettings(): Promise<BusinessSettings & { isRazorpayTestMode: boolean }> {
    return this.request<BusinessSettings & { isRazorpayTestMode: boolean }>('/api/settings');
  }

  public async updateSettings(settings: Partial<BusinessSettings>) {
    return this.request<{ message: string; settings: BusinessSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }, true);
  }

  // --- Legal Policies & Terms ---
  public async getLegalPolicies(): Promise<LegalPolicies> {
    return this.request<LegalPolicies>('/api/legal-policies');
  }

  public async updateLegalPolicies(policies: Partial<LegalPolicies>) {
    return this.request<{ message: string; policies: LegalPolicies }>('/api/legal-policies', {
      method: 'PUT',
      body: JSON.stringify(policies)
    }, true);
  }

  // --- Menu & Categories ---
  public async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  public async getMenu(isAdmin = false): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/api/menu', {}, isAdmin);
  }

  public async createMenuItem(item: Partial<MenuItem>) {
    return this.request<{ message: string; item: MenuItem }>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(item)
    }, true);
  }

  public async updateMenuItem(id: string, item: Partial<MenuItem>) {
    return this.request<{ message: string; item: MenuItem }>(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    }, true);
  }

  public async deleteMenuItem(id: string) {
    return this.request<{ message: string }>(`/api/menu/${id}`, {
      method: 'DELETE'
    }, true);
  }

  public async uploadImage(imageBase64: string, filename?: string): Promise<{ url: string; filename?: string }> {
    return this.request<{ url: string; filename?: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename })
    }, true);
  }

  // --- Plans ---
  public async getPlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/api/plans');
  }

  public async createPlan(plan: Partial<SubscriptionPlan>) {
    return this.request<{ message: string; plan: SubscriptionPlan }>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }, true);
  }

  public async updatePlan(id: string, plan: Partial<SubscriptionPlan>) {
    return this.request<{ message: string; plan: SubscriptionPlan }>(`/api/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    }, true);
  }

  public async deletePlan(id: string) {
    return this.request<{ message: string }>(`/api/plans/${id}`, {
      method: 'DELETE'
    }, true);
  }

  // --- Coupons ---
  public async validateCoupon(code: string, subtotal: number, hasSubscription: boolean, hasLongTerm?: boolean) {
    return this.request<{ valid: boolean; discountAmount: number; message: string; coupon?: Coupon }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal, hasSubscription, hasLongTerm })
    });
  }

  public async getCoupons(): Promise<Coupon[]> {
    return this.request<Coupon[]>('/api/coupons', {}, true);
  }

  public async createCoupon(coupon: Partial<Coupon>) {
    return this.request<{ message: string; coupon: Coupon }>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    }, true);
  }

  public async updateCoupon(id: string, coupon: Partial<Coupon>) {
    return this.request<{ message: string; coupon: Coupon }>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon)
    }, true);
  }

  public async deleteCoupon(id: string) {
    return this.request<{ message: string }>(`/api/coupons/${id}`, {
      method: 'DELETE'
    }, true);
  }

  // --- Orders & Razorpay ---
  public async createPaymentOrder(payload: {
    items: { type: 'meal' | 'subscription'; mealId?: string; planId?: string; quantity: number }[];
    couponCode?: string;
    deliveryAddress: { addressLine: string; landmark?: string; area: string; city: string; pincode: string };
    deliverySlot: string;
    deliveryDate?: string;
    notes?: string;
    paymentMethod?: 'razorpay' | 'cod';
  }) {
    return this.request<{
      success: boolean;
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      currency: string;
      razorpayOrderId: string;
      razorpayKeyId: string;
      isTestMode: boolean;
      customerDetails: { name: string; email: string; phone: string };
    }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      order: Order;
      subscription?: CustomerSubscription;
      whatsAppNotification: { success: boolean; message: string; waLink: string };
    }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async failPayment(orderId: string, reason?: string) {
    return this.request<{ success: boolean; message: string }>('/api/payments/fail', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason })
    });
  }

  public async getOrders(filters: { status?: string; paymentStatus?: string; search?: string; date?: string } = {}, isAdmin = false): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.search) params.set('search', filters.search);
    if (filters.date) params.set('date', filters.date);

    return this.request<Order[]>(`/api/orders?${params.toString()}`, {}, isAdmin);
  }

  public async getOrderById(id: string, isAdmin = false): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}`, {}, isAdmin);
  }

  public async updateOrderStatus(id: string, status: string, note?: string) {
    return this.request<{ message: string; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    }, true);
  }

  public async cancelOrder(id: string) {
    return this.request<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
      method: 'POST'
    });
  }

  // --- Subscriptions ---
  public async getSubscriptions(filters: { status?: string; search?: string } = {}, isAdmin = false): Promise<CustomerSubscription[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    return this.request<CustomerSubscription[]>(`/api/subscriptions?${params.toString()}`, {}, isAdmin);
  }

  public async createSubscription(payload: Partial<CustomerSubscription>) {
    return this.request<{ message: string; subscription: CustomerSubscription }>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
  }

  public async updateSubscription(id: string, payload: Partial<CustomerSubscription>) {
    return this.request<{ message: string; subscription: CustomerSubscription }>(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, true);
  }

  public async updateSubscriptionStatus(id: string, status?: string, mealsUsedDelta?: number, isAdmin = false) {
    return this.request<{ message: string; subscription: CustomerSubscription }>(`/api/subscriptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, mealsUsedDelta })
    }, isAdmin);
  }

  public async getCancellationPolicy(): Promise<CancellationPolicyReference> {
    return this.request<CancellationPolicyReference>('/api/subscriptions/cancellation-policy');
  }

  public async cancelSubscriptionEarly(id: string, payload: { mealsConsumed: number; reason?: string; notes?: string }) {
    return this.request<{ message: string; subscription: CustomerSubscription; cancellationRecord: SubscriptionCancellationRecord }>(`/api/admin/subscriptions/${id}/cancel-early`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
  }

  // --- Customers (Admin) ---
  public async getCustomers(): Promise<(User & { totalOrders: number; totalSpent: number; activeSubscriptionsCount: number })[]> {
    return this.request<(User & { totalOrders: number; totalSpent: number; activeSubscriptionsCount: number })[]>('/api/customers', {}, true);
  }

  public async toggleCustomerStatus(id: string, status: 'active' | 'disabled') {
    return this.request<{ message: string }>(`/api/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }, true);
  }

  // --- Reports (Admin) ---
  public async getReportsSummary(): Promise<DashboardReportSummary> {
    return this.request<DashboardReportSummary>('/api/reports/summary', {}, true);
  }

  public async exportOrdersCSV(params?: {
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Blob> {
    const token = this.getToken(true);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }

    const query = new URLSearchParams();
    if (token) query.append('token', token);
    if (params?.status) query.append('status', params.status);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = `/api/reports/export-csv${qs ? `?${qs}` : ''}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to export CSV: ${response.statusText}`);
    }

    return response.blob();
  }

  // --- Security & Credentials (Admin) ---
  public async getAdminSecurity(): Promise<{
    admin: User;
    isCustomPasswordSet: boolean;
    lastPasswordChange: string | null;
    bootstrapFallbackActive: boolean;
  }> {
    return this.request('/api/admin/security', {}, true);
  }

  public async updateAdminCredentials(payload: {
    currentPassword: string;
    newPassword: string;
    newEmail?: string;
    newName?: string;
  }): Promise<{
    message: string;
    token: string;
    admin: User;
    updatedAt: string;
  }> {
    const res = await this.request<{
      message: string;
      token: string;
      admin: User;
      updatedAt: string;
    }>('/api/admin/security/update-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);

    if (res.token) {
      this.setToken(res.token, true);
    }
    return res;
  }

  // --- WhatsApp Logs ---
  public async getWhatsAppNotifications(): Promise<WhatsAppNotification[]> {
    return this.request<WhatsAppNotification[]>('/api/notifications', {}, true);
  }

  public async resendWhatsApp(orderId: string) {
    return this.request<{ success: boolean; message: string; waLink: string }>('/api/whatsapp/send-manual', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    }, true);
  }

  // --- Long-Term Subscription Cashback Offers ---
  public async getLongTermOffers(): Promise<LongTermCashbackPlan[]> {
    return this.request<LongTermCashbackPlan[]>('/api/long-term-offers');
  }

  public async updateLongTermOffer(id: string, payload: Partial<LongTermCashbackPlan>) {
    return this.request<{ message: string; plan: LongTermCashbackPlan }>(`/api/long-term-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, true);
  }

  // --- Meal Delivery Operations ---
  public async recordMealDelivery(subId: string, count: number = 1) {
    return this.request<{ message: string; subscription: CustomerSubscription }>(`/api/subscriptions/${subId}/record-meal`, {
      method: 'POST',
      body: JSON.stringify({ count })
    }, true);
  }

  // --- Customer Pause Tracker ---
  public async getCustomerPauses(params?: { status?: string; filter?: string }): Promise<CustomerPauseRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.filter) query.append('filter', params.filter);
    const qs = query.toString();
    return this.request<CustomerPauseRecord[]>(`/api/pauses${qs ? `?${qs}` : ''}`, {}, true);
  }

  public async createCustomerPause(payload: {
    subscriptionId: string;
    pauseStartDate: string;
    pauseEndDate: string;
    noticeCompliance?: 'on_time' | 'late' | 'not_provided';
    notes?: string;
  }) {
    return this.request<{
      message: string;
      pause: CustomerPauseRecord;
      subscription: CustomerSubscription;
      isExceeded: boolean;
    }>('/api/pauses', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
  }

  public async deleteCustomerPause(pauseId: string) {
    return this.request<{ message: string }>(`/api/pauses/${pauseId}`, {
      method: 'DELETE'
    }, true);
  }

  // --- Operations KPI Summary ---
  public async getOperationsSummary(): Promise<SubscriptionOperationsSummary> {
    return this.request<SubscriptionOperationsSummary>('/api/subscriptions/operations-summary', {}, true);
  }
}

export const api = new ApiService();
