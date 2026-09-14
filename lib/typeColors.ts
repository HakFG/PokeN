// lib/typeColors.ts
// Cores de aura por Pokémon/tipo — usadas pelo ModeCard para dar
// identidade individual a cada card (Etapa "Qual Modo").
// Cada entrada tem uma cor primária (tipo principal) e uma secundária
// (a cor "de marca" roxa/violeta que costura a identidade das páginas).

export interface AuraColors {
  primary: string;
  secondary: string;
}

export const TRAINER_CARD_AURA: AuraColors = {
  // Gliscor — Ground/Flying: marrom terroso + dourado
  primary: '#A98F71',
  secondary: '#8B5CF6',
};

export const LIVING_DEX_AURA: AuraColors = {
  // Greninja — Water/Dark: azul + roxo
  primary: '#2563EB',
  secondary: '#8B5CF6',
};