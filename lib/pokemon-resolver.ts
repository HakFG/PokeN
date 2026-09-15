import { prisma } from '@/lib/prisma';
import { getPokemonServer } from '@/lib/pokeapi/server';
import { resolveSprite } from '@/lib/pokeapi/server-sprites';

/** Resolve uma espécie nativa ou um Fakémon para uma representação de UI única. */
export async function resolvePokemonDisplay(input: { pokemonId: number; fakeSpeciesId?: string | null; gameId: string; nickname?: string | null; isShiny?: boolean; spriteVariant?: string | null }) {
  if (input.fakeSpeciesId) {
    const fake = await prisma.fakeSpecies.findUnique({ where: { id: input.fakeSpeciesId } });
    if (fake) return { id: fake.id, name: fake.name, spriteUrl: fake.spriteUrl, types: fake.types, isFake: true };
  }

  const [spriteUrl, detail] = await Promise.all([
    resolveSprite(input.pokemonId, input.gameId),
    getPokemonServer(input.pokemonId).catch(() => null),
  ]);

  return {
    id: String(input.pokemonId),
    name: detail?.name ?? `#${input.pokemonId}`,
    spriteUrl,
    types: [],
    isFake: false,
  };
}
