'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  ownedCount: number;
  totalSpecies: number;
}

export default function TopBar({ ownedCount, totalSpecies }: Props) {
  const reduceMotion = useReducedMotion();
  const pct = totalSpecies > 0 ? Math.round((ownedCount / totalSpecies) * 100) : 0;

  return (
    <div className="livingdex-topbar">
      <div className="livingdex-topbar-row">
        {/* Título hexagonal com brilho */}
        <motion.div
          className="livingdex-topbar-hex"
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9, y: -8 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="livingdex-topbar-hex-pokeball" aria-hidden="true" />
          <h1 className="livingdex-topbar-hex-text">POKÉMONS DE HAK</h1>
        </motion.div>

        {/* Botão VER BOX */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/jogos" className="livingdex-topbar-btn group">
            <span className="livingdex-topbar-btn-text">
              Ver Box de<br />Jogos Específicos
            </span>
            <svg
              className="livingdex-topbar-btn-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="livingdex-topbar-btn-shine" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>

      {/* Barra de progresso animada */}
      <motion.div
        className="livingdex-topbar-progress"
        initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="livingdex-topbar-progress-labels">
          <span className="livingdex-topbar-progress-label">Progresso da Dex Regional</span>
          <span className="livingdex-topbar-progress-count">
            {ownedCount}
            <span className="livingdex-topbar-progress-slash"> / </span>
            {totalSpecies}
            <span className="livingdex-topbar-progress-pct">· {pct}%</span>
          </span>
        </div>
        <div className="livingdex-topbar-progress-track">
          <motion.div
            className="livingdex-topbar-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    </div>
  );
}