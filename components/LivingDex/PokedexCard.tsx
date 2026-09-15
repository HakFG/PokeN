'use client';

import { useDraggable } from '@dnd-kit/core';
import { getOfficialArtwork } from '@/lib/pokeapi/sprite-variants';

interface Props {
  id: string;
  pokemonId: number;
  entryNumber: number;
  name: string;
  owned: boolean;
  spriteUrl?: string | null;
  onClick: () => void;
}

export default function PokedexCard({
  id,
  pokemonId,
  entryNumber,
  name,
  owned,
  spriteUrl,
  onClick,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  const sprite = spriteUrl ?? getOfficialArtwork(pokemonId);

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={onClick}
      className={`pokedex-chip ${owned ? 'pokedex-chip-owned' : ''} ${
        isDragging ? 'pokedex-chip-dragging' : ''
      }`}
      aria-label={`${name}, #${String(entryNumber).padStart(3, '0')}${
        owned ? ' (possuído)' : ''
      }`}
    >
      {/* Linha de scan no hover */}
      <span className="pokedex-chip-scan" aria-hidden="true" />

      {/* Número regional */}
      <span className="pokedex-chip-number">
        #{String(entryNumber).padStart(3, '0')}
      </span>

      {/* Indicador de posse */}
      {owned && <span className="pokedex-chip-pokeball" aria-hidden="true" />}

      {/* Sprite */}
      <div className="pokedex-chip-sprite-wrap">
        <img
          src={sprite}
          alt=""
          className="pokedex-chip-sprite"
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Nome */}
      <span className="pokedex-chip-name">{name}</span>
    </button>
  );
}
