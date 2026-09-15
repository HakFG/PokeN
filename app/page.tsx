import Header from '@/components/Header';
import PokemonHero from '@/components/PokemonHero';
import WelcomeText from '@/components/WelcomeText';
import HomeGameCarousel from '@/components/HomeGameCarousel';
import { prisma } from '@/lib/prisma';
import { getOrCreateProfile } from '@/lib/actions/profile';
import { xpRequiredForLevel } from '@/lib/xp/level-curve';

// Pokémon em destaque — imagem local
const HERO_IMAGE = '/images/hero/hero.png';
const HERO_NAME = 'Greninja';

export default async function HomePage() {
  const avatarUrl = process.env.NEXT_PUBLIC_PROFILE_AVATAR_URL ?? '';

  // Fetch real profile + games data in parallel
  const [profile, playingGames, completedGames, uniqueDex] = await Promise.all([
    getOrCreateProfile(),
    prisma.game.findMany({
      where: { isCurrentlyPlaying: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, themeColor: true, bannerUrl: true, isCurrentlyPlaying: true, status: true },
    }),
    prisma.game.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { id: true, name: true, themeColor: true, bannerUrl: true, isCurrentlyPlaying: true, status: true },
    }),
    prisma.ownedPokemon.findMany({
      distinct: ['pokemonId'],
      select: { pokemonId: true },
    }),
  ]);

  const xpNeeded = xpRequiredForLevel(profile.level);
  const dexCount = uniqueDex.length;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Fundo animado — duas camadas */}
      <div className="site-bg" aria-hidden="true" />
      <div className="site-bg-scanlines" aria-hidden="true" />
      <div className="site-bg-stars" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-left" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-right" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-small-top" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-medium-center" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-small-bottom" aria-hidden="true" />
      <div className="pokeball-silhouette pokeball-silhouette-tiny-right" aria-hidden="true" />

      {/* Conteúdo acima do fundo */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header avatarUrl={avatarUrl} />

        <div className="mx-6 sm:mx-8 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" aria-hidden="true" />

        <main className="flex-1 grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-1 md:gap-0 px-6 sm:px-8 py-4 md:py-6 items-center">
          <PokemonHero imageSrc={HERO_IMAGE} pokemonName={HERO_NAME} />

          <div className="flex flex-col items-start justify-center gap-3 md:-ml-16">
            <WelcomeText />

            {/* Carrossel de jogos */}
            <HomeGameCarousel
              playing={playingGames.map((g) => ({
                id: g.id,
                name: g.name,
                themeColor: g.themeColor,
                bannerUrl: g.bannerUrl,
                isCurrentlyPlaying: g.isCurrentlyPlaying,
                status: g.status as 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED',
              }))}
              completed={completedGames.map((g) => ({
                id: g.id,
                name: g.name,
                themeColor: g.themeColor,
                bannerUrl: g.bannerUrl,
                isCurrentlyPlaying: g.isCurrentlyPlaying,
                status: g.status as 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED',
              }))}
            />

            {/* Barra de status real */}
            <div className="flex items-center gap-3 rounded-full border border-amber-200/15 bg-slate-950/20 px-4 py-2 text-xs font-bold tracking-wider text-amber-50/75 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              LV {profile.level}
              <span className="text-white/30">·</span>
              {profile.xp}/{xpNeeded} XP
              <span className="text-white/30">·</span>
              DEX {dexCount > 0 ? dexCount : '—'}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}