'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

interface PokemonApiEntry {
  id: number;
  name: string;
  species: { url: string };
}

interface EvolutionNode {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
}

function speciesId(url: string) {
  return Number(url.split('/').filter(Boolean).pop());
}

function revalidateHackroom(gameId: string) {
  revalidatePath(`/jogos/${gameId}/hackroom`);
  revalidatePath(`/jogos/${gameId}/hackroom/pokedex`);
  revalidatePath(`/jogos/${gameId}/living-dex`);
}

async function getRoom(gameId: string) {
  const room = await prisma.hackRoom.findUnique({ where: { gameId } });
  if (!room) throw new Error('Hackroom não encontrada');
  return room;
}

async function getPokemon(id: number) {
  if (!Number.isInteger(id) || id < 1 || id > 20_000) {
    throw new Error('Pokémon inválido');
  }

  const response = await fetch(`${POKEAPI_URL}/pokemon/${id}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Não foi possível encontrar esse Pokémon');
  const pokemon = await response.json() as PokemonApiEntry;
  if (pokemon.name.includes('-mega')) throw new Error('Mega Evoluções não entram na Pokédex da Hackroom');
  return pokemon;
}

async function addNativeEntries(
  gameId: string,
  pokemon: { id: number; name: string }[],
) {
  const room = await getRoom(gameId);
  const unique = [...new Map(pokemon.map((item) => [item.id, item])).values()];
  if (unique.length === 0) return 0;

  const [existing, lastEntry] = await Promise.all([
    prisma.hackRoomPokedexEntry.findMany({
      where: { hackRoomId: room.id, pokemonId: { in: unique.map((item) => item.id) } },
      select: { pokemonId: true },
    }),
    prisma.hackRoomPokedexEntry.findFirst({
      where: { hackRoomId: room.id },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    }),
  ]);
  const existingIds = new Set(existing.flatMap((item) => item.pokemonId ?? []));
  const missing = unique.filter((item) => !existingIds.has(item.id));
  if (missing.length === 0) return 0;

  await prisma.hackRoomPokedexEntry.createMany({
    data: missing.map((item, index) => ({
      hackRoomId: room.id,
      pokemonId: item.id,
      name: item.name,
      entryNumber: (lastEntry?.entryNumber ?? 0) + index + 1,
    })),
  });
  revalidateHackroom(gameId);
  return missing.length;
}

export async function addHackroomPokedexPokemon(gameId: string, pokemonId: number) {
  const pokemon = await getPokemon(pokemonId);
  const added = await addNativeEntries(gameId, [{ id: pokemon.id, name: pokemon.name }]);
  return { ok: true as const, added };
}

export async function addHackroomEvolutionLine(gameId: string, pokemonId: number) {
  const pokemon = await getPokemon(pokemonId);
  const speciesResponse = await fetch(pokemon.species.url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!speciesResponse.ok) throw new Error('Não foi possível carregar a linha evolutiva');
  const species = (await speciesResponse.json()) as { evolution_chain: { url: string } | null };
  if (!species.evolution_chain?.url) throw new Error('Essa espécie não possui cadeia evolutiva disponível');

  const chainResponse = await fetch(species.evolution_chain.url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!chainResponse.ok) throw new Error('Não foi possível carregar a linha evolutiva');
  const chain = (await chainResponse.json()) as { chain: EvolutionNode };

  const entries: { id: number; name: string }[] = [];
  function visit(node: EvolutionNode) {
    const id = speciesId(node.species.url);
    if (Number.isInteger(id) && id > 0) entries.push({ id, name: node.species.name });
    node.evolves_to.forEach(visit);
  }
  visit(chain.chain);

  // A API separa Megas da cadeia de evolução, então elas nunca entram aqui.
  const added = await addNativeEntries(gameId, entries);
  return { ok: true as const, added, total: entries.length };
}

export async function addHackroomPokedexFake(gameId: string, fakeSpeciesId: string) {
  const room = await getRoom(gameId);
  const fake = await prisma.fakeSpecies.findFirst({
    where: { id: fakeSpeciesId, hackRoomId: room.id },
  });
  if (!fake) throw new Error('Fakémon inválido para esta Hackroom');

  const exists = await prisma.hackRoomPokedexEntry.findFirst({
    where: { hackRoomId: room.id, fakeSpeciesId: fake.id },
  });
  if (exists) return { ok: true as const, added: 0 };

  const lastEntry = await prisma.hackRoomPokedexEntry.findFirst({
    where: { hackRoomId: room.id },
    orderBy: { entryNumber: 'desc' },
    select: { entryNumber: true },
  });
  await prisma.hackRoomPokedexEntry.create({
    data: {
      hackRoomId: room.id,
      fakeSpeciesId: fake.id,
      name: fake.name,
      entryNumber: (lastEntry?.entryNumber ?? 0) + 1,
    },
  });
  revalidateHackroom(gameId);
  return { ok: true as const, added: 1 };
}

export async function addHackroomFakeEvolutionLine(gameId: string, fakeSpeciesId: string) {
  const room = await getRoom(gameId);
  const allFake = await prisma.fakeSpecies.findMany({
    where: { hackRoomId: room.id },
    select: { id: true, name: true, evolvesFromId: true },
  });
  const selected = allFake.find((item) => item.id === fakeSpeciesId);
  if (!selected) throw new Error('Fakémon inválido para esta Hackroom');

  const byParent = new Map<string, typeof allFake>();
  for (const fake of allFake) {
    if (!fake.evolvesFromId) continue;
    byParent.set(fake.evolvesFromId, [...(byParent.get(fake.evolvesFromId) ?? []), fake]);
  }
  const lineIds = new Set<string>([selected.id]);
  let ancestor = selected;
  while (ancestor.evolvesFromId) {
    lineIds.add(ancestor.evolvesFromId);
    const parent = allFake.find((item) => item.id === ancestor.evolvesFromId);
    if (!parent) break;
    ancestor = parent;
  }
  function includeChildren(id: string) {
    for (const child of byParent.get(id) ?? []) {
      if (lineIds.has(child.id)) continue;
      lineIds.add(child.id);
      includeChildren(child.id);
    }
  }
  includeChildren(ancestor.id);

  const selectedLine = allFake.filter((item) => lineIds.has(item.id));
  const existing = await prisma.hackRoomPokedexEntry.findMany({
    where: { hackRoomId: room.id, fakeSpeciesId: { in: selectedLine.map((item) => item.id) } },
    select: { fakeSpeciesId: true },
  });
  const existingIds = new Set(existing.flatMap((item) => item.fakeSpeciesId ?? []));
  const missing = selectedLine.filter((item) => !existingIds.has(item.id));
  if (missing.length === 0) return { ok: true as const, added: 0, total: selectedLine.length };

  const lastEntry = await prisma.hackRoomPokedexEntry.findFirst({
    where: { hackRoomId: room.id }, orderBy: { entryNumber: 'desc' }, select: { entryNumber: true },
  });
  await prisma.hackRoomPokedexEntry.createMany({
    data: missing.map((item, index) => ({
      hackRoomId: room.id, fakeSpeciesId: item.id, name: item.name,
      entryNumber: (lastEntry?.entryNumber ?? 0) + index + 1,
    })),
  });
  revalidateHackroom(gameId);
  return { ok: true as const, added: missing.length, total: selectedLine.length };
}

export async function removeHackroomPokedexEntry(gameId: string, entryId: string) {
  const room = await getRoom(gameId);
  await prisma.hackRoomPokedexEntry.deleteMany({
    where: { id: entryId, hackRoomId: room.id },
  });
  revalidateHackroom(gameId);
  return { ok: true as const, added: 0 };
}
