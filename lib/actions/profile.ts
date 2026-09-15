'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp, mergeXpResults, type GrantXpResult } from '@/lib/xp';

export async function getOrCreateProfile() {
  const existing = await prisma.profile.findFirst();
  if (existing) return existing;
  return prisma.profile.create({
    data: { name: 'Hak', level: 1, xp: 0 },
  });
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
  if (
    !Number.isInteger(slot) ||
    slot < 1 ||
    slot > 6 ||
    !Number.isInteger(pokemonId) ||
    pokemonId < 1
  ) {
    throw new Error('Favorito inválido');
  }

  const profile = await getOrCreateProfile();

  const existing = await prisma.favoritePokemon.findUnique({
    where: { profileId_slot: { profileId: profile.id, slot } },
  });
  const isNewFavorite = !existing;

  await prisma.favoritePokemon.upsert({
    where: { profileId_slot: { profileId: profile.id, slot } },
    update: { pokemonId },
    create: { profileId: profile.id, slot, pokemonId },
  });

  const xpResults: GrantXpResult[] = [];

  if (isNewFavorite) {
    xpResults.push(await grantXp('FAVORITE_SET', { slot, pokemonId }));
  }

  const count = await prisma.favoritePokemon.count({
    where: { profileId: profile.id },
  });
  if (count === 6 && isNewFavorite) {
    xpResults.push(await grantXp('ALL_FAVORITES_SET', {}));
  }

  revalidatePath('/perfil');
  return { ok: true as const, xp: mergeXpResults(xpResults) };
}

export async function removeFavorite(slot: number) {
  const profile = await getOrCreateProfile();
  await prisma.favoritePokemon.deleteMany({
    where: { profileId: profile.id, slot },
  });
  revalidatePath('/perfil');
}
