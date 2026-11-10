import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart, Sparkles, User, Check } from 'lucide-react';

export default function Navbar({
  cartCount = 0,
  favoritesCount = 0,
  onOpenCart,
  onToggleFavoritesFilter,
  showFavoritesOnly = false,
  customer = null,
  onOpenCustomerProfile = null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/95 border-b border-neutral-200/80 shadow-sm transition-all">
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo (Bigger & Crisp) */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <motion.img
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                src="/assets/thriftzy-pill.jpg"
                alt="Thriftzy Logo"
                className="h-12 sm:h-16 md:h-18 w-auto object-contain drop-shadow-sm"
              />
              <span className="sr-only">Thriftzy</span>
            </a>
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

          {/* Right Actions: Google Account & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Google Profile Button */}
            {customer ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenCustomerProfile}
                className="flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200 transition-all text-xs font-bold shadow-sm"
                title="Customer Profile & Orders"
              >
                <img
                  src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                  alt={customer.name}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span className="max-w-[100px] sm:max-w-[120px] truncate">{customer.name}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Online & Synced" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenCustomerProfile}
                className="flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 bg-white border border-neutral-300 text-neutral-800 hover:border-blue-500 hover:text-blue-600 text-xs font-bold transition-all shadow-sm"
                title="Sign in with Google"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Sign in with</span>
                <span>Google</span>
              </motion.button>
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCustomerProfile?.();
            }}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-white border-2 border-neutral-200 text-neutral-900 font-extrabold py-3 text-xs shadow-sm"
          >
            {customer ? (
              <>
                <img
                  src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                  alt={customer.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>Profile: {customer.name}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign in with Google</span>
              </>
            )}
          </button>

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
