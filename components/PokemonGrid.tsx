'use client';

import Link from 'next/link';
import PokemonGridItem from './PokemonGridItem';
import PokemonDetailModal from './PokemonDetailModal';
import { useState } from 'react';

export interface PokemonGridEntry {
  id: string;
  pokemonId: number;
  nickname: string | null;
  name: string;
  level: number;
  moveset: unknown;
  isShiny: boolean;
  typeNames: string[];
  typeName: string;
  typeColor: string;
  spriteUrl: string | null;
  spriteVariant: string | null;
}

interface Props {
  entries: PokemonGridEntry[];
}

export default function PokemonGrid({ entries }: Props) {
  const [selected, setSelected] = useState<PokemonGridEntry | null>(null);

  if (entries.length === 0) {
    return <EmptyPokemonState />;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-2 justify-items-center gap-x-4 gap-y-10 px-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {entries.map((entry, index) => (
        <PokemonGridItem
          key={entry.id}
          pokemonId={entry.pokemonId}
          nickname={entry.nickname}
          name={entry.name}
          level={entry.level}
          isShiny={entry.isShiny}
          typeNames={entry.typeNames}
          typeName={entry.typeName}
          typeColor={entry.typeColor}
          spriteUrl={entry.spriteUrl}
          spriteVariant={entry.spriteVariant}
          index={index}
          onClick={() => setSelected(entry)}
        />
      ))}
      {selected && (
        <PokemonDetailModal
          pokemonId={selected.pokemonId}
          nickname={selected.nickname}
          level={selected.level}
          moveset={selected.moveset}
          isShiny={selected.isShiny}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function EmptyPokemonState() {
  return (
    <div className="mx-6 my-10 flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-cyan-300/20 bg-slate-950/25 px-6 text-center text-slate-100 backdrop-blur-md">
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-cyan-300/70 text-cyan-200">
        <span className="absolute h-1/2 w-full border-b-2 border-cyan-300/70" />
        <span className="z-10 h-8 w-8 rounded-full border-2 border-cyan-300/70 bg-slate-950/80 shadow-[0_0_24px_rgba(34,211,238,0.4)]" />
      </div>
      <h2 className="font-display text-2xl font-bold">Sua coleção está vazia</h2>
      <p className="mt-2 max-w-md text-sm text-slate-300">
        Escolha um jogo e adicione seu primeiro Pokémon para começar sua jornada.
      </p>
      <Link href="/jogos" className="mt-5 rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-2 text-sm font-bold text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-300/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
        Ir para Jogos
      </Link>
    </div>
  );
}