'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { progressPercent, getTitleForLevel } from '@/lib/xp/level-curve';

interface Props {
  xp: number;
  level: number;
}

export default function XpProgressBar({ xp, level }: Props) {
  const reduceMotion = useReducedMotion();
  const percent = progressPercent(xp, level);
  const title = getTitleForLevel(level);
  const needed = level * 100;

  return (
    <div className="xp-bar">
      <div className="xp-bar-header">
        <div className="xp-bar-level">
          <span className="xp-bar-level-badge">LV</span>
          <span className="xp-bar-level-value">{level}</span>
        </div>
        <span className="xp-bar-title">{title}</span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={reduceMotion ? undefined : { width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="xp-bar-shine"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.2 }}
        />
      </div>
      <div className="xp-bar-footer">
        <span className="xp-bar-counter">{xp} / {needed} XP</span>
        <span className="xp-bar-percent">{percent}%</span>
      </div>
    </div>
  );
}