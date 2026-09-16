'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { grantXp } from '@/lib/xp';
import { randomSpriteVariant } from '@/lib/pokeapi/sprite-variants';

export interface AddPokemonInput {
  gameId: string;
  extraGameIds?: string[];
  pokemonId: number;
  nickname?: string | null;
  trainerName?: string | null;
  level?: number;
  isShiny?: boolean;
  spriteVariant?: string | null;
}

export async function addPokemonHomeAction(input: AddPokemonInput) {
  const {
    gameId,
    extraGameIds = [],
    pokemonId,
    nickname = null,
    trainerName = null,
    level = 5,
    isShiny = false,
    spriteVariant = isShiny ? 'official-artwork' : randomSpriteVariant(),
  } = input;

  if (!gameId || !pokemonId || pokemonId < 1) {
    throw new Error('Jogo e Pokémon ID são obrigatórios.');
  }

  const cleanExtraGameIds = Array.from(
    new Set((extraGameIds || []).filter((id) => id && id !== gameId))
  );

  // Encontra o próximo slot livre na box para evitar colisão na restrição unique [gameId, boxNumber, boxSlot]
  const occupiedSlots = await prisma.ownedPokemon.findMany({
    where: { gameId },
    select: { boxNumber: true, boxSlot: true },
  });

  const slotSet = new Set(occupiedSlots.map((s) => `${s.boxNumber}:${s.boxSlot}`));
  let boxNumber = 1;
  let boxSlot = 1;
  while (slotSet.has(`${boxNumber}:${boxSlot}`)) {
    boxSlot++;
    if (boxSlot > 30) {
      boxNumber++;
      boxSlot = 1;
    }
  }

  const created = await prisma.ownedPokemon.create({
    data: {
      gameId,
      extraGameIds: cleanExtraGameIds,
      pokemonId,
      nickname: nickname?.trim() || null,
      trainerName: trainerName?.trim() || null,
      level: Math.min(100, Math.max(1, Math.round(level))),
      isShiny: Boolean(isShiny),
      boxNumber,
      boxSlot,
      spriteVariant: isShiny ? 'official-artwork' : (spriteVariant || 'official-artwork'),
    },
  });

  try {
    await grantXp('CATCH_NEW_SPECIES', { pokemonId, gameId });
    if (isShiny) {
      await grantXp('CATCH_SHINY_BONUS', { pokemonId, gameId });
    }
  } catch (err) {
    console.error('Erro ao conceder XP:', err);
  }

  revalidatePath('/pokemons');
  revalidatePath(`/pokemons/${gameId}`);
  for (const extraId of cleanExtraGameIds) {
    revalidatePath(`/pokemons/${extraId}`);
  }
  revalidatePath(`/jogos/${gameId}/living-dex`);

  return { ok: true, pokemon: created };
}

export interface UpdatePokemonInput {
  gameId?: string;
  extraGameIds?: string[];
  nickname?: string | null;
  trainerName?: string | null;
  level?: number;
  isShiny?: boolean;
  spriteVariant?: string | null;
}

export async function updatePokemonHomeAction(id: string, input: UpdatePokemonInput) {
  if (!id) throw new Error('ID do Pokémon é obrigatório.');

  const existing = await prisma.ownedPokemon.findUnique({
    where: { id },
  });

  if (!existing) throw new Error('Pokémon não encontrado.');

  const updateData: {
    gameId?: string;
    extraGameIds?: string[];
    nickname?: string | null;
    trainerName?: string | null;
    level?: number;
    isShiny?: boolean;
    spriteVariant?: string | null;
  } = {};

  const effectiveGameId = input.gameId ?? existing.gameId;

  if (input.gameId !== undefined && input.gameId !== existing.gameId) {
    updateData.gameId = input.gameId;
  }

  if (input.extraGameIds !== undefined) {
    updateData.extraGameIds = Array.from(
      new Set((input.extraGameIds || []).filter((gid) => gid && gid !== effectiveGameId))
    );
  }

  if (input.nickname !== undefined) {
    updateData.nickname = input.nickname?.trim() || null;
  }
  if (input.trainerName !== undefined) {
    updateData.trainerName = input.trainerName?.trim() || null;
  }
  if (input.level !== undefined) {
    updateData.level = Math.min(100, Math.max(1, Math.round(Number(input.level))));
  }
  if (input.isShiny !== undefined) {
    updateData.isShiny = Boolean(input.isShiny);
    if (updateData.isShiny) {
      updateData.spriteVariant = 'official-artwork';
    }
  }
  if (input.spriteVariant !== undefined && !updateData.isShiny) {
    updateData.spriteVariant = input.spriteVariant;
  }

  const updated = await prisma.ownedPokemon.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/pokemons');
  revalidatePath(`/pokemons/${existing.gameId}`);
  revalidatePath(`/pokemons/${effectiveGameId}`);
  const allTouchedGames = new Set([
    ...(existing.extraGameIds || []),
    ...(updated.extraGameIds || []),
  ]);
  for (const gid of allTouchedGames) {
    revalidatePath(`/pokemons/${gid}`);
  }
  revalidatePath(`/jogos/${existing.gameId}/living-dex`);
  if (effectiveGameId !== existing.gameId) {
    revalidatePath(`/jogos/${effectiveGameId}/living-dex`);
  }

  return { ok: true, pokemon: updated };
}

export async function deletePokemonHomeAction(id: string) {
  if (!id) throw new Error('ID é obrigatório.');

  const existing = await prisma.ownedPokemon.findUnique({
    where: { id },
  });

  if (!existing) throw new Error('Pokémon não encontrado.');

  await prisma.ownedPokemon.delete({
    where: { id },
  });

  revalidatePath('/pokemons');
  revalidatePath(`/pokemons/${existing.gameId}`);
  for (const extraId of existing.extraGameIds || []) {
    revalidatePath(`/pokemons/${extraId}`);
  }
  revalidatePath(`/jogos/${existing.gameId}/living-dex`);

  return { ok: true };
}

export interface TransferPokemonInput {
  pokemonId: string; // id do OwnedPokemon (UUID no banco)
  targetGameId: string;
  targetBoxNumber?: number; // padrão 1
}

export async function transferPokemonGameAction(input: TransferPokemonInput) {
  const { pokemonId: id, targetGameId, targetBoxNumber = 1 } = input;
  if (!id || !targetGameId) throw new Error('ID do Pokémon e jogo de destino são obrigatórios.');

  const pokemon = await prisma.ownedPokemon.findUnique({
    where: { id },
  });
  if (!pokemon) throw new Error('Pokémon não encontrado.');
  if (pokemon.gameId === targetGameId) throw new Error('O Pokémon já está associado a este jogo.');

  const targetGame = await prisma.game.findUnique({
    where: { id: targetGameId },
  });
  if (!targetGame) throw new Error('Jogo de destino não encontrado.');

  // Encontra slot livre no jogo e na box de destino
  const occupiedSlots = await prisma.ownedPokemon.findMany({
    where: { gameId: targetGameId },
    select: { boxNumber: true, boxSlot: true },
  });
  const occupiedSet = new Set(occupiedSlots.map((s) => `${s.boxNumber}:${s.boxSlot}`));

  let box = Math.max(1, targetBoxNumber);
  let slot = 1;
  while (occupiedSet.has(`${box}:${slot}`)) {
    slot++;
    if (slot > 30) {
      box++;
      slot = 1;
    }
  }

  const previousGameId = pokemon.gameId;

  const transferred = await prisma.ownedPokemon.update({
    where: { id },
    data: {
      gameId: targetGameId,
      boxNumber: box,
      boxSlot: slot,
    },
  });

  revalidatePath('/pokemons');
  revalidatePath(`/pokemons/${previousGameId}`);
  revalidatePath(`/pokemons/${targetGameId}`);
  revalidatePath(`/jogos/${previousGameId}/living-dex`);
  revalidatePath(`/jogos/${targetGameId}/living-dex`);

  return { ok: true, pokemon: transferred, targetBox: box, targetSlot: slot };
}
