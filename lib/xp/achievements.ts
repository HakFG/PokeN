// lib/xp/achievements.ts
import { prisma } from '@/lib/prisma';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  category: 'captura' | 'colecao' | 'jogos' | 'social' | 'hackroom' | 'oculta';
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalUniquePokemon: number;
  totalShiny: number;
  totalBadges: number;
  gamesCompleted: number;
  hackroomsCreated: number;
  fakemonCreated: number;
  livingDexCompletedCount: number;
  longestStreak: number;
  favoritesSetCount: number;
  level: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Captura ──
  { id: 'FIRST_CATCH',  name: 'Primeiro Passo',              description: 'Capture seu primeiro pokémon.',              xpReward: 10,  category: 'captura', check: (c) => c.totalUniquePokemon >= 1 },
  { id: 'CATCH_50',     name: 'Colecionador Iniciante',      description: 'Capture 50 espécies únicas.',                 xpReward: 30,  category: 'captura', check: (c) => c.totalUniquePokemon >= 50 },
  { id: 'CATCH_150',    name: 'Mestre da Dex Original',      description: 'Capture 150 espécies únicas.',                xpReward: 75,  category: 'captura', check: (c) => c.totalUniquePokemon >= 150 },
  { id: 'CATCH_300',    name: 'Enciclopédia Ambulante',      description: 'Capture 300 espécies únicas.',                xpReward: 150, category: 'captura', check: (c) => c.totalUniquePokemon >= 300 },
  { id: 'CATCH_ALL',    name: 'Tenho Que Pegar Todos',       description: 'Capture todas as espécies conhecidas.',       xpReward: 500, category: 'captura', check: (c) => c.totalUniquePokemon >= 1025 },

  // ── Shiny / Coleção ──
  { id: 'FIRST_SHINY',  name: 'Brilho Raro',                 description: 'Capture seu primeiro shiny.',                 xpReward: 25,  category: 'colecao', check: (c) => c.totalShiny >= 1 },
  { id: 'SHINY_10',     name: 'Caçador de Brilhos',          description: 'Capture 10 shinies.',                         xpReward: 75,  category: 'colecao', check: (c) => c.totalShiny >= 10 },
  { id: 'SHINY_25',     name: 'Sortudo Profissional',        description: 'Capture 25 shinies.',                         xpReward: 150, category: 'colecao', check: (c) => c.totalShiny >= 25 },

  // ── Insígnias / Jogos ──
  { id: 'FIRST_BADGE',  name: 'Primeira Vitória',            description: 'Conquiste sua primeira insígnia.',            xpReward: 15,  category: 'jogos',   check: (c) => c.totalBadges >= 1 },
  { id: 'BADGE_8',      name: 'Liga Completa',               description: 'Conquiste 8 insígnias em um único jogo.',     xpReward: 100, category: 'jogos',   check: (c) => c.totalBadges >= 8 },
  { id: 'BADGE_50',     name: 'Colirium de Insígnias',       description: 'Conquiste 50 insígnias no total.',            xpReward: 200, category: 'jogos',   check: (c) => c.totalBadges >= 50 },

  { id: 'FIRST_GAME_DONE', name: 'The End',                  description: 'Zere seu primeiro jogo.',                     xpReward: 50,  category: 'jogos',   check: (c) => c.gamesCompleted >= 1 },
  { id: 'GAMES_DONE_5', name: 'Maratonista',                 description: 'Zere 5 jogos.',                               xpReward: 200, category: 'jogos',   check: (c) => c.gamesCompleted >= 5 },
  { id: 'FIRST_DEX_COMPLETE', name: 'Dex Perfeita',          description: 'Complete 100% da Living Dex de um jogo.',     xpReward: 100, category: 'colecao', check: (c) => c.livingDexCompletedCount >= 1 },
  { id: 'DEX_COMPLETE_3',     name: 'Completista Serial',    description: 'Complete 100% da Dex de 3 jogos diferentes.', xpReward: 300, category: 'colecao', check: (c) => c.livingDexCompletedCount >= 3 },

  // ── Hackroom (será habilitado na Fase 4) ──
  { id: 'FIRST_HACKROOM', name: 'Criador de Mundos',         description: 'Crie sua primeira hackroom.',                 xpReward: 25,  category: 'hackroom', check: (c) => c.hackroomsCreated >= 1 },
  { id: 'HACKROOM_5',     name: 'Desenvolvedor Nato',        description: 'Crie 5 hackrooms.',                           xpReward: 100, category: 'hackroom', check: (c) => c.hackroomsCreated >= 5 },

  // ── Perfil ──
  { id: 'FAVORITES_COMPLETE', name: 'Time dos Sonhos',       description: 'Preencha os 6 favoritos.',                    xpReward: 30,  category: 'social',  check: (c) => c.favoritesSetCount >= 6 },

  // ── Streak ──
  { id: 'STREAK_7',   name: 'Semana Dedicada',               description: '7 dias seguidos de atividade.',               xpReward: 50,   category: 'social', check: (c) => c.longestStreak >= 7 },
  { id: 'STREAK_30',  name: 'Vício Saudável',                description: '30 dias seguidos de atividade.',              xpReward: 250,  category: 'social', check: (c) => c.longestStreak >= 30 },
  { id: 'STREAK_100', name: 'Estilo de Vida',                description: '100 dias seguidos de atividade.',             xpReward: 1000, category: 'social', check: (c) => c.longestStreak >= 100 },

  // ── Ocultas ──
  { id: 'HIDDEN_LEVEL_50',  name: '???', description: 'Alcance o nível 50.',                          xpReward: 200,  category: 'oculta', check: (c) => c.level >= 50 },
  { id: 'HIDDEN_ALL',       name: '???', description: 'Desbloqueie todas as outras conquistas.',       xpReward: 1000, category: 'oculta', check: () => false /* checado por último */ },
];

export async function checkAndUnlockAchievements(
  profileId: string,
  ctx: AchievementContext,
) {
  const alreadyUnlocked = await prisma.achievementUnlock.findMany({
    where: { profileId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(alreadyUnlocked.map((a) => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.id === 'HIDDEN_ALL') continue; // checado ao final
    if (achievement.check(ctx)) {
      await prisma.achievementUnlock.create({
        data: { profileId, achievementId: achievement.id },
      });
      newlyUnlocked.push(achievement);
    }
  }

  // Conquista "platina"
  const totalUnlocked = unlockedIds.size + newlyUnlocked.length;
  if (!unlockedIds.has('HIDDEN_ALL') && totalUnlocked >= ACHIEVEMENTS.length - 1) {
    const platinum = ACHIEVEMENTS.find((a) => a.id === 'HIDDEN_ALL')!;
    await prisma.achievementUnlock.create({
      data: { profileId, achievementId: 'HIDDEN_ALL' },
    });
    newlyUnlocked.push(platinum);
  }

  return newlyUnlocked;
}