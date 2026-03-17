'use client';

import { useState } from 'react';
import { usePlayer } from '@/context/player-context';
import { ALL_ACHIEVEMENTS, getLevelInfo, getXpProgress, LEVELS, type Difficulty } from '@/lib/player-stats';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart3, Trophy, Settings, Flame, Zap, Target, BookOpen,
  TrendingUp, Award, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'achievements' | 'settings';

const DIFF_COLORS: Record<Difficulty, string> = {
  easy:   'text-green-400 bg-green-400/10 border-green-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  hard:   'text-red-400 bg-red-400/10 border-red-400/30',
};

const DIFF_BAR: Record<Difficulty, string> = {
  easy:   'bg-green-400',
  medium: 'bg-yellow-400',
  hard:   'bg-red-400',
};

export default function StatsDashboard({ trigger }: { trigger: React.ReactNode }) {
  const { stats, setNoHintsMode, resetStats } = usePlayer();
  const [tab, setTab] = useState<Tab>('overview');
  const [confirmReset, setConfirmReset] = useState(false);

  const levelInfo = getLevelInfo(stats.xp);
  const { current, needed, percent } = getXpProgress(stats.xp);
  const isMaxLevel = levelInfo.level === 6;
  const accuracy = stats.totalAttempts === 0
    ? 0
    : Math.round((stats.totalSolved / stats.totalAttempts) * 100);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Your Progress
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['overview', 'achievements', 'settings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                tab === t
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'overview' && <BarChart3 className="h-3.5 w-3.5 inline mr-1" />}
              {t === 'achievements' && <Award className="h-3.5 w-3.5 inline mr-1" />}
              {t === 'settings' && <Settings className="h-3.5 w-3.5 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[65vh]">

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="p-6 space-y-6">

              {/* Level card */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Level {levelInfo.level}</p>
                    <p className="text-xl font-black text-foreground">{levelInfo.title}</p>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2',
                    levelInfo.level === 6
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                      : 'bg-primary/15 border-primary text-primary'
                  )}>
                    {levelInfo.level}
                  </div>
                </div>
                {!isMaxLevel ? (
                  <>
                    <Progress value={percent} className="h-2 bg-muted" indicatorClassName={cn('transition-all', levelInfo.level === 6 ? 'bg-yellow-400' : 'bg-primary')} />
                    <p className="text-xs text-muted-foreground text-right">{current} / {needed} XP</p>
                  </>
                ) : (
                  <p className="text-xs text-yellow-400 font-semibold">✨ Maximum level reached! {stats.xp} total XP</p>
                )}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {LEVELS.map(l => (
                    <div key={l.level} className={cn(
                      'rounded-lg p-2 text-center border text-xs',
                      stats.level >= l.level
                        ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    )}>
                      <div className="font-bold">Lv.{l.level}</div>
                      <div className="truncate">{l.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Flame className="h-4 w-4 text-orange-400" />} label="Current Streak" value={stats.streak} sub={`Best: ${stats.bestStreak}`} />
                <StatCard icon={<Zap className="h-4 w-4 text-yellow-400" />} label="Total XP" value={stats.xp} sub={`Level ${stats.level}`} />
                <StatCard icon={<BookOpen className="h-4 w-4 text-blue-400" />} label="Solved" value={stats.totalSolved} sub={`of ${stats.totalAttempts} attempted`} />
                <StatCard icon={<Target className="h-4 w-4 text-green-400" />} label="Accuracy" value={`${accuracy}%`} sub={`${stats.solvedFirstTry} first-try`} />
              </div>

              {/* Difficulty breakdown */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Difficulty Ladder
                  </p>
                </div>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                  const count = stats.solvedByDifficulty[d];
                  const max = Math.max(...Object.values(stats.solvedByDifficulty), 1);
                  return (
                    <div key={d} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize font-medium">{d}</span>
                        <span className="text-muted-foreground">{count} solved</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', DIFF_BAR[d])}
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground pt-1">
                  Auto-promotes after 3 correct in a row · Demotes after 3 wrong in a row
                </p>
              </div>

              {/* Hints */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<span className="text-base">🙈</span>} label="No-Hint Solves" value={stats.solvedNoHints} sub="without peeking" />
                <StatCard icon={<span className="text-base">💡</span>} label="Hints Used" value={stats.hintsUsed} sub="total" />
              </div>
            </div>
          )}

          {/* ── ACHIEVEMENTS ─────────────────────────────────────────────── */}
          {tab === 'achievements' && (
            <div className="p-6 space-y-3">
              <p className="text-xs text-muted-foreground">
                {stats.unlockedAchievements.length} / {ALL_ACHIEVEMENTS.length} unlocked
              </p>
              <div className="grid grid-cols-1 gap-2">
                {ALL_ACHIEVEMENTS.map(a => {
                  const unlocked = stats.unlockedAchievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 transition-all',
                        unlocked
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border opacity-50'
                      )}
                    >
                      <span className={cn('text-2xl', !unlocked && 'grayscale')}>{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-semibold', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
                          {a.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                      </div>
                      {unlocked && (
                        <span className="text-xs text-primary font-bold shrink-0">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────────── */}
          {tab === 'settings' && (
            <div className="p-6 space-y-6">
              {/* No Hints Mode */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      🔒 No Hints Mode
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hints are disabled. Earn +8 XP bonus per correct solve.
                    </p>
                  </div>
                  <Switch
                    checked={stats.noHintsMode}
                    onCheckedChange={setNoHintsMode}
                    aria-label="Toggle No Hints Mode"
                  />
                </div>
                {stats.noHintsMode && (
                  <p className="text-xs text-primary font-semibold bg-primary/10 rounded-lg px-3 py-2">
                    🔥 No Hints Mode is active — every solve earns bonus XP!
                  </p>
                )}
              </div>

              {/* XP Breakdown info */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" /> XP Breakdown
                </p>
                {[
                  ['Easy correct',        '+10 XP'],
                  ['Medium correct',      '+20 XP'],
                  ['Hard correct',        '+40 XP'],
                  ['First try bonus',     '+15 XP'],
                  ['No hint bonus',       '+10 XP'],
                  ['No Hints Mode bonus', '+8 XP'],
                  ['Streak bonus',        '+2 XP × streak (max ×10)'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Reset */}
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Reset Progress
                </p>
                <p className="text-xs text-muted-foreground">
                  This will permanently erase all XP, levels, streaks and achievements.
                </p>
                {!confirmReset ? (
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => setConfirmReset(true)}>
                    Reset All Stats
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => { resetStats(); setConfirmReset(false); }}>
                      Yes, Reset
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmReset(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="text-2xl font-black text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
