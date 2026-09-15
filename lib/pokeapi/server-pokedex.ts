import { NATIONAL_DEX_ID } from './pokedex-map';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const memoryCache = new Map<number, { expiresAt: number; species: PokedexSpecies[] }>();
const pendingRequests = new Map<number, Promise<PokedexSpecies[]>>();

export interface PokedexSpecies {
  id: number;
  entryNumber: number;
  name: string;
  fakeSpeciesId?: string | null;
  spriteUrl?: string | null;
}

interface PokedexApiResponse {
  pokemon_entries: {
    entry_number: number;
    pokemon_species: { name: string; url: string };
  }[];
}

export async function getPokedexServer(
  pokedexId: number | null,
): Promise<PokedexSpecies[]> {
  const target = pokedexId ?? NATIONAL_DEX_ID;
  const cached = memoryCache.get(target);
  if (cached && cached.expiresAt > Date.now()) return cached.species;

  const pending = pendingRequests.get(target);
  if (pending) return pending;

  const request = loadPokedex(target);
  pendingRequests.set(target, request);
  try {
    const species = await request;
    if (species.length > 0) {
      memoryCache.set(target, { species, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return species;
  } finally {
    pendingRequests.delete(target);
  }
}

async function loadPokedex(target: number): Promise<PokedexSpecies[]> {

  try {
    const response = await fetch(`${BASE_URL}/pokedex/${target}`, {
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(
        `Pokedex ${target} retornou ${response.status} em ${BASE_URL}/pokedex/${target}`,
      );
    }

    const data = (await response.json()) as PokedexApiResponse;
    const species = data.pokemon_entries
      .map((entry) => {
        const id = Number(entry.pokemon_species.url.split('/').filter(Boolean).pop());
        return {
          id,
          entryNumber: entry.entry_number,
          name: entry.pokemon_species.name,
        };
      })
      .sort((first, second) => first.entryNumber - second.entryNumber);

    return species;
  } catch (error) {
    // A PokeAPI é externa; uma falha transitória não pode derrubar o SSR.
    // Não logamos o objeto de erro: em dev, o Next o promove para o overlay.
    console.warn(`Pokédex ${target} indisponível; usando dados de fallback.`);
    if (target !== NATIONAL_DEX_ID) {
      return getPokedexServer(NATIONAL_DEX_ID);
    }
    return [];
  }
}
