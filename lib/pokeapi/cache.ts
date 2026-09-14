// lib/pokeapi/cache.ts
import { openDB, type IDBPDatabase } from 'idb';
import type {
  PokemonListResponse,
  PokemonDetail,
  MoveDetail,
  PokemonSpecies,
} from './types';

const DB_NAME = 'poken-cache';
const DB_VERSION = 1;

export const STORES = {
  LIST: 'pokemon-list',
  DETAIL: 'pokemon-detail',
  MOVE: 'move-detail',
  SPECIES: 'pokemon-species',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cria as stores apenas se ainda não existirem
        if (!db.objectStoreNames.contains(STORES.LIST)) {
          db.createObjectStore(STORES.LIST);
        }
        if (!db.objectStoreNames.contains(STORES.DETAIL)) {
          db.createObjectStore(STORES.DETAIL);
        }
        if (!db.objectStoreNames.contains(STORES.MOVE)) {
          db.createObjectStore(STORES.MOVE);
        }
        if (!db.objectStoreNames.contains(STORES.SPECIES)) {
          db.createObjectStore(STORES.SPECIES);
        }
      },
    });
  }
  return dbPromise;
}

// ── Genéricos ──────────────────────────────────────────────
async function getFromStore<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await getDB();
  return db.get(store, key) as Promise<T | undefined>;
}

async function putInStore<T>(store: StoreName, key: IDBValidKey, value: T): Promise<void> {
  const db = await getDB();
  await db.put(store, value, key);
}

// ── Lista de pokémons ─────────────────────────────────────
export async function getCachedPokemonList(): Promise<PokemonListResponse | undefined> {
  return getFromStore<PokemonListResponse>(STORES.LIST, 'all');
}

export async function setCachedPokemonList(data: PokemonListResponse): Promise<void> {
  await putInStore(STORES.LIST, 'all', data);
}

// ── Detalhe de pokémon ────────────────────────────────────
export async function getCachedPokemonDetail(id: number): Promise<PokemonDetail | undefined> {
  return getFromStore<PokemonDetail>(STORES.DETAIL, id);
}

export async function setCachedPokemonDetail(id: number, data: PokemonDetail): Promise<void> {
  await putInStore(STORES.DETAIL, id, data);
}

// ── Detalhe de move ───────────────────────────────────────
export async function getCachedMove(name: string): Promise<MoveDetail | undefined> {
  return getFromStore<MoveDetail>(STORES.MOVE, name);
}

export async function setCachedMove(name: string, data: MoveDetail): Promise<void> {
  await putInStore(STORES.MOVE, name, data);
}

// ── Espécie ───────────────────────────────────────────────
export async function getCachedSpecies(id: number): Promise<PokemonSpecies | undefined> {
  return getFromStore<PokemonSpecies>(STORES.SPECIES, id);
}

export async function setCachedSpecies(id: number, data: PokemonSpecies): Promise<void> {
  await putInStore(STORES.SPECIES, id, data);
}

// ── Limpeza (útil para debug) ──────────────────────────────
export async function clearCache(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear(STORES.LIST),
    db.clear(STORES.DETAIL),
    db.clear(STORES.MOVE),
    db.clear(STORES.SPECIES),
  ]);
}