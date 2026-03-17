'use client';

import { usePlayer } from '@/context/player-context';
import { getLevelInfo, getXpProgress } from '@/lib/player-stats';
import { Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';

export default function PlayerHUD() {
  const { stats } = usePlayer();
  const { data: session } = useSession();
  const levelInfo = getLevelInfo(stats.xp);
  const { current, needed, percent } = getXpProgress(stats.xp);
  const isMaxLevel = levelInfo.level === 6;

  // Only show the HUD when the user is signed in
  if (!session?.user) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">

        {/* Streak */}
        {stats.streak > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 cursor-default">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">{stats.streak}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>🔥 {stats.streak} riddle streak! Best: {stats.bestStreak}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Level + XP bar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-default">
              {/* Level badge */}
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-black border-2',
                levelInfo.level === 6
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                  : 'bg-primary/20 border-primary text-primary'
              )}>
                {levelInfo.level}
              </div>

              {/* XP bar */}
              <div className="hidden sm:flex flex-col gap-0.5 w-20">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground font-medium">{levelInfo.title}</span>
                  {!isMaxLevel && (
                    <span className="text-[10px] text-muted-foreground">{current}/{needed}</span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      levelInfo.level === 6 ? 'bg-yellow-400' : 'bg-primary'
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{levelInfo.title} — Level {levelInfo.level}</p>
            <p className="text-xs text-muted-foreground">
              {isMaxLevel ? `${stats.xp} XP total (max level)` : `${current} / ${needed} XP to next level`}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Zap className="h-3 w-3" /> {stats.xp} total XP
            </p>
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}
