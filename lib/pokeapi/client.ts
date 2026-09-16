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
  iconUrl: string;
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

/** Busca no cache do IndexedDB / PokeAPI com ranking por prefixo e suporte a número da Dex. */
export async function searchPokemonByName(
  query: string,
): Promise<PokemonSearchResult[]> {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  const isNumeric = /^\d+$/.test(q);
  const numVal = isNumeric ? parseInt(q, 10) : null;

  try {
    const list = await getPokemonList();
    const mapped = list.results
      .map((r, index) => {
        const idMatch = r.url.match(/\/pokemon\/(\d+)\//);
        const id = idMatch ? parseInt(idMatch[1], 10) : index + 1;
        return {
          id,
          name: r.name,
          iconUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          animatedSpriteUrl: getAnimatedSpriteUrl(id),
          fallbackSpriteUrl: getArtworkSpriteUrl(id),
        };
      })
      .filter((p) => p.id > 0 && p.id <= 1025);

    if (isNumeric && numVal !== null) {
      // Prioridade: ID exato primeiro, depois ID que começa com os dígitos
      return mapped
        .filter((p) => String(p.id).startsWith(q))
        .sort((a, b) => {
          if (a.id === numVal) return -1;
          if (b.id === numVal) return 1;
          return a.id - b.id;
        })
        .slice(0, 10);
    }

    // Busca textual: começa com 'q' primeiro, depois contém 'q'
    const startsWithMatches: PokemonSearchResult[] = [];
    const containsMatches: PokemonSearchResult[] = [];

    for (const p of mapped) {
      const lower = p.name.toLowerCase();
      if (lower.startsWith(q)) {
        startsWithMatches.push(p);
      } else if (lower.includes(q)) {
        containsMatches.push(p);
      }
    }

    startsWithMatches.sort((a, b) => a.name.localeCompare(b.name));
    containsMatches.sort((a, b) => a.name.localeCompare(b.name));

    return [...startsWithMatches, ...containsMatches].slice(0, 10);
  } catch {
    return [];
  }
}