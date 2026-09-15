// lib/xp/level-curve.ts

export function xpRequiredForLevel(level: number): number {
  return level * 100;
}

export function addXp(currentXp: number, currentLevel: number, gained: number) {
  let xp = currentXp + gained;
  let level = currentLevel;
  let leveledUp = false;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
    leveledUp = true;
  }

  return { xp, level, leveledUp };
}

export function progressPercent(xp: number, level: number): number {
  return Math.min(100, Math.round((xp / xpRequiredForLevel(level)) * 100));
}

export function xpProgress(xp: number, level: number) {
  const needed = xpRequiredForLevel(level);
  return { current: xp, needed, pct: progressPercent(xp, level) };
}

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1,   title: 'Novato de Kanto' },
  { minLevel: 5,   title: 'Aspirante a Treinador' },
  { minLevel: 10,  title: 'Treinador de Rota' },
  { minLevel: 15,  title: 'Caçador de Insígnias' },
  { minLevel: 20,  title: 'Domador de Pokémon' },
  { minLevel: 30,  title: 'Veterano da Liga' },
  { minLevel: 40,  title: 'Colecionador Obsessivo' },
  { minLevel: 50,  title: 'Mestre Pokémon' },
  { minLevel: 65,  title: 'Lenda Viva' },
  { minLevel: 80,  title: 'Campeão Eterno' },
  { minLevel: 100, title: 'Arceus em Pessoa' },
];

export function getTitleForLevel(level: number): string {
  const match = [...LEVEL_TITLES].reverse().find((t) => level >= t.minLevel);
  return match?.title ?? LEVEL_TITLES[0].title;
}