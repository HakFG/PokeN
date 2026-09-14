// lib/pokeapi/sprite-variants.ts

/**
 * Variantes disponíveis. Aqui só usamos as "desenhadas" (sem 3D, sem pixel art):
 *   - dream-world       → SVG vetorial (Gen I–V apenas)
 *   - official-artwork  → PNG arte oficial 2D (todas as gerações)
 *
 * Shiny: Dream World não tem versão shiny na PokeAPI.
 * Quando isShiny=true, sempre usamos official-artwork/shiny.
 */
export const SPRITE_VARIANTS = ['dream-world', 'official-artwork'] as const;

export type SpriteVariant = (typeof SPRITE_VARIANTS)[number];

/** Sorteia uma variante aleatória do pool. */
export function randomSpriteVariant(): SpriteVariant {
  return SPRITE_VARIANTS[Math.floor(Math.random() * SPRITE_VARIANTS.length)];
}

/** Retorna a URL de uma variante específica (não-shiny). */
export function getSpriteUrl(pokemonId: number, variant: SpriteVariant): string {
  switch (variant) {
    case 'dream-world':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`;
    case 'official-artwork':
    default:
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  }
}

/** Official artwork normal ou shiny. */
export function getOfficialArtwork(pokemonId: number, shiny = false): string {
  if (shiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`;
  }
  return getSpriteUrl(pokemonId, 'official-artwork');
}

/**
 * Retorna a URL do sprite.
 * Se shiny → sempre official-artwork shiny (única arte shiny 2D disponível).
 * Se variant null → official-artwork normal.
 */
export function getPreferredSprite(
  pokemonId: number,
  variant: string | null,
  shiny = false,
): string {
  if (shiny) return getOfficialArtwork(pokemonId, true);
  const v = (variant as SpriteVariant) || 'official-artwork';
  return getSpriteUrl(pokemonId, v);
}

/** Fallback universal — official-artwork (shiny se aplicável). */
export function getFallbackSprite(pokemonId: number, shiny = false): string {
  return getOfficialArtwork(pokemonId, shiny);
}
