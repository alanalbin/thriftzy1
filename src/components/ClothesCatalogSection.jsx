import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card3D from './3d/Card3D';
import Scroll3DReveal from './3d/Scroll3DReveal';
import { Plus, Eye, ShoppingBag, Tag, SlidersHorizontal, Search, MessageCircle, Phone, Heart, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES, SIZES } from '../data/items';

export default function ClothesCatalogSection({
  clothes = [],
  favorites = [],
  onToggleFavorite,
  onOpenQuickView,
  onAddToCart,
  onOpenAddModal,
  currentCurrency = 'USD',
  showFavoritesOnly = false,
  onResetFavoritesFilter
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under50' | '50to100' | 'over100'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Currency multiplier
  const currencyRates = { USD: 1, EUR: 0.92, GBP: 0.78, INR: 83 };
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

  const formatPrice = (usdAmount) => {
    const rate = currencyRates[currentCurrency] || 1;
    const symbol = currencySymbols[currentCurrency] || '$';
    return `${symbol}${Math.round(Number(usdAmount) * rate)}`;
  };

  // Filter items
  const filteredClothes = clothes.filter((item) => {
    if (showFavoritesOnly && !favorites.includes(item.id)) return false;

    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSize = selectedSize === 'All Sizes' || item.size === selectedSize;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesPrice = true;
    const p = Number(item.price);
    if (priceRange === 'under50') matchesPrice = p < 50;
    if (priceRange === '50to100') matchesPrice = p >= 50 && p <= 100;
    if (priceRange === 'over100') matchesPrice = p > 100;

    return matchesCat && matchesSize && matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const handleAddToCart = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 55,
      origin: { x, y },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']
    });

    onAddToCart(item);
  };

  const getWhatsAppLink = (item) => {
    const phone = (item.contactNumber || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hi, I'm interested in buying your "${item.name}" (Size: ${item.size}, Price: $${item.price}) on Thriftzy!`);
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <section id="store-catalog" className="py-24 bg-[#FAFAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Outcrowd Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>{showFavoritesOnly ? 'Your Favorites' : `Available Clothes (${clothes.length})`}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
              {showFavoritesOnly ? 'Saved Wishlist' : 'Wardrobe'} <span className="gradient-text-red">Collection</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              Authentic clothes listed by sellers. Filter by category, size, or price, or add your own clothes to sell.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {showFavoritesOnly && (
              <button
                onClick={onResetFavoritesFilter}
                className="px-3.5 py-2 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-300 transition-colors"
              >
                Show All Clothes
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ List a Cloth For Sale</span>
            </motion.button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-3.5 py-2 shadow-sm text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-bold text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="newest">Recently Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clothes, brands..."
              className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500 shadow-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Size Filter */}
          <div className="shrink-0 flex items-center gap-2">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="text-xs font-bold rounded-full bg-white border border-neutral-200 px-3.5 py-2 text-neutral-800 focus:outline-none focus:border-red-500 shadow-sm"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="text-xs font-bold rounded-full bg-white border border-neutral-200 px-3.5 py-2 text-neutral-800 focus:outline-none focus:border-red-500 shadow-sm"
            >
              <option value="all">All Prices</option>
              <option value="under50">Under $50</option>
              <option value="50to100">$50 - $100</option>
              <option value="over100">$100+</option>
            </select>
          </div>
        </div>

        {/* Clothes Grid with 3D Tilt Cards */}
        <div className="mt-8">
          {filteredClothes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-neutral-200 p-8 shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {clothes.length === 0 ? 'No Clothes Listed in Database Yet' : 'No clothes match this filter'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                {clothes.length === 0
                  ? 'Your store is ready for real clothes! Upload photos directly from your phone or computer, set your price, and start selling.'
                  : 'Try clearing your search query or choosing another category or size.'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/25 hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ List a Cloth For Sale</span>
                </button>
                {clothes.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSelectedSize('All Sizes');
                      setPriceRange('all');
                      setSearchQuery('');
                    }}
                    className="px-5 py-3 rounded-full bg-neutral-100 text-neutral-700 font-bold text-xs hover:bg-neutral-200"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Clothes Grid with Outcrowd 3D Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence>
                {filteredClothes.map((item, idx) => {
                  const isFavorited = favorites.includes(item.id);
                  return (
                    <Scroll3DReveal key={item.id} intensity={15} delay={idx * 0.04}>
                      <Card3D maxTilt={13} className="h-full">
                        <div className="h-full flex flex-col justify-between group rounded-[28px] bg-white border border-neutral-200/90 shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-red-400/50 outcrowd-shadow">
                          <div>
                            {/* Image Box */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 rounded-t-[28px]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />

                              {/* Size Badge (Outcrowd Elevated) */}
                              <div
                                style={{ transform: 'translateZ(30px)' }}
                                className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase"
                              >
                                Size {item.size}
                              </div>

                              {/* Wishlist Heart Toggle (Outcrowd Squishy Button) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(item.id);
                                }}
                                style={{ transform: 'translateZ(35px)' }}
                                className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-md transition-all hover:scale-110 ${
                                  isFavorited ? 'text-red-600' : 'text-neutral-400 hover:text-red-600'
                                }`}
                                title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                              >
                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                              </button>

                              {/* Condition Tag */}
                              <div
                                style={{ transform: 'translateZ(30px)' }}
                                className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white shadow-md"
                              >
                                {item.condition}
                              </div>

                              {/* Hover Quick View Overlay */}
                              <div className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => onOpenQuickView(item)}
                                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-neutral-900 text-xs font-bold shadow-xl transition-transform"
                                >
                                  <Eye className="w-4 h-4 text-red-600" />
                                  <span>3D Quick View</span>
                                </motion.button>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500">
                                <span className="text-red-600 uppercase tracking-wider">
                                  {item.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span>{item.rating || '5.0'}</span>
                                </div>
                              </div>

                              <h3 className="mt-1 text-base font-bold text-neutral-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                                {item.name}
                              </h3>

                              {item.description && (
                                <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}

                              {item.contactNumber && (
                                <div className="mt-3 flex items-center justify-between text-[11px]">
                                  <span className="text-neutral-500">Brand: <strong className="text-neutral-800">{item.brand || 'Thriftzy'}</strong></span>
                                  <a
                                    href={getWhatsAppLink(item)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom Bar: Price & Action */}
                          <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between">
                            <div>
                              {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                <span className="text-[10px] text-neutral-400 block line-through leading-none">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                              <span className="text-xl font-black text-neutral-950">
                                {formatPrice(item.price)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenQuickView(item)}
                                className="p-2.5 rounded-full border border-neutral-200 text-neutral-700 hover:border-red-400 hover:text-red-600 transition-colors"
                                title="Inspect 3D details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleAddToCart(e, item)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Bag</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </Card3D>
                    </Scroll3DReveal>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
