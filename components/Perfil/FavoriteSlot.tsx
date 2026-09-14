'use client';

import { motion } from 'framer-motion';
import { getOfficialArtwork } from '@/lib/pokeapi/sprite-variants';

interface Props {
  pokemonId: number | null;
  name: string | null;
  onClick: () => void;
}

export default function FavoriteSlot({ pokemonId, name, onClick }: Props) {
  const src = pokemonId ? getOfficialArtwork(pokemonId) : null;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="aspect-square rounded-3xl bg-black flex items-center justify-center overflow-hidden"
    >
      {src ? (
        <img
          src={src}
          alt={name ?? ''}
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <span className="text-white/30 text-3xl font-light">+</span>
      )}
    </motion.button>
  );
}
