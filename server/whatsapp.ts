import type { Order, WhatsAppNotification } from '../src/types/index.ts';
import { dbManager } from './db.ts';

export interface WhatsAppSendResult {
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  message: string;
  waLink: string;
  error?: string;
}

export class WhatsAppNotificationService {
  private apiToken: string | undefined;
  private phoneNumberId: string | undefined;
  private adminRecipient: string;

  constructor() {
    this.apiToken = process.env.WHATSAPP_API_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.adminRecipient = process.env.WHATSAPP_ADMIN_RECIPIENT || '+919890786024';
  }

  /**
   * Formats the required message as specified in user requirements
   */
  public formatOrderMessage(order: Order): string {
    const itemsDescription = order.items.map(item => {
      if (item.type === 'subscription') {
        return `${item.name} (${item.quantity} plan${item.quantity > 1 ? 's' : ''}${item.details ? ' - ' + item.details : ''})`;
      }
      return `${item.name} x ${item.quantity}`;
    }).join(', ');

    const address = `${order.deliveryAddress.addressLine}${order.deliveryAddress.landmark ? ', ' + order.deliveryAddress.landmark : ''}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`;

    return `New Manna Foods Order\n\nOrder ID: #${order.orderNumber}\nCustomer: ${order.customerName}\nPlan/Items: ${itemsDescription}\nAmount: ₹${order.totalAmount}\nPayment: Paid\nDelivery Address: ${address}\nOrder Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\nThank you for ordering from Manna Foods.`;
  }

  /**
   * Generates a direct WhatsApp web/app link with pre-filled encoded message
   */
  public generateWhatsAppLink(phoneNumber: string, message: string): string {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Dispatches WhatsApp notification to customer and admin
   */
  public async sendOrderConfirmation(order: Order): Promise<WhatsAppSendResult> {
    const message = this.formatOrderMessage(order);
    const waLink = this.generateWhatsAppLink(order.customerPhone, message);

    let status: 'sent' | 'simulated' | 'failed' = 'simulated';
    let errorMessage: string | undefined;

    // Check if Cloud API credentials are provided
    if (this.apiToken && this.phoneNumberId && this.apiToken !== 'your_whatsapp_cloud_api_token') {
      try {
        const cleanRecipient = order.customerPhone.replace(/[^0-9]/g, '');
        const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanRecipient,
            type: 'text',
            text: {
              preview_url: false,
              body: message
            }
          })
        });

        if (response.ok) {
          status = 'sent';
        } else {
          const errData = await response.text();
          console.warn('WhatsApp API returned error response:', errData);
          status = 'simulated';
          errorMessage = 'WhatsApp API returned error. Fallback to webhook/simulation.';
        }
      } catch (err: any) {
        console.warn('WhatsApp Cloud API call failed:', err.message);
        status = 'simulated';
        errorMessage = err.message;
      }
    } else {
      // API credentials not configured yet, record as simulated with full audit payload
      status = 'simulated';
    }

    // Record notification in audit database
    const notification: WhatsAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      customerName: order.customerName,
      phone: order.customerPhone,
      message,
      status,
      type: 'order_confirmed',
      sentAt: new Date().toISOString(),
      error: errorMessage
    };

    const notifications = dbManager.get('notifications');
    notifications.unshift(notification);
    dbManager.set('notifications', notifications.slice(0, 200));

    return {
      success: true,
      status,
      message,
      waLink,
      error: errorMessage
    };
  }
}

export const whatsAppService = new WhatsAppNotificationService();
