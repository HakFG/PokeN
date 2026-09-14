// lib/pokeapi/server.ts
import type { PokemonDetail } from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Versão server-side da busca de pokémon.
 * Usa o cache de fetch do Next.js (revalidate de 24h),
 * já que IndexedDB não existe no servidor.
 */
export async function getPokemonServer(
  idOrName: number | string,
): Promise<PokemonDetail> {
  const res = await fetch(`${BASE_URL}/pokemon/${idOrName}`, {
    next: { revalidate: 86400 }, // 24h
  });
  if (!res.ok) {
    throw new Error(`PokeAPI error ${res.status} para ${idOrName}`);
  }
  return res.json() as Promise<PokemonDetail>;
}