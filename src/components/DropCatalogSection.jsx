import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card3D from './3d/Card3D';
import Scroll3DReveal from './3d/Scroll3DReveal';
import { Sparkles, Eye, ShoppingBag, ShieldCheck, Flame, SlidersHorizontal, Plus, Database } from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = ['All', 'Outerwear', 'Graphic Tees', 'Footwear', 'Denim'];

export default function DropCatalogSection({
  items = [],
  onOpenQuickView,
  onAddToCart,
  onOpenAddModal,
  onOpenDbModal
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'hyped') return (b.viewsCount || 0) - (a.viewsCount || 0);
    return 0;
  });

  const handleAdd = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { x, y },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']
    });

    onAddToCart(item);
  };

  return (
    <section id="drops-catalog" className="py-24 bg-[#FAFAFC] relative overflow-hidden">
      {/* Red ambient glows */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span>Live SQLite Vault ({items.length} Grails)</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
              Curated Vintage <span className="gradient-text-red">Archive Grails</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              Strictly 1-of-1 pieces stored in our persistent SQLite database. Rendered with 3D interactive physics.
            </p>
          </div>

          {/* Action buttons & Sort Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDbModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-bold shadow-sm hover:border-red-400 hover:text-red-600 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-red-600" />
              <span>DB Stats</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold rounded-xl bg-white border border-neutral-200 px-3 py-2 text-neutral-800 focus:outline-none focus:border-red-500 shadow-sm"
              >
                <option value="featured">Featured Grails</option>
                <option value="hyped">Most Hyped Views</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs text-neutral-400 font-medium ml-auto hidden sm:inline">
            Showing {filteredItems.length} items from SQLite
          </span>
        </div>

        {/* Product Cards Grid with 3D Tilt & 3D Scroll Reveal Animations */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <Scroll3DReveal key={item.id} intensity={18} delay={idx * 0.05}>
                <Card3D maxTilt={14} className="h-full">
                  <div className="h-full flex flex-col justify-between group rounded-3xl bg-white border border-neutral-200/80 shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-red-400/40">
                    <div>
                      {/* Image Container with Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 rounded-t-3xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Drop status badge (3D elevated) */}
                        <div
                          style={{ transform: 'translateZ(30px)' }}
                          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-md"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          {item.dropStatus}
                        </div>

                        {/* Condition Chip (3D elevated) */}
                        <div
                          style={{ transform: 'translateZ(30px)' }}
                          className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-bold text-neutral-800 shadow-md"
                        >
                          {item.condition}
                        </div>

                        {/* Quick View Overlay Button on Hover */}
                        <div className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onOpenQuickView(item)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-neutral-900 text-xs font-bold shadow-xl transition-transform"
                          >
                            <Eye className="w-4 h-4 text-red-600" />
                            <span>3D Quick View</span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                          <span className="text-red-600 uppercase tracking-wider font-bold">
                            {item.era}
                          </span>
                          <span>Size: {item.size}</span>
                        </div>

                        <h3 className="mt-1.5 text-base font-bold text-neutral-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">{item.provenance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom / Price & CTA */}
                    <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 block line-through leading-none">
                          ${item.originalRetail}
                        </span>
                        <span className="text-xl font-extrabold text-neutral-950">
                          ${item.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenQuickView(item)}
                          className="p-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:border-red-400 hover:text-red-600 transition-colors"
                          title="Inspect 3D grail details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAdd(e, item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Cop Grail</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </Scroll3DReveal>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
