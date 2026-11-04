import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  AlertCircle,
  Database,
  Download,
  Upload,
  User,
  Mail,
  Lock,
  LogOut,
  Tag,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Camera,
  SlidersHorizontal,
  DollarSign,
  Phone,
  RefreshCw,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Card3D from '../3d/Card3D';
import { CATEGORIES, SIZES, CONDITIONS } from '../../data/items';
import {
  adminLogin,
  adminRegister,
  adminLogout,
  adminUpdateCredentials,
  adminGetList,
  adminDeleteAccount,
  exportDatabaseJSON,
  importDatabaseJSON
} from '../../services/api';

export default function AdminPage({
  admin,
  onAdminLoginSuccess,
  onAdminLogout,
  onNavigateHome,
  clothes = [],
  dbStats,
  onClothAdded,
  onClothUpdated,
  onDeleteItem,
  onOpenQuickView,
  onDatabaseReload
}) {
  // Login / Register state if not authenticated
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Dashboard Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(true);

  // New Cloth Form State (for adding directly on first page of admin page)
  const [newCloth, setNewCloth] = useState({
    name: '',
    category: 'T-Shirts',
    brand: 'Thriftzy',
    price: '',
    originalPrice: '',
    size: 'M',
    condition: 'Like New (Mint)',
    description: '',
    contactNumber: '',
    image: '',
    status: 'Available',
  });
  const [clothImagePreview, setClothImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingCloth, setIsAddingCloth] = useState(false);
  const fileInputRef = useRef(null);
  const fileImportRef = useRef(null);

  // Dynamic Credentials Form State
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    newName: ''
  });
  const [credLoading, setCredLoading] = useState(false);
  const [credMessage, setCredMessage] = useState({ text: '', type: '' });

  // Additional Admin Registration State
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [newAdminLoading, setNewAdminLoading] = useState(false);
  const [adminList, setAdminList] = useState([]);

  // Load admins list if logged in
  useEffect(() => {
    if (admin) {
      loadAdmins();
    }
  }, [admin]);

  const loadAdmins = async () => {
    try {
      const list = await adminGetList();
      setAdminList(list || []);
    } catch (e) {}
  };

  // Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please provide both email ID and password.');
      return;
    }

    if (authMode === 'register') {
      if (authPassword.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      let session;
      if (authMode === 'login') {
        session = await adminLogin(authEmail, authPassword);
        setAuthSuccess(`Welcome back, ${session.admin.name || session.admin.email}!`);
      } else {
        session = await adminRegister(authEmail, authPassword, authName || 'Admin');
        setAuthSuccess(`Admin account created successfully! Signed in as ${session.admin.email}`);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']
      });

      onAdminLoginSuccess(session.admin);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setAuthEmail('admin@thriftzy.store');
    setAuthPassword('adminpassword123');
    setAuthError('');
  };

  // File Upload Handlers for Adding Cloth
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setClothImagePreview(base64Url);
      setNewCloth((prev) => ({ ...prev, image: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateClothSubmit = async (e) => {
    e.preventDefault();
    if (!newCloth.name.trim()) {
      alert('Please enter a title for the cloth.');
      return;
    }
    if (!newCloth.price) {
      alert('Please enter a selling price.');
      return;
    }
    if (!newCloth.image) {
      alert('Please upload a photo of the cloth.');
      return;
    }

    setIsAddingCloth(true);
    try {
      await onClothAdded({
        ...newCloth,
        price: Number(newCloth.price),
        originalPrice: newCloth.originalPrice ? Number(newCloth.originalPrice) : null,
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#000000']
      });

      // Reset
      setNewCloth({
        name: '',
        category: 'T-Shirts',
        brand: 'Thriftzy',
        price: '',
        originalPrice: '',
        size: 'M',
        condition: 'Like New (Mint)',
        description: '',
        contactNumber: '',
        image: '',
        status: 'Available',
      });
      setClothImagePreview('');
      alert('Success! New cloth was added to the database and is live on the store.');
    } catch (err) {
      alert('Error adding cloth: ' + err.message);
    } finally {
      setIsAddingCloth(false);
    }
  };

  // Delete Cloth Handler
  const handleDeleteCloth = async (id) => {
    try {
      await onDeleteItem(id);
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Error removing cloth: ' + err.message);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Sold' ? 'Available' : 'Sold';
    await onClothUpdated(item.id, { status: newStatus });
  };

  // Update Credentials Handler
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredMessage({ text: '', type: '' });

    if (!credForm.currentPassword) {
      setCredMessage({ text: 'Please enter your current password to authorize changes.', type: 'error' });
      return;
    }

    if (!credForm.newEmail && !credForm.newPassword && !credForm.newName) {
      setCredMessage({ text: 'Please provide at least one new value to update.', type: 'error' });
      return;
    }

    setCredLoading(true);
    try {
      const updated = await adminUpdateCredentials({
        currentPassword: credForm.currentPassword,
        email: credForm.newEmail || undefined,
        password: credForm.newPassword || undefined,
        name: credForm.newName || undefined
      });

      setCredMessage({
        text: `Success! Admin credentials updated for ${updated.email}.`,
        type: 'success'
      });
      setCredForm({ currentPassword: '', newEmail: '', newPassword: '', newName: '' });
      loadAdmins();
    } catch (err) {
      setCredMessage({ text: err.message || 'Failed to update credentials.', type: 'error' });
    } finally {
      setCredLoading(false);
    }
  };

  // Register Another Admin Handler
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminForm.email || !newAdminForm.password) {
      alert('Email ID and password are required.');
      return;
    }
    setNewAdminLoading(true);
    try {
      await adminRegister(newAdminForm.email, newAdminForm.password, newAdminForm.name || 'Admin');
      alert(`Admin account created for ${newAdminForm.email}!`);
      setNewAdminForm({ email: '', password: '', name: '' });
      loadAdmins();
    } catch (err) {
      alert('Error creating admin: ' + err.message);
    } finally {
      setNewAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      try {
        await adminDeleteAccount(adminId);
        loadAdmins();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // JSON Import
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const imported = importDatabaseJSON(json);
        onDatabaseReload?.(imported);
        alert(`Successfully imported ${imported.length} clothes into store database!`);
      } catch (err) {
        alert('Failed to parse JSON backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Filtered clothes
  const filteredClothes = clothes.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-neutral-900 pb-24">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/95 border-b border-red-500/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo: Clean without border */}
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2 group transition-transform hover:scale-105"
                title="Return to Storefront"
              >
                <img
                  src="/assets/thriftzy-pill.jpg"
                  alt="Thriftzy Logo"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Admin Command Portal
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-300">
                  SQLite Database Live
                </span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:text-red-600 hover:border-red-400 text-xs font-bold transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Storefront View</span>
              </button>

              {admin && (
                <button
                  onClick={() => {
                    if (window.confirm('Sign out from Admin Portal?')) {
                      onAdminLogout();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Logout ({admin.name || admin.email.split('@')[0]})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!admin ? (
          /* =====================================================================
             1. IF NOT LOGGED IN: DEDICATED FULL-PAGE ADMIN LOGIN & REGISTRATION
             ===================================================================== */
          <div className="py-12 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ perspective: '1400px' }}
              className="w-full max-w-md"
            >
              <Card3D maxTilt={10} className="w-full">
                <div className="rounded-[32px] bg-white p-7 sm:p-9 shadow-2xl border border-red-500/20 outcrowd-shadow">
                  {/* Emblem */}
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/35 mb-3.5">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
                      Admin <span className="gradient-text-red">Portal</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                      Dynamic credentials authentication. Manage clothes inventory, photos, and store records.
                    </p>
                  </div>

                  {/* Mode Tabs */}
                  <div className="mt-6 grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                        authMode === 'login'
                          ? 'bg-white text-neutral-950 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                        authMode === 'register'
                          ? 'bg-white text-neutral-950 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      + Register New Admin
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {authError && (
                    <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  {/* Auth Form */}
                  <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
                    {authMode === 'register' && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Full Name / Admin Title
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="e.g. Albin Manager"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Admin Email ID *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="admin@thriftzy.store"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={authLoading}
                      type="submit"
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all disabled:opacity-50"
                    >
                      <span>{authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In as Admin' : 'Create Admin Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>

                  {/* Demo fill button */}
                  {authMode === 'login' && (
                    <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
                      <span className="text-[11px] text-neutral-400 block mb-1.5">
                        Initial dynamic admin account ready in database:
                      </span>
                      <button
                        type="button"
                        onClick={fillDemoAdmin}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-mono transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-600" />
                        <span>admin@thriftzy.store / adminpassword123</span>
                      </button>
                    </div>
                  )}
                </div>
              </Card3D>
            </motion.div>
          </div>
        ) : (
          /* =====================================================================
             2. IF LOGGED IN: FIRST PAGE ON ADMIN PAGE
                - METRICS
                - PRODUCT ADD (DIRECT PHOTO & DETAILS TO DATABASE)
                - PRODUCT DELETE & VIEW (LIVE INVENTORY TABLE)
                - DYNAMIC ADMIN CREDENTIALS & DATABASE BACKUP
             ===================================================================== */
          <div className="space-y-8">
            {/* Row 1: Real-time Database Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm outcrowd-shadow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Clothes in DB</span>
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1 block">{clothes.length} Pieces</span>
                <span className="text-[11px] text-neutral-500 font-medium">Stored directly in SQLite</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm outcrowd-shadow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Inventory Valuation</span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">
                  ${clothes.reduce((acc, it) => acc + (Number(it.price) || 0), 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">Active wardrobe value</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm outcrowd-shadow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Status Breakdown</span>
                <span className="text-sm font-bold text-neutral-900 mt-2 block">
                  <span className="text-emerald-600 font-extrabold">{clothes.filter((c) => c.status !== 'Sold').length} Available</span> •{' '}
                  <span className="text-neutral-500 font-extrabold">{clothes.filter((c) => c.status === 'Sold').length} Sold</span>
                </span>
                <span className="text-[11px] text-neutral-400">1-click status toggles</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm outcrowd-shadow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Admin Session</span>
                <span className="text-xs font-mono font-bold text-neutral-900 mt-2 block truncate">
                  {admin.email}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Dynamic Hashed Session
                </span>
              </div>
            </div>

            {/* Row 2: FIRST PAGE PRODUCT ADD STUDIO */}
            <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-red-500/20 shadow-xl outcrowd-shadow">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight">
                      Add a New Cloth to Database
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Upload high-res photos and set clothing details. It is saved directly in SQLite and shows live immediately.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                  className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                >
                  {isAddFormOpen ? 'Collapse Studio' : '+ Expand Add Form'}
                </button>
              </div>

              {isAddFormOpen && (
                <form onSubmit={handleCreateClothSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Photo Upload & 3D Live Card Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Cloth Photo & 3D Live Card Preview *
                    </label>

                    {/* Drag and Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                      }}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                        isDragging ? 'border-red-500 bg-red-50' : 'border-neutral-300 hover:border-red-400 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-red-600">Click to upload photo</span>
                          <span className="text-neutral-500"> or drag & drop</span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          PNG, JPG, WebP stored permanently in database
                        </span>
                      </div>
                    </div>

                    {/* Image URL fallback */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase">Or URL:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newCloth.image.startsWith('data:') ? '' : newCloth.image}
                        onChange={(e) => {
                          const url = e.target.value;
                          setClothImagePreview(url);
                          setNewCloth({ ...newCloth, image: url });
                        }}
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* 3D Tilt Card Preview */}
                    <Card3D maxTilt={14} className="w-full">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-md flex items-center justify-center">
                        {clothImagePreview ? (
                          <img
                            src={clothImagePreview}
                            alt="Cloth Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-6 text-neutral-400">
                            <Camera className="w-10 h-10 mx-auto mb-2 opacity-50 text-red-500" />
                            <span className="text-xs font-semibold block">Photo preview will appear here</span>
                            <span className="text-[10px]">Select a file from your device</span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                          {newCloth.size || 'Size M'}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow">
                          {newCloth.condition}
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-between text-xs shadow-md">
                          <div>
                            <span className="font-bold text-neutral-900 block line-clamp-1">
                              {newCloth.name || 'Title of Cloth'}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                              {newCloth.brand || 'Thriftzy'} • {newCloth.category}
                            </span>
                          </div>
                          <span className="font-extrabold text-red-600 text-base">
                            ${newCloth.price || '0'}
                          </span>
                        </div>
                      </div>
                    </Card3D>
                  </div>

                  {/* Right Column: Cloth Details Form */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Cloth Title */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Cloth Title / Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCloth.name}
                        onChange={(e) => setNewCloth({ ...newCloth, name: e.target.value })}
                        placeholder="e.g. Vintage 1994 Harley Davidson Eagle Biker Tee"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Category *
                        </label>
                        <select
                          value={newCloth.category}
                          onChange={(e) => setNewCloth({ ...newCloth, category: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        >
                          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Brand / Label
                        </label>
                        <input
                          type="text"
                          value={newCloth.brand}
                          onChange={(e) => setNewCloth({ ...newCloth, brand: e.target.value })}
                          placeholder="e.g. Nike / Thriftzy / Carhartt"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Price & Original Price */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Selling Price ($) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="any"
                          value={newCloth.price}
                          onChange={(e) => setNewCloth({ ...newCloth, price: e.target.value })}
                          placeholder="65"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 font-bold focus:border-red-500 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Original Price ($ optional)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={newCloth.originalPrice}
                          onChange={(e) => setNewCloth({ ...newCloth, originalPrice: e.target.value })}
                          placeholder="120"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Size & Condition */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Size *
                        </label>
                        <select
                          value={newCloth.size}
                          onChange={(e) => setNewCloth({ ...newCloth, size: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        >
                          {SIZES.filter((s) => s !== 'All Sizes').map((sz) => (
                            <option key={sz} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Condition *
                        </label>
                        <select
                          value={newCloth.condition}
                          onChange={(e) => setNewCloth({ ...newCloth, condition: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        >
                          {CONDITIONS.map((cond) => (
                            <option key={cond} value={cond}>
                              {cond}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status & Contact */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Inventory Status
                        </label>
                        <select
                          value={newCloth.status}
                          onChange={(e) => setNewCloth({ ...newCloth, status: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        >
                          <option value="Available">Available for Sale</option>
                          <option value="Sold">Sold / Reserved</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Contact (for buyers)</span>
                        </label>
                        <input
                          type="text"
                          value={newCloth.contactNumber}
                          onChange={(e) => setNewCloth({ ...newCloth, contactNumber: e.target.value })}
                          placeholder="+1 555-0199"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Description & Flaws (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={newCloth.description}
                        onChange={(e) => setNewCloth({ ...newCloth, description: e.target.value })}
                        placeholder="Mention fit, cotton weight, measurements, or any vintage fade..."
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none resize-none"
                      />
                    </div>

                    {/* Publish Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isAddingCloth}
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAddingCloth ? 'Saving to Database...' : '+ Publish Cloth to Database'}</span>
                    </motion.button>
                  </div>
                </form>
              )}
            </div>

            {/* Row 3: FIRST PAGE PRODUCT VIEW & DELETE INVENTORY TABLE */}
            <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-neutral-200/90 shadow-xl outcrowd-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                    <span>Manage Clothes Inventory</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                      {filteredClothes.length} Listed
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    View 3D cards, toggle Available / Sold, or delete clothes directly from SQLite database.
                  </p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clothes..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs font-bold rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-neutral-800 focus:outline-none focus:border-red-500"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-5">
                {filteredClothes.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 p-8">
                    <Tag className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                    <h4 className="font-bold text-neutral-800 text-sm">No Clothes Found</h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      Use the "Add a New Cloth" studio above to add your first clothing item into the database!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredClothes.map((item) => {
                      const isSold = item.status === 'Sold';
                      const isConfirmingDelete = confirmDeleteId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-red-300 transition-colors"
                        >
                          {/* Image & Details */}
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              {isSold && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-white uppercase">
                                  Sold
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-sm text-neutral-900">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                  {item.category}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                                  Size {item.size}
                                </span>
                                <button
                                  onClick={() => handleToggleStatus(item)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                    isSold
                                      ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {item.status || 'Available'} (Toggle)
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                                <span className="font-mono text-[11px]">ID: {item.id}</span>
                                <span>•</span>
                                <span>Brand: <strong className="text-neutral-700">{item.brand || 'Thriftzy'}</strong></span>
                                <span>•</span>
                                <span>Condition: <strong className="text-neutral-700">{item.condition}</strong></span>
                                {item.contactNumber && (
                                  <>
                                    <span>•</span>
                                    <span>WhatsApp: <strong className="text-neutral-700">{item.contactNumber}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price & Actions: View, Toggle, Delete */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                            <div className="text-left sm:text-right">
                              {item.originalPrice && (
                                <span className="text-[11px] text-neutral-400 line-through block">
                                  ${item.originalPrice}
                                </span>
                              )}
                              <span className="text-lg font-black text-neutral-900">
                                ${item.price}
                              </span>
                            </div>

                            {/* View 3D Button */}
                            <button
                              onClick={() => onOpenQuickView(item)}
                              className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:text-red-600 hover:border-red-400 transition-colors flex items-center gap-1 text-xs font-bold"
                              title="Inspect 3D Quick View"
                            >
                              <Eye className="w-4 h-4 text-red-600" />
                              <span className="hidden md:inline">View 3D</span>
                            </button>

                            {/* Delete Product Button */}
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleDeleteCloth(item.id)}
                                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1.5 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(item.id)}
                                className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-bold"
                                title="Delete cloth from database"
                              >
                                <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-600" />
                                <span className="hidden md:inline">Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: DYNAMIC ADMIN CREDENTIALS & TEAM MANAGEMENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Change My Credentials Form */}
              <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-neutral-200/90 shadow-xl outcrowd-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      Update My Email ID or Password
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Change your email or set a new password dynamically in the database.
                    </p>
                  </div>
                </div>

                {credMessage.text && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
                      credMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {credMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{credMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCredentials} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                      Current Password * (to authorize changes)
                    </label>
                    <input
                      type="password"
                      required
                      value={credForm.currentPassword}
                      onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                      placeholder="Current password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                      New Email ID (optional)
                    </label>
                    <input
                      type="email"
                      value={credForm.newEmail}
                      onChange={(e) => setCredForm({ ...credForm, newEmail: e.target.value })}
                      placeholder="Leave blank to keep current email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                      New Password (optional, min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={credForm.newPassword}
                      onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                      Display Name (optional)
                    </label>
                    <input
                      type="text"
                      value={credForm.newName}
                      onChange={(e) => setCredForm({ ...credForm, newName: e.target.value })}
                      placeholder="e.g. Albin Manager"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={credLoading}
                    className="w-full py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {credLoading ? 'Saving Changes...' : 'Save Updated Credentials'}
                  </button>
                </form>
              </div>

              {/* Register Another Admin & Database Portability */}
              <div className="space-y-6">
                <form onSubmit={handleCreateAdmin} className="p-6 sm:p-8 rounded-[32px] bg-white border border-neutral-200/90 shadow-xl outcrowd-shadow space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">
                        Register Another Admin
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Create another admin account with their own email ID and password.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                      placeholder="New admin email ID"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                    <input
                      type="password"
                      required
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      placeholder="Password (min 6 chars)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={newAdminLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    {newAdminLoading ? 'Registering...' : '+ Create Admin Account'}
                  </button>
                </form>

                {/* Database Backup & Restore */}
                <div className="p-6 rounded-[32px] bg-neutral-50 border border-neutral-200/90 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-red-600" />
                    <span>Database Backup Studio</span>
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Export your entire clothes inventory as a JSON file or restore it anytime.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={exportDatabaseJSON}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                    <input
                      ref={fileImportRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileImportRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Restore Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

