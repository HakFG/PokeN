'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { getPreferredSprite, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  pokemonId: number;
  nickname: string | null;
  name: string;
  level: number;
  isShiny: boolean;
  typeNames: string[];
  typeName: string;
  typeColor: string;
  spriteUrl: string | null;
  spriteVariant: string | null;
  index?: number;
  onClick?: () => void;
}

export default function PokemonGridItem({
  pokemonId,
  nickname,
  name,
  level,
  isShiny,
  typeNames,
  typeName,
  typeColor,
  spriteUrl,
  spriteVariant,
  onClick,
  index = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const displayName = nickname ?? name;
  const src = spriteUrl
    ? spriteUrl
    : failed
      ? getFallbackSprite(pokemonId, isShiny)
      : getPreferredSprite(pokemonId, spriteVariant, isShiny);

  const regNo = `#${String(pokemonId).padStart(3, '0')}`;
  const secondaryColor = typeColor; // fallback if only one type resolves color
  const edgeGradient =
    typeNames.length > 1
      ? `linear-gradient(90deg, ${typeColor}, ${secondaryColor}66)`
      : typeColor;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${displayName}, nível ${level}, Pokédex número ${pokemonId}${isShiny ? ', variante shiny' : ''}`}
      whileTap={{ scale: 0.96 }}
      initial={reduceMotion ? undefined : { opacity: 0, clipPath: 'inset(50% 0 50% 0)' }}
      animate={reduceMotion ? undefined : { opacity: 1, clipPath: 'inset(0% 0 0% 0)' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.55), ease: [0.16, 1, 0.3, 1] }}
      className="pokebay group relative flex w-full flex-col overflow-hidden rounded-[10px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      style={{ '--bay-color': typeColor } as CSSProperties}
    >
      <div className="pokebay-frame relative border border-white/10 bg-[#120B1E] transition-shadow duration-300">
        {/* barra de tipo no topo — sólida se mono-tipo, gradiente se dual-tipo */}
        <div className="h-[3px] w-full" style={{ background: edgeGradient }} aria-hidden="true" />

        {/* cantos de mira — só aparecem no hover/focus */}
        <svg
          className="pointer-events-none absolute left-0 top-0 z-30 h-4 w-4 -translate-x-px opacity-0 transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M1 7V1H7" stroke={typeColor} strokeWidth="1.5" />
        </svg>
        <svg
          className="pointer-events-none absolute right-0 top-0 z-30 h-4 w-4 translate-x-px opacity-0 transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M15 7V1H9" stroke={typeColor} strokeWidth="1.5" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-4 w-4 -translate-x-px opacity-0 transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M1 9V15H7" stroke={typeColor} strokeWidth="1.5" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-0 right-0 z-30 h-4 w-4 translate-x-px opacity-0 transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M15 9V15H9" stroke={typeColor} strokeWidth="1.5" />
        </svg>

        {/* barra de leitura */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="font-mono text-[10px] font-bold tracking-tight text-slate-500 group-hover:text-slate-300">
            {regNo}
          </span>
          <span
            className="h-1.5 w-1.5 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_6px_var(--bay-color)]"
            style={{ backgroundColor: `${typeColor}99` }}
            aria-hidden="true"
          />
        </div>

        {/* baia de contenção */}
        <div className="pokebay-well relative flex h-28 items-center justify-center sm:h-32">
          <div className="pokebay-grid absolute inset-0 opacity-[0.15]" aria-hidden="true" />
          <div
            className="pokebay-scanline absolute inset-x-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-70"
            style={{ backgroundColor: typeColor, boxShadow: `0 0 8px ${typeColor}` }}
            aria-hidden="true"
          />
          <img
            src={src}
            alt={displayName}
            className="relative z-10 h-[78%] w-[78%] object-contain drop-shadow-[0_8px_10px_rgba(4,8,24,0.5)] transition duration-300 group-hover:scale-[1.07] group-hover:drop-shadow-[0_0_14px_var(--bay-color)]"
            loading="lazy"
            onError={() => setFailed(true)}
          />
          {isShiny && (
            <span
              className="pokebay-shiny absolute left-1.5 top-1.5 z-20 flex items-center gap-0.5 rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/50"
              aria-label="Variante shiny"
            >
              <svg viewBox="0 0 10 10" className="h-2 w-2 fill-amber-200" aria-hidden="true">
                <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" />
              </svg>
              anomalia
            </span>
          )}
          <span className="absolute bottom-1.5 right-1.5 z-20 rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-200 ring-1 ring-white/10">
            Lv{level}
          </span>
        </div>

        {/* rodapé */}
        <div className="border-t border-white/10 bg-black/20 px-2 py-1.5">
          <p className="truncate text-[11px] font-bold leading-tight text-slate-100 sm:text-xs">
            {displayName}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {typeNames.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-[3px] px-1 py-[1px] text-[8px] font-bold uppercase tracking-wide text-slate-950"
                style={{ backgroundColor: t === typeName ? typeColor : `${typeColor}55` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}