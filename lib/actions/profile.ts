'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { addXp } from '@/lib/xp';

export async function getOrCreateProfile() {
  const existing = await prisma.profile.findFirst();
  if (existing) return existing;

  return prisma.profile.create({
    data: { name: 'Hak', level: 1, xp: 0 },
  });
}

export async function grantXp(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Quantidade de XP inválida');
  }

  const profile = await getOrCreateProfile();
  const { xp, level } = addXp(profile.xp, profile.level, amount);
  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: { xp, level },
  });

  revalidatePath('/perfil');
  return updated;
}

export async function updateProfileSprite(url: string | null) {
  const normalizedUrl = url?.trim() || null;
  if (
    normalizedUrl &&
    !normalizedUrl.startsWith('/') &&
    !/^https?:\/\//i.test(normalizedUrl)
  ) {
    throw new Error('A URL do avatar deve começar com http://, https:// ou /');
  }

  const profile = await getOrCreateProfile();
  await prisma.profile.update({
    where: { id: profile.id },
    data: { characterSpriteUrl: normalizedUrl },
  });
  revalidatePath('/perfil');
  revalidatePath('/', 'layout');
}

export async function setFavorite(slot: number, pokemonId: number) {
  if (!Number.isInteger(slot) || slot < 1 || slot > 6 || !Number.isInteger(pokemonId) || pokemonId < 1) {
    throw new Error('Favorito inválido');
  }

  const profile = await getOrCreateProfile();
  await prisma.favoritePokemon.upsert({
    where: { profileId_slot: { profileId: profile.id, slot } },
    update: { pokemonId },
    create: { profileId: profile.id, slot, pokemonId },
  });
  revalidatePath('/perfil');
}

export async function removeFavorite(slot: number) {
  const profile = await getOrCreateProfile();
  await prisma.favoritePokemon.deleteMany({
    where: { profileId: profile.id, slot },
  });
  revalidatePath('/perfil');
}
