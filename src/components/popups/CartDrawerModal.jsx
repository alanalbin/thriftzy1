import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Tag,
  Check,
  User,
  MapPin,
  Phone,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createCustomerOrder } from '../../services/api';

export default function CartDrawerModal({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  customer = null,
  onOpenCustomerModal = null
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Sync with customer profile when customer logs in
  useEffect(() => {
    if (customer) {
      if (customer.name) setCustomerName(customer.name);
      if (customer.phone) setCustomerPhone(customer.phone);
      if (customer.address) setShippingAddress(customer.address);
    }
  }, [customer]);

  if (!isOpen) return null;

  const formatPrice = (amount) => {
    return `₹${Math.round(Number(amount || 0)).toLocaleString('en-IN')}`;
  };

  const rawSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'THRIFTZY20' || promoCode.trim().toUpperCase() === 'INDIA') {
      setDiscountPercent(20);
      setPromoMessage('🎉 20% Discount Applied!');
    } else {
      setPromoMessage('Invalid promo code. Try "THRIFTZY20"');
    }
  };

  // WhatsApp formatted direct order message
  const handleWhatsAppCheckout = async () => {
    if (!customerName || !customerPhone) {
      setIsCheckingOut(true);
      alert('Please fill in your Name and Contact Phone / WhatsApp number before placing the order.');
      return;
    }

    setPlacingOrder(true);
    try {
      // Save order to customer database
      const order = await createCustomerOrder({
        customerEmail: customer?.email || `${customerPhone}@customer.thriftzy`,
        customerName,
        customerPhone,
        deliveryAddress: shippingAddress,
        items: cart,
        totalAmount: finalTotal
      });

      const itemsList = cart.map((item, idx) => `${idx + 1}. ${item.name} (${item.size}) - ₹${item.price}`).join('%0A');
      const msg = `*NEW ORDER FROM THRIFTZY STORE (Order ID: ${order.id})*%0A%0A*Customer:* ${encodeURIComponent(customerName)}%0A*Phone:* ${encodeURIComponent(customerPhone)}%0A*Delivery Address:* ${encodeURIComponent(shippingAddress || 'To be confirmed')}%0A%0A*Items Ordered:*%0A${itemsList}%0A%0A*Total Amount:* ${formatPrice(finalTotal)}%0A%0APlease confirm my order shipment!`;

      const sellerContact = (cart[0]?.contactNumber || '').replace(/[^0-9]/g, '');
      const waUrl = sellerContact ? `https://wa.me/${sellerContact}?text=${msg}` : `https://wa.me/?text=${msg}`;

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#000000']
      });

      window.open(waUrl, '_blank');
      setPlacedOrder(order);
      onClearCart();
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleStandardCheckout = async () => {
    if (!customerName || !customerPhone) {
      setIsCheckingOut(true);
      alert('Please enter your Name and Mobile Number for order confirmation.');
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await createCustomerOrder({
        customerEmail: customer?.email || `${customerPhone}@customer.thriftzy`,
        customerName,
        customerPhone,
        deliveryAddress: shippingAddress,
        items: cart,
        totalAmount: finalTotal
      });

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#E50914', '#FFFFFF', '#FF3B56', '#FFE0E3']
      });

      setPlacedOrder(order);
      onClearCart();
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (placedOrder) setPlacedOrder(null);
            onClose();
          }}
          className="fixed inset-0 bg-neutral-950/65 backdrop-blur-md"
        />

        {/* Drawer Slider */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-950">
                    Your Shopping Bag
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">
                    {cart.length} {cart.length === 1 ? 'cloth' : 'clothes'} in bag
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (placedOrder) setPlacedOrder(null);
                  onClose();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {placedOrder ? (
                /* ORDER CONFIRMED VIEW */
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <PackageCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      Order Placed Successfully!
                    </span>
                    <h4 className="text-2xl font-black text-neutral-950 mt-1">
                      #{placedOrder.id}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto">
                      Thank you, <strong className="text-neutral-900">{placedOrder.customer_name || customerName}</strong>! Your order has been registered in the database.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Total Amount:</span>
                      <span className="font-bold text-neutral-950">₹{Number(placedOrder.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                    {placedOrder.delivery_address && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Shipping to:</span>
                        <span className="font-medium text-neutral-800 text-right">{placedOrder.delivery_address}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPlacedOrder(null);
                      onClose();
                    }}
                    className="w-full py-3 rounded-2xl bg-neutral-950 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-neutral-800">Your bag is empty</h4>
                  <p className="text-xs text-neutral-500 max-w-[220px]">
                    Explore our curated collection and add your favorite vintage pieces to cart.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Item Cards */}
                  <div className="space-y-3.5">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex gap-3.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 items-center"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-neutral-500 block">
                            Size: {item.size} • {item.condition}
                          </span>
                          <span className="text-xs font-black text-red-600 mt-1 block">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Customer Profile Status */}
                  <div className="pt-2">
                    {customer ? (
                      <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                            alt={customer.name}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block">{customer.name}</span>
                            <span className="text-[10px] text-blue-700 font-medium">{customer.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={onOpenCustomerModal}
                          className="text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                        <span className="text-neutral-600">Have a Google account?</span>
                        <button
                          onClick={onOpenCustomerModal}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white font-bold text-[11px] hover:bg-red-600 transition-colors flex items-center gap-1.5"
                        >
                          <span>Sign In</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Promo code */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Promo Code (try 'THRIFTZY20')"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500"
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

                  {/* Shipping & Contact Details */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(!isCheckingOut)}
                      className="text-xs font-bold text-neutral-700 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <span>{isCheckingOut ? '− Hide Delivery Address' : '+ Verify Shipping & Contact Details'}</span>
                    </button>

                    {isCheckingOut && (
                      <div className="mt-3 space-y-2.5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Albin Joseph"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Mobile / WhatsApp Number *</label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Delivery Address *</label>
                          <textarea
                            rows={2}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Flat/House no., Street, City, State, PIN Code"
                            className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Actions */}
            {cart.length > 0 && !placedOrder && (
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
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-950">
                    <span>Grand Total</span>
                    <span className="text-xl text-red-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={placingOrder}
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{placingOrder ? 'Processing...' : 'Order & Confirm via WhatsApp'}</span>
                </motion.button>

                {/* Direct Order Confirmation */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={placingOrder}
                  onClick={handleStandardCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-3 text-xs font-bold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <span>{placingOrder ? 'Placing Order...' : 'Place Order Online (Pay on Delivery)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Vintage & Fast Pan-India Shipping</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
