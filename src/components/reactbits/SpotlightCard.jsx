import React, { useRef, useState } from 'react';

/**
 * SpotlightCard component from React Bits
 * Illuminates card boundaries and content with an interactive mouse spotlight.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(229, 9, 20, 0.15)',
  borderColor = 'rgba(229, 9, 20, 0.25)',
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 ${className}`}
    >
      {/* Spotlight background radial */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      
      {/* Spotlight border glow highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border transition-opacity duration-300"
        style={{
          opacity,
          borderColor: borderColor,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

