// lib/pokeapi/types.ts

export interface PokemonListItem {
  id: number;
  name: string;
  url: string; // URL do recurso na PokeAPI
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
  versions?: {
    [generation: string]: {
      [game: string]: {
        front_default: string | null;
        back_default?: string | null;
      };
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  moves: { move: { name: string; url: string } }[];
}

export interface MoveDetail {
  id: number;
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: { name: string };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  generation: { name: string; url: string };
  color: { name: string };
  is_legendary: boolean;
  is_mythical: boolean;
}