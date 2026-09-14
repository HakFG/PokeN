import Header from '@/components/Header';
import ProfileCard from '@/components/Perfil/ProfileCard';
import FavoritesGrid from '@/components/Perfil/FavoritesGrid';
import { prisma } from '@/lib/prisma';
import { getOrCreateProfile } from '@/lib/actions/profile';
import { getPokemonServer } from '@/lib/pokeapi/server';

export default async function PerfilPage() {
  const profile = await getOrCreateProfile();
  const favorites = await prisma.favoritePokemon.findMany({
    where: { profileId: profile.id },
    orderBy: { slot: 'asc' },
  });

  const favoritesData = await Promise.all(
    Array.from({ length: 6 }, async (_, index) => {
      const slot = index + 1;
      const favorite = favorites.find((item) => item.slot === slot);
      if (!favorite) return { slot, pokemonId: null, name: null };

      const detail = await getPokemonServer(favorite.pokemonId).catch(() => null);
      return {
        slot,
        pokemonId: favorite.pokemonId,
        name: detail?.name ?? `#${favorite.pokemonId}`,
      };
    }),
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 px-6 md:px-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-6xl mx-auto mt-6">
          <ProfileCard
            name={profile.name}
            level={profile.level}
            xp={profile.xp}
            characterSpriteUrl={profile.characterSpriteUrl}
          />
          <FavoritesGrid favorites={favoritesData} />
        </div>
      </main>
    </div>
  );
}
