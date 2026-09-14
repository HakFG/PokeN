'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function TrainerCardBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="trainer-card-background" aria-hidden="true">
      <div className="trainer-card-table" />
      <div className="trainer-card-light trainer-card-light-one" />
      <div className="trainer-card-light trainer-card-light-two" />
      {!reduceMotion && (
        <motion.div
          className="trainer-card-scan"
          animate={{ x: ['-35%', '35%'] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      )}
      <div className="trainer-card-vignette" />
    </div>
  );
}
