'use client';

import FavoriteSlotCard from './FavoriteSlotCard';

export interface FavoriteSlotData {
  slot: number;
  pokemonId: number | null;
  animatedSpriteUrl: string | null;
  name: string | null;
}

interface Props {
  favorites: FavoriteSlotData[];
}

export default function FavoritesGrid({ favorites }: Props) {
  const filledCount = favorites.filter((f) => f.pokemonId !== null).length;

  return (
    <div className="favorites-panel">
      <div className="favorites-header">
        <span className="favorites-title">6 Pokémons Favoritos</span>
        <span className="favorites-count">{filledCount} / 6</span>
      </div>

      <div className="favorites-grid">
        {favorites.map((fav) => (
          <FavoriteSlotCard key={fav.slot} slot={fav.slot} favorite={fav} />
        ))}
      </div>
    </div>
  );
}