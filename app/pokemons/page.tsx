// app/pokemons/page.tsx
import Header from '@/components/Header';
import PokemonHomeBanner from '@/components/PokemonHomeBanner';
import PokemonGrid, { type PokemonGridEntry } from '@/components/PokemonGrid';
import { prisma } from '@/lib/prisma';
import { resolveSpritesBatch } from '@/lib/pokeapi/server-sprites';
import { getPokemonServer } from '@/lib/pokeapi/server';
import { getTypeColor } from '@/lib/pokemon-types';
import PokemonAtmosphere from '@/components/Pokemons/PokemonAtmosphere';

export default async function PokemonsPage() {
  const [owned, games] = await Promise.all([
    prisma.ownedPokemon.findMany({
      // Número nacional primeiro; duplicatas da mesma espécie ficam lado a lado.
      orderBy: [{ pokemonId: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.game.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Resolve apenas sprites customizados de hack room
  const spriteMap = await resolveSpritesBatch(
    owned.map((p) => ({ pokemonId: p.pokemonId, gameId: p.gameId })),
  );

  const gameMap = new Map(games.map((g) => [g.id, g.name]));

  const entries: PokemonGridEntry[] = await Promise.all(
    owned.map(async (p) => {
      const detail = await getPokemonServer(p.pokemonId).catch(() => null);
      const gameIds = Array.from(new Set([p.gameId, ...(p.extraGameIds || [])]));
      const gameNames = gameIds.map((id) => gameMap.get(id) ?? id);

      return {
        id: p.id,
        gameId: p.gameId,
        gameIds,
        gameNames,
        boxNumber: p.boxNumber,
        boxSlot: p.boxSlot,
        pokemonId: p.pokemonId,
        nickname: p.nickname,
        trainerName: p.trainerName,
        name: detail?.name ?? `#${p.pokemonId}`,
        level: p.level,
        moveset: p.moveset,
        isShiny: p.isShiny,
        typeNames: detail?.types.map((type) => type.type.name) ?? ['normal'],
        typeName: detail?.types[0]?.type.name ?? 'normal',
        typeColor: detail ? getTypeColor(detail.types) : '#22D3EE',
        spriteUrl: spriteMap.get(`${p.pokemonId}:${p.gameId}`) ?? null,
        spriteVariant: p.spriteVariant,
      };
    }),
  );

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#1D132D]">
      <PokemonAtmosphere />
      <Header />
      <div className="pokemon-header-line" aria-hidden="true" />
      <main className="relative z-10 flex-1 pb-16">
        <PokemonHomeBanner count={entries.length} />
        <PokemonGrid entries={entries} games={games} />
      </main>
    </div>
  );
}
