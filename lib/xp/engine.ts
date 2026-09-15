// lib/xp/engine.ts
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { XP_SOURCES, type XpSourceKey } from './sources';
import { addXp, getTitleForLevel } from './level-curve';
import { updateStreak } from './streak';
import {
  checkAndUnlockAchievements,
  type AchievementContext,
  type Achievement,
} from './achievements';
import { getGlobalStats, getGamesWithProgress } from '@/lib/stats/profile-aggregates';

interface GrantXpOptions {
  /** Pular checagem de conquistas (usado em batch, ex: adicionar 20 pokémons). */
  skipAchievements?: boolean;
}

export interface GrantXpResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  newTitle: string | null;
  streakBonus: number;
  currentStreak: number;
  /** Sem `check` — serializável para o cliente. */
  newAchievements: Omit<Achievement, 'check'>[];
}

async function getOrCreateProfileRow() {
  const existing = await prisma.profile.findFirst();
  if (existing) return existing;
  return prisma.profile.create({
    data: { name: 'Hak', level: 1, xp: 0 },
  });
}

/**
 * Ponto único de entrada para ganho de XP.
 * Aplica XP, atualiza streak, checa conquistas, registra log.
 */
export async function grantXp(
  source: XpSourceKey,
  metadata?: Record<string, unknown>,
  options: GrantXpOptions = {},
): Promise<GrantXpResult> {
  const profile = await getOrCreateProfileRow();
  const amount = XP_SOURCES[source].amount;

  // 1. Aplica XP base
  const base = addXp(profile.xp, profile.level, amount);

  // 2. Atualiza streak (só em ação real do usuário)
  const streakResult = await updateStreak(profile.id);

  // 3. Aplica bônus de streak (se houver)
  const afterBonus =
    streakResult.bonusXp > 0
      ? addXp(base.xp, base.level, streakResult.bonusXp)
      : base;

  const totalGained = amount + streakResult.bonusXp;

  // 4. Persiste
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      xp: afterBonus.xp,
      level: afterBonus.level,
      totalXpEarned: { increment: totalGained },
    },
  });

  // 5. Log
  await prisma.xpLog.create({
    data: {
      profileId: profile.id,
      source,
      amount,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  // 6. Conquistas (com guard para batch)
  let newAchievements: Achievement[] = [];
  if (!options.skipAchievements) {
    const [globalStats, gamesProgress, hackroomsCreated, favoritesSetCount, fakemonCreated] =
      await Promise.all([
        getGlobalStats(),
        getGamesWithProgress(),
        prisma.hackRoom.count(),
        prisma.favoritePokemon.count({ where: { profileId: profile.id } }),
        prisma.fakeSpecies.count(),
      ]);

    const ctx: AchievementContext = {
      totalUniquePokemon: globalStats.uniquePokemonCount,
      totalShiny: globalStats.totalShiny,
      totalBadges: globalStats.totalBadges,
      gamesCompleted: globalStats.gamesCompleted,
      hackroomsCreated,
      fakemonCreated,
      livingDexCompletedCount: gamesProgress.filter((g) => g.isDexComplete).length,
      longestStreak: Math.max(streakResult.streak, profile.longestStreak),
      favoritesSetCount,
      level: afterBonus.level,
    };

    newAchievements = await checkAndUnlockAchievements(profile.id, ctx);

    // XP das conquistas (fora do fluxo normal, para não recursar)
    if (newAchievements.length > 0) {
      const achievementXp = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
      if (achievementXp > 0) {
        const bonus = addXp(afterBonus.xp, afterBonus.level, achievementXp);
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            xp: bonus.xp,
            level: bonus.level,
            totalXpEarned: { increment: achievementXp },
          },
        });
      }
    }
  }

  revalidatePath('/perfil');

  return {
    xpGained: totalGained,
    leveledUp: afterBonus.leveledUp,
    newLevel: afterBonus.level,
    newTitle: afterBonus.leveledUp ? getTitleForLevel(afterBonus.level) : null,
    streakBonus: streakResult.bonusXp,
    currentStreak: streakResult.streak,
    newAchievements: newAchievements.map(
      ({ check: _check, ...rest }) => rest,
    ),
  };
}

/** Combina múltiplos resultados de grantXp numa resposta única. */
export function mergeXpResults(results: GrantXpResult[]): GrantXpResult {
  if (results.length === 0) {
    return {
      xpGained: 0,
      leveledUp: false,
      newLevel: 0,
      newTitle: null,
      streakBonus: 0,
      currentStreak: 0,
      newAchievements: [],
    };
  }

  return {
    xpGained: results.reduce((sum, r) => sum + r.xpGained, 0),
    leveledUp: results.some((r) => r.leveledUp),
    newLevel: results[results.length - 1].newLevel,
    newTitle: results.find((r) => r.newTitle)?.newTitle ?? null,
    streakBonus: results.reduce((sum, r) => sum + r.streakBonus, 0),
    currentStreak: results[results.length - 1].currentStreak,
    newAchievements: results.flatMap((r) => r.newAchievements),
  };
}
