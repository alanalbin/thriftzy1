import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VIP_PLANS } from '../data/items';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';

export default function VIPPricingSection({ onOpenWaitlist }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  return (
    <section id="vip-pricing" className="py-24 bg-white relative overflow-hidden border-t border-neutral-100">
      {/* Red ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-200">
            <Crown className="w-3.5 h-3.5 text-red-600" />
            <span>Thriftzy VIP Collective</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
            Priority Access for <span className="gradient-text-red">Serious Collectors</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            Never take an L on high-heat archive drops again. Unlock 15-minute advance checkout windows and 0% buyer fees.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-extrabold">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {VIP_PLANS.map((plan) => {
            const isVip = plan.isPopular;
            const priceDisplay =
              billingCycle === 'annual'
                ? plan.id === 'vip'
                  ? '$14'
                  : plan.id === 'studio'
                  ? '$38'
                  : '$0'
                : plan.price;

            return (
              <div key={plan.id} className="relative flex">
                <SpotlightCard
                  className={`w-full flex flex-col justify-between p-7 transition-all ${
                    isVip
                      ? 'border-2 border-red-500 ring-4 ring-red-500/10 shadow-xl'
                      : 'border-neutral-200'
                  }`}
                >
                  {isVip && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular for Collectors
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-neutral-950">
                        {plan.name}
                      </h3>
                      {isVip && <Crown className="w-5 h-5 text-red-600" />}
                    </div>

                    <p className="mt-2 text-xs text-neutral-500 min-h-[34px]">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-neutral-950">
                        {priceDisplay}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {plan.id === 'member' ? '/ free forever' : '/ month'}
                      </span>
                    </div>

                    {/* Features list */}
                    <ul className="mt-6 space-y-3 border-t border-neutral-100 pt-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isVip ? 'text-red-600' : 'text-emerald-600'}`} />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA button */}
                  <div className="mt-8 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onOpenWaitlist}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isVip
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

