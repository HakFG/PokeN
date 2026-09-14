'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Background "Holodex Archive" — estética de Pokédex holográfica.
 * Camadas: base em gradiente + grade hexagonal + glow central +
 * scan line vertical (varredura tipo Pokédex) + HUD corners +
 * data streams (números de dex flutuando) + vinheta.
 */
export default function LivingDexBackground() {
  const reduceMotion = useReducedMotion();

  // Data streams — números de dex que sobem e desaparecem
  const streams = [
    { id: 1, left: '8%', delay: 0, text: '#001' },
    { id: 2, left: '22%', delay: 2.4, text: '#025' },
    { id: 3, left: '38%', delay: 5.1, text: '#150' },
    { id: 4, left: '58%', delay: 1.2, text: '#151' },
    { id: 5, left: '76%', delay: 3.6, text: '#251' },
    { id: 6, left: '90%', delay: 6.8, text: '#493' },
  ];

  return (
    <div className="livingdex-bg" aria-hidden="true">
      {/* Base em gradiente roxo/violeta */}
      <div className="livingdex-bg-base" />

      {/* Grade hexagonal (referência a telas de Pokédex) */}
      <div className="livingdex-bg-hexgrid" />

      {/* Glow radial central ciano/dourado */}
      <div className="livingdex-bg-glow" />

      {/* Scan line vertical contínua — "Pokédex scan" */}
      {!reduceMotion && <div className="livingdex-bg-scan" />}

      {/* Feixe diagonal dourado (assinatura do site) */}
      {!reduceMotion && <div className="livingdex-bg-sweep" />}

      {/* HUD corners (brackets nos 4 cantos) */}
      <span className="livingdex-hud tl" />
      <span className="livingdex-hud tr" />
      <span className="livingdex-hud bl" />
      <span className="livingdex-hud br" />

      {/* Data streams — números flutuando para cima */}
      {!reduceMotion &&
        streams.map((s) => (
          <motion.span
            key={s.id}
            className="livingdex-data"
            style={{ left: s.left }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], y: ['100%', '-20%'] }}
            transition={{
              duration: 10,
              delay: s.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {s.text}
          </motion.span>
        ))}

      {/* Vinheta escura */}
      <div className="livingdex-bg-vignette" />
    </div>
  );
}