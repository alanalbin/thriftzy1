import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Box, RefreshCw } from 'lucide-react';

export default function VaultCube3D({ className = '' }) {
  const [rotX, setRotX] = useState(-18);
  const [rotY, setRotY] = useState(24);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Subtle continuous auto-rotation when not interacting
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.4) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    startPos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + deltaX * 0.7);
    setRotX((prev) => Math.max(-65, Math.min(65, prev - deltaY * 0.7)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const size = 180; // px
  const halfSize = size / 2;

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-red-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Interactive 3D Vault Hologram (Drag to Rotate)</span>
      </div>

      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '900px',
        }}
        className="relative cursor-grab active:cursor-grabbing my-3"
        onPointerDown={handlePointerDown}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s linear',
          }}
        >
          {/* FRONT FACE (Thriftzy Pill) */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateY(0deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-gradient-to-br from-white via-neutral-50 to-red-50 border-2 border-red-500/40 shadow-2xl p-3 flex flex-col items-center justify-between backdrop-blur-md"
          >
            <div className="w-full flex items-center justify-between text-[9px] font-bold text-red-600 uppercase">
              <span>VAULT_01</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
            </div>
            <img
              src="/assets/thriftzy-pill.jpg"
              alt="Thriftzy Front"
              className="w-28 object-contain rounded-md shadow-sm"
            />
            <span className="text-[10px] font-bold text-neutral-800 bg-red-100/70 px-2 py-0.5 rounded-full">
              Live Vault Node
            </span>
          </div>

          {/* BACK FACE (Thriftzy Box Logo) */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateY(180deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-neutral-950 border-2 border-red-500/50 shadow-2xl p-3 flex flex-col items-center justify-between text-white"
          >
            <div className="w-full flex items-center justify-between text-[9px] font-bold text-red-400 uppercase font-mono">
              <span>AUTHENTICITY</span>
              <span>100%</span>
            </div>
            <img
              src="/assets/thriftzy-box.jpg"
              alt="Thriftzy Back"
              className="w-24 object-contain rounded shadow-md border border-white/20"
            />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              40x Macro Verified
            </span>
          </div>

          {/* RIGHT FACE (Tokyo Vault) */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateY(90deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white p-3 flex flex-col items-center justify-between shadow-2xl"
          >
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">TOKYO NODE</span>
            <div className="text-center">
              <span className="text-2xl block font-black">渋谷</span>
              <span className="text-xs font-bold uppercase tracking-wider">Harajuku 90s</span>
            </div>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
              8 Vault Partners
            </span>
          </div>

          {/* LEFT FACE (NYC Vault) */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-gradient-to-br from-neutral-900 to-black text-white p-3 flex flex-col items-center justify-between border border-neutral-700 shadow-2xl"
          >
            <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">NYC NODE</span>
            <div className="text-center">
              <span className="text-sm font-black text-red-400">LOWER EAST</span>
              <span className="text-[11px] font-bold block text-neutral-200">Archive Grails</span>
            </div>
            <span className="text-[9px] bg-red-950 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full font-mono">
              Single-Stitch Hem
            </span>
          </div>

          {/* TOP FACE (NFC Passport) */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateX(90deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-white border border-red-300 p-3 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <ShieldCheck className="w-8 h-8 text-red-600 mb-1" />
            <span className="text-xs font-black text-neutral-900">NFC SMART TAG</span>
            <span className="text-[9px] text-neutral-500">Every Piece Digitized</span>
          </div>

          {/* BOTTOM FACE */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
            }}
            className="rounded-2xl bg-neutral-900 text-white p-3 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <span className="text-xl font-black text-red-500">9.5+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              Condition Floor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

