import React from 'react';
import { ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer({ onNavigateAdmin }) {
  return (
    <footer className="bg-neutral-950 text-white relative overflow-hidden border-t border-red-500/20 pt-16 pb-12">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/assets/thriftzy-box.jpg"
                alt="Thriftzy Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Curated clothes, vintage fashion, and streetwear archive marketplace. 100% authentic pre-loved apparel delivered across India.
            </p>
            <div className="text-[11px] text-neutral-500 font-mono">
              Prices in Indian Rupees (₹) • Free Delivery Over ₹999
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">T-Shirts & Tops</a></li>
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">Hoodies & Sweaters</a></li>
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">Jackets & Outerwear</a></li>
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">Pants & Denim</a></li>
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">Shoes & Sneakers</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#how-it-works" className="hover:text-red-400 transition-colors">How Ordering Works</a></li>
              <li><a href="#faq" className="hover:text-red-400 transition-colors">Buyer FAQ & Returns</a></li>
              <li><a href="#store-catalog" className="hover:text-red-400 transition-colors">Track Orders</a></li>
              <li><a href="mailto:support@thriftzy.store" className="hover:text-red-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Col 4: Trust Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Thriftzy Guarantee
            </h4>
            <p className="text-xs text-neutral-400">
              Every garment is hand-inspected for authenticity, quality, and condition before shipping. Pay on delivery or via WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Authentic</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <img
              src="/assets/thriftzy-pill.jpg"
              alt="Thriftzy Pill"
              className="h-6 w-auto object-contain"
            />
            <span>&copy; {new Date().getFullYear()} Thriftzy Vault. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
            {/* Discreet admin link */}
            <button
              onClick={onNavigateAdmin}
              className="hover:text-neutral-400 transition-colors text-[11px] opacity-40 hover:opacity-100"
              title="Separate Admin Portal"
            >
              Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
