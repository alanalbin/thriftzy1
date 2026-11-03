import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ShieldCheck, ArrowRight, Sparkles, MessageCircle, Tag, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawerModal({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  currentCurrency = 'USD'
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const currencyRates = { USD: 1, EUR: 0.92, GBP: 0.78, INR: 83 };
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  const rate = currencyRates[currentCurrency] || 1;
  const symbol = currencySymbols[currentCurrency] || '$';

  const formatPrice = (usdAmount) => {
    return `${symbol}${Math.round(Number(usdAmount) * rate)}`;
  };

  const rawSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'THRIFTZY20' || promoCode.trim().toUpperCase() === 'OUTCROWD') {
      setDiscountPercent(20);
      setPromoMessage('🎉 20% Discount Applied!');
    } else {
      setPromoMessage('Invalid code. Try "THRIFTZY20"');
    }
  };

  // WhatsApp formatted direct order message
  const handleWhatsAppCheckout = () => {
    if (!customerName || !customerPhone) {
      alert('Please fill in your Name and Contact Phone/WhatsApp number.');
      return;
    }

    const itemsList = cart.map((item, idx) => `${idx + 1}. ${item.name} (${item.size}) - $${item.price}`).join('%0A');
    const msg = `*NEW ORDER FROM THRIFTZY STORE*%0A%0A*Customer:* ${encodeURIComponent(customerName)}%0A*Phone:* ${encodeURIComponent(customerPhone)}%0A*Address:* ${encodeURIComponent(shippingAddress || 'Not provided')}%0A%0A*Items Ordered:*%0A${itemsList}%0A%0A*Total:* ${formatPrice(finalTotal)}%0A%0APlease confirm my order and shipping details!`;

    // Take contact from first item if available, or default
    const sellerContact = (cart[0]?.contactNumber || '').replace(/[^0-9]/g, '');
    const waUrl = sellerContact ? `https://wa.me/${sellerContact}?text=${msg}` : `https://wa.me/?text=${msg}`;

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#000000']
    });

    window.open(waUrl, '_blank');
    onClearCart();
    onClose();
  };

  const handleStandardCheckout = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#E50914', '#FFFFFF', '#FF3B56', '#FFE0E3']
    });
    alert('🎉 Order placed successfully! The seller has been notified with your order details.');
    onClearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/65 backdrop-blur-md"
        />

        {/* Drawer Slider with Outcrowd Spring Motion */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
            }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Your Shopping Bag</h3>
                  <p className="text-xs text-neutral-500">{cart.length} {cart.length === 1 ? 'item' : 'items'} selected</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-neutral-800 text-base">Your Bag is Empty</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Browse our clothing catalog to find vintage pieces and streetwear grails.
                  </p>
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-4 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover border border-neutral-200 bg-white"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-xs text-neutral-900 leading-snug line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => onRemoveFromCart(idx)}
                              className="text-neutral-400 hover:text-red-600 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                            Size: {item.size} • {item.condition}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-base font-black text-neutral-900">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Promo code form */}
                  <form onSubmit={handleApplyPromo} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (THRIFTZY20)"
                      className="flex-1 rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {promoMessage && (
                    <span className="text-xs font-bold text-red-600 block">{promoMessage}</span>
                  )}

                  {/* Toggle Checkout Details Form */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsCheckingOut(!isCheckingOut)}
                      className="text-xs font-bold text-neutral-700 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <span>{isCheckingOut ? '− Hide Shipping Details' : '+ Add Shipping & Contact Details'}</span>
                    </button>

                    {isCheckingOut && (
                      <div className="mt-3 space-y-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Alex Morgan"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">WhatsApp / Phone *</label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+1 555-0199"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Delivery Address</label>
                          <input
                            type="text"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Street, City, Postal Code"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Actions */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/80 space-y-3.5">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">{formatPrice(rawSubtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-950">
                    <span>Total</span>
                    <span className="text-xl text-red-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp</span>
                </motion.button>

                {/* Standard Online Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStandardCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-3 text-xs font-bold text-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  <span>Place Standard Order</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buyer Protection & Verified Thriftzy Guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
