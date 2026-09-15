import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import TopBar from '@/components/LivingDex/TopBar';
import LivingDexClientLoader from '@/components/LivingDex/LivingDexClientLoader';
import LivingDexBackground from '@/components/LivingDex/LivingDexBackground';
import { prisma } from '@/lib/prisma';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';
import { POKEDEX_BY_ID } from '@/lib/pokeapi/pokedex-map';
import { resolvePokemonDisplay } from '@/lib/pokemon-resolver';

export default async function LivingDexPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { hackRoom: { include: { fakeSpecies: true, pokedexEntries: { include: { fakeSpecies: true } } } } },
  });
  if (!game) notFound();

  const [owned, defaultSpecies] = await Promise.all([
    prisma.ownedPokemon.findMany({
      where: { gameId },
      orderBy: [{ boxNumber: 'asc' }, { boxSlot: 'asc' }],
    }),
    game.type === 'HACK_ROM' ? Promise.resolve([]) : getPokedexServer(game.pokedexId),
  ]);

  const species = game.type === 'HACK_ROM'
    ? game.hackRoom!.pokedexEntries
      .sort((first, second) => first.entryNumber - second.entryNumber)
      .map((entry) => ({
        id: entry.pokemonId ?? 0,
        entryNumber: entry.entryNumber,
        name: entry.name,
        fakeSpeciesId: entry.fakeSpeciesId,
        spriteUrl: entry.fakeSpecies?.spriteUrl ?? null,
      }))
    : defaultSpecies;
  const ownedIds = [...new Set(owned.map((pokemon) => pokemon.fakeSpeciesId ? `fake:${pokemon.fakeSpeciesId}` : `pokemon:${pokemon.pokemonId}`))];

  const speciesMap = new Map(species.map((item) => [item.id, item.name]));

  const ownedForBox = await Promise.all(owned.map(async (pokemon) => {
    const display = await resolvePokemonDisplay({ pokemonId: pokemon.pokemonId, fakeSpeciesId: pokemon.fakeSpeciesId, gameId, nickname: pokemon.nickname, isShiny: pokemon.isShiny, spriteVariant: pokemon.spriteVariant });
    return ({
    id: pokemon.id,
    pokemonId: pokemon.pokemonId,
    name:
      display.name ??
      speciesMap.get(pokemon.pokemonId) ??
      `#${pokemon.pokemonId}`,
    nickname: pokemon.nickname,
    level: pokemon.level,
    boxNumber: pokemon.boxNumber,
    boxSlot: pokemon.boxSlot,
    spriteUrl: display.spriteUrl,
    spriteVariant: pokemon.spriteVariant,
    isShiny: pokemon.isShiny,
    fakeSpeciesId: pokemon.fakeSpeciesId,
  });
  }));

  const pokedexInfo = game.pokedexId ? POKEDEX_BY_ID[game.pokedexId] : null;
  const pokedexDescription = pokedexInfo
    ? pokedexInfo.description
    : game.type === 'HACK_ROM'
      ? 'Pokédex personalizada da Hackroom'
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
            fakeSpecies={game.hackRoom?.pokedexEntries.flatMap((entry) => entry.fakeSpecies ? [{ id: entry.fakeSpecies.id, name: entry.fakeSpecies.name, spriteUrl: entry.fakeSpecies.spriteUrl }] : []) ?? []}
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
