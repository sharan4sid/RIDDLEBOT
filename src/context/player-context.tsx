'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  type PlayerStats,
  type Difficulty,
  INITIAL_STATS,
  getLevelInfo,
  calculateXpGain,
  updateDifficultyLadder,
  checkNewAchievements,
  ALL_ACHIEVEMENTS,
  type Achievement,
} from '@/lib/player-stats';

// Derives a user-specific storage key so each Google account has its own slot.
function getStorageKey(userId: string) {
  return `prahelika_stats_${userId}`;
}

interface SolveResult {
  wasCorrect: boolean;
  triesLeft: number;
  maxTries: number;
  usedHint: boolean;
  difficulty: Difficulty;
}

interface XpGainEvent {
  amount: number;
  breakdown: { base: number; firstTry: number; noHint: number; streak: number; noHintsMode: number };
}

interface PlayerContextType {
  stats: PlayerStats;
  recordSolve: (result: SolveResult) => {
    newAchievements: Achievement[];
    xpGain: XpGainEvent | null;
    promoted: boolean;
    demoted: boolean;
    leveledUp: boolean;
    newLevel: number;
  };
  recordHintUsed: () => void;
  setNoHintsMode: (val: boolean) => void;
  resetStats: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

function loadStats(userId: string): PlayerStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw) as PlayerStats;
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

function saveStats(userId: string, stats: PlayerStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(stats));
  } catch { /* ignore quota errors */ }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);

  // Whenever the session changes (login / logout / loaded), re-hydrate stats.
  useEffect(() => {
    if (status === 'loading') return; // Wait until Next-Auth resolves the session.

    if (session?.user?.email) {
      // User is authenticated — load their data.
      setStats(loadStats(session.user.email));
    } else {
      // No session — show empty defaults, never touching localStorage.
      setStats(INITIAL_STATS);
    }
  }, [session, status]);

  const recordSolve = useCallback((result: SolveResult) => {
    let newAchievements: Achievement[] = [];
    let xpGain: XpGainEvent | null = null;
    let promoted = false;
    let demoted = false;
    let leveledUp = false;
    let newLevel = 1;

    setStats(prev => {
      const next = { ...prev };

      next.totalAttempts += 1;

      if (result.wasCorrect) {
        next.streak += 1;
        if (next.streak > next.bestStreak) next.bestStreak = next.streak;
        next.totalSolved += 1;
        next.solvedByDifficulty = {
          ...next.solvedByDifficulty,
          [result.difficulty]: next.solvedByDifficulty[result.difficulty] + 1,
        };
        if (result.triesLeft === result.maxTries) next.solvedFirstTry += 1;
        if (!result.usedHint) next.solvedNoHints += 1;

        const xpResult = calculateXpGain({
          difficulty: result.difficulty,
          triesLeftWhenCorrect: result.triesLeft,
          maxTries: result.maxTries,
          usedHint: result.usedHint,
          noHintsMode: next.noHintsMode,
          streak: next.streak,
        });
        const oldLevel = next.level;
        next.xp += xpResult.total;
        next.level = getLevelInfo(next.xp).level;
        xpGain = { amount: xpResult.total, breakdown: xpResult.breakdown };
        if (next.level > oldLevel) {
          leveledUp = true;
          newLevel = next.level;
        }

        next.consecutiveCorrect += 1;
        next.consecutiveWrong = 0;
        const ladderResult = updateDifficultyLadder(next, true);
        if (ladderResult.promoted) {
          next.currentDifficulty = ladderResult.newDifficulty;
          next.consecutiveCorrect = 0;
          promoted = true;
        }
      } else {
        next.streak = 0;
        next.consecutiveWrong += 1;
        next.consecutiveCorrect = 0;
        const ladderResult = updateDifficultyLadder(next, false);
        if (ladderResult.demoted) {
          next.currentDifficulty = ladderResult.newDifficulty;
          next.consecutiveWrong = 0;
          demoted = true;
        }
      }

      const newIds = checkNewAchievements(next);
      if (newIds.length > 0) {
        next.unlockedAchievements = [...next.unlockedAchievements, ...newIds];
        newAchievements = newIds
          .map(id => ALL_ACHIEVEMENTS.find(a => a.id === id))
          .filter(Boolean) as Achievement[];
      }

      // Only persist data if the user is authenticated.
      if (session?.user?.email) {
        saveStats(session.user.email, next);
      }
      return next;
    });

    return { newAchievements, xpGain, promoted, demoted, leveledUp, newLevel };
  }, [session]);

  const recordHintUsed = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, hintsUsed: prev.hintsUsed + 1 };
      if (session?.user?.email) saveStats(session.user.email, next);
      return next;
    });
  }, [session]);

  const setNoHintsMode = useCallback((val: boolean) => {
    setStats(prev => {
      const next = { ...prev, noHintsMode: val };
      if (session?.user?.email) saveStats(session.user.email, next);
      return next;
    });
  }, [session]);

  const resetStats = useCallback(() => {
    setStats(INITIAL_STATS);
    if (session?.user?.email) saveStats(session.user.email, INITIAL_STATS);
  }, [session]);

  return (
    <PlayerContext.Provider value={{ stats, recordSolve, recordHintUsed, setNoHintsMode, resetStats }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return ctx;
}

