// components/PokemonBox.tsx
'use client';

import { useState } from 'react';
import PokemonDetailModal from './PokemonDetailModal';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

const BOX_COLS = 6;
const BOX_ROWS = 5;
const BOX_SIZE = BOX_COLS * BOX_ROWS;

interface Owned {
  id: string;
  pokemonId: number;
  nickname: string | null;
  level: number;
  boxNumber: number;
  boxSlot: number;
  moveset: unknown;
  isShiny: boolean;
  typeColor: string;
}

interface Props {
  game: { id: string; name: string; ownedPokemon: Owned[]; pokedexId: number | null };
  dexTotal: number;
}

export default function PokemonBox({ game, dexTotal }: Props) {
  const [selected, setSelected] = useState<Owned | null>(null);
  const [boxNumber, setBoxNumber] = useState(1);

  const boxPokemon = game.ownedPokemon.filter((p) => p.boxNumber === boxNumber);
  const slots = Array.from({ length: BOX_SIZE }, (_, i) => i + 1);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div><h2 className="font-display font-bold text-xl text-cyan-100">{game.name}</h2><p className="text-xs text-slate-400">{new Set(game.ownedPokemon.map((p) => p.pokemonId)).size} / {dexTotal} espécies</p></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setBoxNumber(n)}
              className={`px-3 py-1 rounded ${
                boxNumber === n ? 'bg-slate-700 text-white' : 'bg-slate-200'
              }`}
            >
              Box {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 rounded-3xl border border-cyan-300/20 bg-slate-950/55 p-4 shadow-[0_18px_50px_rgba(8,15,45,0.25)] backdrop-blur-md">
        {slots.map((slot) => {
          const p = boxPokemon.find((x) => x.boxSlot === slot);
          return (
            <button
              key={slot}
              onClick={() => p && setSelected(p)}
              className={`aspect-square rounded-xl flex items-center justify-center border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                p ? 'bg-white/10 hover:bg-white/20' : 'border-dashed border-cyan-300/45 bg-cyan-300/5 hover:bg-cyan-300/10'
              }`}
              style={p ? { borderColor: p.typeColor } : undefined}
            >
              {p ? (
                <BoxSprite pokemonId={p.pokemonId} isShiny={p.isShiny} />
              ) : null}
            </button>
          );
        })}
      </div>

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
    </section>
  );
}

function BoxSprite({ pokemonId, isShiny }: { pokemonId: number; isShiny: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? getFallbackSprite(pokemonId, isShiny)
    : getOfficialArtwork(pokemonId, isShiny);

  return (
    <img
      src={src}
      alt={`#${pokemonId}`}
      className="w-12 h-12 object-contain"
      style={{ filter: isShiny ? 'drop-shadow(0 0 8px rgba(253,230,138,.9))' : undefined }}
      onError={() => setFailed(true)}
    />
  );
}
