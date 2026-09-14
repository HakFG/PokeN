// lib/pokeapi/sprites.ts
import type { PokemonDetail } from './types';

/**
 * Mapa de "chave de jogo" → caminho dentro de sprites.versions
 * Ajuste conforme os jogos que você for suportar.
 */
const GAME_SPRITE_MAP: Record<string, [string, string]> = {
  'red-blue': ['generation-i', 'red-blue'],
  'yellow': ['generation-i', 'yellow'],
  'gold-silver': ['generation-ii', 'gold'],
  'crystal': ['generation-ii', 'crystal'],
  'ruby-sapphire': ['generation-iii', 'ruby-sapphire'],
  'emerald': ['generation-iii', 'emerald'],
  'firered-leafgreen': ['generation-iii', 'firered-leafgreen'],
  'diamond-pearl': ['generation-iv', 'diamond-pearl'],
  'platinum': ['generation-iv', 'platinum'],
  'heartgold-soulsilver': ['generation-iv', 'heartgold-soulsilver'],
  'black-white': ['generation-v', 'black-white'],
  'black-2-white-2': ['generation-v', 'black-2-white-2'],
  'x-y': ['generation-vi', 'x-y'],
  'omega-ruby-alpha-sapphire': ['generation-vi', 'omega-ruby-alpha-sapphire'],
  'sun-moon': ['generation-vii', 'sun-moon'],
  'ultra-sun-ultra-moon': ['generation-vii', 'ultra-sun-ultra-moon'],
};

/**
 * Retorna a URL do sprite pixelado de um pokémon para um jogo específico.
 * Se não houver sprite para aquele jogo, cai para o front_default.
 */
export function getPixelSprite(detail: PokemonDetail, gameKey: string): string | null {
  const versions = detail.sprites.versions;
  if (!versions) return detail.sprites.front_default;

  const mapping = GAME_SPRITE_MAP[gameKey];
  if (!mapping) return detail.sprites.front_default;

  const [generation, game] = mapping;
  const sprite = versions[generation]?.[game]?.front_default;

  return sprite ?? detail.sprites.front_default;
}

/**
 * Retorna o artwork oficial (estilo home/favoritos).
 */
export function getOfficialArtwork(detail: PokemonDetail): string | null {
  return detail.sprites.other?.['official-artwork']?.front_default ?? null;
}

// lib/pokeapi/sprites.ts (continuação)

import { getPokemon } from './client';

/**
 * Retorna a URL do sprite para um pokémon em um contexto de jogo.
 * Nesta etapa, apenas delega para a PokeAPI. A verificação de
 * CustomSprite (hack room) será adicionada em etapa futura.
 *
 * ATENÇÃO: esta função deve rodar no servidor se for consultar o Prisma.
 */
export async function getSpriteForContext(
  pokemonId: number,
  gameId: string,
  gameKey: string,
): Promise<string | null> {
  // TODO: verificar CustomSprite no Prisma quando hack rooms estiverem implementadas
  const detail = await getPokemon(pokemonId);
  return getPixelSprite(detail, gameKey);
}