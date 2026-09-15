import { prisma } from '@/lib/prisma';
import { resolveSprite } from '@/lib/pokeapi/server-sprites';

/** Resolve uma espécie nativa ou um Fakémon para uma representação de UI única. */
export async function resolvePokemonDisplay(input: { pokemonId: number; fakeSpeciesId?: string | null; gameId: string; nickname?: string | null; isShiny?: boolean; spriteVariant?: string | null }) {
  if (input.fakeSpeciesId) {
    const fake = await prisma.fakeSpecies.findUnique({ where: { id: input.fakeSpeciesId } });
    if (fake) return { id: fake.id, name: input.nickname || fake.name, spriteUrl: fake.spriteUrl, types: fake.types, isFake: true };
  }
  const spriteUrl = await resolveSprite(input.pokemonId, input.gameId);
  return { id: String(input.pokemonId), name: input.nickname || `#${input.pokemonId}`, spriteUrl, types: [], isFake: false };
}
