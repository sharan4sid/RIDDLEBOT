'use client';

import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { generateRiddle } from '@/ai/flows/generate-riddle';
import {
  useState, useTransition, useEffect, useCallback, useRef,
  forwardRef, useImperativeHandle, useContext,
} from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb, Loader2, RefreshCcw, Smile, Frown, Info,
  AlertCircle, Zap, TrendingUp, TrendingDown, Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RiddleContext } from '@/context/riddle-context';
import { usePlayer } from '@/context/player-context';
import { getLevelInfo } from '@/lib/player-stats';

const MAX_TRIES = 3;

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer.'),
});
type AnswerFormData = z.infer<typeof answerSchema>;

interface RiddleSolverProps { initialRiddle: GenerateRiddleOutput; }
export interface RiddleSolverRef { updateConstraintsAndFetch: (constraints: string) => void; }

function isCorrectAnswer(guess: string, riddle: GenerateRiddleOutput): boolean {
  const norm = (s: string) =>
    s.trim().toLowerCase()
      .replace(/^(a|an|the)\s+/i, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  const normGuess = norm(guess);
  return [riddle.answer, ...(riddle.alternativeAnswers ?? [])].some(a => norm(a) === normGuess);
}

const RiddleSolver = forwardRef<RiddleSolverRef, RiddleSolverProps>(
  ({ initialRiddle }, ref) => {
    const [riddleData, setRiddleData]   = useState<GenerateRiddleOutput>(initialRiddle);
    const [triesLeft, setTriesLeft]     = useState(MAX_TRIES);
    const [isCorrect, setIsCorrect]     = useState<boolean | null>(null);
    const [usedHint, setUsedHint]       = useState(false);
    const [isFetching, startTransition] = useTransition();
    const { toast }                     = useToast();
    const { currentConstraints }        = useContext(RiddleContext);
    const { stats, recordSolve, recordHintUsed } = usePlayer();
    const formRef                       = useRef<HTMLFormElement>(null);

    const { register, handleSubmit, reset, setFocus, formState: { errors } } =
      useForm<AnswerFormData>({ resolver: zodResolver(answerSchema) });

    const buildConstraints = useCallback((override?: string | null) => {
      const base = override !== undefined ? override : (currentConstraints ?? '');
      const diff = `difficulty: ${stats.currentDifficulty}`;
      if (!base) return diff;
      if (base.toLowerCase().includes('difficulty')) return base;
      return `${diff}, ${base}`;
    }, [currentConstraints, stats.currentDifficulty]);

    const fetchNewRiddle = useCallback((constraintsToUse?: string | null) => {
      setIsCorrect(null);
      setTriesLeft(MAX_TRIES);
      setUsedHint(false);
      reset({ answer: '' });
      startTransition(async () => {
        try {
          const constraints = buildConstraints(constraintsToUse);
          const newRiddle = await generateRiddle({ constraints });
          if (!newRiddle || typeof newRiddle.riddle !== 'string') throw new Error('Invalid riddle.');
          setRiddleData(newRiddle);
          toast({ title: 'New Riddle Loaded!', description: 'Let the guessing begin!' });
          setFocus('answer');
        } catch (error) {
          console.error('Failed to fetch riddle:', error);
          toast({ title: 'Error', description: 'Could not load a new riddle.', variant: 'destructive' });
          setRiddleData({ riddle: 'Riddle Load Error', answer: 'Error', hint: 'Could not load the riddle.', alternativeAnswers: [] });
          reset({ answer: '' });
        }
      });
    }, [buildConstraints, reset, toast, setFocus]);

    useEffect(() => {
      setRiddleData(initialRiddle);
      setTriesLeft(MAX_TRIES);
      setIsCorrect(null);
      setUsedHint(false);
      reset({ answer: '' });
      if (initialRiddle?.answer !== 'Error') setFocus('answer');
    }, [initialRiddle, reset, setFocus]);

    useImperativeHandle(ref, () => ({
      updateConstraintsAndFetch: (constraints: string) => fetchNewRiddle(constraints),
    }), [fetchNewRiddle]);

    const handleGuess: SubmitHandler<AnswerFormData> = (data) => {
      const errorStates = ['Error', 'Overload', 'Network Error', 'Unexpected Error'];
      if (isCorrect || errorStates.includes(riddleData?.answer)) {
        toast({ title: 'Cannot Guess Now', description: 'Fetch a new riddle first.', variant: 'destructive' });
        return;
      }

      if (isCorrectAnswer(data.answer, riddleData)) {
        setIsCorrect(true);
        const { newAchievements, xpGain, promoted, leveledUp, newLevel } = recordSolve({
          wasCorrect: true,
          triesLeft,
          maxTries: MAX_TRIES,
          usedHint,
          difficulty: activeDifficulty,
        });

        // XP toast
        if (xpGain) {
          const parts: string[] = [`+${xpGain.breakdown.base} base`];
          if (xpGain.breakdown.firstTry)    parts.push(`+${xpGain.breakdown.firstTry} first try!`);
          if (xpGain.breakdown.noHint)      parts.push(`+${xpGain.breakdown.noHint} no hint`);
          if (xpGain.breakdown.streak)      parts.push(`+${xpGain.breakdown.streak} streak`);
          if (xpGain.breakdown.noHintsMode) parts.push(`+${xpGain.breakdown.noHintsMode} purist`);
          toast({
            title: `Correct! +${xpGain.amount} XP`,
            description: parts.join(' · '),
            className: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
          });
        }

        if (leveledUp) {
          const lvlInfo = getLevelInfo(stats.xp);
          setTimeout(() => toast({
            title: `Level Up! Now Level ${newLevel}`,
            description: `Welcome, ${lvlInfo.title}!`,
            duration: 5000,
          }), 600);
        }

        if (promoted) {
          setTimeout(() => toast({
            title: 'Difficulty Promoted!',
            description: `You're now on ${stats.currentDifficulty} difficulty!`,
            duration: 5000,
          }), 1200);
        }

        newAchievements.forEach((ach, i) => {
          setTimeout(() => toast({
            title: `${ach.icon} Achievement Unlocked!`,
            description: `${ach.title}: ${ach.description}`,
            duration: 6000,
          }), 1800 + i * 800);
        });

      } else {
        const newTries = triesLeft - 1;
        setTriesLeft(newTries);
        setIsCorrect(false);

        if (newTries === 0) {
          const { demoted } = recordSolve({
            wasCorrect: false, triesLeft: 0, maxTries: MAX_TRIES, usedHint, difficulty: activeDifficulty,
          });
          toast({ title: 'Out of Tries!', description: `The answer was: ${riddleData.answer}`, variant: 'destructive' });
          if (demoted) {
            setTimeout(() => toast({
              title: 'Difficulty Reduced',
              description: `Lowered to ${stats.currentDifficulty}. Keep practising!`,
              duration: 5000,
            }), 800);
          }
        } else {
          toast({ title: 'Incorrect', description: `${newTries} ${newTries === 1 ? 'try' : 'tries'} left.`, variant: 'destructive' });
          reset({ answer: '' });
          setFocus('answer');
        }
      }
    };

    const handleShowHint = () => {
      const errorStates = ['Error', 'Overload', 'Network Error'];
      if (!riddleData?.hint || errorStates.includes(riddleData.answer)) {
        toast({ title: 'Hint Unavailable', variant: 'destructive' });
        return;
      }
      if (stats.noHintsMode) {
        toast({ title: 'No Hints Mode is active', description: 'Disable it in Stats to use hints.', variant: 'destructive' });
        return;
      }
      if (!usedHint) { setUsedHint(true); recordHintUsed(); }
      toast({ title: "Here's a Hint:", description: riddleData.hint, duration: 7000 });
    };

    const isErrorState = ['Error', 'Overload', 'Network Error', 'Unexpected Error'].includes(riddleData?.answer ?? '');

    let activeDifficulty = stats.currentDifficulty;
    if (currentConstraints) {
      const match = currentConstraints.match(/difficulty:\s*(easy|medium|hard)/i);
      if (match) {
        activeDifficulty = match[1].toLowerCase() as 'easy' | 'medium' | 'hard';
      }
    }

    const diffBadgeColor = {
      easy:   'bg-green-400/10 text-green-400 border-green-400/30',
      medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
      hard:   'bg-red-400/10 text-red-400 border-red-400/30',
    }[activeDifficulty] || 'bg-gray-400/10 text-gray-400 border-gray-400/30';

    let displayConstraints = currentConstraints;
    if (currentConstraints && currentConstraints.toLowerCase().includes('difficulty')) {
      displayConstraints = currentConstraints.replace(/,?\s*difficulty:\s*(easy|medium|hard)/i, '').trim();
      if (displayConstraints.startsWith(',')) displayConstraints = displayConstraints.substring(1).trim();
    }

    return (
      <TooltipProvider>
        <div className="space-y-6">
          <Card className="bg-card text-card-foreground shadow-sm border-border relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 flex-wrap justify-end max-w-[60%]">
              {stats.noHintsMode && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-purple-400/10 text-purple-400 border-purple-400/30">
                  Purist
                </span>
              )}
              {displayConstraints && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-secondary text-secondary-foreground border-border flex items-center gap-1">
                  <Info size={10} /> {displayConstraints}
                </span>
              )}
            </div>

            <CardContent className="px-4 sm:px-6 py-6 pt-10">
              {isFetching ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading new riddle...</p>
                </div>
              ) : (
                <p className={cn('text-lg md:text-xl text-center font-medium text-foreground whitespace-pre-wrap min-h-[60px]', isErrorState ? 'text-destructive' : '')}>
                  {riddleData.riddle}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 bg-muted/50 py-3 px-4 sm:px-6 border-t">
              <div className="flex items-center space-x-2 w-full max-w-xs">
                <Label htmlFor="tries" className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tries Left:</Label>
                <Progress
                  id="tries" value={isErrorState ? 0 : (triesLeft / MAX_TRIES) * 100}
                  className="w-full h-2 bg-secondary"
                  indicatorClassName={cn('transition-all', isErrorState ? 'bg-destructive' : triesLeft > 1 ? 'bg-primary' : 'bg-destructive')}
                />
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">{isErrorState ? '0' : triesLeft}/{MAX_TRIES}</span>
              </div>

              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleShowHint}
                      disabled={isFetching || isCorrect === true || triesLeft === 0 || isErrorState}
                      className={cn('transition-transform duration-150 hover:scale-110 active:scale-100', stats.noHintsMode && 'opacity-40')}>
                      <Lightbulb className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{stats.noHintsMode ? 'Hints disabled (Purist mode)' : 'Show Hint'}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => fetchNewRiddle()} disabled={isFetching}
                      className="transition-transform duration-150 hover:scale-110 active:scale-100">
                      {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>New {stats.currentDifficulty} riddle</p></TooltipContent>
                </Tooltip>
              </div>
            </CardFooter>
          </Card>

          {triesLeft > 0 && isCorrect !== true && !isFetching && !isErrorState && (
            <form ref={formRef} onSubmit={handleSubmit(handleGuess)} className="space-y-3">
              <Label htmlFor="answer" className="sr-only">Your Answer</Label>
              <Input id="answer" type="text" placeholder="Enter your guess..."
                className={cn('w-full text-center text-base transition-colors duration-200',
                  errors.answer ? 'border-destructive focus-visible:ring-destructive' : '',
                  isCorrect === false && triesLeft < MAX_TRIES ? 'border-destructive/50' : '')}
                aria-invalid={errors.answer ? 'true' : 'false'}
                disabled={isFetching} autoComplete="off" {...register('answer')} />
              {errors.answer && <p className="text-sm text-destructive text-center">{errors.answer.message}</p>}
              <Button type="submit" disabled={isFetching} className="w-full">Submit Guess</Button>
            </form>
          )}

          {isCorrect === true && !isFetching && (
            <Alert className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200 animate-in fade-in duration-300">
              <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="font-bold">Congratulations!</AlertTitle>
              <AlertDescription>
                The answer was <strong>{riddleData.answer}</strong>.
                {(riddleData.alternativeAnswers?.length ?? 0) > 0 && (
                  <span className="block mt-1 text-sm opacity-75">Also accepted: {riddleData.alternativeAnswers!.join(', ')}</span>
                )}
              </AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm">
                <Zap className="h-4 w-4 mr-1" /> Next Riddle
              </Button>
            </Alert>
          )}

          {triesLeft === 0 && isCorrect === false && !isFetching && !isErrorState && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-300">
              <Frown className="h-5 w-5" />
              <AlertTitle className="font-bold">Game Over!</AlertTitle>
              <AlertDescription>
                The answer was: <strong>{riddleData.answer}</strong>.
                {(riddleData.alternativeAnswers?.length ?? 0) > 0 && (
                  <span className="block mt-1 text-sm opacity-75">Also accepted: {riddleData.alternativeAnswers!.join(', ')}</span>
                )}
              </AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm">Try Again</Button>
            </Alert>
          )}

          {isErrorState && !isFetching && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Riddle Load Error</AlertTitle>
              <AlertDescription>{riddleData?.hint || 'Could not load the riddle.'}</AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm">Try Again</Button>
            </Alert>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

RiddleSolver.displayName = 'RiddleSolver';
export default RiddleSolver;
