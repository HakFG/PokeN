'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

export default function JogosBackground() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(
    () => Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: (index * 0.6) % 8,
      duration: 9 + ((index * 3) % 6),
      size: 3 + (index % 3),
      color: index % 5 === 0 ? '#8B5CF6' : index % 3 === 0 ? '#FBBF24' : '#22D3EE',
    })),
    [],
  );

  return (
    <div aria-hidden="true" className="jogos-bg">
      <div className="jogos-bg-gradient" />
      {!reduceMotion && <div className="jogos-bg-grid" />}
      {!reduceMotion && particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -810] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <div className="jogos-bg-vignette" />
    </div>
  );
}
