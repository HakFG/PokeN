import Header from '@/components/Header';
import PokemonHero from '@/components/PokemonHero';
import WelcomeText from '@/components/WelcomeText';
import GameShortcuts from '@/components/GameShortcuts';

// Pokémon em destaque — imagem local
const HERO_IMAGE = '/images/hero/hero.png';
const HERO_NAME = 'Greninja';

export default function HomePage() {
  const avatarUrl = process.env.NEXT_PUBLIC_PROFILE_AVATAR_URL ?? '';

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
            <GameShortcuts />
            <div className="flex items-center gap-3 rounded-full border border-amber-200/15 bg-slate-950/20 px-4 py-2 text-xs font-bold tracking-wider text-amber-50/75 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              LV 1 <span className="text-white/30">·</span> 0/100 XP <span className="text-white/30">·</span> DEX —
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}