// app/jogos/page.tsx
import Link from 'next/link';
import Header from '@/components/Header';
import HexHeading from '@/components/HexHeading';
import GameBanner from '@/components/GameBanner';
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-8 md:px-20 pb-16">
        {/* Seção Jogos da Franquia */}
        <HexHeading label="JOGOS DA FRÂNQUIA" size="sm" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
          {franchise.length === 0 ? (
            <p className="col-span-full text-center text-slate-500 py-8">
              Nenhum jogo cadastrado. Rode <code>npx prisma db seed</code>.
            </p>
          ) : (
            franchise.map((g) => (
              <GameBanner
                key={g.id}
                gameId={g.id}
                name={g.name}
                themeColor={g.themeColor}
                bannerUrl={g.bannerUrl}
              />
            ))
          )}
        </div>

        {/* Seção Hack Rooms */}
        <HexHeading label="HACK ROOMS" size="sm" />

        <div className="flex justify-center mb-6">
          <Link
            href="/jogos/nova-hackroom"
            className="px-6 py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
          >
            + Nova Hack Room
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {hackRooms.length === 0 ? (
            <p className="col-span-full text-center text-slate-500 py-8">
              Nenhuma hack room ainda. Crie a primeira acima.
            </p>
          ) : (
            hackRooms.map((g) => (
              <GameBanner
                key={g.id}
                gameId={g.id}
                name={g.name}
                themeColor={g.themeColor}
                bannerUrl={g.bannerUrl}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}