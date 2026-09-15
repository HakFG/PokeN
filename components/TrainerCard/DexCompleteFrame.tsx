'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  isComplete: boolean;
  children: ReactNode;
}

export default function DexCompleteFrame({ isComplete, children }: Props) {
  const reduceMotion = useReducedMotion();

  if (!isComplete) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="trainer-card-complete-frame"
    >
      <div className="trainer-card-complete-banner">
        <motion.span
          className="trainer-card-complete-star"
          animate={reduceMotion ? undefined : { rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⭐
        </motion.span>
        <span className="trainer-card-complete-text">
          Living Dex Completa
        </span>
        <motion.span
          className="trainer-card-complete-star"
          animate={reduceMotion ? undefined : { rotate: [0, -15, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⭐
        </motion.span>
      </div>
      <div className="trainer-card-complete-inner">{children}</div>
    </motion.div>
  );
}
