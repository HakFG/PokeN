'use client';

import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface Props {
  newLevel: number;
  newTitle: string;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, newTitle, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="levelup-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotateY: -30 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="levelup-modal"
      >
        <span className="levelup-halo" aria-hidden="true" />

        <motion.div
          className="levelup-icon"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          ✦
        </motion.div>

        <span className="levelup-label">Level Up</span>

        <motion.span
          className="levelup-level"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {newLevel}
        </motion.span>

        <span className="levelup-title">{newTitle}</span>

        <button type="button" onClick={onClose} className="levelup-btn">
          Continuar
        </button>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
