'use client';

import { motion } from 'framer-motion';

export default function GameCardBadge({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <motion.div
      className="game-card-badge"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      title="Living Dex Completa"
    >
      <span aria-hidden="true">⭐</span>
    </motion.div>
  );
}