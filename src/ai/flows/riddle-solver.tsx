'use client';

import type { GenerateRiddleOutput } from '@/ai/flows/generate-riddle';
import { generateRiddle } from '@/ai/flows/generate-riddle';
import {
  useState, useTransition, useEffect, useCallback, useRef,
  forwardRef, useImperativeHandle, useContext
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
import { Lightbulb, Loader2, RefreshCcw, Smile, Frown, Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RiddleContext } from '@/context/riddle-context';

const MAX_TRIES = 3;

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer.'),
});
type AnswerFormData = z.infer<typeof answerSchema>;

interface RiddleSolverProps {
  initialRiddle: GenerateRiddleOutput;
}

export interface RiddleSolverRef {
  updateConstraintsAndFetch: (constraints: string) => void;
}

// ─── Check guess against primary answer + all alternatives ───────────────────
function isCorrectAnswer(guess: string, riddle: GenerateRiddleOutput): boolean {
  const normalise = (s: string) =>
    s.trim().toLowerCase()
      .replace(/^(a|an|the)\s+/i, '') // strip leading articles
      .replace(/[^a-z0-9\s]/g, '')    // strip punctuation
      .replace(/\s+/g, ' ');          // collapse spaces

  const normGuess = normalise(guess);
  const allAnswers = [riddle.answer, ...(riddle.alternativeAnswers ?? [])];
  return allAnswers.some(ans => normalise(ans) === normGuess);
}

const RiddleSolver = forwardRef<RiddleSolverRef, RiddleSolverProps>(
  ({ initialRiddle }, ref) => {
    const [riddleData, setRiddleData] = useState<GenerateRiddleOutput>(initialRiddle);
    const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isFetching, startTransition] = useTransition();
    const { toast } = useToast();
    const { currentConstraints } = useContext(RiddleContext);
    const formRef = useRef<HTMLFormElement>(null);

    const { register, handleSubmit, reset, setFocus, formState: { errors } } =
      useForm<AnswerFormData>({ resolver: zodResolver(answerSchema) });

    const fetchNewRiddle = useCallback((constraintsToUse: string | null = currentConstraints) => {
      setIsCorrect(null);
      setTriesLeft(MAX_TRIES);
      reset({ answer: '' });

      startTransition(async () => {
        try {
          const newRiddle = await generateRiddle({ constraints: constraintsToUse ?? '' });
          if (!newRiddle || typeof newRiddle.riddle !== 'string') {
            throw new Error('Invalid riddle data.');
          }
          setRiddleData(newRiddle);
          toast({ title: 'New Riddle Loaded!', description: 'Let the guessing begin!' });
          setFocus('answer');
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error('Failed to fetch riddle:', msg);
          toast({ title: 'Error', description: 'Could not load a new riddle. Please try again.', variant: 'destructive' });
          setRiddleData({ riddle: 'Riddle Load Error', answer: 'Error', hint: 'Could not load the riddle. Please try again.', alternativeAnswers: [] });
          reset({ answer: '' });
        }
      });
    }, [reset, toast, setFocus, currentConstraints]);

    useEffect(() => {
      setRiddleData(initialRiddle);
      setTriesLeft(MAX_TRIES);
      setIsCorrect(null);
      reset({ answer: '' });
      if (initialRiddle?.answer !== 'Error') setFocus('answer');
    }, [initialRiddle, reset, setFocus]);

    useImperativeHandle(ref, () => ({
      updateConstraintsAndFetch: (constraints: string) => fetchNewRiddle(constraints),
    }), [fetchNewRiddle]);

    const handleGuess: SubmitHandler<AnswerFormData> = (data) => {
      const errorStates = ['Error', 'Overload', 'Network Error', 'Unexpected Error'];
      if (isCorrect || errorStates.includes(riddleData?.answer)) {
        toast({ title: 'Cannot Guess Now', description: 'Please fetch a new riddle first.', variant: 'destructive' });
        return;
      }

      if (isCorrectAnswer(data.answer, riddleData)) {
        setIsCorrect(true);
        toast({
          title: '🎉 Correct!',
          description: `"${riddleData.answer}" is right!`,
          className: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
        });
      } else {
        const newTries = triesLeft - 1;
        setTriesLeft(newTries);
        setIsCorrect(false);
        if (newTries === 0) {
          toast({ title: 'Out of Tries!', description: `The answer was: ${riddleData.answer}`, variant: 'destructive' });
        } else {
          toast({ title: 'Incorrect', description: `Not quite! ${newTries} ${newTries === 1 ? 'try' : 'tries'} left.`, variant: 'destructive' });
          reset({ answer: '' });
          setFocus('answer');
        }
      }
    };

    const showHint = () => {
      const errorStates = ['Error', 'Overload', 'Network Error'];
      if (!riddleData?.hint || errorStates.includes(riddleData.answer)) {
        toast({ title: 'Hint Unavailable', description: 'No hint available.', variant: 'destructive' });
        return;
      }
      toast({ title: "Here's a Hint:", description: riddleData.hint, icon: <Lightbulb className="h-5 w-5 text-yellow-500" />, duration: 7000 });
    };

    const isErrorState = ['Error', 'Overload', 'Network Error', 'Unexpected Error'].includes(riddleData?.answer ?? '');
    const progressValue = (triesLeft / MAX_TRIES) * 100;

    return (
      <TooltipProvider>
        <div className="space-y-6">
          {/* Riddle card */}
          <Card className="bg-card text-card-foreground shadow-sm border-border relative overflow-hidden">
            {currentConstraints && (
              <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 z-10">
                <Info size={12} /> {currentConstraints}
              </div>
            )}
            <CardContent className="px-4 sm:px-6 py-6">
              {isFetching ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading new riddle...</p>
                </div>
              ) : (
                <p className={cn(
                  'text-lg md:text-xl text-center font-medium text-foreground whitespace-pre-wrap min-h-[60px]',
                  isErrorState ? 'text-destructive' : ''
                )}>
                  {riddleData.riddle}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 bg-muted/50 py-3 px-4 sm:px-6 border-t">
              <div className="flex items-center space-x-2 w-full max-w-xs">
                <Label htmlFor="tries" className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tries Left:</Label>
                <Progress
                  id="tries"
                  value={isErrorState ? 0 : progressValue}
                  className="w-full h-2 bg-secondary"
                  indicatorClassName={cn('transition-all', isErrorState ? 'bg-destructive' : triesLeft > 1 ? 'bg-primary' : 'bg-destructive')}
                  aria-label={`${triesLeft} of ${MAX_TRIES} tries remaining`}
                />
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {isErrorState ? '0' : triesLeft}/{MAX_TRIES}
                </span>
              </div>

              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={showHint}
                      disabled={isFetching || isCorrect === true || triesLeft === 0 || isErrorState}
                      className="transition-transform duration-150 hover:scale-110 active:scale-100">
                      <Lightbulb className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Show Hint</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => fetchNewRiddle()}
                      disabled={isFetching}
                      className="transition-transform duration-150 hover:scale-110 active:scale-100">
                      {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get New Riddle{currentConstraints ? ` (${currentConstraints})` : ''}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardFooter>
          </Card>

          {/* Input form */}
          {triesLeft > 0 && isCorrect !== true && !isFetching && !isErrorState && (
            <form ref={formRef} onSubmit={handleSubmit(handleGuess)} className="space-y-3">
              <Label htmlFor="answer" className="sr-only">Your Answer</Label>
              <Input
                id="answer" type="text" placeholder="Enter your guess..."
                className={cn(
                  'w-full text-center text-base transition-colors duration-200',
                  errors.answer ? 'border-destructive focus-visible:ring-destructive' : '',
                  isCorrect === false && triesLeft < MAX_TRIES ? 'border-destructive/50' : ''
                )}
                aria-invalid={errors.answer ? 'true' : 'false'}
                disabled={isFetching} autoComplete="off"
                {...register('answer')}
              />
              {errors.answer && <p className="text-sm text-destructive text-center">{errors.answer.message}</p>}
              <Button type="submit" disabled={isFetching} className="w-full transition-transform duration-150 hover:scale-[1.02] active:scale-100">
                {isFetching ? <Loader2 className="animate-spin" /> : 'Submit Guess'}
              </Button>
            </form>
          )}

          {/* Correct */}
          {isCorrect === true && !isFetching && (
            <Alert className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200 animate-in fade-in duration-300">
              <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="font-bold">Congratulations!</AlertTitle>
              <AlertDescription>
                You solved it! The answer was <strong>{riddleData.answer}</strong>.
                {(riddleData.alternativeAnswers?.length ?? 0) > 0 && (
                  <span className="block mt-1 text-sm opacity-75">
                    Also accepted: {riddleData.alternativeAnswers!.join(', ')}
                  </span>
                )}
              </AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm" disabled={isFetching}>
                Play Again{currentConstraints ? ` (${currentConstraints})` : ''}
              </Button>
            </Alert>
          )}

          {/* Out of tries */}
          {triesLeft === 0 && isCorrect === false && !isFetching && !isErrorState && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-300">
              <Frown className="h-5 w-5" />
              <AlertTitle className="font-bold">Game Over!</AlertTitle>
              <AlertDescription>
                The correct answer was: <strong>{riddleData.answer}</strong>.
                {(riddleData.alternativeAnswers?.length ?? 0) > 0 && (
                  <span className="block mt-1 text-sm opacity-75">
                    Also accepted: {riddleData.alternativeAnswers!.join(', ')}
                  </span>
                )}
              </AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm" disabled={isFetching}>
                Try a New Riddle{currentConstraints ? ` (${currentConstraints})` : ''}
              </Button>
            </Alert>
          )}

          {/* Error */}
          {isErrorState && !isFetching && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Riddle Load Error</AlertTitle>
              <AlertDescription>{riddleData?.hint || 'Could not load the riddle.'}</AlertDescription>
              <Button onClick={() => fetchNewRiddle()} className="mt-4 w-full sm:w-auto" variant="secondary" size="sm" disabled={isFetching}>
                Try Again
              </Button>
            </Alert>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

RiddleSolver.displayName = 'RiddleSolver';
export default RiddleSolver;
