// lib/xp/sources.ts

export const XP_SOURCES = {
  // ── Living Dex ──
  CATCH_NEW_SPECIES:       { amount: 10,  label: 'Nova espécie capturada' },
  CATCH_DUPLICATE_SPECIES: { amount: 2,   label: 'Espécie repetida capturada' },
  CATCH_SHINY_BONUS:       { amount: 15,  label: 'Bônus de shiny' },
  FILL_BOX_COMPLETELY:     { amount: 20,  label: 'Box preenchida' },
  DEX_COMPLETE_GAME:       { amount: 200, label: 'Living Dex 100%' },

  // ── Jogos e progressão ──
  GAME_COMPLETED:          { amount: 300, label: 'Jogo zerado' },
  HACKROOM_CREATED:        { amount: 15,  label: 'Nova hackroom' },
  FAKEMON_CREATED:         { amount: 20,  label: 'Fakemon cadastrado' },
  GYM_LEADER_DEFEATED:     { amount: 25,  label: 'Líder derrotado' },

  // ── Trainer Card ──
  BADGE_EARNED:            { amount: 25,  label: 'Insígnia conquistada' },
  TRAINER_CARD_FIRST_SETUP:{ amount: 10,  label: 'Trainer Card configurado' },
  FULL_TEAM_SET:           { amount: 15,  label: 'Time completo' },

  // ── Perfil ──
  FAVORITE_SET:            { amount: 5,   label: 'Favorito definido' },
  ALL_FAVORITES_SET:       { amount: 30,  label: 'Favoritos completos' },

  // ── Engajamento ──
  DAILY_ACTIVITY:          { amount: 5,   label: 'Atividade do dia' },
  STREAK_MILESTONE_7:      { amount: 50,  label: '7 dias seguidos' },
  STREAK_MILESTONE_30:     { amount: 250, label: '30 dias seguidos' },
} as const;

export type XpSourceKey = keyof typeof XP_SOURCES;