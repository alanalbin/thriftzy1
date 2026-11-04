import React from 'react';
import { ArrowRight, Shield, Plus, LayoutDashboard } from 'lucide-react';

export default function Footer({
  admin = null,
  onNavigateAdmin,
  onOpenAddModal
}) {
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
              Curated clothes, vintage fashion, and streetwear archive marketplace. Persistent SQLite database and authentic pre-loved apparel.
            </p>
            <div className="text-[11px] text-neutral-500 font-mono">
              Database: Persistent SQLite + Dynamic Admin
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

          {/* Col 3: Admin & Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Administration
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={onNavigateAdmin}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-bold text-red-400"
                >
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span>Admin Dedicated Page</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAddModal}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-red-500" />
                  <span>+ Add Cloth</span>
                </button>
              </li>
              <li><a href="#how-it-works" className="hover:text-red-400 transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-red-400 transition-colors">Buyer FAQ & Support</a></li>
            </ul>
          </div>

          {/* Col 4: Quick Action Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Admin Portal
            </h4>
            <p className="text-xs text-neutral-400">
              Access the dedicated admin page to manage inventory, upload photos to database, remove clothes, or update credentials.
            </p>
            <button
              onClick={onNavigateAdmin}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-bold hover:bg-red-600 hover:border-red-600 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Go to Admin Page</span>
            </button>
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
            <span>© 2026 Thriftzy Store. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            <span>White & Red Gradient Theme</span>
            <span>•</span>
            <span>SQLite Database & Dynamic Admin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
