// app/jogos/[gameId]/trainer-card/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import CardDisplay from '@/components/TrainerCard/CardDisplay';
import EditButton from '@/components/TrainerCard/EditButton';
import { prisma } from '@/lib/prisma';
import { getPokemonServer } from '@/lib/pokeapi/server';
import { getOrCreateTrainerCard } from '@/lib/actions/trainer-card';
import { getTrainerCardStats } from '@/lib/stats/trainer-card-aggregates';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import TrainerCardBackground from '@/components/TrainerCard/TrainerCardBackground';

export default async function TrainerCardPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) notFound();

  const card = await getOrCreateTrainerCard(gameId);
  const stats = await getTrainerCardStats(gameId);

  const details = new Map<number, PokemonDetail>();
  await Promise.all(
    card.showcasePokemon.map(async (p: { pokemonId: number }) => {
      const d = await getPokemonServer(p.pokemonId).catch(() => null);
      if (d) details.set(p.pokemonId, d);
    }),
  );

  const showcase = card.showcasePokemon.map(
    (p: {
      slot: number;
      pokemonId: number;
      nickname: string | null;
      moveset: unknown;
    }) => ({
      slot: p.slot,
      pokemonId: p.pokemonId,
      nickname: p.nickname,
      moveset: Array.isArray(p.moveset) ? (p.moveset as string[]) : [],
    }),
  );

  return (
    <div className="relative min-h-screen bg-[#1D132D]">
      <TrainerCardBackground />

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 md:px-10 md:py-8">
        {/* Barra de ações */}
        <div className="mb-6 flex items-center justify-end">
          <EditButton
            gameId={gameId}
            trainerCardId={card.id}
            trainerName={card.trainerName}
            characterSpriteUrl={card.characterSpriteUrl}
            trainerPresetId={card.trainerPresetId}
            playtime={card.playtime}
            gameStatus={game.status}
            isCurrentlyPlaying={game.isCurrentlyPlaying}
            startedAt={game.startedAt}
            showcase={showcase}
            badges={card.badges}
          />
        </div>

        {/* Card com altura mínima confortável, mas sem travar em viewport */}
        <div className="min-h-[720px] w-full">
          <CardDisplay
            game={game}
            trainerName={card.trainerName}
            characterSpriteUrl={card.characterSpriteUrl}
            trainerIdCode={card.trainerIdCode}
            playtime={card.playtime}
            showcase={showcase}
            badges={card.badges}
            details={details}
            stats={stats}
          />
        </div>
      </main>
    </div>
  );
}
