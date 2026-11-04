import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import Card3D from './3d/Card3D';

export default function BrandShowcase({ admin = null, onOpenAddModal }) {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white via-red-50/40 to-white relative overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-neutral-950 text-white overflow-hidden shadow-2xl border border-red-500/25 flex flex-col lg:flex-row items-center">
          {/* Left: Poster image */}
          <div className="lg:w-1/2 w-full p-8 sm:p-12 flex items-center justify-center bg-gradient-to-br from-red-600 via-rose-600 to-red-800 relative group overflow-hidden">
            <Card3D maxTilt={14} className="w-full max-w-sm">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src="/assets/thriftzy-poster.jpg"
                  alt="Thriftzy Supreme Archive Red Poster"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Official Thriftzy Monogram</span>
                  <span className="text-red-400">EST. 2026</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Right: Brand Story & Mission */}
          <div className="lg:w-1/2 w-full p-8 sm:p-12 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/60 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30">
              <span>The Thriftzy Vision</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
              Circular Fashion. <br />
              <span className="gradient-text-red">Your Personal Thrift Vault.</span>
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every garment in our vault has a unique story. From rare Japanese denim to 90s vintage leather jackets, Thriftzy preserves cultural streetwear pieces and delivers them directly to true collectors.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>100% verified authentic vintage garments and streetwear</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Persistent database storage keeps all items organized in real time</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Direct WhatsApp and messaging connection between buyers and store management</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              {admin ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenAddModal}
                  className="px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Cloth (Admin)</span>
                </motion.button>
              ) : (
                <a
                  href="#store-catalog"
                  className="px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Wardrobe Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
