import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, Plus, Shield, Sparkles, Heart, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({
  admin = null,
  onNavigateAdmin,
  onOpenAddModal,
  onAdminLogout,
  cartCount = 0,
  favoritesCount = 0,
  currentCurrency = 'USD',
  onCurrencyChange,
  onOpenCart,
  onToggleFavoritesFilter,
  showFavoritesOnly = false,
  dbItemCount = 0,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
  ];

  const adminName = admin ? (admin.name || admin.email.split('@')[0]) : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/95 border-b border-red-500/10 shadow-sm transition-all">
      {/* Top Outcrowd Ticker Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white py-1.5 px-4 text-center text-[11px] font-bold tracking-wider uppercase overflow-hidden">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-red-200" />
            THRIFTZY // STREETWEAR & VINTAGE VAULT
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">SQLITE PERSISTENT DATABASE & 3D TACTILE STORE</span>
          <span className="hidden sm:inline">•</span>
          <span>FREE WORLDWIDE SHIPPING OVER $120</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo: Clean without border */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <motion.img
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                src="/assets/thriftzy-pill.jpg"
                alt="Thriftzy Logo"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <span className="sr-only">Thriftzy</span>
            </a>

            {/* Admin Status Pill (if logged in) */}
            {admin && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onNavigateAdmin}
                className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all outcrowd-shadow"
                title="Go to Admin Page"
              >
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span>Admin: {adminName}</span>
              </motion.button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <a href="#store-catalog" className="transition-colors hover:text-red-600">
              Shop Clothes
            </a>
            <button
              onClick={onToggleFavoritesFilter}
              className={`flex items-center gap-1 transition-colors ${
                showFavoritesOnly ? 'text-red-600 font-extrabold' : 'hover:text-red-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-red-600 text-red-600' : ''}`} />
              <span>Favorites ({favoritesCount})</span>
            </button>
            <a href="#how-it-works" className="transition-colors hover:text-red-600">
              How It Works
            </a>
            <a href="#about" className="transition-colors hover:text-red-600">
              Our Story
            </a>
            <a href="#faq" className="transition-colors hover:text-red-600">
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-full px-2 py-1 text-xs font-bold text-neutral-700 border border-neutral-200">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => onCurrencyChange?.(curr.code)}
                  className={`px-1.5 py-0.5 rounded-full transition-all ${
                    currentCurrency === curr.code
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {curr.symbol}
                </button>
              ))}
            </div>

            {/* Product Add Button on Homepage */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
              title="Add a new cloth"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Cloth</span>
            </motion.button>

            {/* Admin Portal Page Button (Navigates to dedicated /admin page) */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onNavigateAdmin}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                admin
                  ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200 hover:border-red-400 hover:text-red-600'
              }`}
              title="Go to Admin Page"
            >
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>{admin ? 'Admin Studio' : 'Admin Portal'}</span>
            </motion.button>

            {admin && (
              <button
                onClick={onAdminLogout}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Cart Trigger */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white transition-all hover:bg-red-600 shadow-md"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-neutral-100 bg-white px-4 py-4 space-y-3"
        >
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAddModal();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 text-white font-bold py-2.5 text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Cloth
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-950 text-white font-bold py-2.5 text-xs shadow-md"
            >
              <Shield className="w-3.5 h-3.5 text-red-500" /> Admin Page
            </button>
          </div>

          <a
            href="#store-catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-800 py-1"
          >
            Shop Clothes
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onToggleFavoritesFilter?.();
            }}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-800 py-1"
          >
            Favorites ({favoritesCount})
          </button>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-800 py-1"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-800 py-1"
          >
            Our Story
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-800 py-1"
          >
            FAQ
          </a>
        </motion.div>
      )}
    </header>
  );
}
