// components/PokemonHomeBanner.tsx
 'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import HexHeading from './HexHeading';

interface Props {
  count?: number;
}

export default function PokemonHomeBanner({ count = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(count / 12));
    const timer = window.setInterval(() => {
      current = Math.min(count, current + step);
      setAnimatedCount(current);
      if (current >= count) window.clearInterval(timer);
    }, 45);
    return () => window.clearInterval(timer);
  }, [count, reduceMotion]);

  return (
    <div className="pokemon-home-banner flex flex-wrap items-center justify-center gap-4 px-6">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.84, filter: 'blur(12px)' }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <HexHeading label="POKÉMON HOME" size="lg" />
      </motion.div>
      <motion.span
        initial={reduceMotion ? undefined : { opacity: 0, y: -14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pokemon-count-chip font-display rounded-full border border-cyan-300/40 bg-slate-950/45 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur-md"
      >
        <span className="mr-2 inline-block h-3 w-3 rounded-full border border-cyan-200 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" aria-hidden="true" />
        {reduceMotion ? count : animatedCount} {count === 1 ? 'pokémon' : 'pokémons'}
      </motion.span>
    </div>
  );
}