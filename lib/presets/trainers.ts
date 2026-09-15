// lib/presets/trainers.ts

export interface TrainerPreset {
  id: string;
  label: string;
  game: string;
}

/**
 * Catálogo dos protagonistas jogáveis da série principal.
 * O sprite pode ser enviado diretamente no editor da Trainer Card.
 */
export const TRAINER_PRESETS: TrainerPreset[] = [
  { id: 'red', label: 'Red', game: 'Red / Blue / Yellow' },
  { id: 'leaf', label: 'Leaf', game: 'FireRed / LeafGreen' },
  { id: 'chase', label: 'Chase', game: "Let’s Go, Pikachu!" },
  { id: 'elaine', label: 'Elaine', game: "Let’s Go, Eevee!" },
  { id: 'gold', label: 'Gold', game: 'Gold / Silver' },
  { id: 'kris', label: 'Kris', game: 'Crystal' },
  { id: 'ethan', label: 'Ethan', game: 'HeartGold / SoulSilver' },
  { id: 'lyra', label: 'Lyra', game: 'HeartGold / SoulSilver' },
  { id: 'brendan', label: 'Brendan', game: 'Ruby / Sapphire / Emerald' },
  { id: 'may', label: 'May', game: 'Ruby / Sapphire / Emerald' },
  { id: 'lucas', label: 'Lucas', game: 'Diamond / Pearl / Platinum' },
  { id: 'dawn', label: 'Dawn', game: 'Diamond / Pearl / Platinum' },
  { id: 'hilbert', label: 'Hilbert', game: 'Black / White' },
  { id: 'hilda', label: 'Hilda', game: 'Black / White' },
  { id: 'nate', label: 'Nate', game: 'Black 2 / White 2' },
  { id: 'rosa', label: 'Rosa', game: 'Black 2 / White 2' },
  { id: 'calem', label: 'Calem', game: 'X / Y' },
  { id: 'serena', label: 'Serena', game: 'X / Y' },
  { id: 'elio', label: 'Elio', game: 'Sun / Moon / Ultra' },
  { id: 'selene', label: 'Selene', game: 'Sun / Moon / Ultra' },
  { id: 'victor', label: 'Victor', game: 'Sword / Shield' },
  { id: 'gloria', label: 'Gloria', game: 'Sword / Shield' },
  { id: 'rei', label: 'Rei', game: 'Legends: Arceus' },
  { id: 'akari', label: 'Akari', game: 'Legends: Arceus' },
  { id: 'florian', label: 'Florian', game: 'Scarlet / Violet' },
  { id: 'juliana', label: 'Juliana', game: 'Scarlet / Violet' },
  { id: 'urbain', label: 'Urbain', game: 'Legends: Z-A' },
  { id: 'taunie', label: 'Taunie', game: 'Legends: Z-A' },
];
