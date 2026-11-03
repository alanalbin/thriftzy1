import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, X, Check, ArrowRight, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SecretDropPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('THRIFTZY-SPARK-20');
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8, x: 0.85 },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF']
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring' }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-neutral-900 px-4 py-2.5 text-white shadow-xl shadow-red-950/20 border border-red-500/30 transition-all hover:bg-red-600 hover:border-red-400"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold tracking-tight">Secret Drop Code</span>
          <Gift className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
        </motion.button>
      </motion.div>

      {/* Smooth Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 300,
              }}
              className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-white via-neutral-50 to-red-50 p-6 shadow-2xl border border-red-500/25 z-10"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>ReactBits Spark Perk</span>
              </div>

              <h4 className="text-xl font-extrabold text-neutral-950">
                Unlock 20% Off Your First Grail
              </h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Use our exclusive Sparkdesign launch code at checkout to claim 20% off any authenticated vintage drop.
              </p>

              {/* Promo Code Box */}
              <div className="mt-5 rounded-2xl bg-white p-3.5 border-2 border-dashed border-red-300 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-600" />
                  <span className="font-mono font-bold text-sm text-neutral-900 tracking-wider">
                    THRIFTZY-SPARK-20
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm transition-colors hover:bg-red-700"
                >
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    'Copy'
                  )}
                </motion.button>
              </div>

              <p className="mt-3 text-[11px] text-neutral-400 text-center">
                Valid on all authenticated vintage drops • Expires in 24 hours
              </p>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full rounded-xl bg-neutral-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-neutral-800"
              >
                Got It, Let's Hunt Grails
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

