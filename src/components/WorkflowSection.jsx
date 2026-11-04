import React from 'react';
import { Camera, Tag, Send, CheckCircle2, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import Scroll3DReveal from './3d/Scroll3DReveal';
import Card3D from './3d/Card3D';

const STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Curated 3D Vault Selection',
    description: 'Every vintage jacket, tee, and streetwear grail is inspected and uploaded with high-resolution photos and details.'
  },
  {
    num: '02',
    icon: Tag,
    title: 'Transparent Pricing & Sizes',
    description: 'Real garment measurements, fabric condition, and authentic market value saved directly in our permanent store database.'
  },
  {
    num: '03',
    icon: Send,
    title: 'Instant Order & WhatsApp Checkout',
    description: 'Add clothes to your bag, reserve pieces in real-time, or chat directly via WhatsApp for lightning-fast delivery coordination.'
  }
];

export default function WorkflowSection({ admin = null, onOpenAddModal }) {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Scroll3DReveal intensity={14}>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-200">
              <span>Simple 3-Step Experience</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
              How To Shop On <span className="gradient-text-red">Thriftzy</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              Discover unique one-of-a-kind vintage fashion and cop authentic streetwear grails.
            </p>
          </div>
        </Scroll3DReveal>

        {/* 3 Step Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Scroll3DReveal key={step.num} intensity={14} delay={idx * 0.1}>
                <Card3D maxTilt={12} className="h-full">
                  <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200 h-full flex flex-col justify-between hover:border-red-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-2xl font-black text-neutral-300">
                          {step.num}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-neutral-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center gap-2 text-xs text-neutral-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Instant Database Sync</span>
                    </div>
                  </div>
                </Card3D>
              </Scroll3DReveal>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          {admin ? (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Cloth (Admin)</span>
            </button>
          ) : (
            <a
              href="#store-catalog"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Clothes</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
