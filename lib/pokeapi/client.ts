// lib/pokeapi/client.ts
import {
  getCachedPokemonList,
  setCachedPokemonList,
  getCachedPokemonDetail,
  setCachedPokemonDetail,
  getCachedMove,
  setCachedMove,
  getCachedSpecies,
  setCachedSpecies,
} from './cache';
import type {
  PokemonListResponse,
  PokemonDetail,
  MoveDetail,
  PokemonSpecies,
} from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

// ── Helper de fetch com tratamento de erro ────────────────
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PokeAPI error ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

// ── Lista de pokémons ─────────────────────────────────────
export async function getPokemonList(): Promise<PokemonListResponse> {
  const cached = await getCachedPokemonList();
  if (cached) return cached;

  const data = await fetchJson<PokemonListResponse>(`${BASE_URL}/pokemon?limit=2000`);
  await setCachedPokemonList(data);
  return data;
}

// ── Detalhe de pokémon (por id ou nome) ───────────────────
export async function getPokemon(idOrName: number | string): Promise<PokemonDetail> {
  // Se for nome, não podemos usar o cache por id diretamente.
  // Normalizamos para id numérico apenas quando possível.
  if (typeof idOrName === 'number') {
    const cached = await getCachedPokemonDetail(idOrName);
    if (cached) return cached;

    const data = await fetchJson<PokemonDetail>(`${BASE_URL}/pokemon/${idOrName}`);
    await setCachedPokemonDetail(idOrName, data);
    return data;
  }

  // Fluxo para nome: busca direto (sem cache por nome nesta versão)
  const data = await fetchJson<PokemonDetail>(`${BASE_URL}/pokemon/${idOrName.toLowerCase()}`);
  await setCachedPokemonDetail(data.id, data); // cacheia pelo id numérico
  return data;
}

// ── Detalhe de move ───────────────────────────────────────
export async function getMove(name: string): Promise<MoveDetail> {
  const key = name.toLowerCase();
  const cached = await getCachedMove(key);
  if (cached) return cached;

  const data = await fetchJson<MoveDetail>(`${BASE_URL}/move/${key}`);
  await setCachedMove(key, data);
  return data;
}

// ── Espécie ───────────────────────────────────────────────
export async function getSpecies(id: number): Promise<PokemonSpecies> {
  const cached = await getCachedSpecies(id);
  if (cached) return cached;

  const data = await fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${id}`);
  await setCachedSpecies(id, data);
  return data;
}

// Adicione no final do arquivo:

export interface PokemonSearchResult {
  id: number;
  name: string;
  animatedSpriteUrl: string;
  fallbackSpriteUrl: string;
}

/** GIF animado estilo Gen V (Black/White) — só existe até #649. */
export function getAnimatedSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

/** Artwork oficial — usado como fallback do GIF. */
export function getArtworkSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Busca no cache do IndexedDB (mesma lista da Pokedex, sem nova rede). */
export async function searchPokemonByName(
  query: string,
): Promise<PokemonSearchResult[]> {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const list = await getPokemonList();
  return list.results
    .map((r) => {
      const id = Number(r.url.split('/').filter(Boolean).pop());
      return {
        id,
        name: r.name,
        animatedSpriteUrl: getAnimatedSpriteUrl(id),
        fallbackSpriteUrl: getArtworkSpriteUrl(id),
      };
    })
    .filter((p) => p.id > 0 && p.id <= 1025 && p.name.includes(q))
    .slice(0, 12);
}