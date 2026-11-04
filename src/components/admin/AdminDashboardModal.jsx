import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
  Check,
  RefreshCw,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import {
  adminLogout,
  adminUpdateCredentials,
  adminGetList,
  adminRegister,
  adminDeleteAccount,
  exportDatabaseJSON,
  importDatabaseJSON
} from '../../services/api';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  admin,
  onAdminLogout,
  items = [],
  dbStats,
  onDeleteItem,
  onUpdateItem,
  onOpenAddModal,
  onOpenEditModal,
  onDatabaseReload
}) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'accounts' | 'database'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const fileImportRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'accounts') {
      loadAdmins();
    }
  }, [isOpen, activeTab]);

  const loadAdmins = async () => {
    try {
      const list = await adminGetList();
      setAdminList(list || []);
    } catch (e) {}
  };

  if (!isOpen || !admin) return null;

  // Filtered Inventory items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Handle cloth removal
  const handleDeleteCloth = async (id) => {
    try {
      await onDeleteItem(id);
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Error removing cloth: ' + err.message);
    }
  };

  // Toggle item status between Available and Sold
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Sold' ? 'Available' : 'Sold';
    if (onUpdateItem) {
      await onUpdateItem(item.id, { status: newStatus });
    }
  };

  // Handle Admin Credentials Update (Dynamic email and password)
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredMessage({ text: '', type: '' });

    if (!credForm.currentPassword) {
      setCredMessage({ text: 'Please enter your current password to authorize changes.', type: 'error' });
      return;
    }

    if (!credForm.newEmail && !credForm.newPassword && !credForm.newName) {
      setCredMessage({ text: 'Please provide at least one new value to update (email, password, or name).', type: 'error' });
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

  // Handle Registering Additional Admin
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

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1400px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
        />

        {/* 3D Dashboard Window */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: 16,
            scale: 0.92,
            z: -100,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            scale: 1,
            z: 0,
          }}
          exit={{
            opacity: 0,
            rotateX: -14,
            scale: 0.92,
            z: -60,
          }}
          transition={{
            type: 'spring',
            damping: 26,
            stiffness: 280,
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] bg-white p-5 sm:p-8 shadow-2xl border border-red-500/20 z-10 flex flex-col outcrowd-shadow"
        >
          {/* Top Bar / Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight">
                    Admin Command Center
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-300">
                    Live Session
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span>Logged in as:</span>
                  <strong className="text-neutral-900 font-mono">{admin.email}</strong>
                  <span className="text-neutral-300">•</span>
                  <span className="text-red-600 font-bold uppercase text-[10px]">{admin.role || 'Admin'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/25 hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Cloth</span>
              </motion.button>

              <button
                onClick={() => {
                  if (window.confirm('Sign out from Admin Portal?')) {
                    onAdminLogout();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Inventory</span>
              <span className="text-xl font-black text-neutral-900">{items.length} Clothes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Inventory Valuation</span>
              <span className="text-xl font-black text-red-600">
                ${items.reduce((acc, it) => acc + (Number(it.price) || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Available / Sold</span>
              <span className="text-xs font-bold text-neutral-800">
                {items.filter((c) => c.status !== 'Sold').length} Avail • {items.filter((c) => c.status === 'Sold').length} Sold
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Admin Authentication</span>
              <span className="text-xs font-bold text-emerald-600">Dynamic DB & Hashing</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Clothes Inventory ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'accounts'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Admin Accounts & Password
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'database'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Database Studio & Backup
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {/* TAB 1: INVENTORY (ADD, EDIT, REMOVE CLOTHES) */}
            {activeTab === 'inventory' && (
              <div>
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clothes to manage or delete..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="text-xs font-bold rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-neutral-800 focus:outline-none focus:border-red-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Hoodies & Sweaters">Hoodies & Sweaters</option>
                      <option value="Jackets & Outerwear">Jackets & Outerwear</option>
                      <option value="Pants & Denim">Pants & Denim</option>
                      <option value="Shoes & Sneakers">Shoes & Sneakers</option>
                      <option value="Accessories">Accessories</option>
                    </select>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenAddModal();
                      }}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Cloth</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 p-8">
                    <Tag className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                    <h4 className="font-bold text-neutral-800 text-sm">
                      {items.length === 0 ? 'No Clothes in Store Database Yet' : 'No items match your filter'}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {items.length === 0
                        ? 'Click "+ Add Cloth" above to list your first clothing item into the database!'
                        : 'Try searching with another keyword or resetting the category filter.'}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAddModal();
                      }}
                      className="mt-4 px-5 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                    >
                      + Add New Cloth
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((item) => {
                      const isSold = item.status === 'Sold';
                      const isConfirmingDelete = confirmDeleteId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-red-300 transition-colors"
                        >
                          {/* Item Thumbnail & Details */}
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

                          {/* Price & Action Buttons */}
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

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                onClose();
                                onOpenEditModal?.(item);
                              }}
                              className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:text-red-600 hover:border-red-400 transition-colors"
                              title="Edit cloth details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Remove / Delete Button with Confirmation */}
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
                                className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
                                title="Remove cloth from store"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADMIN ACCOUNTS & PASSWORD (DYNAMIC AUTH) */}
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                {/* Account details card */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">
                        Current Admin Session
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Email: <strong className="text-neutral-800 font-mono">{admin.email}</strong> • Role: <strong className="text-red-600">{admin.role || 'admin'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Change Credentials Form */}
                  <form onSubmit={handleUpdateCredentials} className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3.5">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-600" />
                        <span>Update My Email ID or Password</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Change your email address or set a new password. Enter current password to confirm.
                      </p>
                    </div>

                    {credMessage.text && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                        Current Password * (Required for verification)
                      </label>
                      <input
                        type="password"
                        required
                        value={credForm.currentPassword}
                        onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                        placeholder="Current password"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
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
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
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
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
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
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={credLoading}
                      className="w-full py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {credLoading ? 'Saving Changes...' : 'Save Updated Credentials'}
                    </button>
                  </form>

                  {/* Right: Register Another Admin & Admins List */}
                  <div className="space-y-4">
                    <form onSubmit={handleCreateAdmin} className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-600" />
                          <span>Register Another Admin</span>
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Grant another team member access with their own email & password.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="email"
                          required
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                          placeholder="New admin email"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                        <input
                          type="password"
                          required
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                          placeholder="Password (min 6 chars)"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={newAdminLoading}
                        className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        {newAdminLoading ? 'Registering...' : '+ Create Admin Account'}
                      </button>
                    </form>

                    {/* Active Admins List */}
                    <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Registered Admins in Database ({adminList.length})
                      </h4>
                      {adminList.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-neutral-900">{a.email}</span>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              Role: {a.role || 'admin'} • {a.name || 'Admin'}
                            </span>
                          </div>
                          {adminList.length > 1 && a.id !== admin.id && (
                            <button
                              onClick={() => handleDeleteAdmin(a.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 transition-colors"
                              title="Delete this admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DATABASE STUDIO & BACKUP */}
            {activeTab === 'database' && (
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-600" />
                    <span>Database Status & Storage Layer</span>
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    All clothes, categories, prices, images, and dynamic admin accounts are persisted safely in the SQLite database (`server/thriftzy.sqlite`) with automatic browser synchronization for reliable zero-latency viewing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export */}
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase">
                      <Download className="w-4 h-4" />
                      <span>Export JSON Inventory Backup</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Download all {items.length} listed clothes, photos, and prices into a standalone JSON file.
                    </p>
                    <button
                      onClick={exportDatabaseJSON}
                      className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      Download JSON Backup
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                      <Upload className="w-4 h-4" />
                      <span>Restore Inventory from JSON</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Upload a previously exported JSON backup to immediately restore your items.
                    </p>
                    <input
                      ref={fileImportRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileImportRef.current?.click()}
                      className="w-full py-2.5 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      Select JSON File to Restore
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

