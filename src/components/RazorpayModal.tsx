import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';
import { Order, CustomerSubscription } from '../types/index.ts';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    isTestMode: boolean;
    customerDetails: { name: string; email: string; phone: string };
  } | null;
  onSuccess: (order: Order, subscription?: CustomerSubscription, waDetails?: any) => void;
  onFailure: (errorMessage: string) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onFailure
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !orderData) return null;

  // Handle standard payment completion
  const handleVerify = async (paymentId: string, signature?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyPayment({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature || `sandbox_sig_${paymentId}`
      });

      if (res.success) {
        onSuccess(res.order, res.subscription, res.whatsAppNotification);
      } else {
        throw new Error('Payment verification unsuccessful');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment signature verification failed.');
      onFailure(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Launch native Razorpay checkout window if user prefers standard gateway window
  const launchNativeRazorpay = () => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: orderData.razorpayKeyId,
        amount: Math.round(orderData.totalAmount * 100),
        currency: 'INR',
        name: 'Manna Foods',
        description: `Order #${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone
        },
        theme: {
          color: '#d97706'
        },
        handler: async (response: any) => {
          await handleVerify(
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: async () => {
            await api.failPayment(orderData.orderId, 'User closed gateway popup');
            setErrorMsg('Payment cancelled by user. You can retry anytime.');
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (e) {
        console.warn('Could not launch popup, using direct sandbox simulation:', e);
      }
    }
  };

  const handleSimulateSuccess = () => {
    const fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    handleVerify(fakePaymentId);
  };

  const handleSimulateFailure = async () => {
    setIsProcessing(true);
    await api.failPayment(orderData.orderId, 'Bank server transaction declined in test mode');
    setIsProcessing(false);
    setErrorMsg('Transaction declined: Your bank reported insufficient test funds or timeout.');
    onFailure('Payment declined by payment gateway.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-stone-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-bold text-blue-300 font-display">
              ₹
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>Razorpay Gateway</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-mono">
                  TEST MODE
                </span>
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Manna Foods · Order #{orderData.orderNumber}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Amount Banner */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex items-baseline justify-between">
          <span className="text-xs text-stone-600 font-medium">Payable Amount:</span>
          <span className="text-xl font-extrabold text-stone-900 tabular-nums">
            ₹{orderData.totalAmount}
          </span>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="block">Payment Failed:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span className="text-xs block">UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span className="text-xs block">Card</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedMethod === 'netbanking'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span className="text-xs block">Netbanking</span>
            </button>
          </div>

          {/* Tab Content */}
          {selectedMethod === 'upi' && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <label className="font-semibold text-stone-700 block">
                Virtual Payment Address (VPA / UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-stone-800"
              />
              <div className="flex gap-2 text-[10px] text-stone-500 pt-1">
                <span className="bg-white px-2 py-0.5 rounded border border-stone-200">Google Pay</span>
                <span className="bg-white px-2 py-0.5 rounded border border-stone-200">PhonePe</span>
                <span className="bg-white px-2 py-0.5 rounded border border-stone-200">Paytm</span>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Card Number (Test Cards Allowed)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-stone-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <label className="font-semibold text-stone-700 block">Select Bank</label>
              <select className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment Signature...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Authorize &amp; Pay ₹{orderData.totalAmount} (Test Mode)</span>
                </>
              )}
            </button>

            {/* Standard native popup trigger */}
            <button
              type="button"
              onClick={launchNativeRazorpay}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Standard Razorpay Checkout Window</span>
            </button>

            {/* Test Failure Button */}
            <button
              type="button"
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors"
            >
              Simulate Failed Payment (Test Failure Handler)
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="bg-stone-100 px-5 py-2.5 text-[10px] text-stone-500 flex items-center justify-between border-t border-stone-200">
          <span>Razorpay ID: {orderData.razorpayOrderId}</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Backend HMAC Signature Verified
          </span>
        </div>
      </div>
    </div>
  );
};
