'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  amount: number;
  label: string;
  visible: boolean;
}

export default function XpToast({ amount, label, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -16, x: '-50%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="xp-toast"
        >
          <span className="xp-toast-icon">✦</span>
          <span className="xp-toast-amount">+{amount} XP</span>
          <span className="xp-toast-label">{label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
