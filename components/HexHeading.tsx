'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  label: string;
  /** Tamanho do texto. 'sm' para títulos de seção, 'lg' para banners grandes */
  size?: 'sm' | 'lg';
  /**
   * Opcional: quando true, aplica uma entrada animada (scale + blur -> foco).
   * Default false para não alterar o comportamento de páginas já existentes
   * que usam HexHeading sem essa prop (Home, Pokémons, Jogos, etc).
   */
  animateIn?: boolean;
}

export default function HexHeading({ label, size = 'sm', animateIn = false }: Props) {
  const isLg = size === 'lg';
  const reduceMotion = useReducedMotion();

  const hexBox = (
    <div
      className={`bg-slate-950/70 border border-cyan-300/45 shadow-[0_0_26px_rgba(34,211,238,0.15)] select-none ${
        isLg ? 'py-5 px-20' : 'py-3 px-10'
      }`}
      style={{
        clipPath: 'polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)',
      }}
    >
      <h2
        className={`font-display font-black tracking-wider text-cyan-100 whitespace-nowrap ${
          isLg ? 'text-3xl md:text-4xl' : 'text-lg md:text-xl'
        }`}
      >
        {label}
      </h2>
    </div>
  );

  if (!animateIn) {
    // Comportamento original, intocado — usado por todas as outras páginas.
    return <div className="flex justify-center my-8">{hexBox}</div>;
  }

  return (
    <div className="flex justify-center my-8">
      <motion.div
        initial={
          reduceMotion
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, scale: 0.9, filter: 'blur(6px)' }
        }
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {hexBox}
      </motion.div>
    </div>
  );
}