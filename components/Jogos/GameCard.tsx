'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  gameId: string;
  name: string;
  themeColor: string;
  isCurrentlyPlaying: boolean;
  bannerUrl: string | null;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  index: number;
}

export default function GameCard({ gameId, name, themeColor, isCurrentlyPlaying, bannerUrl, status, index }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 60, scale: 0.9 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/jogos/${gameId}`} className="block">
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -12, scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-[#1D132D] ${isCurrentlyPlaying ? 'game-card-playing' : ''}`}
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 40px ${themeColor}66, 0 0 32px ${themeColor}80` }}
          />
          {bannerUrl && !imageFailed ? (
            <img
              src={bannerUrl}
              alt={name}
              onError={() => setImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.15]"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-3" style={{ background: `linear-gradient(160deg, ${themeColor}55 0%, #1D132D 100%)` }}>
              <span className="font-display text-center text-2xl font-black uppercase leading-tight tracking-wide text-white/90 drop-shadow-lg">{name}</span>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          {isCurrentlyPlaying && (
            <motion.div
              aria-hidden="true"
              className="absolute right-3 top-3 z-30 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black"
              style={{ backgroundColor: '#FBBF24' }}
              animate={reduceMotion ? undefined : { boxShadow: ['0 0 12px rgba(251,191,36,.6)', '0 0 24px rgba(251,191,36,1)', '0 0 12px rgba(251,191,36,.6)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >Jogando</motion.div>
          )}
          {status && <span className={`absolute left-3 top-3 z-30 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${status === 'COMPLETED' ? 'bg-emerald-300 text-emerald-950' : status === 'DROPPED' ? 'bg-red-300 text-red-950' : 'bg-cyan-300 text-cyan-950'}`}>{status === 'COMPLETED' ? 'Concluído' : status === 'DROPPED' ? 'Pausado' : 'Em andamento'}</span>}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
            <h3 className="font-display text-center text-sm font-black uppercase leading-tight tracking-wide text-white drop-shadow-md md:text-base">{name}</h3>
            <div className="mt-2 h-[3px] w-full rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }} />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
