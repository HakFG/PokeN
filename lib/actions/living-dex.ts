'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp } from '@/lib/actions/profile';
import { XP_VALUES } from '@/lib/xp';
import { getPokedexServer } from '@/lib/pokeapi/server-pokedex';
import { randomSpriteVariant } from '@/lib/pokeapi/sprite-variants';

export async function createOwnedPokemon(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? '');
  const boxNumber = Number(formData.get('boxNumber'));
  const boxSlot = Number(formData.get('boxSlot'));
  const pokemonId = Number(formData.get('pokemonId'));
  const level = Number(formData.get('level')) || 1;
  const nickname = String(formData.get('nickname') ?? '').trim() || null;
  const isShiny = formData.get('isShiny') === 'on';
  const sprite = formData.get('sprite');

  if (
    !gameId ||
    !Number.isInteger(pokemonId) ||
    pokemonId < 1 ||
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
    include: { hackRoom: true },
  });
  if (!game) throw new Error('Jogo não encontrado');

  const isNewSpecies =
    (await prisma.ownedPokemon.count({ where: { pokemonId } })) === 0;

  let customSpriteUrl: string | null = null;
  if (
    game.type === 'HACK_ROM' &&
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
        pokemonId,
        level,
        nickname,
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

  await grantXp(
    isNewSpecies ? XP_VALUES.NEW_SPECIES : XP_VALUES.DUPLICATE_SPECIES,
  );

  if (game.pokedexId && !game.completionBonusAwarded) {
    const species = await getPokedexServer(game.pokedexId);
    const ownedDistinct = await prisma.ownedPokemon.findMany({
      where: { gameId },
      select: { pokemonId: true },
      distinct: ['pokemonId'],
    });

    if (species.length > 0 && ownedDistinct.length >= species.length) {
      const completion = await prisma.game.updateMany({
        where: { id: gameId, completionBonusAwarded: false },
        data: { completionBonusAwarded: true },
      });

      if (completion.count > 0) {
        await grantXp(XP_VALUES.COMPLETE_DEX);
      }
    }
  }

  revalidatePath(`/jogos/${gameId}/living-dex`);
}

export async function deleteOwnedPokemon(id: string, gameId: string) {
  if (!id || !gameId) throw new Error('Dados incompletos');
  await prisma.ownedPokemon.delete({ where: { id } });
  revalidatePath(`/jogos/${gameId}/living-dex`);
}
