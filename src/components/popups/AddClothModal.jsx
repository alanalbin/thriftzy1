import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Camera, Image as ImageIcon, ShieldCheck, Tag, Phone, Save, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card3D from '../3d/Card3D';
import { CATEGORIES, SIZES, CONDITIONS } from '../../data/items';

export default function AddClothModal({
  isOpen,
  onClose,
  onClothAdded,
  onClothUpdated,
  initialCloth = null
}) {
  const [formData, setFormData] = useState({
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

  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = Boolean(initialCloth);

  useEffect(() => {
    if (initialCloth) {
      setFormData({
        name: initialCloth.name || '',
        category: initialCloth.category || 'T-Shirts',
        brand: initialCloth.brand || 'Thriftzy',
        price: initialCloth.price || '',
        originalPrice: initialCloth.originalPrice || '',
        size: initialCloth.size || 'M',
        condition: initialCloth.condition || 'Like New (Mint)',
        description: initialCloth.description || '',
        contactNumber: initialCloth.contactNumber || '',
        image: initialCloth.image || '',
        status: initialCloth.status || 'Available',
      });
      setImagePreview(initialCloth.image || '');
    } else {
      setFormData({
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
      setImagePreview('');
    }
  }, [initialCloth, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload (convert to Base64 data URL)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setImagePreview(base64Url);
      setFormData((prev) => ({ ...prev, image: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a title for your cloth.');
      return;
    }
    if (!formData.price) {
      alert('Please enter a selling price.');
      return;
    }
    if (!formData.image) {
      alert('Please upload a photo of your cloth.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      };

      if (isEditing && onClothUpdated) {
        await onClothUpdated(initialCloth.id, payload);
      } else if (onClothAdded) {
        await onClothAdded(payload);
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#000000']
        });
      }

      onClose();
    } catch (err) {
      alert('Error saving cloth: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1400px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md"
        />

        {/* 3D Folding Pop-in Modal Window */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: 20,
            rotateY: -6,
            scale: 0.9,
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
            rotateX: -16,
            scale: 0.92,
            z: -80,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 290,
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-red-500/20 z-10 flex flex-col lg:flex-row gap-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Column: Real-time 3D Preview */}
          <div className="lg:w-5/12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                {isEditing ? <Edit3 className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                <span>{isEditing ? 'Admin Editor' : 'Admin Listing Studio'}</span>
              </div>
              <h3 className="text-2xl font-black text-neutral-950">
                {isEditing ? 'Edit Cloth Details' : 'Add Cloth to Store'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isEditing
                  ? 'Update the price, title, or details of this item in the persistent database.'
                  : 'Add a new piece directly to your inventory database. It will immediately show on the storefront.'}
              </p>

              {/* 3D Card Preview */}
              <div className="mt-5">
                <Card3D maxTilt={15} className="w-full">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-lg flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Cloth Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-neutral-400">
                        <Camera className="w-10 h-10 mx-auto mb-2 opacity-50 text-red-500" />
                        <span className="text-xs font-semibold block">Photo preview will appear here</span>
                        <span className="text-[10px]">Select a file from your device below</span>
                      </div>
                    )}

                    {/* Size and Condition Badges */}
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {formData.size || 'Size M'}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow">
                      {formData.condition}
                    </div>

                    {/* Bottom Preview Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-between text-xs shadow-md">
                      <div>
                        <span className="font-bold text-neutral-900 block line-clamp-1">
                          {formData.name || 'Your Cloth Title'}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {formData.brand || 'Thriftzy'} • {formData.category}
                        </span>
                      </div>
                      <span className="font-extrabold text-red-600 text-base">
                        ₹{formData.price || '0'}
                      </span>
                    </div>
                  </div>
                </Card3D>
              </div>

              {/* Tips for admin */}
              <div className="mt-4 p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 space-y-1">
                <span className="font-bold text-neutral-900 block">💡 Admin Pro Tip:</span>
                <p className="text-[11px] leading-relaxed">
                  High quality photos, realistic original prices, and WhatsApp contact numbers drive instant buyer inquiries.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct SQLite Database Insertion</span>
            </div>
          </div>

          {/* Right Column: Form */}
          <form onSubmit={handleSubmit} className="lg:w-7/12 space-y-4">
            {/* Photo Upload Zone */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Cloth Photo *
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-50/50'
                    : 'border-neutral-300 hover:border-red-400 hover:bg-neutral-50'
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
                    <span className="text-neutral-500"> or drag and drop</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    PNG, JPG, WebP from your phone or computer
                  </span>
                </div>
              </div>

              {/* Or paste image URL alternative */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase">Or Image URL:</span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image && formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={(e) => {
                    const url = e.target.value;
                    setImagePreview(url);
                    setFormData({ ...formData, image: url });
                  }}
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Cloth Title */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Cloth Title / Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vintage 90s Carhartt Double Knee Work Pants"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Thriftzy / Nike / Vintage"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Price & Original Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1499"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 font-bold focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Original Retail Price (₹ optional)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="2999"
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
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
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
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
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
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  <option value="Available">Available for Sale</option>
                  <option value="Sold">Sold / Reserved</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp Contact</span>
                </label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mention fit, cotton weight, measurements, or vintage details..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-red-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {loading
                  ? 'Saving to Database...'
                  : isEditing
                  ? 'Save Cloth Changes'
                  : 'Add Cloth to Store Database'}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
