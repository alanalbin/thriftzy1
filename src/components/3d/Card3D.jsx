import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Card3D: Interactive 3D Perspective Tilt Card with Mouse Light Reflection
 * Applies real CSS 3D transform with depth layers (translateZ).
 */
export default function Card3D({
  children,
  className = '',
  maxTilt = 14,
  glare = true,
  scale = 1.03,
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rotX);
    setRotateY(rotY);

    if (glare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.35,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: '1200px' }}
      className={`relative select-none ${className}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? scale : 1,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 280,
          mass: 0.5,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full w-full rounded-3xl overflow-hidden will-change-transform"
      >
        {/* Child Content (can use style={{ transform: 'translateZ(30px)' }} for 3D depth) */}
        <div style={{ transformStyle: 'preserve-3d' }}>
          {children}
        </div>

        {/* 3D Holographic Light Glare */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-3xl mix-blend-overlay"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.7) 0%, rgba(229,9,20,0.2) 40%, transparent 80%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

