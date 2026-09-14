'use client';

import { useState } from 'react';
import { getPokemon } from '@/lib/pokeapi/client';
import { getOfficialArtwork, getPixelSprite } from '@/lib/pokeapi/sprites';
import type { PokemonDetail } from '@/lib/pokeapi/types';

export default function TestePokeAPI() {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'cache' | 'network' | null>(null);

  async function buscar(id: number) {
    setLoading(true);
    const start = performance.now();
    const data = await getPokemon(id);
    const duration = Math.round(performance.now() - start);
    setPokemon(data);
    setSource(duration < 50 ? 'cache' : 'network');
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Teste PokeAPI + Cache</h1>
      <div className="flex gap-2">
        <button
          onClick={() => buscar(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Buscar Bulbasaur (1)
        </button>
        <button
          onClick={() => buscar(25)}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Buscar Pikachu (25)
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {source && <p className="text-sm text-gray-500">Fonte: {source}</p>}

      {pokemon && (
        <div className="border p-4 rounded space-y-2">
          <h2 className="text-xl font-bold capitalize">{pokemon.name}</h2>
          <p>ID: {pokemon.id}</p>
          <p>Tipos: {pokemon.types.map((t) => t.type.name).join(', ')}</p>
          {getOfficialArtwork(pokemon) && (
            <img src={getOfficialArtwork(pokemon)!} alt={pokemon.name} width={200} />
          )}
          {getPixelSprite(pokemon, 'red-blue') && (
            <img src={getPixelSprite(pokemon, 'red-blue')!} alt={`${pokemon.name} pixel`} width={96} />
          )}
        </div>
      )}
    </div>
  );
}