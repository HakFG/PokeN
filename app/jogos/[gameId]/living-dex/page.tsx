import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import TopBar from '@/components/LivingDex/TopBar';
import LivingDexClientLoader from '@/components/LivingDex/LivingDexClientLoader';
import LivingDexBackground from '@/components/LivingDex/LivingDexBackground';
import { prisma } from '@/lib/prisma';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';
import { POKEDEX_BY_ID } from '@/lib/pokeapi/pokedex-map';
import { resolveSpritesBatch } from '@/lib/pokeapi/server-sprites';

export default async function LivingDexPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { hackRoom: true },
  });
  if (!game) notFound();

  const [owned, species] = await Promise.all([
    prisma.ownedPokemon.findMany({
      where: { gameId },
      orderBy: [{ boxNumber: 'asc' }, { boxSlot: 'asc' }],
    }),
    getPokedexServer(game.pokedexId),
  ]);

  const ownedIds = [...new Set(owned.map((pokemon) => pokemon.pokemonId))];

  const spriteMap = await resolveSpritesBatch(
    owned.map((pokemon) => ({ pokemonId: pokemon.pokemonId, gameId })),
  );

  const speciesMap = new Map(species.map((item) => [item.id, item.name]));

  const ownedForBox = owned.map((pokemon) => ({
    id: pokemon.id,
    pokemonId: pokemon.pokemonId,
    name:
      pokemon.nickname ??
      speciesMap.get(pokemon.pokemonId) ??
      `#${pokemon.pokemonId}`,
    level: pokemon.level,
    boxNumber: pokemon.boxNumber,
    boxSlot: pokemon.boxSlot,
    spriteUrl: spriteMap.get(`${pokemon.pokemonId}:${gameId}`) ?? null,
    spriteVariant: pokemon.spriteVariant,
    isShiny: pokemon.isShiny,
  }));

  const pokedexInfo = game.pokedexId ? POKEDEX_BY_ID[game.pokedexId] : null;
  const pokedexDescription = pokedexInfo
    ? pokedexInfo.description
    : game.type === 'HACK_ROM'
      ? 'Pokédex Nacional (fallback para hack room)'
      : 'Pokédex Nacional';

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <LivingDexBackground />

      <Header />

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-2 px-3 pb-3 md:gap-3 md:px-5 md:pb-4">
        <TopBar ownedCount={ownedIds.length} totalSpecies={species.length} />

        <div className="min-h-0 flex-1">
          <LivingDexClientLoader
            gameId={gameId}
            isHackRoom={game.type === 'HACK_ROM'}
            species={species}
            ownedIds={ownedIds}
            owned={ownedForBox}
            pokedexDescription={pokedexDescription}
          />
        </div>
      </main>
    </div>
  );
}