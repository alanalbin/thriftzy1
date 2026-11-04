import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Shield, ShoppingBag, Tag, CheckCircle2, Search, Sparkles, Star, ShieldCheck, LayoutDashboard } from 'lucide-react';
import Card3D from './3d/Card3D';

export default function HeroSection({
  admin = null,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onOpenAddModal,
  featuredCloth,
  totalItemsCount = 0,
  onOpenQuickView,
  onSearchSubmit,
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
              <img src="/assets/thriftzy-pill.jpg" alt="Thriftzy" className="h-4 w-auto rounded object-contain" />
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
              <span className="gradient-text-red">
                Curated Streetwear.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Thriftzy is the tactile 3D marketplace for pre-loved fashion, rare vintage jackets, and streetwear grails. Inspect pieces in 3D, enjoy instant WhatsApp checkout, and browse verified authentic collections.
            </motion.p>

            {/* Hero Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="max-w-md mx-auto lg:mx-0 flex items-center gap-2 p-1.5 rounded-full bg-white border border-neutral-200/90 shadow-lg shadow-red-950/5 focus-within:border-red-500 transition-all"
            >
              <div className="pl-3 text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search vintage tees, jackets, pants..."
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

              {admin ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onOpenAddModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-neutral-950 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-all"
                  >
                    <Plus className="w-4 h-4 text-red-500" />
                    <span>+ Add Cloth (Admin)</span>
                  </motion.button>

                  <button
                    onClick={onOpenAdminDashboard}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-4 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors"
                    title="Open admin dashboard"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-red-600" />
                    <span>Admin Studio</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white border border-neutral-200 text-neutral-800 font-bold text-xs shadow-sm hover:border-red-400 hover:text-red-600 transition-all"
                >
                  <Shield className="w-4 h-4 text-red-500" />
                  <span>Admin Portal</span>
                </button>
              )}
            </motion.div>

            {/* Outcrowd Trust Metrics */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-neutral-600 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Curated Vintage Grails
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant WhatsApp Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dynamic SQLite Inventory
              </span>
            </div>
          </div>

          {/* Right Column: Outcrowd 3D Showcase Card */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-6 -left-6 z-20 hidden sm:block animate-float-3d"
            >
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-red-500/20 text-xs font-bold text-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Authentic Archive</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="absolute -bottom-5 -right-5 z-20 hidden sm:block animate-float-3d"
              style={{ animationDelay: '3s' }}
            >
              <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/30 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Top Rated Vintage</span>
              </div>
            </motion.div>

            {/* 3D Perspective Tilt Card */}
            <Card3D maxTilt={14} className="w-full max-w-md">
              <div className="rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl border border-red-500/15 outcrowd-shadow">
                {featuredCloth ? (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
                      <img
                        src={featuredCloth.image}
                        alt={featuredCloth.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <img
                          src="/assets/thriftzy-box.jpg"
                          alt="Thriftzy"
                          className="h-8 rounded shadow-md border border-white/20"
                        />
                      </div>
                      <div className="absolute top-3 right-3 bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                        {featuredCloth.condition}
                      </div>
                    </div>

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
                          ${featuredCloth.price}
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
                        Thriftzy Store Vault
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                        Explore hand-picked streetwear grails and pre-loved fashion gems.
                      </p>
                    </div>

                    {admin ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onOpenAddModal}
                        className="w-full py-3 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Your First Cloth</span>
                      </motion.button>
                    ) : (
                      <a
                        href="#store-catalog"
                        className="w-full py-3 rounded-2xl bg-neutral-950 text-white text-xs font-bold shadow-md hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Explore Catalog</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </section>
  );
}
