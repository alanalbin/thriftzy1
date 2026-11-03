import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Check } from 'lucide-react';

export default function CanvasCommentModal({ isOpen, onClose, onAddComment, targetItemName }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [tagType, setTagType] = useState('legit-check'); // 'legit-check' | 'fit-note' | 'grail-hype'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
    ];

    onAddComment({
      id: 'c_' + Date.now(),
      author: author.trim() || 'Thrift Scout',
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      text: text.trim(),
      tagType,
      time: 'Just now',
      x: Math.floor(Math.random() * 40 + 30),
      y: Math.floor(Math.random() * 40 + 30)
    });

    setText('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 350,
          }}
          className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-red-500/20 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Pin Spark Comment</span>
          </div>

          <h4 className="text-lg font-bold text-neutral-900">
            Leave Note on Canvas
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pinning note to: <span className="font-semibold text-neutral-800">{targetItemName || 'Live Showcase'}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                Your Tag Type
              </label>
              <div className="flex gap-1.5">
                {[
                  { id: 'legit-check', label: '🛡️ Legit Check' },
                  { id: 'fit-note', label: '📏 Fit Guide' },
                  { id: 'grail-hype', label: '🔥 Grail Hype' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTagType(t.id)}
                    className={`flex-1 text-[10px] py-1.5 rounded-lg font-semibold border transition-all ${
                      tagType === t.id
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                Your Handle / Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="@vintage_tokyo"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                Comment Note
              </label>
              <textarea
                required
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Single stitch looks 100% authentic from 1996 batch!"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pin Note to Canvas</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

