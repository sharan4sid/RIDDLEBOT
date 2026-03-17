// ─── Types ────────────────────────────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PlayerStats {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  totalSolved: number;
  totalAttempts: number;
  solvedFirstTry: number;
  solvedNoHints: number;
  hintsUsed: number;
  solvedByDifficulty: Record<Difficulty, number>;
  consecutiveCorrect: number; // for difficulty ladder promotion
  consecutiveWrong: number;   // for difficulty ladder demotion
  currentDifficulty: Difficulty;
  noHintsMode: boolean;
  unlockedAchievements: string[];
}

export const INITIAL_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  totalSolved: 0,
  totalAttempts: 0,
  solvedFirstTry: 0,
  solvedNoHints: 0,
  hintsUsed: 0,
  solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  currentDifficulty: 'medium',
  noHintsMode: false,
  unlockedAchievements: [],
};

// ─── Level System ─────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: 'Novice',        minXp: 0,    maxXp: 99   },
  { level: 2, title: 'Apprentice',    minXp: 100,  maxXp: 249  },
  { level: 3, title: 'Scholar',       minXp: 250,  maxXp: 499  },
  { level: 4, title: 'Expert',        minXp: 500,  maxXp: 999  },
  { level: 5, title: 'Master',        minXp: 1000, maxXp: 1999 },
  { level: 6, title: 'Riddle Master', minXp: 2000, maxXp: Infinity },
];

export function getLevelInfo(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXpProgress(xp: number): { current: number; needed: number; percent: number } {
  const lvl = getLevelInfo(xp);
  if (lvl.maxXp === Infinity) return { current: xp - lvl.minXp, needed: 0, percent: 100 };
  const current = xp - lvl.minXp;
  const needed = lvl.maxXp - lvl.minXp + 1;
  return { current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) };
}

// ─── XP Calculation ───────────────────────────────────────────────────────────
// MAX_TRIES = 3. triesLeft when correct:
//   3 → solved on first try (no wrong answers yet)
//   2 → solved on second try
//   1 → solved on third/last try
export function calculateXpGain(opts: {
  difficulty: Difficulty;
  triesLeftWhenCorrect: number;
  maxTries: number;
  usedHint: boolean;
  noHintsMode: boolean;
  streak: number;
}): { total: number; breakdown: { base: number; firstTry: number; noHint: number; streak: number; noHintsMode: number } } {
  const base = { easy: 10, medium: 20, hard: 40 }[opts.difficulty];
  const firstTry = opts.triesLeftWhenCorrect === opts.maxTries ? 15 : 0;
  const noHint = !opts.usedHint ? 10 : 0;
  const streakBonus = Math.min(opts.streak, 10) * 2; // up to +20 XP at 10 streak
  const noHintsModeBonus = opts.noHintsMode ? 8 : 0;
  return {
    total: base + firstTry + noHint + streakBonus + noHintsModeBonus,
    breakdown: { base, firstTry, noHint, streak: streakBonus, noHintsMode: noHintsModeBonus },
  };
}

// ─── Difficulty Ladder ────────────────────────────────────────────────────────
const PROMOTE_THRESHOLD = 3; // consecutive correct to promote
const DEMOTE_THRESHOLD  = 3; // consecutive wrong to demote

export function updateDifficultyLadder(
  stats: PlayerStats,
  wasCorrect: boolean
): { newDifficulty: Difficulty; promoted: boolean; demoted: boolean } {
  const order: Difficulty[] = ['easy', 'medium', 'hard'];
  const idx = order.indexOf(stats.currentDifficulty);

  if (wasCorrect) {
    const next = stats.consecutiveCorrect + 1;
    if (next >= PROMOTE_THRESHOLD && idx < order.length - 1) {
      return { newDifficulty: order[idx + 1], promoted: true, demoted: false };
    }
    return { newDifficulty: stats.currentDifficulty, promoted: false, demoted: false };
  } else {
    const next = stats.consecutiveWrong + 1;
    if (next >= DEMOTE_THRESHOLD && idx > 0) {
      return { newDifficulty: order[idx - 1], promoted: false, demoted: true };
    }
    return { newDifficulty: stats.currentDifficulty, promoted: false, demoted: false };
  }
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_solve',   title: 'First Step',       description: 'Solve your first riddle',                  icon: '🌟' },
  { id: 'streak_3',      title: 'Getting Warm',      description: 'Reach a 3-riddle streak',                  icon: '🔥' },
  { id: 'streak_5',      title: 'On Fire!',          description: 'Reach a 5-riddle streak',                  icon: '🔥' },
  { id: 'streak_10',     title: 'Unstoppable',       description: 'Reach a 10-riddle streak',                 icon: '⚡' },
  { id: 'first_try_3',   title: 'Sharp Eye',         description: 'Solve 3 riddles on the first try',         icon: '🎯' },
  { id: 'first_try_10',  title: 'Dead Shot',         description: 'Solve 10 riddles on the first try',        icon: '🎯' },
  { id: 'no_hints_5',    title: 'No Peeking',        description: 'Solve 5 riddles without hints',            icon: '🙈' },
  { id: 'no_hints_20',   title: 'Pure Intellect',    description: 'Solve 20 riddles without hints',           icon: '🧠' },
  { id: 'hard_3',        title: 'Hard Boiled',       description: 'Solve 3 hard riddles',                     icon: '💎' },
  { id: 'hard_10',       title: 'Iron Mind',         description: 'Solve 10 hard riddles',                    icon: '🪨' },
  { id: 'total_10',      title: 'Curious Mind',      description: 'Solve 10 riddles total',                   icon: '📖' },
  { id: 'total_25',      title: 'Dedicated',         description: 'Solve 25 riddles total',                   icon: '📚' },
  { id: 'total_50',      title: 'Veteran',           description: 'Solve 50 riddles total',                   icon: '🏅' },
  { id: 'level_3',       title: 'Rising Scholar',    description: 'Reach Level 3 (Scholar)',                  icon: '🎓' },
  { id: 'level_5',       title: 'Grand Master',      description: 'Reach Level 5 (Master)',                   icon: '👑' },
  { id: 'reach_hard',    title: 'Climber',           description: 'Get promoted to Hard difficulty',          icon: '🏔️' },
  { id: 'no_hints_mode', title: 'Purist',            description: 'Enable No Hints Mode and solve a riddle',  icon: '🔒' },
];

export function checkNewAchievements(stats: PlayerStats): string[] {
  const already = new Set(stats.unlockedAchievements);
  const newly: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) newly.push(id);
  };

  check('first_solve',   stats.totalSolved >= 1);
  check('streak_3',      stats.streak >= 3);
  check('streak_5',      stats.streak >= 5);
  check('streak_10',     stats.streak >= 10);
  check('first_try_3',   stats.solvedFirstTry >= 3);
  check('first_try_10',  stats.solvedFirstTry >= 10);
  check('no_hints_5',    stats.solvedNoHints >= 5);
  check('no_hints_20',   stats.solvedNoHints >= 20);
  check('hard_3',        stats.solvedByDifficulty.hard >= 3);
  check('hard_10',       stats.solvedByDifficulty.hard >= 10);
  check('total_10',      stats.totalSolved >= 10);
  check('total_25',      stats.totalSolved >= 25);
  check('total_50',      stats.totalSolved >= 50);
  check('level_3',       stats.level >= 3);
  check('level_5',       stats.level >= 5);
  check('reach_hard',    stats.currentDifficulty === 'hard');
  check('no_hints_mode', stats.noHintsMode && stats.solvedNoHints >= 1);

  return newly;
}
