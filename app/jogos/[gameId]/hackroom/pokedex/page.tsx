import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import HackDexBuilder from '@/components/HackRoom/HackDexBuilder';
import { prisma } from '@/lib/prisma';

export default async function HackroomPokedexPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      hackRoom: {
        include: {
          fakeSpecies: { orderBy: { name: 'asc' } },
          pokedexEntries: { include: { fakeSpecies: true }, orderBy: { entryNumber: 'asc' } },
        },
      },
    },
  });
  if (!game?.hackRoom || game.type !== 'HACK_ROM') notFound();

  return <div className="min-h-screen bg-[#080d1a] text-white"><Header /><main className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10"><Link href={`/jogos/${gameId}/hackroom`} className="text-xs font-bold uppercase tracking-wider text-cyan-200/70 hover:text-cyan-100">← Voltar à Hackroom</Link><div className="mt-5"><HackDexBuilder gameId={gameId} fakeSpecies={game.hackRoom.fakeSpecies.map((item) => ({ id: item.id, name: item.name, spriteUrl: item.spriteUrl, evolvesFromId: item.evolvesFromId }))} entries={game.hackRoom.pokedexEntries.map((item) => ({ id: item.id, entryNumber: item.entryNumber, name: item.name, pokemonId: item.pokemonId, fakeSpeciesId: item.fakeSpeciesId, spriteUrl: item.fakeSpecies?.spriteUrl ?? null }))} /></div></main></div>;
}
