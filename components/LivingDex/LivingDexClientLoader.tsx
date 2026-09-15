'use client';

import dynamic from 'next/dynamic';

const LivingDexClient = dynamic(() => import('./LivingDexClient'), {
  ssr: false,
  loading: () => (
    <div className="livingdex-loader">
      <div className="livingdex-loader-ring" />
      <span className="livingdex-loader-text">Inicializando Pokédex…</span>
    </div>
  ),
});

interface Props {
  gameId: string;
  isHackRoom: boolean;
  species: { id: number; entryNumber: number; name: string }[];
  ownedIds: number[];
  owned: {
    id: string;
    pokemonId: number;
    name: string;
    level: number;
    boxNumber: number;
    boxSlot: number;
    spriteUrl: string | null;
    spriteVariant: string | null;
    isShiny: boolean;
    fakeSpeciesId?: string | null;
  }[];
  pokedexDescription: string;
  fakeSpecies?: { id: string; name: string; spriteUrl: string | null }[];
}

export default function LivingDexClientLoader(props: Props) {
  return <LivingDexClient {...props} />;
}
