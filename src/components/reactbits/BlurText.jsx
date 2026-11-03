import React from 'react';
import { motion } from 'framer-motion';

/**
 * BlurText component from React Bits
 * Smooth word-by-word reveal with blur & spring physics
 */
export default function BlurText({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
}) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <p className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 15 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: (index * delay) / 1000,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block mr-[0.28em] last:mr-0"
        >
          {segment}
        </motion.span>
      ))}
    </p>
  );
}

