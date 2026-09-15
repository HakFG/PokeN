'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  name: string;
  characterSpriteUrl: string | null;
}

export default function HakCard({ name, characterSpriteUrl }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="hak-card"
    >
      <span className="hak-card-topline" aria-hidden="true" />
      <span className="hak-card-label">{name.toUpperCase()} CARD</span>

      <div className="hak-card-sprite-wrap">
        {characterSpriteUrl ? (
          <motion.img
            src={characterSpriteUrl}
            alt={name}
            className="hak-card-sprite"
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        ) : (
          <div className="hak-card-sprite-empty">
            <span>Sem sprite</span>
          </div>
        )}
      </div>

      <div className="hak-card-glow" aria-hidden="true" />
    </motion.div>
  );
}