import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Scroll3DReveal: Buttery Smooth 3D Perspective Scrolling Animation
 * Smoothly tilts, elevates, and pops elements into 3D space with spring physics.
 */
export default function Scroll3DReveal({
  children,
  className = '',
  intensity = 16,
  delay = 0,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Buttery-smooth spring damping physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    mass: 0.5,
  });

  // 3D Perspective rotation & depth mapping along scroll
  const rotateX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [intensity, 0, 0, -intensity]);
  const scale = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [0.94, 1, 1, 0.96]);
  const opacity = useTransform(smoothProgress, [0, 0.25, 0.85, 1], [0.6, 1, 1, 0.8]);
  const y = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [40, 0, 0, -30]);
  const z = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [-60, 0, 0, -40]);

  return (
    <div
      ref={ref}
      style={{ perspective: '1400px' }}
      className={`will-change-transform ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y,
          z,
          transformStyle: 'preserve-3d',
        }}
        transition={{ delay }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
