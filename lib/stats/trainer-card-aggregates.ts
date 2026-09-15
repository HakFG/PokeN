// lib/stats/trainer-card-aggregates.ts
import { prisma } from '@/lib/prisma';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';

export async function getTrainerCardStats(gameId: string) {
  const [shinyCount, ownedPokemon, game] = await Promise.all([
    prisma.ownedPokemon.count({ where: { gameId, isShiny: true } }),
    prisma.ownedPokemon.findMany({
      where: { gameId },
      select: { pokemonId: true },
    }),
    prisma.game.findUnique({
      where: { id: gameId },
      select: { status: true, startedAt: true, completedAt: true, pokedexId: true },
    }),
  ]);

  const totalSpecies = (await getPokedexServer(game?.pokedexId ?? 1)).length;
  const uniqueCaught = new Set(ownedPokemon.map((p) => p.pokemonId)).size;
  const dexPercent =
    totalSpecies > 0 ? Math.round((uniqueCaught / totalSpecies) * 100) : 0;

  return {
    shinyCount,
    uniqueCaught,
    totalSpecies,
    dexPercent,
    isDexComplete: dexPercent >= 100,
    status: game?.status ?? 'IN_PROGRESS',
    startedAt: game?.startedAt ?? null,
    completedAt: game?.completedAt ?? null,
  };
}
