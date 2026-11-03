import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Database, Sparkles, Image as ImageIcon, ShieldCheck, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card3D from '../3d/Card3D';

const PRESET_IMAGES = [
  {
    name: '1995 Tokyo Biker Leather',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
    category: 'Outerwear',
    price: 360,
    era: '1995 Shibuya Drop'
  },
  {
    name: '1993 Nirvana Single-Stitch Tee',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    category: 'Graphic Tees',
    price: 195,
    era: '1993 Pacific Northwest'
  },
  {
    name: '1997 Okayama Selvedge Denim',
    url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=85',
    category: 'Denim',
    price: 240,
    era: '1997 Kojima Loom'
  },
  {
    name: '1991 OG High Chicago Kicks',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85',
    category: 'Footwear',
    price: 450,
    era: '1991 Deadstock'
  }
];

export default function AddGrailModal({ isOpen, onClose, onGrailAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Thriftzy Archive',
    era: '1997 Archive Run',
    category: 'Outerwear',
    price: 220,
    originalRetail: 520,
    condition: '9.7/10 Mint Vintage',
    size: 'L (Boxy Relaxed)',
    image: PRESET_IMAGES[0].url,
    description: 'Single-needle authentic vintage construction sourced for the Thriftzy Vault.',
    provenance: 'Shibuya Vault, Tokyo',
    isHot: true,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) return;

    setLoading(true);
    try {
      await onGrailAdded({
        ...formData,
        price: Number(formData.price),
        originalRetail: Number(formData.originalRetail) || Number(formData.price) * 2,
        stockLeft: 1,
        viewsCount: Math.floor(Math.random() * 200 + 100),
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E50914', '#FF2E4D', '#FFFFFF']
      });

      onClose();
    } catch (err) {
      alert('Error saving to SQLite database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      image: preset.url,
      category: preset.category,
      price: preset.price,
      era: preset.era,
      originalRetail: Math.round(preset.price * 2.3)
    }));
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1200px' }}
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

        {/* 3D Folding Pop-in Modal */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: 25,
            rotateY: -8,
            scale: 0.88,
            z: -120,
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
            rotateX: -20,
            scale: 0.9,
            z: -100,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 280,
            mass: 0.7,
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-red-500/25 z-10 flex flex-col lg:flex-row gap-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left: 3D Preview of the Item */}
          <div className="lg:w-5/12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                <Database className="w-4 h-4" />
                <span>Live SQLite Insertion</span>
              </div>
              <h3 className="text-xl font-black text-neutral-900">
                Add Grail to Database
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Saved permanently in <code className="text-red-600 font-mono">thriftzy.sqlite</code>
              </p>

              {/* 3D Tilt Card Live Preview */}
              <div className="mt-4">
                <Card3D maxTilt={16} className="w-full">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-md">
                    <img
                      src={formData.image || PRESET_IMAGES[0].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      {formData.era}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                      {formData.condition}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 line-clamp-1">
                          {formData.name || 'Untitled Vintage Grail'}
                        </span>
                        <span className="text-[10px] text-neutral-500">{formData.category} • {formData.size}</span>
                      </div>
                      <span className="font-extrabold text-red-600 text-sm">
                        ${formData.price}
                      </span>
                    </div>
                  </div>
                </Card3D>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Or Click 1-Click Vault Preset:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left text-[11px] p-2 rounded-xl border border-neutral-200 hover:border-red-400 hover:bg-red-50/50 transition-colors"
                    >
                      <span className="font-bold text-neutral-800 block line-clamp-1">{preset.name}</span>
                      <span className="text-[10px] text-red-600 font-semibold">${preset.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ACID Compliant SQLite Storage</span>
            </div>
          </div>

          {/* Right: Form */}
          <form onSubmit={handleSubmit} className="lg:w-7/12 space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                Grail Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 1994 Archive Distressed Moto Racer"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Vault Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Original Retail ($)
                </label>
                <input
                  type="number"
                  value={formData.originalRetail}
                  onChange={(e) => setFormData({ ...formData, originalRetail: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  <option value="Outerwear">Outerwear</option>
                  <option value="Graphic Tees">Graphic Tees</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Denim">Denim</option>
                  <option value="Headwear">Headwear</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Era / Year
                </label>
                <input
                  type="text"
                  value={formData.era}
                  onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                  placeholder="e.g. 1996 Harajuku Run"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Condition Score
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g. 9.8/10 Flawless"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                  Size & Fit
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g. XL (Boxy Cut)"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                Image URL *
              </label>
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                Description & Provenance
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Inserting into SQLite...' : 'Save & Publish to SQLite Database'}</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

