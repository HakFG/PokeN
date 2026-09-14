export interface PokedexInfo {
  id: number;
  region: string;
  description: string;
}

export const POKEDEX_BY_ID: Record<number, PokedexInfo> = {
  2: { id: 2, region: 'Kanto', description: 'Kanto (Red/Blue/Yellow/FireRed/LeafGreen)' },
  3: { id: 3, region: 'Johto', description: 'Johto Original (Gold/Silver/Crystal)' },
  4: { id: 4, region: 'Hoenn', description: 'Hoenn (Ruby/Sapphire/Emerald)' },
  5: { id: 5, region: 'Sinnoh', description: 'Sinnoh Original (Diamond/Pearl)' },
  6: { id: 6, region: 'Sinnoh', description: 'Sinnoh Estendida (Platinum)' },
  7: { id: 7, region: 'Johto', description: 'Johto Atualizada (HeartGold/SoulSilver)' },
  8: { id: 8, region: 'Unova', description: 'Unova Original (Black/White)' },
  9: { id: 9, region: 'Unova', description: 'Unova Atualizada (Black 2/White 2)' },
  12: { id: 12, region: 'Kalos', description: 'Kalos Central (X/Y)' },
  15: { id: 15, region: 'Hoenn', description: 'Hoenn Atualizada (Omega Ruby/Alpha Sapphire)' },
  16: { id: 16, region: 'Alola', description: 'Alola Original (Sun/Moon)' },
  17: { id: 17, region: 'Alola', description: 'Alola Atualizada (Ultra Sun/Ultra Moon)' },
};

export const NATIONAL_DEX_ID = 1;
