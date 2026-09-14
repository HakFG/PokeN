// lib/pokeapi/server-sprites.ts
import { prisma } from '@/lib/prisma';

/**
 * Resolve a URL de sprite para um pokémon em um contexto de jogo.
 * Ordem de prioridade:
 *   1. CustomSprite da hack room (se existir)
 *   2. null — o cliente usa Dream World + fallback official-artwork
 */
export async function resolveSprite(
  pokemonId: number,
  gameId: string,
): Promise<string | null> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { hackRoom: { include: { customSprites: true } } },
  });

  const custom = game?.hackRoom?.customSprites.find(
    (s) => s.pokemonId === pokemonId,
  );
  if (custom) return custom.imageUrl;

  return null;
}

/**
 * Versão em lote: resolve apenas sprites customizados de hack room.
 * Para o restante, o cliente usa getPreferredSprite / getFallbackSprite.
 */
export async function resolveSpritesBatch(
  items: { pokemonId: number; gameId: string }[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();

  const gameIds = [...new Set(items.map((i) => i.gameId))];
  const games = await prisma.game.findMany({
    where: { id: { in: gameIds } },
    include: { hackRoom: { include: { customSprites: true } } },
  });
  const gameMap = new Map(games.map((g) => [g.id, g]));

  for (const item of items) {
    const key = `${item.pokemonId}:${item.gameId}`;
    const game = gameMap.get(item.gameId);

    const custom = game?.hackRoom?.customSprites.find(
      (s) => s.pokemonId === item.pokemonId,
    );
    result.set(key, custom?.imageUrl ?? null);
  }

  return result;
}
