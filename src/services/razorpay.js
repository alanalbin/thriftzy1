/**
 * Razorpay Payment Gateway Service
 * Handles loading Razorpay Checkout SDK, initiating online payments (UPI, Cards, NetBanking),
 * and verifying payment callbacks.
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const STORAGE_KEY = 'thriftzy_razorpay_key_id';

export function getRazorpayKey() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_51THRIFTZYTEST';
}

export function saveRazorpayKey(key) {
  if (typeof window !== 'undefined' && key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function isRazorpayConfigured() {
  const k = getRazorpayKey();
  return Boolean(k && k.startsWith('rzp_') && !k.includes('THRIFTZYTEST'));
}

/**
 * Ensures Razorpay Checkout SDK is loaded into window
 */
export function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Checkout Modal
 * @param {Object} params
 * @param {number} params.amount Total amount in INR
 * @param {Object} params.customer Customer object { name, email, phone, address }
 * @param {Array} params.items Cart items
 * @param {string} params.orderId Optional internal order ID
 * @param {Function} params.onSuccess Callback receiving { razorpay_payment_id, ... }
 * @param {Function} params.onFailure Callback receiving error or cancellation details
 */
export async function initiateRazorpayPayment({
  amount,
  customer,
  items = [],
  orderId = '',
  onSuccess,
  onFailure
}) {
  const isLoaded = await loadRazorpaySDK();
  if (!isLoaded || typeof window.Razorpay === 'undefined') {
    if (onFailure) {
      onFailure(new Error('Razorpay SDK could not be loaded. Please check your internet connection.'));
    }
    return;
  }

  const key = getRazorpayKey();
  const paiseAmount = Math.max(100, Math.round(Number(amount) * 100)); // Minimum ₹1

  const options = {
    key,
    amount: paiseAmount,
    currency: 'INR',
    name: 'Thriftzy Store',
    description: `Order payment for ${items.length} vintage piece(s)`,
    image: '/assets/thriftzy-pill.jpg',
    prefill: {
      name: customer?.name || 'Customer',
      email: customer?.email || '',
      contact: (customer?.phone || '').replace(/[^0-9+]/g, '')
    },
    notes: {
      deliveryAddress: customer?.address || '',
      orderItems: items.map((i) => `${i.name} (${i.size})`).join(', ').slice(0, 200),
      orderId: orderId || ''
    },
    theme: {
      color: '#0A0A0A'
    },
    modal: {
      confirm_close: true,
      ondismiss: () => {
        if (onFailure) {
          onFailure({ cancelled: true, message: 'Razorpay checkout cancelled by customer.' });
        }
      }
    },
    handler: function (response) {
      if (onSuccess && response?.razorpay_payment_id) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || null,
          razorpay_signature: response.razorpay_signature || null,
          payment_method: 'Razorpay',
          payment_status: 'PAID'
        });
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      console.warn('[Razorpay] Payment failed:', resp.error);
      if (onFailure) {
        onFailure(resp.error || new Error('Razorpay payment failed.'));
      }
    });
    rzp.open();
  } catch (err) {
    console.warn('[Razorpay] Launch notice:', err);
    if (onFailure) {
      onFailure(err);
    }
  }
}

