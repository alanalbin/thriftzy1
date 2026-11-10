import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, ShieldCheck, Flame, Clock, Eye, Plus, ArrowUpRight, Database, Box } from 'lucide-react';
import Card3D from './3d/Card3D';
import VaultCube3D from './3d/VaultCube3D';

const HERO_TABS = [
  { id: 'all', label: 'All Curated Grails' },
  { id: 'leather', label: '1990s Leather Racers' },
  { id: 'tees', label: 'Single-Stitch Graphic Tees' },
  { id: 'denim', label: 'Japanese Selvedge Denim' },
  { id: 'sneakers', label: 'Retro OG Kicks' },
];

export default function HeroSparkCanvas({
  onOpenWaitlist,
  onOpenQuickView,
  onOpenCommentModal,
  onOpenAddModal,
  onOpenDbModal,
  canvasComments,
  featuredItem,
  totalItemsCount = 6,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  const displayItem = featuredItem || {
    name: '1996 Archive Leather Racer Jacket',
    price: 340,
    originalRetail: 820,
    era: '1996 Japanese Release',
    condition: '9.6/10 Natural Patina',
    provenance: 'Shibuya Vault, Tokyo',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
  };

  return (
    <section id="hero-canvas" className="relative pt-6 pb-20 overflow-hidden bg-hero-gradient">
      {/* Background ambient red-white glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-500/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-rose-400/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Top Pill with supreme-style red & white badge & SQLite indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-red-500/20 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-neutral-900">
              React Bits <span className="text-red-600 font-bold">Sparkdesign</span> 3D Architecture
            </span>
            <span className="text-neutral-300">|</span>
            <button
              onClick={onOpenDbModal}
              className="text-red-600 font-bold flex items-center gap-1 hover:underline"
            >
              <Database className="w-3 h-3" />
              <span>SQLite ({totalItemsCount} Grails)</span>
            </button>
          </div>

          {/* Main Title with bold Supreme/Thriftzy typography */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 uppercase leading-[1.08]">
            Where Rare Finds Meet{' '}
            <span className="gradient-text-red block sm:inline">
              Street Culture.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Thriftzy connects discerning collectors with hand-curated 90s archives, vintage Japanese denim, and grail streetwear. Powered by 3D spatial physics and backed by a live SQLite database.
          </p>

          {/* Live Drop Countdown & CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Countdown Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-red-500/20 shadow-sm text-xs font-medium">
              <Clock className="w-4 h-4 text-red-600 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-neutral-500 font-medium">Next Drop Closes In:</span>
              <span className="font-mono font-bold text-red-600 text-sm">
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenWaitlist}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40"
              >
                <Flame className="w-4 h-4" />
                <span>Join VIP Drop Priority</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sparkdesign Project Tabs Navigation */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-red-500/15 overflow-x-auto max-w-full">
            {HERO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SPARKDESIGN 3D INTERACTIVE CANVAS HERO                   */}
        {/* ======================================================== */}
        <div className="mt-8 relative max-w-5xl mx-auto">
          {/* 3D Tilt Card Wrapper around canvas */}
          <Card3D maxTilt={9} className="w-full">
            <div className="p-3 sm:p-5 bg-gradient-to-b from-white via-white to-red-50/40 border border-red-500/20 shadow-2xl rounded-3xl">
              {/* Top Canvas Bar */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-neutral-400 ml-2 tracking-wide font-mono uppercase">
                    3D Spatial Canvas // SQLite Archive
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCommentModal(displayItem.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors hover:bg-red-100 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pin Note to Canvas</span>
                  </button>
                  <button
                    onClick={onOpenDbModal}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Manage DB</span>
                  </button>
                </div>
              </div>

              {/* Interactive Canvas Centerpiece with 3D Depth Layers */}
              <div
                style={{ transformStyle: 'preserve-3d' }}
                className="relative mt-3 h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center group"
              >
                {/* Centerpiece Image */}
                <img
                  src={displayItem.image}
                  alt={displayItem.name}
                  className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

                {/* Floating Supreme/Thriftzy Box Logo (3D translateZ) */}
                <div
                  style={{ transform: 'translateZ(45px)' }}
                  className="absolute top-4 left-4 z-20"
                >
                  <img
                    src="/assets/thriftzy-box.jpg"
                    alt="Thriftzy Box Logo"
                    className="h-10 sm:h-12 rounded-lg shadow-2xl border border-white/20"
                  />
                </div>

                {/* Verified Legit Check Shield Badge (3D translateZ) */}
                <div
                  style={{ transform: 'translateZ(45px)' }}
                  className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Double-Blind Authenticated</span>
                </div>

                {/* ==================================================== */}
                {/* Sparkdesign Live Floating Interactive Comment Pins   */}
                {/* ==================================================== */}
                {/* Comment Pin 1: Elena */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ transform: 'translateZ(60px)' }}
                  className="absolute top-[22%] left-[8%] sm:left-[14%] z-20 animate-float-tag"
                >
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-red-500/20 max-w-xs transition-transform hover:scale-105">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Elena"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-red-500"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-neutral-900 block">Elena (Harajuku Vault)</span>
                      <span className="text-neutral-600 font-medium">Original 1996 double-stitch confirmed 🎯</span>
                    </div>
                  </div>
                  <div className="h-4 w-0.5 bg-red-500 ml-5" />
                  <div className="h-2 w-2 rounded-full bg-red-500 ml-4 animate-ping" />
                </motion.div>

                {/* Comment Pin 2: Marcus */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ transform: 'translateZ(60px)' }}
                  className="absolute top-[38%] right-[6%] sm:right-[15%] z-20 animate-float-tag"
                >
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-red-500/20 max-w-xs transition-transform hover:scale-105">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt="Marcus"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-neutral-900 block">Marcus (NYC Collector)</span>
                      <span className="text-neutral-600 font-medium">RiRi brass zipper is deadstock smooth 🔥</span>
                    </div>
                  </div>
                  <div className="h-4 w-0.5 bg-emerald-500 ml-5" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500 ml-4" />
                </motion.div>

                {/* Custom comments added by user via popup */}
                {canvasComments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      top: `${c.y}%`,
                      left: `${c.x}%`,
                      transform: 'translateZ(70px)',
                    }}
                    className="absolute z-20 animate-float-tag"
                  >
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-2xl shadow-2xl border border-white/40 text-xs">
                      <span className="font-bold">{c.author}:</span>
                      <span>{c.text}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Bottom Canvas Banner with Quick Action (3D translateZ) */}
                <div
                  style={{ transform: 'translateZ(50px)' }}
                  className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                        Featured Vault Piece
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        {displayItem.era}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">
                      {displayItem.name}
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium">
                      {displayItem.provenance} • Condition {displayItem.condition}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block line-through leading-none">
                        ${displayItem.originalRetail}
                      </span>
                      <span className="text-xl font-black text-red-600 leading-tight">
                        ${displayItem.price}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onOpenQuickView(displayItem)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold transition-all hover:bg-red-600 shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>3D Quick View</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Bottom canvas metrics */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase">3D Physics</span>
                  <span className="text-sm font-bold text-neutral-900">Spatial Depth Parallax</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase">Database Engine</span>
                  <span className="text-sm font-bold text-neutral-900">SQLite WAL Active</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase">Passports</span>
                  <span className="text-sm font-bold text-neutral-900">NFC Smart Tagged</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase">Vault Items</span>
                  <span className="text-sm font-bold text-red-600">{totalItemsCount} In Database</span>
                </div>
              </div>
            </div>
          </Card3D>
        </div>

        {/* Interactive 3D Vault Hologram Cube section */}
        <div className="mt-14 flex flex-col items-center justify-center">
          <VaultCube3D />
        </div>
      </div>
    </section>
  );
}
