// lib/pokeapi/server-list.ts
import type { PokemonListResponse } from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemonList(): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=2000`, {
    next: { revalidate: 604800 }, // 7 dias
  });
  if (!res.ok) throw new Error(`PokeAPI error ${res.status}`);
  return res.json() as Promise<PokemonListResponse>;
}