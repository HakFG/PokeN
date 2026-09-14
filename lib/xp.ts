export const XP_VALUES = {
  NEW_SPECIES: 10,
  DUPLICATE_SPECIES: 2,
  BADGE_EARNED: 25,
  COMPLETE_DEX: 200,
  NEW_HACKROOM: 15,
} as const;

export function addXp(currentXp: number, currentLevel: number, gained: number) {
  let xp = currentXp + gained;
  let level = currentLevel;

  while (xp >= level * 100) {
    xp -= level * 100;
    level += 1;
  }

  return { xp, level };
}

export function xpProgress(xp: number, level: number) {
  const needed = level * 100;
  const pct = Math.min(100, Math.round((xp / needed) * 100));
  return { current: xp, needed, pct };
}
