import React from 'react';

/**
 * ShinyText component from React Bits
 * Adds a moving light shimmer across gradient text.
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = '',
}) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(229, 9, 20, 0.9) 0%, rgba(255, 255, 255, 1) 45%, rgba(229, 9, 20, 0.9) 70%)',
        backgroundSize: '200% 100%',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
}

