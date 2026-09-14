'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, useReducedMotion } from 'framer-motion';
import { getPreferredSprite, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  slot: number;
  boxNumber: number;
  owned: {
    id: string;
    pokemonId: number;
    name: string;
    level: number;
    spriteUrl: string | null;
    spriteVariant: string | null;
    isShiny: boolean;
  } | null;
  onEmptyClick: (slot: number) => void;
  onFilledClick: (id: string) => void;
}

export default function BoxSlot({
  slot,
  boxNumber,
  owned,
  onEmptyClick,
  onFilledClick,
}: Props) {
  const dropId = `box-${boxNumber}-slot-${slot}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    disabled: !!owned,
  });
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  // ---------- Slot vazio ----------
  if (!owned) {
    return (
      <motion.button
        ref={setNodeRef}
        type="button"
        onClick={() => onEmptyClick(slot)}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`box-slot box-slot-empty ${isOver ? 'box-slot-over' : ''}`}
        aria-label={`Slot vazio ${slot}`}
      >
        <span className="box-slot-empty-plus">+</span>
        <span className="box-slot-empty-number">{String(slot).padStart(2, '0')}</span>
      </motion.button>
    );
  }

  // ---------- Slot ocupado ----------
  const src = owned.spriteUrl
    ? owned.spriteUrl
    : failed
      ? getFallbackSprite(owned.pokemonId, owned.isShiny)
      : getPreferredSprite(owned.pokemonId, owned.spriteVariant, owned.isShiny);

  // Atraso da animação de flutuação — cada slot tem timing diferente
  const floatDelay = (slot % 6) * 0.4;

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      onClick={() => onFilledClick(owned.id)}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="box-slot box-slot-filled"
      aria-label={`${owned.name} nível ${owned.level}`}
    >
      {/* Holo sweep contínuo */}
      <span className="box-slot-holo" aria-hidden="true" />

      <div className="box-slot-filled-inner">
        {/* Sprite com flutuação */}
        <div className="box-slot-sprite-wrap">
          <motion.img
            src={src}
            alt={owned.name}
            className="box-slot-sprite"
            draggable={false}
            loading="lazy"
            onError={() => setFailed(true)}
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -4, 0] }
            }
            transition={{
              duration: 3.2,
              delay: floatDelay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Info */}
        <div className="box-slot-info">
          <span className="box-slot-name">{owned.name}</span>
          <span className="box-slot-level">
            <span className="box-slot-level-label">LV</span>
            <span className="box-slot-level-value">
              {String(owned.level).padStart(2, '0')}
            </span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}
