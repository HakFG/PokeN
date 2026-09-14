// app/pokemons/[gameId]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { prisma } from '@/lib/prisma';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';
import { getPokemonServer } from '@/lib/pokeapi/server';
import { getTypeColor } from '@/lib/pokemon-types';
import PokemonAtmosphere from '@/components/Pokemons/PokemonAtmosphere';
import PokedexList from '@/components/PokedexList';
import PokemonBox from '@/components/PokemonBox';

export default async function BoxPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { ownedPokemon: { orderBy: [{ boxNumber: 'asc' }, { boxSlot: 'asc' }] } },
  });

  if (!game) notFound();

  const regionalSpecies = await getPokedexServer(game.pokedexId);
  const details = await Promise.all(
    game.ownedPokemon.map((pokemon) => getPokemonServer(pokemon.pokemonId).catch(() => null)),
  );
  const typeColors = new Map(
    game.ownedPokemon.map((pokemon, index) => [
      pokemon.id,
      details[index] ? getTypeColor(details[index]!.types) : '#22D3EE',
    ]),
  );

  const ownedIds = new Set(game.ownedPokemon.map((p) => p.pokemonId));

  const boxGame = {
    ...game,
    ownedPokemon: game.ownedPokemon.map((pokemon) => ({
      ...pokemon,
      isShiny: pokemon.isShiny,
      typeColor: typeColors.get(pokemon.id) ?? '#22D3EE',
    })),
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#1D132D]">
      <PokemonAtmosphere />
      <Header />
      <main className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 px-6 py-8">
        <PokedexList species={regionalSpecies} ownedIds={ownedIds} />
        <PokemonBox game={boxGame} dexTotal={regionalSpecies.length} />
      </main>
    </div>
  );
}