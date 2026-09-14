'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const LINES = ['BEM-VINDO,', 'HAK'];

export default function WelcomeText() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`${rajdhani.className} text-left`}>
      <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.92] text-white drop-shadow-[0_4px_24px_rgba(15,23,42,0.35)]">
        {LINES.map((line, idx) => (
          <div key={line} className="overflow-hidden">
            <motion.div
              initial={{ y: '115%' }}
              animate={{ y: '0%' }}
              transition={{
                duration: 1,
                delay: 0.3 + idx * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.div>
          </div>
        ))}
      </h1>

      {/* Linha de acento com gradiente */}
      {!reduceMotion && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="origin-left h-[3px] w-36 mt-5 rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-transparent"
        />
      )}

      <div className="overflow-hidden mt-5">
        <motion.p
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-amber-50/85 font-medium tracking-wide leading-snug drop-shadow-[0_2px_12px_rgba(15,23,42,0.3)]"
        >
          Um mundo só seu e<br />
          dos seus pokémons
        </motion.p>
      </div>
    </div>
  );
}