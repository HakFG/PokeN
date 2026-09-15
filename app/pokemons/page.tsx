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
  const owned = await prisma.ownedPokemon.findMany({
    // Número nacional primeiro; duplicatas da mesma espécie ficam lado a lado.
    orderBy: [{ pokemonId: 'asc' }, { createdAt: 'asc' }],
  });

  // Resolve apenas sprites customizados de hack room
  const spriteMap = await resolveSpritesBatch(
    owned.map((p) => ({ pokemonId: p.pokemonId, gameId: p.gameId })),
  );

  const entries: PokemonGridEntry[] = await Promise.all(
    owned.map(async (p) => {
      const detail = await getPokemonServer(p.pokemonId).catch(() => null);
      return {
        id: p.id,
        pokemonId: p.pokemonId,
        nickname: p.nickname,
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
        <PokemonGrid entries={entries} />
      </main>
    </div>
  );
}
