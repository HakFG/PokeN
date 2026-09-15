// lib/stats/profile-aggregates.ts
import { prisma } from '@/lib/prisma';
import { POKEDEX_BY_ID } from '@/lib/pokeapi/pokedex-map';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';

export async function getGlobalStats() {
  const [uniquePokemon, totalShiny, totalBadges, gamesCompleted, gamesInProgress] =
    await Promise.all([
      prisma.ownedPokemon.findMany({
        distinct: ['pokemonId'],
        select: { pokemonId: true },
      }),
      prisma.ownedPokemon.count({ where: { isShiny: true } }),
      prisma.badge.count({ where: { earnedAt: { not: null } } }),
      prisma.game.count({ where: { status: 'COMPLETED' } }),
      prisma.game.count({ where: { status: 'IN_PROGRESS' } }),
    ]);

  return {
    uniquePokemonCount: uniquePokemon.length,
    totalShiny,
    totalBadges,
    gamesCompleted,
    gamesInProgress,
  };
}

export async function getGamesWithProgress() {
  const games = await prisma.game.findMany({
    include: { ownedPokemon: { select: { pokemonId: true } } },
  });

  // Cache de tamanho de dex por pokedexId (evita refetch repetido)
  const sizeCache = new Map<number, Promise<number>>();
  async function getDexSize(pokedexId: number | null): Promise<number> {
    const id = pokedexId ?? 1; // fallback nacional
    let pending = sizeCache.get(id);
    if (!pending) {
      pending = getPokedexServer(id).then((species) => species.length);
      sizeCache.set(id, pending);
    }
    return pending;
  }

  const result = await Promise.all(
    games.map(async (game) => {
      const uniqueCaught = new Set(game.ownedPokemon.map((p) => p.pokemonId)).size;
      const total = await getDexSize(game.pokedexId);
      const percent = total > 0 ? Math.round((uniqueCaught / total) * 100) : 0;
      return {
        id: game.id,
        name: game.name,
        themeColor: game.themeColor,
        status: game.status,
        percent,
        isDexComplete: percent >= 100,
      };
    }),
  );

  return result;
}

export async function getCompletedGames() {
  return prisma.game.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });
}
