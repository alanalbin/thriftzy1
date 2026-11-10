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
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Flame,
  Key,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  customerGoogleLogin,
  updateCustomerProfile,
  customerLogout,
  getCustomerOrders,
  fetchCustomerCart
} from '../../services/api';
import {
  signInWithFirebaseGoogle,
  firebaseSignOut,
  isFirebaseConfigured,
  getFirebaseConfig,
  saveFirebaseConfig
} from '../../services/firebase';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customer,
  onCustomerChange,
  onOpenCart,
  onCartUpdated
}) {
  const [tab, setTab] = useState('profile'); // 'profile' | 'orders'
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Firebase Configuration state
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbAppId, setFbAppId] = useState('');
  const [configSuccess, setConfigSuccess] = useState(false);

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

  // Initialize config fields
  useEffect(() => {
    const cfg = getFirebaseConfig();
    setFbApiKey(cfg.apiKey || '');
    setFbAuthDomain(cfg.authDomain || '');
    setFbProjectId(cfg.projectId || '');
    setFbAppId(cfg.appId || '');
  }, [isOpen]);

  // Initialize profile fields when customer changes
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

  // Initialize official Google Identity Services (GSI) if client ID exists
  useEffect(() => {
    if (!customer && isOpen && typeof window !== 'undefined' && window.google?.accounts?.id) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId && !clientId.includes('your_google')) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response?.credential) {
                try {
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  );
                  const payload = JSON.parse(jsonPayload);
                  if (payload?.email) {
                    performGoogleLogin(
                      payload.email,
                      payload.name || payload.given_name,
                      payload.picture,
                      payload.sub,
                      `fb_gsi_${payload.sub}`,
                      'google_gsi'
                    );
                  }
                } catch (e) {
                  console.warn('Google credential decode error:', e);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('gsi-official-button-container');
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 320
            });
          }
        } catch (err) {}
      }
    }
  }, [customer, isOpen]);

  const loadOrders = async (email) => {
    if (!email) return;
    setOrdersLoading(true);
    try {
      const list = await getCustomerOrders(email);
      setOrders(list || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!isOpen) return null;

  // Execute Real Google Login & Database Storage
  const performGoogleLogin = async (
    emailToUse,
    nameToUse,
    avatarToUse,
    googleIdToUse,
    firebaseUidToUse,
    providerToUse
  ) => {
    setError('');
    setLoading(true);
    setLoadingMessage('Syncing with customer database...');

    try {
      const cleanEmail = (emailToUse || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        throw new Error('Authenticated Google account does not contain a valid email address.');
      }

      const cleanName = (nameToUse || cleanEmail.split('@')[0])
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const avatar =
        avatarToUse ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;

      setLoadingMessage('Saving customer profile in database...');

      const newCustomer = await customerGoogleLogin({
        email: cleanEmail,
        name: cleanName,
        avatar,
        google_id: googleIdToUse || 'goog_' + Date.now().toString(36),
        firebase_uid: firebaseUidToUse || 'fb_' + Date.now().toString(36),
        auth_provider: providerToUse || 'firebase_google'
      });

      // Celebratory confetti explosion in Google & Firebase brand colors
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FFCA28']
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
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Primary Real Google Sign-In Handler (Firebase Auth Popup)
  const handlePrimaryGoogleClick = async () => {
    setError('');
    setLoading(true);
    setLoadingMessage('Opening Google Sign-in popup...');

    try {
      const fbResult = await signInWithFirebaseGoogle();

      if (fbResult.success && fbResult.user) {
        await performGoogleLogin(
          fbResult.user.email,
          fbResult.user.name,
          fbResult.user.avatar,
          fbResult.user.google_id,
          fbResult.user.firebase_uid,
          'firebase_google'
        );
        return;
      }

      // User closed the popup window
      if (fbResult.cancelled) {
        setLoading(false);
        setLoadingMessage('');
        return;
      }

      // Missing or invalid Firebase API Key
      if (fbResult.needsConfig) {
        setShowConfigHelper(true);
        setError('Real Google authentication requires valid Firebase Web App credentials. Please paste your Firebase config below.');
        setLoading(false);
        setLoadingMessage('');
        return;
      }

      // Unauthorized domain
      if (fbResult.unauthorizedDomain) {
        setError(fbResult.errorMessage);
        setLoading(false);
        setLoadingMessage('');
        return;
      }

      setError(fbResult.errorMessage || 'Google authentication failed.');
    } catch (err) {
      console.warn('Google Sign-in error:', err);
      setError(err.message || 'Could not authenticate with Google.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Save custom Firebase credentials
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!fbApiKey || fbApiKey.trim().length < 20) {
      setError('Please provide a valid Firebase API Key (e.g. AIzaSy...).');
      return;
    }

    const cfg = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim() || 'thriftzy-store.firebaseapp.com',
      projectId: fbProjectId.trim() || 'thriftzy-store',
      storageBucket: `${fbProjectId.trim() || 'thriftzy-store'}.appspot.com`,
      messagingSenderId: '1084226305417',
      appId: fbAppId.trim() || '1:1084226305417:web:8c5b96f13e7d'
    };

    saveFirebaseConfig(cfg);
    setConfigSuccess(true);
    setError('');
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfigHelper(false);
      handlePrimaryGoogleClick();
    }, 1000);
  };

  // Handle Profile Update (Customer details entering)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);

    if (!phone || phone.trim().length < 8) {
      alert('Please enter a valid mobile number for delivery.');
      return;
    }

    const fullAddress = [flat, street, city, state, pincode].filter(Boolean).join(', ');
    if (!fullAddress || fullAddress.length < 5) {
      alert('Please enter a complete delivery address (House/Flat, Street, City, State, PIN).');
      return;
    }

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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#34A853', '#FFFFFF', '#4285F4']
      });

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Sign out of your Google customer account?')) {
      await firebaseSignOut();
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
            damping: 24,
            stiffness: 220
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-lg rounded-[32px] bg-white border border-neutral-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden z-10 my-auto"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {!customer ? (
            /* =======================================================
               VIEW 1: AUTHENTICATE WITH REAL GOOGLE ACCOUNTS (FIREBASE)
               ======================================================= */
            <div className="space-y-5">
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm mx-auto">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
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
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    <Flame className="w-3 h-3 text-amber-600 fill-amber-500" /> Firebase Real Google Auth
                  </span>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                  Sign in with Google
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Authenticate securely using your real Google Account to enter delivery details, sync your bag, and checkout with Razorpay.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}

              {/* Official Google GSI Button Container (Rendered by Google Script if available) */}
              <div id="gsi-official-button-container" className="flex justify-center w-full empty:hidden" />

              {/* Primary Real Google Sign-in Button */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={loading}
                  onClick={handlePrimaryGoogleClick}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white border-2 border-neutral-200 hover:border-blue-500 hover:bg-neutral-50 text-neutral-800 font-bold text-xs shadow-sm hover:shadow-md transition-all group disabled:opacity-60"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="text-sm font-extrabold text-neutral-900">
                    {loading ? (loadingMessage || 'Authenticating with Google...') : 'Sign in with Google (Firebase)'}
                  </span>
                </motion.button>
              </div>

              {/* Firebase Credentials Configuration Drawer */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowConfigHelper(!showConfigHelper)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Firebase Credentials Configuration</span>
                  </span>
                  {showConfigHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showConfigHelper && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleSaveFirebaseConfig}
                    className="mt-2.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-700">
                        Paste your Web App credentials from Firebase Console:
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; Web app.
                      </p>
                    </div>

                    {configSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved! Re-initiating real Google Authentication...</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        Firebase API Key (apiKey) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fbApiKey}
                        onChange={(e) => setFbApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 font-mono text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                          Auth Domain
                        </label>
                        <input
                          type="text"
                          value={fbAuthDomain}
                          onChange={(e) => setFbAuthDomain(e.target.value)}
                          placeholder="your-app.firebaseapp.com"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                          Project ID
                        </label>
                        <input
                          type="text"
                          value={fbProjectId}
                          onChange={(e) => setFbProjectId(e.target.value)}
                          placeholder="your-project-id"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Save Credentials & Launch Google Sign-In</span>
                    </button>
                  </motion.form>
                )}
              </div>

              {/* Security & Database Notice */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Real Google OAuth 2.0 & SQLite Customer Database</span>
              </div>
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
                      <span className="font-extrabold text-neutral-950 block">Google Account Authenticated!</span>
                      <span className="text-[11px] text-neutral-600">Please complete your delivery address below to enable Razorpay checkout.</span>
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
                        <Check className="w-3 h-3 text-blue-600" /> Google Verified
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium">{customer.email}</p>
                    {customer.firebase_uid && (
                      <p className="text-[10px] text-neutral-400 font-mono">UID: {customer.firebase_uid.slice(0, 16)}...</p>
                    )}
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
                      <span>Details saved in database! You are ready to checkout with Razorpay.</span>
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
                        Mobile Number (for delivery & OTP) *
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
                    <span>Save Delivery Details & Ready for Razorpay Checkout</span>
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
                        Your completed orders will appear here. Add your favorite streetwear pieces to your cart and proceed to Razorpay checkout!
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
                            {order.status || 'Confirmed (Paid)'}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                          <span>
                            {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          {order.razorpay_payment_id && (
                            <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                              Razorpay: {order.razorpay_payment_id}
                            </span>
                          )}
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
