'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import type { AuraColors } from '@/lib/typeColors';

interface Props {
  href: string;
  label: string;
  imageUrl: string;
  alt: string;
  /** Lado de onde o card entra (esquerda entra da esquerda, direita entra da direita). */
  direction: 'left' | 'right';
  /** Cores de aura específicas deste Pokémon/modo (ver lib/typeColors.ts). */
  aura: AuraColors;
  /** Delay (s) da entrada do card em si. */
  entranceDelay: number;
  /** Delay (s) da entrada do Pokémon sobreposto (spring com bounce leve). */
  pokemonDelay: number;
  /** Delay (s) do rótulo (fade-in depois do card). */
  labelDelay: number;
  /** Delay (s) do início do float idle — evita sincronizar os dois cards. */
  floatDelay: number;
}

export default function ModeCard({
  href,
  label,
  imageUrl,
  alt,
  direction,
  aura,
  entranceDelay,
  pokemonDelay,
  labelDelay,
  floatDelay,
}: Props) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  // Clique: bounce + flash rápido antes de navegar, em vez de navegação
  // instantânea do Link.
  const [clicked, setClicked] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (reduceMotion) return; // navegação instantânea, sem flash decorativo
    e.preventDefault();
    setClicked(true);
    window.setTimeout(() => router.push(href), 260);
  }

  return (
    // Camada 1: entrada do card (x -> 0), independente do hover.
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: direction === 'left' ? -60 : 60, scale: 0.9 }
      }
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: reduceMotion ? 0 : entranceDelay, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href={href} onClick={handleClick} className="block w-full">
        {/* Camada 2: interações de hover/tap do card, isoladas da entrada. */}
        <motion.div
          className="group relative"
          whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          animate={clicked ? { scale: [1, 1.06, 0.98] } : undefined}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Flash de clique */}
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 z-20 rounded-3xl bg-white pointer-events-none"
              initial={{ opacity: 0 }}
              animate={clicked ? { opacity: [0, 0.55, 0] } : { opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* Aura pulsante na cor do tipo — respiração via CSS, intensifica no hover via group-hover */}
          <div
            aria-hidden="true"
            className="modecard-aura absolute -inset-6 md:-inset-10 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
            style={
              {
                '--aura-a': aura.primary,
                '--aura-b': aura.secondary,
              } as React.CSSProperties
            }
          />

          {/*
            O sprite nunca anima opacity, blur ou filter. A entrada e a
            levitação usam apenas transformações, evitando o pisca-pisca.
          */}
          <motion.div
            initial={reduceMotion ? { y: 0, scale: 1 } : { y: 30, scale: 0.8 }}
            animate={reduceMotion ? { y: 0, scale: 1 } : { y: [0, -10, 0], scale: [1, 1.015, 1] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: pokemonDelay + floatDelay }}
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            className="relative z-10 flex w-full justify-center -mb-10 md:-mb-14"
          >
            <motion.img
              src={imageUrl}
              alt={alt}
              initial={reduceMotion ? { rotate: 0 } : { rotate: -1.5 }}
              animate={reduceMotion ? { rotate: 0 } : { rotate: [-1.5, 1.5, -1.5] }}
              transition={reduceMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
              className="mx-auto block h-56 w-auto object-contain drop-shadow-xl md:h-72"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="70" fill="${aura.primary}" opacity="0.5"/></svg>`
                  );
              }}
            />
          </motion.div>

          {/* Card com rótulo */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : labelDelay }}
            className="relative rounded-3xl pt-16 md:pt-20 pb-8 px-6 bg-slate-950/55 backdrop-blur-md border border-white/10"
            style={
              {
                '--aura-a': aura.primary,
                boxShadow: `0 0 0 1px color-mix(in srgb, ${aura.primary} 35%, transparent), 0 8px 28px rgba(0,0,0,0.35)`,
              } as React.CSSProperties
            }
          >
            <h2 className="font-display text-center text-2xl md:text-3xl font-black uppercase tracking-wide text-slate-50 transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_18px_var(--aura-a)]">
              {label}
            </h2>
          </motion.div>
        </motion.div>
      </a>
    </motion.div>
  );
}