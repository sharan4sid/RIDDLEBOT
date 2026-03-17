'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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

const STORAGE_KEY = 'prahelika_player_stats';

interface SolveResult {
  wasCorrect: boolean;
  triesLeft: number;  // tries remaining when the riddle ended
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

function loadStats(): PlayerStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw) as PlayerStats;
    // Merge with INITIAL_STATS to handle new fields added over time
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

function saveStats(stats: PlayerStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch { /* ignore quota errors */ }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setStats(loadStats());
  }, []);

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
        // ── Streak ──
        next.streak += 1;
        if (next.streak > next.bestStreak) next.bestStreak = next.streak;

        // ── Counts ──
        next.totalSolved += 1;
        next.solvedByDifficulty = {
          ...next.solvedByDifficulty,
          [result.difficulty]: next.solvedByDifficulty[result.difficulty] + 1,
        };
        if (result.triesLeft === result.maxTries) next.solvedFirstTry += 1;
        if (!result.usedHint) next.solvedNoHints += 1;

        // ── XP ──
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

        // ── Difficulty Ladder ──
        next.consecutiveCorrect += 1;
        next.consecutiveWrong = 0;
        const ladderResult = updateDifficultyLadder(next, true);
        if (ladderResult.promoted) {
          next.currentDifficulty = ladderResult.newDifficulty;
          next.consecutiveCorrect = 0;
          promoted = true;
        }
      } else {
        // Wrong — reset streak
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

      // ── Achievements ──
      const newIds = checkNewAchievements(next);
      if (newIds.length > 0) {
        next.unlockedAchievements = [...next.unlockedAchievements, ...newIds];
        newAchievements = newIds
          .map(id => ALL_ACHIEVEMENTS.find(a => a.id === id))
          .filter(Boolean) as Achievement[];
      }

      saveStats(next);
      return next;
    });

    return { newAchievements, xpGain, promoted, demoted, leveledUp, newLevel };
  }, []);

  const recordHintUsed = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, hintsUsed: prev.hintsUsed + 1 };
      saveStats(next);
      return next;
    });
  }, []);

  const setNoHintsMode = useCallback((val: boolean) => {
    setStats(prev => {
      const next = { ...prev, noHintsMode: val };
      saveStats(next);
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(INITIAL_STATS);
    saveStats(INITIAL_STATS);
  }, []);

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
