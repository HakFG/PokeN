'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getPokemon } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  pokemonId: number;
  nickname: string | null;
  level: number;
  moveset: unknown;
  isShiny?: boolean;
  onClose: () => void;
}

export default function PokemonDetailModal({
  pokemonId,
  nickname,
  level,
  moveset,
  isShiny = false,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getPokemon(pokemonId).then(setDetail).catch(() => {});
  }, [pokemonId]);

  useEffect(() => {
    setFailed(false);
  }, [pokemonId, isShiny]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const moves = Array.isArray(moveset) ? (moveset as string[]) : [];
  const src = failed
    ? getFallbackSprite(pokemonId, isShiny)
    : getOfficialArtwork(pokemonId, isShiny);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-cyan-300/25 bg-slate-950/90 p-6 text-slate-100 shadow-[0_20px_80px_rgba(34,211,238,0.18)]"
        >
          <h2 className="text-2xl font-bold capitalize">
            {nickname ?? detail?.name ?? `#${pokemonId}`}
          </h2>
          {detail && (
            <p className="text-cyan-200">
              {detail.types.map((t) => t.type.name).join(' / ')}
            </p>
          )}
          <img
            src={src}
            alt={nickname ?? detail?.name ?? ''}
            className="mx-auto my-4 w-40 object-contain"
            onError={() => setFailed(true)}
          />
          <p className="font-semibold">Nível {level}</p>
          {moves.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-sm">Moveset</p>
              <ul className="list-disc list-inside text-sm capitalize">
                {moves.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2 font-bold text-amber-100 transition hover:bg-amber-300/20 focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            Fechar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
