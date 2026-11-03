import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ClickSpark component from React Bits
 * Generates sparkling burst particles and expanding ripples on click.
 */
export default function ClickSpark({
  sparkColor = '#E50914',
  sparkSize = 10,
  sparkRadius = 25,
  sparkCount = 12,
  duration = 450,
  extraColors = ['#FF2E4D', '#FFFFFF', '#FF8596', '#E50914'],
  children,
  className = '',
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const ringsRef = useRef([]);
  const animationIdRef = useRef(null);

  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw sparks
    sparksRef.current = sparksRef.current.filter((spark) => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) return false;

      const progress = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRadius = spark.maxRadius * easeOut;
      const x = spark.originX + Math.cos(spark.angle) * currentRadius;
      const y = spark.originY + Math.sin(spark.angle) * currentRadius + (progress * 15); // subtle gravity
      const alpha = 1 - progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, spark.size * (1 - progress * 0.6), 0, 2 * Math.PI);
      ctx.fillStyle = spark.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = spark.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      return true;
    });

    // Update & draw rings
    ringsRef.current = ringsRef.current.filter((ring) => {
      const elapsed = timestamp - ring.startTime;
      if (elapsed >= duration * 0.9) return false;

      const progress = elapsed / (duration * 0.9);
      const currentRadius = ring.maxRadius * (1 - Math.pow(1 - progress, 2));
      const alpha = (1 - progress) * 0.6;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ring.originX, ring.originY, currentRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1.5 * (1 - progress);
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.restore();

      return true;
    });

    if (sparksRef.current.length > 0 || ringsRef.current.length > 0) {
      animationIdRef.current = requestAnimationFrame(draw);
    } else {
      animationIdRef.current = null;
    }
  }, [duration]);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const colors = [sparkColor, ...extraColors];

    // Create sparks
    const newSparks = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newSparks.push({
        originX: x,
        originY: y,
        angle,
        size: (Math.random() * 0.6 + 0.6) * sparkSize,
        maxRadius: (Math.random() * 0.5 + 0.75) * sparkRadius,
        color,
        startTime: now,
      });
    }

    sparksRef.current.push(...newSparks);

    // Create ring
    ringsRef.current.push({
      originX: x,
      originY: y,
      maxRadius: sparkRadius * 1.4,
      color: sparkColor,
      startTime: now,
    });

    if (!animationIdRef.current) {
      animationIdRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50 h-full w-full"
      />
      {children}
    </div>
  );
}

