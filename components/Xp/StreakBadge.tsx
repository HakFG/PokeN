'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  current: number;
  longest: number;
}

export default function StreakBadge({ current, longest }: Props) {
  const reduceMotion = useReducedMotion();
  const isHot = current >= 3;

  // Mostra mesmo com 0, para manter layout consistente
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={`streak-badge ${isHot ? 'streak-badge-hot' : ''} ${
        current === 0 ? 'streak-badge-cold' : ''
      }`}
    >
      <motion.span
        className="streak-badge-icon"
        animate={
          reduceMotion || current === 0
            ? undefined
            : { scale: [1, 1.15, 1] }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {current === 0 ? '❄' : '🔥'}
      </motion.span>
      <div className="streak-badge-info">
        <span className="streak-badge-current">
          {current === 0 ? 'Sem streak' : `${current} dia${current > 1 ? 's' : ''}`}
        </span>
        <span className="streak-badge-record">
          {longest > 0 ? `recorde ${longest}` : 'comece hoje'}
        </span>
      </div>
    </motion.div>
  );
}