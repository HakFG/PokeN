'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Busca o TrainerCard do jogo.
 * Se não existir, cria um vazio com 8 slots de insígnia.
 */
export async function getOrCreateTrainerCard(gameId: string) {
  const existing = await prisma.trainerCard.findUnique({
    where: { gameId },
    include: {
      badges: { orderBy: { name: 'asc' } },
      showcasePokemon: { orderBy: { slot: 'asc' } },
    },
  });
  if (existing) return existing;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Jogo não encontrado');

  return prisma.trainerCard.create({
    data: {
      gameId,
      trainerName: 'Hak',
      badges: {
        create: Array.from({ length: 8 }, (_, i) => ({
          name: `Insígnia ${i + 1}`,
        })),
      },
    },
    include: {
      badges: { orderBy: { name: 'asc' } },
      showcasePokemon: { orderBy: { slot: 'asc' } },
    },
  });
}

/** Atualiza nome e sprite do treinador. */
export async function updateTrainerInfo(
  trainerCardId: string,
  data: { trainerName?: string; characterSpriteUrl?: string | null },
) {
  await prisma.trainerCard.update({
    where: { id: trainerCardId },
    data,
  });
  revalidatePath('/jogos', 'layout');
}

/** Substitui o time inteiro (6 slots). */
export async function updateShowcase(
  trainerCardId: string,
  slots: {
    slot: number;
    pokemonId: number;
    nickname: string | null;
    moveset: string[];
  }[],
) {
  await prisma.$transaction([
    prisma.trainerCardPokemon.deleteMany({ where: { trainerCardId } }),
    prisma.trainerCardPokemon.createMany({
      data: slots.map((s) => ({
        trainerCardId,
        slot: s.slot,
        pokemonId: s.pokemonId,
        nickname: s.nickname,
        moveset: s.moveset,
      })),
    }),
  ]);
  revalidatePath('/jogos', 'layout');
}

/** Renomeia uma insígnia. */
export async function renameBadge(badgeId: string, name: string) {
  await prisma.badge.update({ where: { id: badgeId }, data: { name } });
  revalidatePath('/jogos', 'layout');
}

/** Marca/desmarca conquista. */
export async function toggleBadgeEarned(badgeId: string, earned: boolean) {
  await prisma.badge.update({
    where: { id: badgeId },
    data: { earnedAt: earned ? new Date() : null },
  });
  revalidatePath('/jogos', 'layout');
}