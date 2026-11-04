import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Shield, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminLogin } from '../../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email ID and password.');
      return;
    }

    setLoading(true);
    try {
      const session = await adminLogin(email, password);
      setSuccessMsg(`Welcome, ${session.admin.name || session.admin.email}! Access granted.`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']
      });

      setTimeout(() => {
        onLoginSuccess(session.admin);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1400px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md rounded-[32px] bg-white p-7 sm:p-9 shadow-2xl border border-red-500/20 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Shield Emblem */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/30 mb-3.5">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Admin <span className="gradient-text-red">Portal</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Authorized administrator access only. Enter your credentials to manage clothes and view orders.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Admin Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="albineditz1@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
