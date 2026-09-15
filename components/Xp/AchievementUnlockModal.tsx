'use client';

import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { Achievement } from '@/lib/xp/achievements';

interface Props {
  achievement: Omit<Achievement, 'check'>;
  onNext: () => void;
  hasMore: boolean;
}

export default function AchievementUnlockModal({
  achievement,
  onNext,
  hasMore,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') onNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext]);

  if (!mounted) return null;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="achievement-backdrop"
      onClick={onNext}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotateX: -30 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="achievement-modal"
      >
        <span className="achievement-modal-shine" aria-hidden="true" />

        <span className="achievement-modal-label">Conquista desbloqueada</span>

        <motion.span
          className="achievement-modal-icon"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏆
        </motion.span>

        <h2 className="achievement-modal-name">{achievement.name}</h2>
        <p className="achievement-modal-desc">{achievement.description}</p>

        <span className="achievement-modal-reward">
          +{achievement.xpReward} XP
        </span>

        <button type="button" onClick={onNext} className="achievement-modal-btn">
          {hasMore ? 'Próxima' : 'Legal!'}
        </button>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
