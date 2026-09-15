'use client';

import GameCard from './GameCard';

interface Game {
  id: string;
  name: string;
  themeColor: string;
  isCurrentlyPlaying: boolean;
  bannerUrl: string | null;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
}

export default function GamesGrid({ games }: { games: Game[] }) {
  if (games.length === 0) return <p className="col-span-full py-8 text-center text-slate-400">Nenhum jogo aqui ainda.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          gameId={game.id}
          name={game.name}
          themeColor={game.themeColor}
          isCurrentlyPlaying={game.isCurrentlyPlaying}
          bannerUrl={game.bannerUrl}
          status={game.status}
          index={index}
        />
      ))}
    </div>
  );
}
