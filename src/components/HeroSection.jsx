import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, CheckCircle2, Search, Sparkles, Star, ShieldCheck, User } from 'lucide-react';
import Card3D from './3d/Card3D';

export default function HeroSection({
  featuredCloth,
  totalItemsCount = 0,
  onOpenQuickView,
  onSearchSubmit,
  customer = null,
  onOpenCustomerProfile = null
}) {
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(heroSearch);
      const target = document.getElementById('store-catalog');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-10 pb-24 overflow-hidden hero-mesh">
      {/* Floating 3D Background Spheres & Glows */}
      <div className="absolute top-12 left-10 w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 to-rose-300/10 blur-xl pointer-events-none animate-float-3d" />
      <div className="absolute top-1/3 right-12 w-44 h-44 rounded-full bg-gradient-to-br from-red-600/15 to-amber-200/20 blur-2xl pointer-events-none animate-float-3d" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-10 left-1/3 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Outcrowd Hero Typography & Controls */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Outcrowd Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-red-500/20 text-xs font-bold"
            >
              <img src="/assets/thriftzy-pill.jpg" alt="Thriftzy" className="h-4 w-auto object-contain" />
              <span className="text-neutral-900">Curated Streetwear & Vintage Archive</span>
              <span className="text-neutral-300">|</span>
              <span className="text-red-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Outcrowd 3D Architecture
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 uppercase leading-[1.04]"
            >
              Cop Rare Vintage. <br />
              <span className="gradient-text-red">Wear the Culture.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 font-medium"
            >
              Every garment is an authentic, one-of-one vintage piece. Log in with your Google account to save your delivery address, add clothes to your bag, and order directly in rupees (₹).
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="max-w-md mx-auto lg:mx-0 flex items-center gap-2 p-2 rounded-full bg-white shadow-xl shadow-neutral-950/5 border border-neutral-200"
            >
              <Search className="w-5 h-5 text-neutral-400 ml-3" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search vintage tees, jackets, hoodies..."
                className="w-full text-xs font-medium text-neutral-800 placeholder:text-neutral-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                Search
              </button>
            </motion.form>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              <a
                href="#store-catalog"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-xs shadow-xl shadow-red-500/30 transition-all hover:shadow-2xl hover:shadow-red-500/40"
              >
                <span>Browse Collection ({totalItemsCount})</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {customer ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenCustomerProfile}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-white border border-neutral-200 text-neutral-900 font-bold text-xs shadow-sm hover:border-red-400 hover:text-red-600 transition-all"
                >
                  <img
                    src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                    alt={customer.name}
                    className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                  />
                  <span>Hi, {customer.name}</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenCustomerProfile}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-white border-2 border-neutral-200 hover:border-blue-500 hover:bg-neutral-50 text-neutral-900 font-extrabold text-xs shadow-sm hover:shadow-md transition-all"
                >
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
                </motion.button>
              )}
            </motion.div>

            {/* Trust Metrics */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-neutral-600 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Genuine Vintage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Razorpay & UPI Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Shipping Over ₹999
              </span>
            </div>
          </div>

          {/* Right Column: 3D Interactive Card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-sm sm:max-w-md"
            >
              <Card3D maxTilt={14} className="w-full">
                <div className="rounded-[32px] bg-white p-4 sm:p-5 shadow-2xl border border-red-500/15 outcrowd-shadow relative overflow-hidden group">
                  {featuredCloth ? (
                    <div className="space-y-4">
                      {/* Image Frame */}
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-inner">
                        <img
                          src={featuredCloth.image}
                          alt={featuredCloth.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Staff Pick</span>
                        </div>
                      </div>

                      {/* Content & Price */}
                      <div className="p-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                            {featuredCloth.category} • Size {featuredCloth.size}
                          </span>
                          <h3 className="text-base font-bold text-neutral-900 mt-0.5 line-clamp-1">
                            {featuredCloth.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-red-600">
                            ₹{Number(featuredCloth.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onOpenQuickView(featuredCloth)}
                        className="w-full py-3 rounded-2xl bg-neutral-950 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Inspect 3D Details & Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-6 px-4">
                      <div className="relative mx-auto max-w-[220px] rounded-2xl overflow-hidden shadow-xl border border-red-200">
                        <img
                          src="/assets/thriftzy-poster.jpg"
                          alt="Thriftzy Poster"
                          className="w-full h-auto object-cover"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">
                          Thriftzy Streetwear Vault
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                          New drops are coming soon! Sign in with your Google account to stay ready for instant checkout.
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200">
                          <Sparkles className="w-3.5 h-3.5 text-red-600" />
                          <span>Curated Indian Streetwear Collection</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card3D>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
