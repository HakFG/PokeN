'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideGame {
  id: string;
  name: string;
  themeColor: string;
  bannerUrl: string | null;
  isCurrentlyPlaying: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
}

interface CarouselProps {
  games: SlideGame[];
  label: string;
  emptyMsg: string;
  autoDelay?: number;
}

const slideVariants = {
  enter: (d: number) => ({
    x: d > 0 ? '55%' : '-55%',
    opacity: 0,
    scale: 0.88,
    filter: 'blur(4px)',
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (d: number) => ({
    x: d > 0 ? '-55%' : '55%',
    opacity: 0,
    scale: 0.88,
    filter: 'blur(4px)',
  }),
};

function GameSlide({ game }: { game: SlideGame }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href={`/jogos/${game.id}`} className="block w-full h-full group/card">
      <div
        className="relative w-full h-full overflow-hidden rounded-2xl bg-[#1D132D] cursor-pointer"
        style={{ boxShadow: '0 4px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)' }}
      >
        {/* Banner / fallback */}
        {game.bannerUrl && !imgFailed ? (
          <img
            src={game.bannerUrl}
            alt={game.name}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${game.themeColor}55 0%, #1D132D 100%)`,
            }}
          />
        )}

        {/* Escurecimento base */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

        {/* ── Hover overlay: shimmer + glow pulse ── */}
        {/* Borda colorida que acende */}
        <div
          className="absolute inset-0 z-20 rounded-2xl pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-400"
          style={{
            boxShadow: `inset 0 0 0 2px ${game.themeColor}cc, 0 0 40px ${game.themeColor}55`,
          }}
        />
        {/* Sweep de luz diagonal */}
        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'none',
          }}
        />
        {/* Vignette que desaparece no hover para "iluminar" */}
        <div className="absolute inset-0 z-20 rounded-2xl pointer-events-none bg-black/30 group-hover/card:bg-black/0 transition-colors duration-400" />

        {/* Badge: Jogando */}
        {game.isCurrentlyPlaying && (
          <div
            className="absolute right-2 top-2 z-30 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black"
            style={{
              backgroundColor: '#FBBF24',
              boxShadow: '0 0 14px rgba(251,191,36,0.75)',
            }}
          >
            Jogando
          </div>
        )}

        {/* Badge: 100% */}
        {game.status === 'COMPLETED' && (
          <span className="absolute left-2 top-2 z-30 rounded-full bg-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-950">
            100%
          </span>
        )}

        {/* Nome */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
          <h3 className="font-display text-center text-sm font-black uppercase leading-tight tracking-wide text-white drop-shadow-md">
            {game.name}
          </h3>
          <div
            className="mt-1.5 h-[3px] w-full rounded-full transition-all duration-400 group-hover/card:brightness-150"
            style={{
              background: `linear-gradient(90deg, transparent, ${game.themeColor}, transparent)`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

function SingleCarousel({ games, label, emptyMsg, autoDelay = 4200 }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (delta: 1 | -1) => {
      if (games.length < 2) return;
      setDir(delta);
      setIndex((i) => (i + delta + games.length) % games.length);
    },
    [games.length],
  );

  useEffect(() => {
    if (games.length < 2) return;
    const id = setInterval(() => go(1), autoDelay);
    return () => clearInterval(id);
  }, [games.length, go, autoDelay]);

  const current = games[index] ?? null;

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* Label */}
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 px-0.5">
        {label}
      </span>

      {/* Card area — aspecto 4/3 */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        {games.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
            <p className="text-center text-[11px] text-white/35 px-4 leading-snug">{emptyMsg}</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={`${index}`}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {current && <GameSlide game={current} />}
              </motion.div>
            </AnimatePresence>

            {/* Setas */}
            {games.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Anterior"
                  className="absolute left-1.5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white/65 backdrop-blur-sm hover:bg-black/80 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
                  style={{ opacity: undefined }}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Próximo"
                  className="absolute right-1.5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white/65 backdrop-blur-sm hover:bg-black/80 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
                  style={{ opacity: undefined }}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots compactos (máx 5) */}
                <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {(() => {
                    const maxDots = 5;
                    let start = 0;
                    if (games.length > maxDots) {
                      start = Math.max(0, Math.min(index - Math.floor(maxDots / 2), games.length - maxDots));
                    }
                    const visibleDots = Array.from(
                      { length: Math.min(maxDots, games.length) },
                      (_, idx) => start + idx,
                    );

                    return visibleDots.map((i, dotPos) => {
                      const isCurrent = i === index;
                      const isEdgeLeft = dotPos === 0 && i > 0;
                      const isEdgeRight = dotPos === visibleDots.length - 1 && i < games.length - 1;
                      const isEdge = isEdgeLeft || isEdgeRight;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setDir(i > index ? 1 : -1);
                            setIndex(i);
                          }}
                          aria-label={`Slide ${i + 1}`}
                          className={`rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'h-1.5 w-3.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                              : isEdge
                                ? 'h-1 w-1 bg-white/25 scale-75'
                                : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      );
                    });
                  })()}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface Props {
  playing: SlideGame[];
  completed: SlideGame[];
}

export default function HomeGameCarousel({ playing, completed }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
      className="group flex w-full max-w-[60%] gap-3"
    >
      <SingleCarousel
        games={playing}
        label="Jogando"
        emptyMsg="Nenhum jogo em andamento"
        autoDelay={4000}
      />
      <SingleCarousel
        games={completed}
        label="100%"
        emptyMsg="Nenhum jogo concluído"
        autoDelay={4800}
      />
    </motion.div>
  );
}
