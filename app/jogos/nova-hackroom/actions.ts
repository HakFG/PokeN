// app/jogos/nova-hackroom/actions.ts
'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { grantXp } from '@/lib/actions/profile';
import { XP_VALUES } from '@/lib/xp';

export async function createHackRoom(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const themeColor = (formData.get('themeColor') as string) || '#90A4AE';
  const description = (formData.get('description') as string)?.trim() || null;
  const banner = formData.get('banner') as File | null;

  if (!name) {
    throw new Error('Nome é obrigatório');
  }

  // Upload do banner (se houver)
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

  // Cria Game + HackRoom em transação (atômico)
  await prisma.$transaction(async (tx) => {
    const game = await tx.game.create({
      data: {
        name,
        type: 'HACK_ROM',
        themeColor,
        bannerUrl,
        spriteKey: null, // hack rooms customizam sprite por pokémon depois
        isCurrentlyPlaying: false,
      },
    });
    await tx.hackRoom.create({
      data: {
        gameId: game.id,
        description,
      },
    });
  });

  await grantXp(XP_VALUES.NEW_HACKROOM);
  revalidatePath('/jogos');
  redirect('/jogos');
}