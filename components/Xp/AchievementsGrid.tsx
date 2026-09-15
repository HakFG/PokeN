'use client';

import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '@/lib/xp/achievements';

interface Unlock {
  achievementId: string;
  unlockedAt: Date | string;
}

interface Props {
  unlocked: Unlock[];
  /** Se verdadeiro, mostra só as desbloqueadas + 3 bloqueadas próximas. */
  compact?: boolean;
}

export default function AchievementsGrid({ unlocked, compact = false }: Props) {
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  const items = compact
    ? ACHIEVEMENTS.filter((a) => unlockedMap.has(a.id) || a.category !== 'oculta').slice(0, 8)
    : ACHIEVEMENTS;

  return (
    <div className="achievements-panel">
      <div className="achievements-header">
        <span className="achievements-title">Conquistas</span>
        <span className="achievements-count">
          {unlockedMap.size} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div className={`achievements-grid ${compact ? 'achievements-grid-compact' : ''}`}>
        {items.map((a, i) => {
          const isUnlocked = unlockedMap.has(a.id);
          const isHidden = a.category === 'oculta' && !isUnlocked;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className={`achievement-card ${isUnlocked ? 'achievement-card-unlocked' : ''}`}
              title={isHidden ? 'Conquista oculta' : a.description}
            >
              <span className="achievement-card-icon">
                {isUnlocked ? '🏆' : '🔒'}
              </span>
              <span className="achievement-card-name">
                {isHidden ? '???' : a.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}