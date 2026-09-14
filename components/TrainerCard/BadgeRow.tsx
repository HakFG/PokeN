'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  iconUrl: string | null;
  earnedAt: Date | string | null;
}

interface Props {
  badges: Badge[];
  themeColor: string;
}

export default function BadgeRow({ badges, themeColor }: Props) {
  const [selected, setSelected] = useState<Badge | null>(null);
  const reduceMotion = useReducedMotion();
  const earnedCount = badges.filter((b) => !!b.earnedAt).length;

  return (
    <div className="relative overflow-visible rounded-2xl border border-white/10 bg-slate-950/75 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur md:p-3">
      {/* Linha superior com a cor do jogo */}
      <div
        className="pointer-events-none absolute inset-x-3 top-0 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeColor} 50%, transparent)`,
          boxShadow: `0 0 10px ${themeColor}88`,
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/90 md:text-[10px]">
            Insígnias
          </span>
          <span className="font-display text-[9px] font-bold tracking-wider text-white/50 md:text-[10px]">
            {earnedCount} / {badges.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2">
          {badges.length === 0 ? (
            <span className="text-[10px] italic text-white/40">Nenhuma insígnia</span>
          ) : (
            badges.map((b, i) => {
              const earned = !!b.earnedAt;
              const isSelected = selected?.id === b.id;
              return (
                <motion.button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : b)}
                  initial={reduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.04,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.12, y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all md:h-10 md:w-10 ${
                    earned
                      ? 'border-amber-300/90 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
                      : 'border-white/20 bg-slate-800/70 hover:border-white/40'
                  } ${isSelected ? 'ring-2 ring-amber-300/70 ring-offset-2 ring-offset-slate-950' : ''}`}
                  aria-label={
                    earned
                      ? `${b.name}, conquistada em ${new Date(b.earnedAt!).toLocaleDateString('pt-BR')}`
                      : `${b.name}, bloqueada`
                  }
                >
                  {b.iconUrl ? (
                    <img
                      src={b.iconUrl}
                      alt=""
                      className={`h-5 w-5 object-contain md:h-6 md:w-6 ${earned ? '' : 'opacity-25 grayscale'}`}
                    />
                  ) : earned ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="rgba(35,25,0,0.9)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    // Pokébola estilizada em outline
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.15)" />
                    </svg>
                  )}

                  {earned && !reduceMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_rgba(253,230,138,0.9)]"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Faixa de info inline (evita overflow/clipping) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-1.5 text-[10px]">
              <span className="font-display font-bold uppercase tracking-wider text-amber-100">
                {selected.name}
              </span>
              <span className="text-white/50">
                {selected.earnedAt
                  ? `Conquistada em ${new Date(selected.earnedAt).toLocaleDateString('pt-BR')}`
                  : 'Ainda não conquistada'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}