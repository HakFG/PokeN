'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BoxSlot from './BoxSlot';

const BOX_COLS = 4;
const BOX_ROWS = 3;
const BOX_SIZE = BOX_COLS * BOX_ROWS;

interface Owned {
  id: string;
  pokemonId: number;
  name: string;
  nickname: string | null;
  level: number;
  boxNumber: number;
  boxSlot: number;
  spriteUrl: string | null;
  spriteVariant: string | null;
  isShiny: boolean;
}

interface Props {
  owned: Owned[];
  onEmptyClick: (boxNumber: number, slot: number) => void;
  onFilledClick: (id: string) => void;
}

export default function BoxPanel({ owned, onEmptyClick, onFilledClick }: Props) {
  const reduceMotion = useReducedMotion();
  const maxBox = Math.max(1, ...owned.map((p) => p.boxNumber));
  const [boxNumber, setBoxNumber] = useState(1);

  const boxOwned = owned.filter((p) => p.boxNumber === boxNumber);
  const slots = Array.from({ length: BOX_SIZE }, (_, i) => i + 1);
  const occupiedCount = boxOwned.length;

  function goTo(next: number) {
    setBoxNumber(Math.max(1, Math.min(maxBox + 1, next)));
  }

  return (
    <div className="box-panel">
      {/* Header: navegação entre boxes */}
      <div className="box-panel-header">
        <button
          type="button"
          onClick={() => goTo(boxNumber - 1)}
          disabled={boxNumber === 1}
          className="box-panel-nav-btn"
          aria-label="Box anterior"
        >
          ‹
        </button>

        <div className="box-panel-title-wrap">
          <span className="box-panel-title">BOX {String(boxNumber).padStart(2, '0')}</span>
          <span className="box-panel-count">
            {occupiedCount} / {BOX_SIZE}
          </span>
        </div>

        <button
          type="button"
          onClick={() => goTo(boxNumber + 1)}
          className="box-panel-nav-btn"
          aria-label="Próxima box"
        >
          ›
        </button>
      </div>

      {/* Grid de slots */}
      <div className="box-panel-grid">
        {slots.map((slot, i) => {
          const found = boxOwned.find((p) => p.boxSlot === slot) ?? null;
          return (
            <motion.div
              key={slot}
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: i * 0.02,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <BoxSlot
                slot={slot}
                boxNumber={boxNumber}
                owned={found}
                onEmptyClick={(s) => onEmptyClick(boxNumber, s)}
                onFilledClick={onFilledClick}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
