'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  themeColor: string;
  gameName: string;
}

export default function TrainerCardFrame({ children, themeColor, gameName }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? undefined : { opacity: 0, y: 32, scale: 0.96 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="trainer-card-shell relative mx-auto w-full max-w-[1400px]"
      style={
        {
          '--card-theme': themeColor,
          height: 'calc(100vh - 9rem)',
          minHeight: '540px',
        } as React.CSSProperties
      }
    >
      {/* Anel externo com gradiente animado em conic-gradient */}
      <div className="trainer-card-ring" aria-hidden="true" />

      {/* Superfície interna */}
      <div className="trainer-card-surface relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[1.75rem]">
        {/* Holo sheen que varre o card */}
        <div className="trainer-card-holo" aria-hidden="true" />

        {/* Cantos decorativos (L-shaped dourados) */}
        <span className="trainer-corner trainer-corner-tl" aria-hidden="true" />
        <span className="trainer-corner trainer-corner-tr" aria-hidden="true" />
        <span className="trainer-corner trainer-corner-bl" aria-hidden="true" />
        <span className="trainer-corner trainer-corner-br" aria-hidden="true" />

        {/* Header */}
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="trainer-pokeball" aria-hidden="true" />
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-100">
              Trainer Card
            </span>
          </div>

          <span className="font-display text-xs font-black uppercase tracking-[0.25em] text-white/85">
            {gameName}
          </span>

          <span className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-amber-200/85">
            Coleção
          </span>
        </header>

        {/* Conteúdo */}
        <div className="relative z-10 min-h-0 flex-1 p-3 md:p-4">
          {children}
        </div>
      </div>
    </motion.section>
  );
}