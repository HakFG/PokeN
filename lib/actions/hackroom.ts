'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { grantXp, mergeXpResults } from '@/lib/xp';

const difficulties = new Set(['EASY', 'NORMAL', 'HARD', 'BRUTAL']);
const clean = (value: FormDataEntryValue | null) => String(value ?? '').trim() || null;

async function upload(file: FormDataEntryValue | null, folder: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith('image/')) throw new Error('Envie uma imagem válida');
  const ext = file.name.split('.').pop() || 'png';
  const blob = await put(`${folder}/${crypto.randomUUID()}.${ext}`, file, {
    access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

function paths(gameId: string) {
  revalidatePath(`/jogos/${gameId}/hackroom`);
  revalidatePath(`/jogos/${gameId}/hackroom/fakemon`);
  revalidatePath(`/jogos/${gameId}/hackroom/lideres`);
  revalidatePath(`/jogos/${gameId}/living-dex`);
  revalidatePath('/jogos');
}

export async function updateHackRoomMeta(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? '');
  const difficulty = clean(formData.get('difficulty'));
  if (!gameId || (difficulty && !difficulties.has(difficulty))) throw new Error('Dados inválidos');
  const room = await prisma.hackRoom.update({
    where: { gameId },
    data: { description: clean(formData.get('description')), baseRomName: clean(formData.get('baseRomName')), regionName: clean(formData.get('regionName')), difficulty: difficulty as never },
  });
  paths(gameId);
  return { ok: true as const, roomId: room.id };
}

export async function updateGameStatus(gameId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED') {
  if (!['IN_PROGRESS', 'COMPLETED', 'DROPPED'].includes(status)) throw new Error('Status inválido');
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.type !== 'HACK_ROM') throw new Error('Hackroom não encontrada');
  const newlyCompleted = status === 'COMPLETED' && !game.completedAt;
  await prisma.game.update({ where: { id: gameId }, data: { status, startedAt: game.startedAt ?? new Date(), completedAt: status === 'COMPLETED' ? game.completedAt ?? new Date() : game.completedAt } });
  const xp = newlyCompleted ? mergeXpResults([await grantXp('GAME_COMPLETED', { gameId })]) : null;
  paths(gameId);
  return { ok: true as const, xp };
}

export async function addScreenshot(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? '');
  const room = await prisma.hackRoom.findUnique({ where: { gameId } });
  if (!room) throw new Error('Hackroom não encontrada');
  const imageUrl = await upload(formData.get('image'), `hackrooms/${room.id}/screenshots`);
  if (!imageUrl) throw new Error('Escolha uma imagem');
  await prisma.hackRoomScreenshot.create({ data: { hackRoomId: room.id, imageUrl, caption: clean(formData.get('caption')) } });
  paths(gameId); return { ok: true as const };
}

export async function deleteScreenshot(id: string, gameId: string) {
  await prisma.hackRoomScreenshot.delete({ where: { id } }); paths(gameId);
}

export async function saveFakeSpecies(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? ''); const id = clean(formData.get('id'));
  const room = await prisma.hackRoom.findUnique({ where: { gameId } });
  const name = clean(formData.get('name')); const types = String(formData.get('types') ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 2);
  if (!room || !name || types.length === 0) throw new Error('Nome e ao menos um tipo são obrigatórios');
  const spriteUrl = await upload(formData.get('sprite'), `hackrooms/${room.id}/fakemon`);
  const statsRaw = clean(formData.get('stats')); let stats: object | null = null;
  if (statsRaw) { try { stats = JSON.parse(statsRaw); } catch { throw new Error('Stats devem estar em JSON válido'); } }
  if (id) await prisma.fakeSpecies.update({ where: { id }, data: { name, types, description: clean(formData.get('description')), evolvesFromId: clean(formData.get('evolvesFromId')), stats: stats ?? undefined, ...(spriteUrl && { spriteUrl }) } });
  else await prisma.fakeSpecies.create({ data: { hackRoomId: room.id, name, types, description: clean(formData.get('description')), evolvesFromId: clean(formData.get('evolvesFromId')), stats: stats ?? undefined, spriteUrl } });
  const xp = id ? null : mergeXpResults([await grantXp('FAKEMON_CREATED', { gameId })]); paths(gameId); return { ok: true as const, xp };
}

export async function deleteFakeSpecies(id: string, gameId: string) { await prisma.fakeSpecies.delete({ where: { id } }); paths(gameId); }

export async function saveGymLeader(formData: FormData) {
  const gameId = String(formData.get('gameId') ?? ''); const id = clean(formData.get('id')); const room = await prisma.hackRoom.findUnique({ where: { gameId } });
  const name = clean(formData.get('name')); const types = String(formData.get('types') ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 2);
  if (!room || !name || types.length === 0) throw new Error('Nome e tipo são obrigatórios');
  const spriteUrl = await upload(formData.get('sprite'), `hackrooms/${room.id}/leaders`);
  const data = { name, title: clean(formData.get('title')), types, ...(spriteUrl && { spriteUrl }) };
  if (id) {
    await prisma.gymLeader.update({ where: { id }, data });
  } else {
    const card = await prisma.trainerCard.upsert({
      where: { gameId },
      update: {},
      create: { gameId, trainerName: 'Hak' },
    });
    const badge = await prisma.badge.create({
      data: { trainerCardId: card.id, name: `${name} Badge` },
    });
    await prisma.gymLeader.create({ data: { hackRoomId: room.id, ...data, badgeId: badge.id } });
  }
  paths(gameId); return { ok: true as const };
}

export async function deleteGymLeader(id: string, gameId: string) { await prisma.gymLeader.delete({ where: { id } }); paths(gameId); }

export async function toggleGymLeaderDefeated(id: string, gameId: string, defeated: boolean) {
  const leader = await prisma.gymLeader.findUnique({ where: { id } }); if (!leader) throw new Error('Líder não encontrado');
  const shouldAwardXp = defeated && !leader.xpAwarded;
  await prisma.$transaction(async (tx) => {
    await tx.gymLeader.update({ where: { id }, data: { defeatedAt: defeated ? new Date() : null, ...(shouldAwardXp && { xpAwarded: true }) } });
    if (leader.badgeId) await tx.badge.update({ where: { id: leader.badgeId }, data: { earnedAt: defeated ? new Date() : null, ...(shouldAwardXp && { xpAwarded: true }) } });
  });
  const xp = shouldAwardXp ? mergeXpResults([await grantXp('GYM_LEADER_DEFEATED', { gameId, leaderId: id })]) : null;
  paths(gameId); return { ok: true as const, xp };
}
