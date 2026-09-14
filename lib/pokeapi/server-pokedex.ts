import { NATIONAL_DEX_ID } from './pokedex-map';

const BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokedexSpecies {
  id: number;
  entryNumber: number;
  name: string;
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

  try {
    const response = await fetch(`${BASE_URL}/pokedex/${target}`, {
      next: { revalidate: 604800 },
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

    console.info(`Pokédex ${target} carregada: ${species.length} entradas`);
    return species;
  } catch (error) {
    console.error(`Falha ao buscar Pokédex ${target}:`, error);
    if (target !== NATIONAL_DEX_ID) {
      console.warn(`Usando fallback da Pokédex Nacional (${NATIONAL_DEX_ID})`);
      return getPokedexServer(NATIONAL_DEX_ID);
    }
    return [];
  }
}
