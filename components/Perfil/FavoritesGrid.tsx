'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FavoriteSlot from './FavoriteSlot';
import FavoritePicker from './FavoritePicker';
import { removeFavorite } from '@/lib/actions/profile';

interface Favorite {
  slot: number;
  pokemonId: number | null;
  name: string | null;
}

interface Props {
  favorites: Favorite[];
}

export default function FavoritesGrid({ favorites }: Props) {
  const router = useRouter();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [detail, setDetail] = useState<Favorite | null>(null);

  return (
    <>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-6 leading-tight tracking-tight">
          6 POKÉMONS<br />FAVORITOS
        </h2>

        <div className="bg-slate-300 rounded-3xl p-4 w-full max-w-md">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((slot) => {
              const favorite = favorites.find((item) => item.slot === slot) ?? {
                slot,
                pokemonId: null,
                name: null,
              };

              return (
                <FavoriteSlot
                  key={slot}
                  pokemonId={favorite.pokemonId}
                  name={favorite.name}
                  onClick={() => {
                    if (favorite.pokemonId) setDetail(favorite);
                    else setPickerSlot(slot);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {pickerSlot !== null && (
        <FavoritePicker
          slot={pickerSlot}
          onClose={() => setPickerSlot(null)}
          onSaved={() => router.refresh()}
        />
      )}

      {detail && detail.pokemonId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-bold text-lg capitalize mb-3">{detail.name}</h3>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setPickerSlot(detail.slot);
                  setDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await removeFavorite(detail.slot);
                  setDetail(null);
                  router.refresh();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
