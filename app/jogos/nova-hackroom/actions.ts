// app/jogos/nova-hackroom/actions.ts
'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp, mergeXpResults } from '@/lib/xp';

export async function createHackRoom(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const themeColor = (formData.get('themeColor') as string) || '#90A4AE';
  const description = (formData.get('description') as string)?.trim() || null;
  const baseRomName = (formData.get('baseRomName') as string)?.trim() || null;
  const regionName = (formData.get('regionName') as string)?.trim() || null;
  const difficulty = (formData.get('difficulty') as string) || null;
  const banner = formData.get('banner') as File | null;

  if (!name) {
    throw new Error('Nome é obrigatório');
  }

  let bannerUrl: string | null = null;
  if (banner && banner.size > 0) {
    const ext = banner.name.split('.').pop() ?? 'bin';
    const filename = `hackrooms/${crypto.randomUUID()}.${ext}`;
    const blob = await put(filename, banner, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    bannerUrl = blob.url;
  }

  const game = await prisma.$transaction(async (tx) => {
    const created = await tx.game.create({
      data: {
        name,
        type: 'HACK_ROM',
        themeColor,
        bannerUrl,
        spriteKey: null,
        isCurrentlyPlaying: false,
      },
    });
    await tx.hackRoom.create({
      data: {
        gameId: created.id,
        description,
        baseRomName,
        regionName,
        difficulty: difficulty as never,
      },
    });
    return created;
  });

  const xpResult = await grantXp('HACKROOM_CREATED', { gameId: game.id });
  revalidatePath('/jogos');

  return {
    ok: true as const,
    xp: mergeXpResults([xpResult]),
    gameId: game.id,
  };
}
