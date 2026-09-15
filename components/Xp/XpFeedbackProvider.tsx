'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import XpToast from './XpToast';
import LevelUpModal from './LevelUpModal';
import AchievementUnlockModal from './AchievementUnlockModal';
import type { GrantXpResult } from '@/lib/xp/engine';
import type { Achievement } from '@/lib/xp/achievements';

type SerializableAchievement = Omit<Achievement, 'check'>;

interface XpFeedbackContextValue {
  showFeedback: (result: GrantXpResult, label?: string) => void;
}

const XpFeedbackContext = createContext<XpFeedbackContextValue | null>(null);

export function useXpFeedback() {
  const ctx = useContext(XpFeedbackContext);
  if (!ctx) {
    throw new Error('useXpFeedback must be used inside XpFeedbackProvider');
  }
  return ctx;
}

interface ToastState {
  amount: number;
  label: string;
}

interface LevelUpState {
  level: number;
  title: string;
}

export function XpFeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null);
  const [achievements, setAchievements] = useState<SerializableAchievement[]>(
    [],
  );

  const showFeedback = useCallback(
    (result: GrantXpResult, label?: string) => {
      // 1. Toast de XP — só se ganhou XP
      if (result.xpGained > 0) {
        setToast({
          amount: result.xpGained,
          label:
            label ??
            (result.streakBonus > 0 ? 'Inclui bônus de streak' : 'XP ganho'),
        });
        window.setTimeout(() => setToast(null), 2800);
      }

      // 2. Level up — sempre com pequeno delay depois do toast
      if (result.leveledUp && result.newTitle) {
        const delay = result.xpGained > 0 ? 900 : 100;
        window.setTimeout(() => {
          setLevelUp({ level: result.newLevel, title: result.newTitle! });
        }, delay);
      }

      // 3. Conquistas — empilha
      if (result.newAchievements.length > 0) {
        const delay = result.leveledUp
          ? 2000
          : result.xpGained > 0
            ? 900
            : 100;
        window.setTimeout(() => {
          setAchievements((prev) => [...prev, ...result.newAchievements]);
        }, delay);
      }
    },
    [],
  );

  const dismissLevelUp = useCallback(() => setLevelUp(null), []);
  const dismissAchievement = useCallback(() => {
    setAchievements((prev) => prev.slice(1));
  }, []);

  return (
    <XpFeedbackContext.Provider value={{ showFeedback }}>
      {children}

      {/* Toast flutuante (não bloqueia interação) */}
      <XpToast
        amount={toast?.amount ?? 0}
        label={toast?.label ?? ''}
        visible={!!toast}
      />

      {/* Level Up (modal bloqueante) */}
      {levelUp && (
        <LevelUpModal
          newLevel={levelUp.level}
          newTitle={levelUp.title}
          onClose={dismissLevelUp}
        />
      )}

      {/* Conquista (modal bloqueante, exibe uma por vez) */}
      {achievements.length > 0 && (
        <AchievementUnlockModal
          achievement={achievements[0]}
          hasMore={achievements.length > 1}
          onNext={dismissAchievement}
        />
      )}
    </XpFeedbackContext.Provider>
  );
}
