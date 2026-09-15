'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import FavoriteEditModal from './FavoriteEditModal';
import type { FavoriteSlotData } from './FavoritesGrid';

interface Props {
  slot: number;
  favorite: FavoriteSlotData;
}

export default function FavoriteSlotCard({ slot, favorite }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasPokemon = favorite.pokemonId !== null;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setModalOpen(true)}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`fav-slot ${hasPokemon ? 'fav-slot-filled' : 'fav-slot-empty'}`}
        aria-label={
          hasPokemon
            ? `Favorito: ${favorite.name ?? 'pokémon'}`
            : `Slot ${slot} vazio — clique para adicionar`
        }
      >
        {hasPokemon && favorite.animatedSpriteUrl && !failed ? (
          <img
            src={favorite.animatedSpriteUrl}
            alt={favorite.name ?? ''}
            className="fav-slot-sprite"
            draggable={false}
            onError={() => setFailed(true)}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : hasPokemon && failed ? (
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${favorite.pokemonId}.png`}
            alt={favorite.name ?? ''}
            className="fav-slot-sprite fav-slot-sprite-fallback"
            draggable={false}
          />
        ) : (
          <span className="fav-slot-plus">+</span>
        )}

        <span className="fav-slot-halo" aria-hidden="true" />
        <span className="fav-slot-sheen" aria-hidden="true" />

        {hasPokemon && favorite.name && (
          <span className="fav-slot-name">{favorite.name}</span>
        )}
      </motion.button>

      {modalOpen && (
        <FavoriteEditModal
          slot={slot}
          current={
            hasPokemon
              ? {
                  pokemonId: favorite.pokemonId!,
                  name: favorite.name,
                  animatedSpriteUrl: favorite.animatedSpriteUrl,
                }
              : null
          }
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}