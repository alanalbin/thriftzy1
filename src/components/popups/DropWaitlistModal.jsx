import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Flame, CheckCircle, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DropWaitlistModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('all');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']
    });

    setSubmitted(true);
    setTimeout(() => {
      // automatically close after 2.5s or let user close
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/65 backdrop-blur-md"
        />

        {/* Modal Window with Smooth Spring Pop-up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 320,
          }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 shadow-2xl border border-red-500/20 z-10"
        >
          {/* Top red glow accent */}
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-red-500/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>

          {!submitted ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Priority Drop Notification
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
                Never Miss a Grail.
              </h3>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Vault drops sell out in under 90 seconds. Sign up to receive direct SMS & Email ping 5 minutes before the next live drop.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@thriftzy.club"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block mb-1">
                    Mobile Phone (for instant SMS alert)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block mb-1">
                    Drop Preferences
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Grails' },
                      { id: 'outerwear', label: 'Outerwear' },
                      { id: 'tees', label: 'Vintage Tees' }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setTier(opt.id)}
                        className={`rounded-lg py-1.5 text-[11px] font-medium border transition-all ${
                          tier === opt.id
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/35"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Get VIP Drop Ping</span>
                </motion.button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                <Sparkles className="w-3 h-3 text-red-500" />
                <span>Zero spam. Unsubscribe anytime in 1 click.</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-3">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold text-neutral-900">You're on the VIP Drop List!</h4>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                We'll notify <strong className="text-neutral-800">{email}</strong> 5 minutes before the next batch drops this Thursday at 6 PM EST.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-neutral-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-neutral-800"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

