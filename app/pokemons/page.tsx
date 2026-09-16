// app/pokemons/page.tsx
export const dynamic = 'force-dynamic';

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
      include: { fakeSpecies: true },
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
    owned
      .filter((p) => p.pokemonId > 0)
      .map((p) => ({ pokemonId: p.pokemonId, gameId: p.gameId })),
  );

  const gameMap = new Map(games.map((g) => [g.id, g.name]));

  const entries: PokemonGridEntry[] = await Promise.all(
    owned.map(async (p) => {
      const isFakemon = Boolean(p.fakeSpecies);
      const detail = isFakemon || p.pokemonId <= 0 ? null : await getPokemonServer(p.pokemonId).catch(() => null);
      const gameIds = Array.from(new Set([p.gameId, ...(p.extraGameIds || [])]));
      const gameNames = gameIds.map((id) => gameMap.get(id) ?? id);

      const resolvedName = p.fakeSpecies?.name ?? detail?.name ?? `#${p.pokemonId}`;
      const resolvedTypes = p.fakeSpecies?.types ?? detail?.types.map((type) => type.type.name) ?? ['normal'];
      const resolvedColor = detail ? getTypeColor(detail.types) : '#22D3EE';
      const resolvedSprite = p.fakeSpecies?.spriteUrl ?? spriteMap.get(`${p.pokemonId}:${p.gameId}`) ?? null;

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
        name: resolvedName,
        level: p.level,
        moveset: p.moveset,
        isShiny: p.isShiny,
        typeNames: resolvedTypes,
        typeName: resolvedTypes[0] ?? 'normal',
        typeColor: resolvedColor,
        spriteUrl: resolvedSprite,
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
