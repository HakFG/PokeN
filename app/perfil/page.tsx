import Header from '@/components/Header';
import HakCard from '@/components/Perfil/HakCard';
import FavoritesGrid from '@/components/Perfil/FavoritesGrid';
import GlobalStatsBar from '@/components/Perfil/GlobalStatsBar';
import HallOfFame from '@/components/Perfil/HallOfFame';
import GameProgressList from '@/components/Perfil/GameProgressList';
import XpProgressBar from '@/components/Xp/XpProgressBar';
import StreakBadge from '@/components/Xp/StreakBadge';
import { prisma } from '@/lib/prisma';
import { getOrCreateProfile } from '@/lib/actions/profile';
import {
  getGlobalStats,
  getGamesWithProgress,
  getCompletedGames,
} from '@/lib/stats/profile-aggregates';
import { getAnimatedSpriteUrl } from '@/lib/pokeapi/client';

export default async function PerfilPage() {
  const profile = await getOrCreateProfile();

  const [globalStats, gamesProgress, completedGames, favorites] = await Promise.all([
    getGlobalStats(),
    getGamesWithProgress(),
    getCompletedGames(),
    prisma.favoritePokemon.findMany({
      where: { profileId: profile.id },
      orderBy: { slot: 'asc' },
    }),
  ]);

  const favoritesData = Array.from({ length: 6 }, (_, i) => {
    const slot = i + 1;
    const fav = favorites.find((f) => f.slot === slot);
    if (!fav) {
      return { slot, pokemonId: null, animatedSpriteUrl: null, name: null };
    }
    return {
      slot,
      pokemonId: fav.pokemonId,
      animatedSpriteUrl: getAnimatedSpriteUrl(fav.pokemonId),
      name: null,
    };
  });

  return (
    <div className="relative flex flex-col min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden bg-[#1D132D]">
      <Header />

      <main className="flex-1 min-h-0 mx-auto w-full max-w-[1600px] px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2">
        {/* Linha principal: Hak Card + XP à esquerda, Favoritos à direita */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Esquerda */}
          <div className="flex flex-col gap-2 min-h-0 min-h-[400px] lg:min-h-0">
            <HakCard
              name={profile.name}
              characterSpriteUrl={profile.characterSpriteUrl}
            />
            <div className="flex items-stretch gap-2 shrink-0">
              <XpProgressBar xp={profile.xp} level={profile.level} />
              <StreakBadge
                current={profile.currentStreak}
                longest={profile.longestStreak}
              />
            </div>
          </div>

          {/* Direita */}
          <FavoritesGrid favorites={favoritesData} />
        </div>

        {/* Faixa inferior compacta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:h-[170px] shrink-0">
          <GlobalStatsBar {...globalStats} />
          <HallOfFame games={completedGames} />
          <GameProgressList games={gamesProgress} />
        </div>
      </main>
    </div>
  );
}