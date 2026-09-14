'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp } from '@/lib/actions/profile';
import { XP_VALUES } from '@/lib/xp';

/**
 * Busca o TrainerCard do jogo.
 * Se não existir, cria um vazio com 8 slots de insígnia.
 * Se existir mas estiver sem insígnias (dados antigos), cria as 8.
 * Se o nome ainda for o do jogo (bug histórico), corrige para "Hak".
 */
export async function getOrCreateTrainerCard(gameId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { name: true },
  });

  if (!game) {
    throw new Error('Jogo não encontrado');
  }

  const existing = await prisma.trainerCard.findUnique({
    where: { gameId },
    include: { badges: true },
  });

  // Caso 1: não existe → cria com as 8 insígnias
  if (!existing) {
    return prisma.trainerCard.create({
      data: {
        gameId,
        trainerName: 'Hak',
        badges: {
          create: Array.from({ length: 8 }, (_, index) => ({
            name: `Insígnia ${index + 1}`,
          })),
        },
      },
      include: {
        showcasePokemon: { orderBy: { slot: 'asc' } },
        badges: { orderBy: { id: 'asc' } },
      },
    });
  }

  // Caso 2: existe mas está sem insígnias (dados antigos) → cria as 8
  if (existing.badges.length === 0) {
    await prisma.badge.createMany({
      data: Array.from({ length: 8 }, (_, index) => ({
        trainerCardId: existing.id,
        name: `Insígnia ${index + 1}`,
      })),
    });
  }

  // Caso 3: nome do treinador ainda é o nome do jogo (bug histórico) → corrige
  if (existing.trainerName === game.name) {
    await prisma.trainerCard.update({
      where: { id: existing.id },
      data: { trainerName: 'Hak' },
    });
  }

  return prisma.trainerCard.findUniqueOrThrow({
    where: { id: existing.id },
    include: {
      showcasePokemon: { orderBy: { slot: 'asc' } },
      badges: { orderBy: { id: 'asc' } },
    },
  });
}

interface TrainerInfoInput {
  trainerName: string;
  characterSpriteUrl: string | null;
}

/** Atualiza nome e sprite do treinador. */
export async function updateTrainerInfo(
  trainerCardId: string,
  data: TrainerInfoInput,
) {
  const trainerName = data.trainerName.trim();

  if (!trainerName) {
    throw new Error('O nome do treinador é obrigatório');
  }

  const card = await prisma.trainerCard.update({
    where: { id: trainerCardId },
    data: {
      trainerName,
      characterSpriteUrl: data.characterSpriteUrl,
    },
    select: { gameId: true },
  });

  revalidatePath(`/jogos/${card.gameId}/trainer-card`);
  return card;
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
  await prisma.badge.update({
    where: { id: badgeId },
    data: { name },
  });
  revalidatePath('/jogos', 'layout');
}

/** Marca/desmarca conquista. Concede XP na primeira conquista. */
export async function toggleBadgeEarned(badgeId: string, earned: boolean) {
  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return;

  // Concede XP só na PRIMEIRA vez que a insígnia é conquistada
  const shouldAwardXp = earned && !badge.xpAwarded;

  await prisma.badge.update({
    where: { id: badgeId },
    data: {
      earnedAt: earned ? new Date() : null,
      ...(shouldAwardXp ? { xpAwarded: true } : {}),
    },
  });

  if (shouldAwardXp) {
    await grantXp(XP_VALUES.BADGE_EARNED);
  }

  revalidatePath('/jogos', 'layout');
}