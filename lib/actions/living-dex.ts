'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp, mergeXpResults, type GrantXpResult } from '@/lib/xp';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';
import { randomSpriteVariant } from '@/lib/pokeapi/sprite-variants';

export async function createOwnedPokemon(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? '');
  const boxNumber = Number(formData.get('boxNumber'));
  const boxSlot = Number(formData.get('boxSlot'));
  const pokemonId = Number(formData.get('pokemonId'));
  const fakeSpeciesId = String(formData.get('fakeSpeciesId') ?? '').trim() || null;
  const level = Number(formData.get('level')) || 1;
  const nickname = String(formData.get('nickname') ?? '').trim() || null;
  const trainerName = String(formData.get('trainerName') ?? '').trim() || null;
  const isShiny = formData.get('isShiny') === 'on';
  const sprite = formData.get('sprite');

  if (
    !gameId ||
    !Number.isInteger(pokemonId) ||
    (pokemonId < 1 && !fakeSpeciesId) ||
    !Number.isInteger(boxNumber) ||
    boxNumber < 1 ||
    !Number.isInteger(boxSlot) ||
    boxSlot < 1 ||
    boxSlot > 12 ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 100
  ) {
    throw new Error('Dados incompletos ou inválidos');
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { hackRoom: { include: { pokedexEntries: true } } },
  });
  if (!game) throw new Error('Jogo não encontrado');
  if (fakeSpeciesId && (!game.hackRoom || !(await prisma.fakeSpecies.findFirst({ where: { id: fakeSpeciesId, hackRoomId: game.hackRoom.id } })))) throw new Error('Fakémon inválido para esta hackroom');
  if (game.type === 'HACK_ROM') {
    const isInCustomDex = game.hackRoom?.pokedexEntries.some((entry) =>
      fakeSpeciesId ? entry.fakeSpeciesId === fakeSpeciesId : entry.pokemonId === pokemonId,
    );
    if (!isInCustomDex) throw new Error('Adicione esta espécie à Pokédex da Hackroom antes de colocá-la na Living Dex');
  }

  const isNewSpecies =
    fakeSpeciesId ? (await prisma.ownedPokemon.count({ where: { fakeSpeciesId } })) === 0 : (await prisma.ownedPokemon.count({ where: { pokemonId } })) === 0;

  let customSpriteUrl: string | null = null;
  if (
    game.type === 'HACK_ROM' &&
    !fakeSpeciesId &&
    sprite instanceof File &&
    sprite.size > 0 &&
    game.hackRoom
  ) {
    const ext = sprite.name.split('.').pop() ?? 'png';
    const filename = `hackrooms/${game.hackRoom.id}/${pokemonId}.${ext}`;
    const blob = await put(filename, sprite, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });
    customSpriteUrl = blob.url;
  }

  // Shiny sempre usa official-artwork (é a única arte shiny 2D na PokeAPI)
  const spriteVariant = isShiny ? 'official-artwork' : randomSpriteVariant();

  await prisma.$transaction(async (tx) => {
    await tx.ownedPokemon.create({
      data: {
        gameId,
        boxNumber,
        boxSlot,
        pokemonId: fakeSpeciesId ? 0 : pokemonId,
        fakeSpeciesId,
        level,
        nickname,
        trainerName,
        isShiny,
        spriteVariant,
      },
    });

    if (customSpriteUrl && game.hackRoom) {
      await tx.customSprite.upsert({
        where: {
          hackRoomId_pokemonId: {
            hackRoomId: game.hackRoom.id,
            pokemonId,
          },
        },
        update: { imageUrl: customSpriteUrl },
        create: {
          hackRoomId: game.hackRoom.id,
          pokemonId,
          imageUrl: customSpriteUrl,
        },
      });
    }
  });

  const xpResults: GrantXpResult[] = [];

  xpResults.push(
    await grantXp(
      isNewSpecies ? 'CATCH_NEW_SPECIES' : 'CATCH_DUPLICATE_SPECIES',
      { pokemonId, gameId },
    ),
  );

  if (isShiny) {
    xpResults.push(
      await grantXp('CATCH_SHINY_BONUS', { pokemonId, gameId }),
    );
  }

  if (!game.completionBonusAwarded) {
    const ownedDistinct = await prisma.ownedPokemon.findMany({
      where: { gameId },
      select: { pokemonId: true, fakeSpeciesId: true },
    });

    const ownedKeys = new Set(ownedDistinct.map((item) => item.fakeSpeciesId ? `fake:${item.fakeSpeciesId}` : `pokemon:${item.pokemonId}`));
    const requiredKeys = game.type === 'HACK_ROM'
      ? new Set((game.hackRoom?.pokedexEntries ?? []).map((item) => item.fakeSpeciesId ? `fake:${item.fakeSpeciesId}` : `pokemon:${item.pokemonId}`))
      : new Set((game.pokedexId ? await getPokedexServer(game.pokedexId) : []).map((item) => `pokemon:${item.id}`));

    if (requiredKeys.size > 0 && [...requiredKeys].every((key) => ownedKeys.has(key))) {
      const completion = await prisma.game.updateMany({
        where: { id: gameId, completionBonusAwarded: false },
        data: { completionBonusAwarded: true },
      });

      if (completion.count > 0) {
        xpResults.push(await grantXp('DEX_COMPLETE_GAME', { gameId }));
      }
    }
  }

  revalidatePath(`/jogos/${gameId}/living-dex`);

  return { ok: true as const, xp: mergeXpResults(xpResults) };
}

export async function deleteOwnedPokemon(id: string, gameId: string) {
  if (!id || !gameId) throw new Error('Dados incompletos');
  await prisma.ownedPokemon.delete({ where: { id } });
  revalidatePath(`/jogos/${gameId}/living-dex`);
}

export async function updateOwnedPokemon(
  id: string,
  gameId: string,
  data: {
    nickname?: string | null;
    trainerName?: string | null;
    level?: number;
    isShiny?: boolean;
  },
) {
  if (!id || !gameId) throw new Error('Dados incompletos');

  const updateData: {
    nickname?: string | null;
    trainerName?: string | null;
    level?: number;
    isShiny?: boolean;
    spriteVariant?: string;
  } = {};

  if (data.nickname !== undefined) {
    updateData.nickname = data.nickname?.trim() || null;
  }
  if (data.trainerName !== undefined) {
    updateData.trainerName = data.trainerName?.trim() || null;
  }
  if (data.level !== undefined) {
    updateData.level = Math.min(100, Math.max(1, Math.round(Number(data.level))));
  }
  if (data.isShiny !== undefined) {
    updateData.isShiny = Boolean(data.isShiny);
    if (updateData.isShiny) {
      updateData.spriteVariant = 'official-artwork';
    }
  }

  await prisma.ownedPokemon.update({
    where: { id },
    data: updateData,
  });

  revalidatePath(`/jogos/${gameId}/living-dex`);
  return { ok: true as const };
}
