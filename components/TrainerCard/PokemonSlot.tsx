'use client';

import { useState } from 'react';
import { TYPE_COLORS } from '@/lib/pokemon-types';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  slot: number;
  pokemonId: number;
  nickname: string | null;
  moveset: string[];
  detail: PokemonDetail | null;
}

export default function PokemonSlot({ slot, pokemonId, nickname, moveset, detail }: Props) {
  const typeColor = detail?.types?.[0]?.type?.name
    ? TYPE_COLORS[detail.types[0].type.name] ?? '#90A4AE'
    : '#90A4AE';

  const [failed, setFailed] = useState(false);
  const sprite = failed
    ? getFallbackSprite(pokemonId)
    : getOfficialArtwork(pokemonId);

  const baseName = detail?.name ? capitalize(detail.name) : `#${pokemonId}`;
  const hasCustomNickname =
    nickname && detail?.name && nickname.toLowerCase() !== detail.name.toLowerCase();
  const displayName = hasCustomNickname ? `${baseName} · ${nickname}` : baseName;

  const hasMoves = moveset.length > 0;

  return (
    <div
      className="trainer-pokemon-slot group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-white/30 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1 md:p-2"
      style={
        {
          backgroundColor: typeColor,
          '--holo-delay': `${(slot - 1) * 0.4}s`,
        } as React.CSSProperties
      }
    >
      {/* Gradiente de profundidade */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30"
        aria-hidden="true"
      />

      {/* Holo sweep contínuo */}
      <div className="trainer-slot-holo" aria-hidden="true" />

      {/* Header: nome + tipos */}
      <div className="relative z-10 flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1 truncate font-display text-[10px] font-black uppercase tracking-wide text-black/85 md:text-[11px]">
          {displayName}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-0.5">
          {detail?.types.map((t) => (
            <span
              key={t.type.name}
              className="rounded-full border border-white/90 px-1.5 py-[1px] text-[7px] font-black uppercase tracking-wide text-white shadow-sm md:text-[8px]"
              style={{ backgroundColor: TYPE_COLORS[t.type.name] ?? '#555' }}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      {/* Corpo: sprite à esquerda + lista de moves à direita */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-1.5 pt-1">
        {/* Sprite */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <img
            src={sprite}
            alt={nickname ?? detail?.name ?? ''}
            className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110"
            draggable={false}
            onError={() => setFailed(true)}
          />
        </div>

        {/* Lista de moves em coluna à direita */}
        {hasMoves && (
          <div className="flex w-[42%] shrink-0 flex-col justify-center gap-1">
            {moveset.slice(0, 4).map((m, idx) => (
              <MoveChip key={m} name={m} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Chip individual de move ---------- */
function MoveChip({ name, index }: { name: string; index: number }) {
  return (
    <div
      className="move-chip group/move relative flex items-center gap-1 overflow-hidden rounded-md border border-white/40 bg-black/55 px-1.5 py-[3px] shadow-sm backdrop-blur-sm"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Marcador numerado estilo menu de batalha */}
      <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-amber-300/90 font-display text-[7px] font-black text-slate-900 shadow-[0_0_4px_rgba(251,191,36,0.7)]">
        {index + 1}
      </span>

      {/* Nome do move */}
      <span className="min-w-0 flex-1 truncate font-display text-[8px] font-bold uppercase tracking-wider text-white/95 md:text-[9px]">
        {name.replace(/-/g, ' ')}
      </span>

      {/* Setinha indicadora no hover */}
      <span className="move-chip-arrow shrink-0 text-[8px] text-amber-200/80">
        ▶
      </span>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
