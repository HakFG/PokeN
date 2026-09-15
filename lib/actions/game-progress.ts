'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export type GameProgressState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

export async function updateGameProgress(
  gameId: string,
  state: GameProgressState,
  isCurrentlyPlaying: boolean,
) {
  if (!['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'].includes(state)) {
    throw new Error('Status de jogo inválido');
  }
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Jogo não encontrado');

  const now = new Date();
  const isNotStarted = state === 'NOT_STARTED';
  const completed = state === 'COMPLETED';
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: isNotStarted ? 'IN_PROGRESS' : state,
      isCurrentlyPlaying: !isNotStarted && !completed && state !== 'DROPPED' && isCurrentlyPlaying,
      startedAt: isNotStarted ? null : game.startedAt ?? now,
      completedAt: completed ? game.completedAt ?? now : null,
    },
  });
  revalidatePath('/jogos');
  revalidatePath(`/jogos/${gameId}/trainer-card`);
  revalidatePath('/');
  return { ok: true as const };
}
