import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Scroll3DReveal: 3D Popup Scrolling Animation
 * Smoothly tilts, elevates, and pops elements into 3D space as the user scrolls.
 */
export default function Scroll3DReveal({
  children,
  className = '',
  intensity = 20,
  delay = 0,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Spring physics for buttery-smooth momentum
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.6,
  });

  // 3D Perspective rotation & depth mapping along scroll
  const rotateX = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [intensity, 0, 0, -intensity]);
  const scale = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [0.92, 1, 1, 0.94]);
  const opacity = useTransform(smoothProgress, [0, 0.25, 0.8, 1], [0.35, 1, 1, 0.4]);
  const y = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [50, 0, 0, -40]);
  const z = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [-80, 0, 0, -60]);

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

