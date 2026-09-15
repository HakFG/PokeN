// app/jogos/[gameId]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import HexHeading from '@/components/HexHeading';
import ModeCard from '@/components/ModeCard';
import QualModoBackground from '@/components/QualModo/QualModoBackground';
import { prisma } from '@/lib/prisma';
import { TRAINER_CARD_AURA, LIVING_DEX_AURA } from '@/lib/typeColors';

export default async function QualModoPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) notFound();

  return (
    <div className="min-h-screen flex flex-col relative isolate">
      {/* Identidade visual desta página: duelo de auras (ver componente) */}
      <QualModoBackground />

      <Header />

      <main className="flex-1 px-8 md:px-20 pb-16 relative z-10">
        <HexHeading label="QUAL MODO" size="sm" animateIn />

        {/* Subtítulo com o nome do jogo, fade-in suave depois do hexágono */}
        {game.name && (
          <p className="text-center text-slate-300/80 text-sm md:text-base mt-1 mb-2 animate-[fadeIn_0.6s_ease_0.5s_both]">
            {game.name}
          </p>
        )}

        {/* Linha de destaque dourada, cresce da esquerda (como em Jogos) */}
        <div className="qualmodo-divider mx-auto mb-4" />

        <div className={`grid grid-cols-1 gap-12 md:gap-10 ${game.type === 'HACK_ROM' ? 'md:grid-cols-3 max-w-6xl' : 'md:grid-cols-2 max-w-5xl'} mx-auto mt-12`}>
          <ModeCard
            href={`/jogos/${gameId}/trainer-card`}
            label="TRAINER CARD"
            imageUrl="/images/modo/trainer-card.png"
            alt="Pokémon do Trainer Card"
            direction="left"
            aura={TRAINER_CARD_AURA}
            entranceDelay={0.3}
            pokemonDelay={0.6}
            labelDelay={0.75}
            floatDelay={0}
          />
          {game.type === 'HACK_ROM' && <ModeCard href={`/jogos/${gameId}/hackroom`} label="HACKROOM" imageUrl="/images/modo/living-dex.png" alt="Ficha da Hackroom" direction="right" aura={{ primary: '#fbbf24', secondary: '#8B5CF6' }} entranceDelay={0.6} pokemonDelay={0.7} labelDelay={0.85} floatDelay={2.4} />}
          <ModeCard
            href={`/jogos/${gameId}/living-dex`}
            label="LIVING DEX"
            imageUrl="/images/modo/living-dex.png"
            alt="Pokémon da Living Dex"
            direction="right"
            aura={LIVING_DEX_AURA}
            entranceDelay={0.45}
            pokemonDelay={0.6}
            labelDelay={0.75}
            floatDelay={1.2}
          />
        </div>
      </main>
    </div>
  );
}
