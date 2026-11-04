import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  LogOut,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Card3D from '../3d/Card3D';
import {
  customerGoogleLogin,
  updateCustomerProfile,
  customerLogout,
  getCustomerOrders,
  fetchCustomerCart
} from '../../services/api';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customer,
  onCustomerChange,
  onOpenCart,
  onCartUpdated
}) {
  const [tab, setTab] = useState('profile'); // 'profile' | 'orders'
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Edit profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');

      // Parse existing address
      const addr = customer.address || '';
      const parts = addr.split(', ').map((p) => p.trim());
      if (parts.length >= 5) {
        setFlat(parts[0] || '');
        setStreet(parts[1] || '');
        setCity(parts[2] || '');
        setState(parts[3] || '');
        setPincode(parts[4] || '');
      } else {
        setFlat(addr);
      }

      loadOrders(customer.email);
    }
  }, [customer]);

  const loadOrders = async (email) => {
    if (!email) return;
    setOrdersLoading(true);
    try {
      const list = await getCustomerOrders(email);
      setOrders(list || []);
    } catch (e) {
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!isOpen) return null;

  // Handle Google Login
  const performGoogleLogin = async (emailToUse, nameToUse) => {
    setError('');
    setLoading(true);

    try {
      const newCustomer = await customerGoogleLogin({
        email: emailToUse,
        name: nameToUse || emailToUse.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse || emailToUse)}`
      });

      // Big celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#E50914']
      });

      // Synchronize database cart for this customer
      if (newCustomer?.email) {
        try {
          const dbCart = await fetchCustomerCart(newCustomer.email);
          if (Array.isArray(dbCart) && onCartUpdated) {
            onCartUpdated(dbCart);
          }
        } catch (e) {}
      }

      onCustomerChange(newCustomer);
      setJustLoggedIn(true);
      setTab('profile');
      setGoogleEmail('');
      setGoogleName('');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    const clean = (googleEmail || '').trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setError('Please enter a valid Gmail address (e.g. yourname@gmail.com).');
      return;
    }
    performGoogleLogin(clean, googleName.trim() || clean.split('@')[0]);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);

    const fullAddress = [flat, street, city, state, pincode].filter(Boolean).join(', ');

    try {
      const updated = await updateCustomerProfile({
        name,
        phone,
        address: fullAddress
      });
      onCustomerChange(updated);
      setSaveSuccess(true);
      setJustLoggedIn(false);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#34A853', '#FFFFFF', '#4285F4']
      });

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Sign out of your customer account?')) {
      customerLogout();
      onCustomerChange(null);
      setJustLoggedIn(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1600px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* 3D Animated Pop-up Window */}
        <motion.div
          key={customer ? 'customer-details-card' : 'google-signin-card'}
          initial={{
            opacity: 0,
            scale: 0.88,
            rotateX: 20,
            y: 40,
            z: -120
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
            y: 0,
            z: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            rotateX: -15,
            y: 30
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24
          }}
          className="relative w-full max-w-xl rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100 z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!customer ? (
            /* =======================================================
               VIEW 1: AUTHENTIC GOOGLE ONE-CLICK SIGN-IN
               ======================================================= */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-neutral-200 shadow-md">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27a7.22 7.22 0 0 1 0-4.54V6.58H1.25a12.01 12.01 0 0 0 0 10.84l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                  Sign in with Google
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Choose an account to sign in to Thriftzy Store and sync your bag & delivery address.
                </p>
              </div>

              {/* 1-Click Fast Google Accounts */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-center">
                  1-Click Instant Sign-In
                </span>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => performGoogleLogin('albin.customer@gmail.com', 'Albin Customer')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 hover:border-blue-400 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/initials/svg?seed=Albin"
                      alt="Albin"
                      className="w-9 h-9 rounded-full object-cover border border-neutral-300"
                    />
                    <div className="text-left">
                      <span className="text-xs font-bold text-neutral-900 block">Albin (Google Account)</span>
                      <span className="text-[11px] text-neutral-500 block">albin.customer@gmail.com</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => performGoogleLogin('shopper.india@gmail.com', 'Streetwear Shopper')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 hover:border-blue-400 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/initials/svg?seed=Shopper"
                      alt="Shopper"
                      className="w-9 h-9 rounded-full object-cover border border-neutral-300"
                    />
                    <div className="text-left">
                      <span className="text-xs font-bold text-neutral-900 block">Guest Shopper</span>
                      <span className="text-[11px] text-neutral-500 block">shopper.india@gmail.com</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-[11px] font-semibold text-neutral-400">or use your Gmail</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Custom Gmail Input Form */}
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Albin Joseph"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27a7.22 7.22 0 0 1 0-4.54V6.58H1.25a12.01 12.01 0 0 0 0 10.84l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                  <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          ) : (
            /* =======================================================
               VIEW 2: 3D ANIMATED DETAILS ENTERING PAGE FOR LOGGED IN
               ======================================================= */
            <div className="space-y-6">
              {/* Welcoming Banner (Triggers upon login) */}
              {justLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-300 text-neutral-900 text-xs flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm">
                      ✓
                    </div>
                    <div>
                      <span className="font-extrabold text-neutral-950 block">Signed In Successfully!</span>
                      <span className="text-[11px] text-neutral-600">Please complete your delivery address below for 1-click orders.</span>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                </motion.div>
              )}

              {/* Profile Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <img
                    src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                    alt={customer.name}
                    className="w-12 h-12 rounded-2xl border-2 border-red-500/30 object-cover shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold text-neutral-900">{customer.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" /> Google Account
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium">{customer.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 border border-neutral-200">
                <button
                  onClick={() => setTab('profile')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    tab === 'profile'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Enter Delivery Details
                </button>
                <button
                  onClick={() => {
                    setTab('orders');
                    loadOrders(customer.email);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    tab === 'orders'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  My Orders ({orders.length})
                </button>
              </div>

              {tab === 'profile' ? (
                /* PROFILE & DELIVERY ADDRESS DETAILS FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Details saved in database! You are ready for 1-click checkout.</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Mobile Number (for delivery) *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        Delivery Address Details
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Flat, House no., Building, Apartment *
                        </label>
                        <input
                          type="text"
                          required
                          value={flat}
                          onChange={(e) => setFlat(e.target.value)}
                          placeholder="e.g. Flat 302, Green Valley Apartments"
                          className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Street, Area, Landmark *
                        </label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="e.g. 12th Cross, Indiranagar"
                          className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Bangalore"
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Karnataka"
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="560038"
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-red-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-neutral-950 hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <Check className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                    <span>Save Delivery Details & Continue Shopping</span>
                  </button>
                </form>
              ) : (
                /* ORDER HISTORY TAB */
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {ordersLoading ? (
                    <div className="text-center py-8 text-neutral-400 text-xs">
                      Loading your orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800">No orders placed yet</h4>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                        Your completed orders will appear here. Add your favorite streetwear pieces to your cart and place an order!
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCart?.();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Cart</span>
                      </button>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-neutral-900">
                            Order #{order.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {order.status || 'Confirmed'}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-500">
                          Placed on: {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1.5 pt-1">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 rounded-lg object-cover"
                                  />
                                )}
                                <span>{item.name} ({item.size})</span>
                              </div>
                              <span className="font-bold text-neutral-900">
                                ₹{Number(item.price || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs font-bold">
                          <span>Total Paid:</span>
                          <span className="text-red-600 text-sm">
                            ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {order.delivery_address && (
                          <div className="text-[11px] text-neutral-500 pt-1">
                            <span className="font-semibold text-neutral-700">Delivery Address: </span>
                            {order.delivery_address}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
