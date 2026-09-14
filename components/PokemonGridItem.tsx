'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
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
  const effectGlyphs: Record<string, string> = {
    fire: '•', water: '◦', grass: '✦', electric: '⚡', psychic: '◌', ghost: '◒',
    ice: '✧', ground: '·', rock: '·', flying: '⌁', poison: '○', dragon: '◆',
    fighting: '+', normal: '·', bug: '•', steel: '◇', dark: '◒', fairy: '✦',
  };
  const glyph = effectGlyphs[typeName] ?? '·';
  const effects = reduceMotion ? [] : Array.from({ length: 4 }, (_, effectIndex) => effectIndex);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${displayName}, nível ${level}, Pokédex número ${pokemonId}`}
      whileTap={{ scale: 0.97 }}
      initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.94 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 1.2), ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.04 }}
      className="group relative flex min-w-0 flex-col items-center rounded-3xl p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
    >
      <div className={`pokemon-card-stage ${typeNames.map((type) => `pokemon-type-${type}`).join(' ')} relative flex h-32 w-full min-w-[128px] items-end justify-center sm:h-36`}>
        <div
          className={`pokemon-blob absolute bottom-1 h-16 w-full max-w-[154px] rounded-[50%] border bg-slate-200/15 backdrop-blur-sm transition duration-300 group-hover:scale-105 group-hover:bg-slate-200/25 group-hover:shadow-[0_0_30px_var(--type-color)] ${isShiny ? 'pokemon-blob-shiny' : ''}`}
          style={{ borderColor: `${typeColor}88`, '--type-color': `${typeColor}99` } as CSSProperties}
        />
        {effects.map((effectIndex) => (
          <span
            key={effectIndex}
            className="pokemon-type-particle absolute z-20 text-sm font-black"
            style={{
              '--particle-index': effectIndex,
              '--type-color': typeColor,
            } as CSSProperties}
            aria-hidden="true"
          >
            {glyph}
          </span>
        ))}
        <motion.img
          src={src}
          alt={displayName}
          className="relative z-10 h-32 w-full object-contain drop-shadow-[0_12px_12px_rgba(8,15,45,0.35)] transition duration-300 group-hover:scale-105 sm:h-36"
          loading="lazy"
          onError={() => setFailed(true)}
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.6, delay: (index % 5) * 0.23, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute bottom-0 right-1 z-20 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow-md">Lv {level}</span>
        {isShiny && <span className="absolute left-1 top-1 text-sm text-amber-200 drop-shadow-[0_0_6px_rgba(253,230,138,0.9)]" aria-label="Shiny">✦</span>}
      </div>
      <span className="mt-3 max-w-[170px] whitespace-normal break-words text-xs font-bold text-slate-100 md:text-sm group-hover:text-white">
        {displayName} <span className="text-amber-200">Lv {level}</span>
      </span>
    </motion.button>
  );
}
