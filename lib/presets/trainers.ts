// lib/presets/trainers.ts

export interface TrainerPreset {
  id: string;
  label: string;
  spriteUrl: string;
}

/**
 * Sprites de treinadores predefinidos.
 * Coloque os PNGs em public/trainers/ com esses nomes.
 * Sugestão: 64x64 ou 96x96, fundo transparente, estilo pixelado.
 */
export const TRAINER_PRESETS: TrainerPreset[] = [
  { id: 'red',    label: 'Red (Gen I)',     spriteUrl: '/trainers/red.png' },
  { id: 'blue',   label: 'Blue (Gen I)',    spriteUrl: '/trainers/blue.png' },
  { id: 'gold',   label: 'Gold (Gen II)',   spriteUrl: '/trainers/gold.png' },
  { id: 'may',    label: 'May (Gen III)',   spriteUrl: '/trainers/may.png' },
  { id: 'dawn',   label: 'Dawn (Gen IV)',   spriteUrl: '/trainers/dawn.png' },
  { id: 'hilbert', label: 'Hilbert (Gen V)', spriteUrl: '/trainers/hilbert.png' },
];