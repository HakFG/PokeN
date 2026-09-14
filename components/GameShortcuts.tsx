'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ITEMS = [
  {
    lines: ['JOGO QUE RECÉM', 'ESTÁ JOGANDO'],
    href: '/jogos?filter=playing',
  },
  {
    lines: ['JOGOS JÁ', 'JOGADOS'],
    href: '/jogos',
  },
];

export default function GameShortcuts() {
  return (
    <div className="flex min-h-[120px] w-full flex-wrap content-start gap-3 md:gap-4">
      {/* TODO: substituir por carrossel de banners (Etapa 11) */}
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.25 + i * 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Link href={item.href}>
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-7 py-5 text-center font-bold text-white cursor-pointer shadow-[0_10px_35px_rgba(8,15,45,0.2)] hover:shadow-[0_12px_32px_rgba(34,211,238,0.35)] hover:border-cyan-300/70 transition-all"
            >
              {/* Barra de acento no topo */}
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-sky-500 to-indigo-500" />
              {item.lines[0]}
              <br />
              {item.lines[1]}
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}