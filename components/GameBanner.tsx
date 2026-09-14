'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
  gameId: string;
  name: string;
  themeColor: string;
  bannerUrl?: string | null;
}

export default function GameBanner({ gameId, name, themeColor, bannerUrl }: Props) {
  return (
    <Link href={`/jogos/${gameId}`} className="block w-full">
      <motion.div
        whileHover={{ scale: 1.04, boxShadow: '0 10px 24px rgba(0,0,0,0.15)' }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-300 cursor-pointer"
        style={
          bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {bannerUrl && <div className="absolute inset-0 bg-black/40" />}

        {/* Barra de acento no topo */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 z-10"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative h-full flex items-center justify-center px-3">
          <h3
            className={`text-sm md:text-base font-black uppercase tracking-wide text-center leading-tight ${
              bannerUrl ? 'text-white drop-shadow-lg' : 'text-slate-900'
            }`}
          >
            {name}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}