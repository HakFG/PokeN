// app/jogos/page.tsx
import Link from 'next/link';
import Header from '@/components/Header';
import HexHeading from '@/components/HexHeading';
import GamesGrid from '@/components/Jogos/GamesGrid';
import JogosBackgroundLoader from '@/components/Jogos/JogosBackgroundLoader';
import { prisma } from '@/lib/prisma';

export default async function JogosPage() {
  const [franchise, hackRooms] = await Promise.all([
    prisma.game.findMany({
      where: { type: 'FRANCHISE' },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.game.findMany({
      where: { type: 'HACK_ROM' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D132D]">
      <JogosBackgroundLoader />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <div className="jogos-divider" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 md:px-12">
        <HexHeading label="JOGOS DA FRÂNQUIA" size="sm" />
        <GamesGrid games={franchise.map((game) => ({ id: game.id, name: game.name, themeColor: game.themeColor, isCurrentlyPlaying: game.isCurrentlyPlaying, bannerUrl: game.bannerUrl, status: game.status }))} />

        <section className="mt-20">
        <HexHeading label="HACK ROOMS" size="sm" />
        <div className="mb-8 flex justify-center">
          <Link
            href="/jogos/nova-hackroom"
            className="rounded-2xl border border-cyan-300/30 bg-slate-950/50 px-8 py-3 font-bold text-white shadow-[0_0_0_1px_rgba(34,211,238,.15),0_8px_24px_rgba(34,211,238,.15)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            + Nova Hack Room
          </Link>
        </div>
        {hackRooms.length === 0 ? (
          <p className="py-8 text-center text-slate-400">Nenhuma hack room ainda. Crie a primeira acima.</p>
        ) : (
          <GamesGrid games={hackRooms.map((game) => ({ id: game.id, name: game.name, themeColor: game.themeColor, isCurrentlyPlaying: game.isCurrentlyPlaying, bannerUrl: game.bannerUrl, status: game.status }))} />
        )}
        </section>
        </main>
      </div>
    </div>
  );
}
