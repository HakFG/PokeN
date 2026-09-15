// lib/xp/streak.ts
import { prisma } from '@/lib/prisma';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(previous: Date, today: Date): boolean {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return isSameDay(previous, y);
}

export async function updateStreak(profileId: string) {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { id: profileId } });
  const today = new Date();

  let newStreak = profile.currentStreak;

  if (!profile.lastActivityDate) {
    newStreak = 1;
  } else if (isSameDay(profile.lastActivityDate, today)) {
    return { streak: profile.currentStreak, isNewDay: false, bonusXp: 0 };
  } else if (isYesterday(profile.lastActivityDate, today)) {
    newStreak = profile.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, profile.longestStreak);

  let bonusXp = 0;
  if (newStreak === 7) bonusXp = 50;
  if (newStreak === 30) bonusXp = 250;

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
    },
  });

  return { streak: newStreak, isNewDay: true, bonusXp };
}