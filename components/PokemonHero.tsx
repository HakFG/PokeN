'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  imageSrc: string;
  pokemonName: string;
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * 360,
  delay: i * 0.22,
  distance: 130 + (i % 3) * 30,
}));

export default function PokemonHero({ imageSrc, pokemonName }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center min-h-[38vh] md:min-h-[55vh] md:mr-[-3rem]">
      {/* Pool de luz embaixo */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{
          opacity: reduceMotion ? 0.55 : [0.4, 0.85, 0.4],
          scale: 1,
        }}
        transition={
          reduceMotion
            ? { duration: 1, delay: 0.4 }
            : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }
        }
        className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[58%] h-28 rounded-full blur-3xl bg-violet-500/55"
      />

      {/* Segunda camada de glow mais ampla */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduceMotion ? 0.35 : [0.2, 0.5, 0.2] }}
        transition={
          reduceMotion
            ? { duration: 1, delay: 0.5 }
            : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }
        }
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[80%] h-40 rounded-full blur-3xl bg-rose-500/25"
      />

      {/* Partículas orbitando */}
      {!reduceMotion &&
        PARTICLES.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          return (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute bottom-[22%] left-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.9)]"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, Math.cos(rad) * p.distance],
                y: [0, Math.sin(rad) * p.distance * 0.7 - 60],
                scale: [0.4, 1, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: p.delay + 1.5,
                ease: 'easeOut',
              }}
            />
          );
        })}

      {/* Pokémon */}
      <motion.div
        initial={{ opacity: 0, x: -100, scale: 0.85, filter: 'blur(16px)' }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <motion.img
          src={imageSrc}
          alt={pokemonName}
          className="max-h-[62vh] w-auto select-none"
          style={{
            filter:
              'drop-shadow(0 0 40px rgba(139,92,246,0.65)) drop-shadow(0 0 100px rgba(190,24,93,0.3))',
          }}
          animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}