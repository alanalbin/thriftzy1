import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles, Check, Heart, Eye, ArrowRight, Share2, Phone, ShoppingBag, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card3D from '../3d/Card3D';

export default function QuickViewModal({ item, isOpen, onClose, onAddToCart }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCartClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#000000']
    });

    onAddToCart(item);
  };

  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [item.image];

  // WhatsApp direct link generator
  const getWhatsAppLink = () => {
    const phone = (item.contactNumber || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hi, I'm interested in buying your "${item.name}" (Size: ${item.size}, ₹${item.price}) on Thriftzy! Is it still available?`);
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1400px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* 3D Folding Pop-in Modal Window */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: 20,
            rotateY: -6,
            scale: 0.9,
            z: -140,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            z: 0,
          }}
          exit={{
            opacity: 0,
            rotateX: -16,
            scale: 0.92,
            z: -80,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 300,
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-red-500/20 flex flex-col md:flex-row z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm transition-all hover:bg-neutral-900 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: 3D Image Showcase with Card3D Tilt */}
          <div className="relative md:w-1/2 bg-neutral-100 flex flex-col justify-between p-6">
            <div className="flex items-center justify-between mb-3 z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                Size {item.size}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-neutral-800 shadow-sm border border-neutral-200">
                {item.condition}
              </span>
            </div>

            {/* 3D Interactive Tilt Showcase */}
            <Card3D maxTilt={15} className="w-full">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-inner flex items-center justify-center">
                <motion.img
                  key={selectedImg}
                  src={gallery[selectedImg] || item.image}
                  alt={item.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="h-full w-full object-cover"
                />
              </div>
            </Card3D>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-4">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImg === idx
                        ? 'border-red-600 ring-2 ring-red-400/30'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Actions */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  {item.brand || 'Thriftzy'} • {item.category}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.status || 'Available'}
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 leading-snug">
                {item.name}
              </h2>

              {/* Price Row */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-neutral-950">
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </span>
                {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                  <>
                    <span className="text-base text-neutral-400 line-through">
                      ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Save ₹{Math.round(Number(item.originalPrice) - Number(item.price)).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Details Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Size</span>
                  <span className="text-sm font-bold text-neutral-900">{item.size}</span>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Condition</span>
                  <span className="text-sm font-bold text-neutral-900">{item.condition}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Description</span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.description || 'No description provided for this item.'}
                </p>
              </div>

              {/* Contact Seller Info */}
              {item.contactNumber && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">Direct Seller Contact</span>
                      <span className="text-xs font-mono font-bold text-emerald-950">{item.contactNumber}</span>
                    </div>
                  </div>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center gap-3">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                  liked
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
                title="Save to favorites"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleCopyLink}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 text-neutral-600 transition-all hover:border-neutral-400"
                title="Share link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCartClick}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag — ${item.price}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
