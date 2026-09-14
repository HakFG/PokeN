'use client';

import { useState } from 'react';
import EditModal from './EditModal';

interface Props {
  trainerCardId: string;
  trainerName: string;
  characterSpriteUrl: string | null;
  showcase: {
    slot: number;
    pokemonId: number;
    nickname: string | null;
    moveset: string[];
  }[];
  badges: {
    id: string;
    name: string;
    iconUrl: string | null;
    earnedAt: Date | string | null;
  }[];
}

export default function EditButton({
  trainerCardId,
  trainerName,
  characterSpriteUrl,
  showcase,
  badges,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-amber-300/40 bg-slate-900/70 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100 backdrop-blur transition-all hover:border-amber-300/80 hover:bg-slate-900/90 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)]"
        aria-label="Editar Trainer Card"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
        <span>Editar</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      </button>

      {open && (
        <EditModal
          gameId=""
          trainerCardId={trainerCardId}
          initialName={trainerName}
          initialSpriteUrl={characterSpriteUrl}
          initialShowcase={showcase}
          initialBadges={badges}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}