import React from 'react';
import { ArrowRight, Database, Plus } from 'lucide-react';

export default function Footer({ onOpenAddModal, onOpenDbModal }) {
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
                className="h-10 w-auto object-contain rounded-lg border border-white/20 shadow-md"
              />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Curated clothes, vintage fashion, and streetwear marketplace. List your own wardrobe pieces and buy authentic pre-loved apparel.
            </p>
            <div className="text-[11px] text-neutral-500 font-mono">
              Database: Persistent SQLite Storage
            </div>
          </div>

          {/* Col 2: Navigation */}
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

          {/* Col 3: Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Seller Actions
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={onOpenAddModal} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-red-500" />
                  <span>List a Cloth for Sale</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenDbModal} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-red-500" />
                  <span>Inspect Database Records</span>
                </button>
              </li>
              <li><a href="#how-it-works" className="hover:text-red-400 transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-red-400 transition-colors">Seller & Buyer FAQ</a></li>
            </ul>
          </div>

          {/* Col 4: Quick Action Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Got Clothes to Sell?
            </h4>
            <p className="text-xs text-neutral-400">
              List your clothes now with photos from your phone or computer.
            </p>
            <button
              onClick={onOpenAddModal}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-red-600/30"
            >
              <span>+ Start Selling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar (NO pulsating live dots) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <img
              src="/assets/thriftzy-pill.jpg"
              alt="Thriftzy Pill"
              className="h-6 w-auto object-contain rounded"
            />
            <span>© 2026 Thriftzy Store. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            <span>White & Red Gradient Theme</span>
            <span>•</span>
            <span>Persistent SQLite Database</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
